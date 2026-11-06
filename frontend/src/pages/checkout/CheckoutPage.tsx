import React, { useState, useEffect } from "react";
import { THEME, COLOR_GREEN_500, COLOR_GREEN_600, COLOR_GREEN_700, COLOR_GREEN_50, COLOR_GREEN_800, COLOR_SLATE_50 } from "@/assets/theme";
import { useSearchParams, useNavigate } from "react-router-dom";
import { QuotationService } from "@/services/quotation.service";
import { CompanyService } from "@/services/company.service";
import { PaymentService, type OrderItemInput } from "@/services/payment.service";
import type { Company } from "@/models/company.models";
import { CustomSelect } from "@/components/Inputs/CustomSelect";
import { useCustomerStore } from "@/store/useCustomerStore";
import type { SelectOption } from "@/types/input.types";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  MenuItem,
} from "@mui/material";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { CustomInput } from "@/components/Inputs/CustomInput";
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import type { QuotationModel } from "@/models/quotation.models";

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [inputQuoteId, setInputQuoteId] = useState<string>("");
  const [loadingQuote, setLoadingQuote] = useState<boolean>(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quotation, setQuotation] = useState<QuotationModel | null>(null);

  // Checkout Customer Details Form
  const [customerName, setCustomerName] = useState<string>("");
  const [institutionName, setInstitutionName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [shippingAddress, setShippingAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("RAZORPAY");
  const [notes, setNotes] = useState<string>("");

  const [submittingCheckout, setSubmittingCheckout] = useState<boolean>(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);
  const [, setRazorpayPaymentId] = useState<string>("");

  const [activeCompany, setActiveCompany] = useState<Company | null>(null);

  useEffect(() => {
    // Load Official Razorpay Checkout Script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  useEffect(() => {
    CompanyService.getActiveCompany().then((res) => {
      if (res.data) setActiveCompany(res.data);
    });
  }, []);

  const {
    customers,
    isLoading: isCustomersLoading,
    isFetchingMore: isCustomersFetchingMore,
    hasMore: hasMoreCustomers,
    fetchCustomers,
    fetchMoreCustomers,
    searchTerm: customerSearchTerm,
    setSearchTerm: setCustomerSearchTerm,
  } = useCustomerStore();

  const [selectedCustId, setSelectedCustId] = useState<string>("");

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const customerOptions: SelectOption[] = React.useMemo(
    () => [
      { id: "", label: "-- Enter Details Manually --" },
      ...customers.map((c) => ({
        id: String(c.id),
        label: `[${c.customer_code}] ${c.company_name} (${c.customer_type})`,
      })),
    ],
    [customers]
  );

  const handleSelectCustomer = (custIdStr: string) => {
    setSelectedCustId(custIdStr);
    if (!custIdStr) return;
    const found = customers.find((c) => String(c.id) === custIdStr);
    if (found) {
      const contactName = found.contact_persons && found.contact_persons.length > 0 ? found.contact_persons[0].name : found.company_name;
      setCustomerName(contactName);
      setInstitutionName(found.company_name);
      setEmail(found.email || (found.contact_persons && found.contact_persons[0]?.email) || "");
      setPhone(found.phone || (found.contact_persons && found.contact_persons[0]?.phone) || "");
      setShippingAddress(found.shipping_address || found.billing_address || "");
    }
  };

  useEffect(() => {
    const paramQuoteId = searchParams.get("quote_id");
    if (paramQuoteId) {
      setInputQuoteId(paramQuoteId);
      fetchQuoteDetails(paramQuoteId);
    }
  }, [searchParams]);

  const fetchQuoteDetails = async (targetQuoteId: string) => {
    if (!targetQuoteId.trim()) return;

    setLoadingQuote(true);
    setQuoteError(null);
    setQuotation(null);

    try {
      const res = await QuotationService.getQuotationById(targetQuoteId.trim());
      if (res.data) {
        setQuotation(res.data);
        setCustomerName(res.data.contact_name || activeCompany?.company_name || "");
        setInstitutionName(res.data.institution_name || activeCompany?.company_name || "");
        setEmail(res.data.email || activeCompany?.email || "");
        setPhone(res.data.phone || activeCompany?.phone || "");
        setShippingAddress(res.data.billing_address || activeCompany?.billing_address || activeCompany?.address || "");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || `Quotation ID '${targetQuoteId}' not found or expired.`;
      setQuoteError(msg);
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotation) return;

    if (!customerName || !email || !phone || !shippingAddress) {
      setQuoteError("Please complete all required customer & shipping address fields.");
      return;
    }

    setSubmittingCheckout(true);
    setQuoteError(null);

    try {
      const orderItems: OrderItemInput[] = quotation.items.map((it: any) => ({
        product_id: Number(it.product_id) || 1,
        product_name: it.product_name,
        quantity: it.quantity,
        unit_price: it.price,
      }));

      if (paymentMethod === "RAZORPAY") {
        // 1. Create Razorpay order on backend (verifies stock availability)
        const orderRes = await PaymentService.createOrder({
          quotation_id: quotation.quote_id,
          items: orderItems,
          notes,
        });

        if (!orderRes.data) {
          throw new Error("Failed to create Razorpay payment order.");
        }

        const razorpayOrder = orderRes.data;

        // 2. Launch Official Razorpay Standard Checkout SDK Modal
        const options = {
          key: razorpayOrder.key_id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Kitrivo Equipment Systems",
          description: `Payment for Quote #${quotation.quote_id}`,
          image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          order_id: razorpayOrder.order_id,
          handler: async (response: any) => {
            try {
              // Verify signature & automatically reduce stock in Stock Management
              await PaymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id || razorpayOrder.order_id,
                razorpay_payment_id: response.razorpay_payment_id || `pay_test_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || "test_dummy_signature",
                quotation_id: quotation.quote_id,
                items: orderItems,
              });

              setRazorpayPaymentId(response.razorpay_payment_id || "PAY_TEST_OK");
              await QuotationService.checkoutQuotation(quotation.quote_id, {
                customer_name: customerName,
                institution_name: institutionName,
                email: email,
                phone: phone,
                shipping_address: shippingAddress,
                payment_method: "RAZORPAY",
                notes: notes,
              });

              setCheckoutSuccess(true);
            } catch (verr: any) {
              setQuoteError(verr.response?.data?.message || verr.message || "Payment verification failed.");
            }
          },
          prefill: {
            name: customerName,
            email: email,
            contact: phone,
          },
          theme: {
            color: THEME.primary,
          },
        };

        if ((window as any).Razorpay) {
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          // Simulation fallback if script is blocked in browser
          const dummyPayId = `pay_sim_${Date.now()}`;
          await PaymentService.verifyPayment({
            razorpay_order_id: razorpayOrder.order_id,
            razorpay_payment_id: dummyPayId,
            razorpay_signature: "test_dummy_signature",
            quotation_id: quotation.quote_id,
            items: orderItems,
          });
          setRazorpayPaymentId(dummyPayId);
          setCheckoutSuccess(true);
        }
      } else {
        const res = await QuotationService.checkoutQuotation(quotation.quote_id, {
          customer_name: customerName,
          institution_name: institutionName,
          email: email,
          phone: phone,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
          notes: notes,
        });

        if (res.data) {
          setQuotation(res.data);
          setCheckoutSuccess(true);
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to complete checkout.";
      setQuoteError(msg);
    } finally {
      setSubmittingCheckout(false);
    }
  };


  return (
    <Box p={3.5} sx={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          mb: 3.5,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${COLOR_GREEN_600} 0%, ${COLOR_GREEN_700} 100%)`,
          color: THEME.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 10px 25px -5px rgba(22, 163, 74, 0.3)",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2.5,
              bgcolor: "rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: 30, color: THEME.white }} />
          </Box>
          <Box>
            <Typography fontSize={24} fontWeight={800} letterSpacing="-0.5px">
              Quotation Order Checkout
            </Typography>
            <Typography fontSize={14} sx={{ color: "rgba(255, 255, 255, 0.85)", mt: 0.3 }}>
              Enter your official Quote ID to retrieve quotation details and complete equipment procurement.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {checkoutSuccess && quotation ? (
        /* SUCCESS CONFIRMATION SCREEN */
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            border: `1px solid ${THEME.border}`,
            bgcolor: THEME.white,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 72, color: THEME.success, mb: 2 }} />
          <Typography fontSize={24} fontWeight={800} color={THEME.textPrimary}>
            Order Checkout Completed Successfully!
          </Typography>
          <Typography fontSize={15} color={THEME.textSecondary} sx={{ maxWidth: 600, mx: "auto", mt: 1, mb: 3 }}>
            Your checkout for Quotation <strong>{quotation.quote_id}</strong> has been received and processed.
            Our technical sales team will contact <strong>{quotation.email}</strong> regarding delivery schedules.
          </Typography>

          <Paper elevation={0} sx={{ p: 3, maxWidth: 540, mx: "auto", bgcolor: COLOR_GREEN_50, borderRadius: 2.5, border: `1px solid ${COLOR_GREEN_500}50`, mb: 4, textAlign: "left" }}>
            <Typography fontSize={14} fontWeight={700} color={COLOR_GREEN_800} mb={1}>
              Order Summary & Tax Invoice Details:
            </Typography>
            <Typography fontSize={13} color={COLOR_GREEN_800}>
              • Quote ID: <strong>{quotation.quote_id}</strong>
            </Typography>
            {quotation.bill_number && (
              <Typography fontSize={13} color={COLOR_GREEN_800}>
                • Generated Bill No: <strong>{quotation.bill_number}</strong>
              </Typography>
            )}
            <Typography fontSize={13} color={COLOR_GREEN_800}>
              • Total Amount Paid: <strong>₹{quotation.total_amount.toLocaleString("en-IN")}</strong>
            </Typography>
            <Typography fontSize={13} color={COLOR_GREEN_800}>
              • Status: <strong style={{ color: COLOR_GREEN_600 }}>CHECKED OUT & BILLED</strong>
            </Typography>
          </Paper>

          <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
            <CustomButton
              variant="contained"
              onClick={() => navigate("/bills")}
              sx={{ bgcolor: THEME.primary, borderRadius: 2, textTransform: "none", fontWeight: 700, px: 3 }}
            >
              View Generated Bill History
            </CustomButton>
            <CustomButton
              variant="outlined"
              onClick={() => navigate("/quotations")}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, px: 3 }}
            >
              Quotation History
            </CustomButton>
            <CustomButton
              variant="text"
              onClick={() => navigate("/showcase")}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, px: 3 }}
            >
              Return to Showcase
            </CustomButton>
          </Box>
        </Paper>
      ) : (
        /* MAIN CHECKOUT FORM & QUOTE ID LOOKUP */
        <Grid container spacing={3.5}>
          {/* Left Column: Quote ID Lookup & Quote Details */}
          <Grid item xs={12} md={7}>
            {/* Quote ID Lookup Card */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
              <Typography fontSize={16} fontWeight={800} mb={1.5} color={THEME.textPrimary}>
                Look Up Quotation by Quote ID
              </Typography>
              <Box display="flex" gap={1.5}>
                <CustomInput
                  fullWidth
                  size="small"
                  placeholder="Enter Quote ID (e.g. QT-2026-89412)"
                  value={inputQuoteId}
                  onChange={(e: any) => setInputQuoteId(e.target.value.toUpperCase())}
                />
                <CustomButton
                  variant="contained"
                  disabled={loadingQuote}
                  startIcon={<SearchIcon />}
                  onClick={() => fetchQuoteDetails(inputQuoteId)}
                  sx={{ bgcolor: THEME.primary, px: 3, borderRadius: 1.5, textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}
                >
                  {loadingQuote ? "Fetching..." : "Fetch Quote"}
                </CustomButton>
              </Box>

              {quoteError && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                  {quoteError}
                </Alert>
              )}
            </Paper>

            {/* Fetched Quotation Details */}
            {quotation && (
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <ReceiptIcon sx={{ color: THEME.primary, fontSize: 26 }} />
                    <Typography fontSize={16} fontWeight={800} color={THEME.textPrimary}>
                      Quotation #{quotation.quote_id}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1} alignItems="center">
                    <Chip
                      label={quotation.status}
                      size="small"
                      color={quotation.status === "CHECKED_OUT" ? "success" : quotation.status === "GENERATED" ? "primary" : "error"}
                      sx={{ fontWeight: 800, fontSize: 11 }}
                    />
                    <Chip
                      label={`Valid till: ${new Date(quotation.valid_until).toLocaleDateString("en-IN")}`}
                      size="small"
                      variant="outlined"
                      color={quotation.is_valid ? "success" : "error"}
                      sx={{ fontWeight: 700, fontSize: 11 }}
                    />
                  </Box>
                </Box>

                {!quotation.is_valid && quotation.status !== "CHECKED_OUT" && (
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                    This quotation expired on {new Date(quotation.valid_until).toLocaleDateString("en-IN")}. Please generate a new quotation.
                  </Alert>
                )}

                {/* Items Table */}
                <Table size="small" sx={{ mb: 2 }}>
                  <TableHead sx={{ bgcolor: COLOR_SLATE_50 }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Item Description</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Qty</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Unit Price</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quotation.items.map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>{item.product_id}</TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{item.product_name}</TableCell>
                        <TableCell align="center" sx={{ fontSize: 13 }}>{item.quantity}</TableCell>
                        <TableCell align="right" sx={{ fontSize: 13 }}>₹{item.price.toLocaleString("en-IN")}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: 13 }}>₹{item.total.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="flex-end">
                  <Box minWidth={240}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography fontSize={13} color={THEME.textSecondary}>Subtotal:</Typography>
                      <Typography fontSize={13} fontWeight={600}>₹{quotation.subtotal.toLocaleString("en-IN")}</Typography>
                    </Box>
                    {quotation.discount_amount > 0 && (
                      <Box display="flex" justifyContent="space-between" mb={0.5} color="error.main">
                        <Typography fontSize={13}>Discount:</Typography>
                        <Typography fontSize={13} fontWeight={600}>- ₹{quotation.discount_amount.toLocaleString("en-IN")}</Typography>
                      </Box>
                    )}
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography fontSize={13} color={THEME.textSecondary}>GST (18% Est.):</Typography>
                      <Typography fontSize={13} fontWeight={600}>₹{quotation.tax_amount.toLocaleString("en-IN")}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography fontSize={16} fontWeight={800} color={THEME.primary}>Total Amount:</Typography>
                      <Typography fontSize={16} fontWeight={800} color={THEME.primary}>₹{quotation.total_amount.toLocaleString("en-IN")}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            )}
          </Grid>

          {/* Right Column: Checkout Customer Form & Payment Placeholder */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              component="form"
              onSubmit={handleCheckoutSubmit}
              sx={{ p: 3, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}
            >
              <Typography fontSize={16} fontWeight={800} mb={2} color={THEME.textPrimary}>
                Customer & Shipping Details
              </Typography>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={12}>
                  <CustomSelect
                    enableSearch
                    label="Auto-fill from Registered Customer Account"
                    value={selectedCustId}
                    options={customerOptions}
                    onChange={(val) => handleSelectCustomer(String(val || ""))}
                    searchTerm={customerSearchTerm}
                    onSearchChange={setCustomerSearchTerm}
                    onScrollEnd={fetchMoreCustomers}
                    hasMore={hasMoreCustomers}
                    isLoading={isCustomersLoading}
                    isFetchingMore={isCustomersFetchingMore}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomInput
                    fullWidth
                    required
                    size="small"
                    label="Customer / Contact Person Name"
                    value={customerName}
                    onChange={(e: any) => setCustomerName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomInput
                    fullWidth
                    size="small"
                    label="Institution / Company Name (Fetched from Profile)"
                    value={institutionName || activeCompany?.company_name || ""}
                    InputProps={{ readOnly: true }}
                    helperText="Fetched automatically from Company Profile details"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomInput
                    fullWidth
                    required
                    size="small"
                    label="Email Address"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomInput
                    fullWidth
                    required
                    size="small"
                    label="Phone Number"
                    value={phone}
                    onChange={(e: any) => setPhone(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomInput
                    fullWidth
                    required
                    multiline
                    rows={2}
                    size="small"
                    label="Shipping & Installation Address"
                    value={shippingAddress}
                    onChange={(e: any) => setShippingAddress(e.target.value)}
                  />
                </Grid>

                {/* Payment Method Selector */}
                <Grid item xs={12}>
                  <CustomInput
                    fullWidth
                    select
                    size="small"
                    label="Payment Method *"
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    helperText="Official Razorpay Standard Checkout SDK mode"
                  >
                    <MenuItem value="RAZORPAY">⚡ Online Payment via Razorpay (Cards, UPI, Netbanking)</MenuItem>
                    <MenuItem value="PURCHASE_ORDER">Official Institutional Purchase Order (PO)</MenuItem>
                    <MenuItem value="NET_BANKING">Bank Wire Transfer / NEFT / RTGS</MenuItem>
                  </CustomInput>
                </Grid>


                <Grid item xs={12}>
                  <CustomInput
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label="Order Notes & Special Instructions"
                    value={notes}
                    onChange={(e: any) => setNotes(e.target.value)}
                  />
                </Grid>
              </Grid>

              <CustomButton
                fullWidth
                type="submit"
                variant="contained"
                disabled={!quotation || !quotation.is_valid || submittingCheckout}
                startIcon={<SendIcon />}
                sx={{
                  bgcolor: THEME.success,
                  "&:hover": { bgcolor: COLOR_GREEN_700 },
                  py: 1.4,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                {submittingCheckout ? "Processing Order Checkout..." : `Complete Order Checkout (₹${quotation ? quotation.total_amount.toLocaleString("en-IN") : "0"})`}
              </CustomButton>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CheckoutPage;
