import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";
import { QuotationService } from "@/services/quotation.service";
import { CompanyService } from "@/services/company.service";
import type { Company } from "@/models/company.models";
import { THEME } from "@/assets/theme";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Chip, IconButton, Paper, Divider, Table, TableBody, TableCell, TableHead, TableRow, Grid, Alert, Snackbar } from "@mui/material";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { CustomInput } from "@/components/Inputs/CustomInput";
import { CustomSelect } from "@/components/Inputs/CustomSelect";
import { useCustomerStore } from "@/store/useCustomerStore";
import type { SelectOption } from "@/types/input.types";
import { Close as CloseIcon, GetApp as DownloadIcon, Edit as EditIcon, Visibility as VisibilityIcon, Save as SaveIcon, ArrowForward as ArrowForwardIcon, Receipt as ReceiptIcon } from "@mui/icons-material";
import type { QuotationTemplateModalProps } from "@/types/common.types";
import type { QuotationModel, QuoteItemPayload } from "@/models/quotation.models";


export const QuotationTemplateModal: React.FC<QuotationTemplateModalProps> = ({ open, quotation, onClose, onQuotationUpdated }) => {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [currentQuote, setCurrentQuote] = useState<QuotationModel | null>(null);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);

  // Editable Form State
  const [institutionName, setInstitutionName] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [billingAddress, setBillingAddress] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [validUntilDate, setValidUntilDate] = useState<string>("");

  const [items, setItems] = useState<QuoteItemPayload[]>([]);

  // Toast alert
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>("");

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
    if (open) {
      CompanyService.getActiveCompany().then((res) => {
        if (res.data) setActiveCompany(res.data);
      });
      fetchCustomers();
    }
  }, [open, fetchCustomers]);

  const customerOptions: SelectOption[] = React.useMemo(
    () => [
      { id: "", label: "-- Enter / Keep Client Details Manually --" },
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
      const primaryContact = found.contact_persons && found.contact_persons.length > 0 ? found.contact_persons[0].name : found.company_name;
      setInstitutionName(found.company_name);
      setContactName(primaryContact);
      setEmail(found.email || (found.contact_persons && found.contact_persons[0]?.email) || "");
      setPhone(found.phone || (found.contact_persons && found.contact_persons[0]?.phone) || "");
      setBillingAddress(found.billing_address || "");
    }
  };


  useEffect(() => {
    if (quotation) {
      setCurrentQuote(quotation);
      setInstitutionName(quotation.institution_name || activeCompany?.company_name || "");
      setContactName(quotation.contact_name || activeCompany?.company_name || "");
      setEmail(quotation.email || activeCompany?.email || "");
      setPhone(quotation.phone || activeCompany?.phone || "");
      setBillingAddress(quotation.billing_address || activeCompany?.billing_address || activeCompany?.address || "");
      setNotes(quotation.notes || "Standard 18% GST applicable. Free delivery and onsite setup within 10 days.");
      setDiscountAmount(quotation.discount_amount || 0);

      if (quotation.valid_until) {
        const d = new Date(quotation.valid_until);
        setValidUntilDate(d.toISOString().split("T")[0]);
      }
      setItems(quotation.items || []);
    }
  }, [quotation, activeCompany]);

  if (!currentQuote) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxable * 0.18 * 100) / 100;
  const totalAmount = Math.round((taxable + taxAmount) * 100) / 100;

  const handleSaveQuotation = async () => {
    setSaving(true);
    try {
      const res = await QuotationService.updateQuotation(currentQuote.quote_id, {
        institution_name: institutionName,
        contact_name: contactName,
        email: email,
        phone: phone,
        billing_address: billingAddress,
        notes: notes,
        discount_amount: discountAmount,
        valid_until: validUntilDate ? new Date(validUntilDate).toISOString() : undefined,
        items: items,
      });

      if (res.data) {
        setCurrentQuote(res.data);
        if (onQuotationUpdated) onQuotationUpdated(res.data);
        setToastMsg("Quotation template updated and saved successfully!");
        setToastOpen(true);
        setIsEditing(false);
      }
    } catch (err: any) {
      setToastMsg("Failed to save quotation template edits.");
      setToastOpen(true);
    } finally {
      setSaving(false);
    }
  };

  const handleItemQtyChange = (idx: number, qty: number) => {
    if (qty < 1) return;
    const updated = [...items];
    updated[idx].quantity = qty;
    updated[idx].total = Math.round(updated[idx].price * qty * 100) / 100;
    setItems(updated);
  };

  const handleItemPriceChange = (idx: number, price: number) => {
    if (price < 0) return;
    const updated = [...items];
    updated[idx].price = price;
    updated[idx].total = Math.round(price * updated[idx].quantity * 100) / 100;
    setItems(updated);
  };

  const generatePDFSoftCopy = (): jsPDF => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const primaryColor = [30, 64, 175];

    const compName = activeCompany?.company_name || "KITRIVO EQUIPMENT SYSTEMS";
    const gstInfo = activeCompany?.gst_number ? `GSTIN: ${activeCompany.gst_number}` : "";
    const panInfo = activeCompany?.pan_number ? `PAN: ${activeCompany.pan_number}` : "";
    const taxLine = [gstInfo, panInfo].filter(Boolean).join("  |  ");

    // Header Banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 32, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(compName.toUpperCase(), 14, 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(taxLine || "OFFICIAL COMMERCIAL & TECHNICAL QUOTATION (SOFT COPY)", 14, 19);
    if (activeCompany?.address) {
      doc.setFontSize(7.5);
      doc.text(activeCompany.address.slice(0, 75), 14, 25);
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`QUOTE ID: ${currentQuote.quote_id}`, 145, 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`ISSUE DATE: ${new Date(currentQuote.created_at).toLocaleDateString("en-IN")}`, 145, 21);


    let y = 42;

    // Customer & Institution Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 26, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text("QUOTATION PREPARED FOR:", 18, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Institution / Client: ${institutionName || "Not Specified"}`, 18, y + 12);
    doc.text(`Contact Person: ${contactName || "Attn: Procurement Officer"}`, 18, y + 17);
    doc.text(`Email / Phone: ${email || "N/A"}  |  ${phone || "N/A"}`, 18, y + 22);

    const validText = validUntilDate
      ? new Date(validUntilDate).toLocaleDateString("en-IN")
      : new Date(currentQuote.valid_until).toLocaleDateString("en-IN");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    doc.text(`VALID TILL: ${validText}`, 130, y + 6);

    y += 32;

    // Items Table Header
    doc.setFillColor(30, 64, 175);
    doc.rect(14, y, 182, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("SKU / Product", 18, y + 5.5);
    doc.text("Item Name & Model", 55, y + 5.5);
    doc.text("Qty", 125, y + 5.5);
    doc.text("Unit Price (INR)", 142, y + 5.5);
    doc.text("Total (INR)", 175, y + 5.5);

    y += 8;

    // Items List
    items.forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 182, 7, "F");
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(item.product_id, 18, y + 5);

      doc.setFont("helvetica", "normal");
      doc.text(item.product_name.slice(0, 38), 55, y + 5);

      doc.text(String(item.quantity), 127, y + 5);
      doc.text(item.price.toLocaleString("en-IN"), 142, y + 5);
      doc.setFont("helvetica", "bold");
      doc.text(item.total.toLocaleString("en-IN"), 175, y + 5);

      y += 7;
    });

    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y, 196, y);
    y += 6;

    // Summary Totals Right Side
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Subtotal:", 135, y);
    doc.text(`INR ${subtotal.toLocaleString("en-IN")}`, 175, y);
    y += 5;

    if (discountAmount > 0) {
      doc.text("Special Discount:", 135, y);
      doc.text(`- INR ${discountAmount.toLocaleString("en-IN")}`, 175, y);
      y += 5;
    }

    doc.text("GST (18% Estimated):", 135, y);
    doc.text(`INR ${taxAmount.toLocaleString("en-IN")}`, 175, y);
    y += 6;

    doc.setFillColor(239, 246, 255);
    doc.rect(130, y - 4, 66, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 64, 175);
    doc.text("Total Amount:", 135, y + 1.5);
    doc.text(`INR ${totalAmount.toLocaleString("en-IN")}`, 175, y + 1.5);
    y += 14;

    // Terms & Conditions
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text("TERMS & CONDITIONS / SPECIAL NOTES:", 14, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const splitNotes = doc.splitTextToSize(notes || "Standard 18% GST. Official guarantee applies.", 182);
    doc.text(splitNotes, 14, y);

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 280, 196, 280);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("Generated by Kitrivo Technical Equipment Quotation Engine", 14, 285);
      doc.text(`Page ${i} of ${pageCount}`, 180, 285);
    }

    return doc;
  };

  const handleDownloadPDF = () => {
    const pdf = generatePDFSoftCopy();
    pdf.save(`${currentQuote.quote_id}_Official_Quotation.pdf`);
  };

  const handleProceedToCheckout = () => {
    onClose();
    navigate(`/checkout?quote_id=${currentQuote.quote_id}`);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ p: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <ReceiptIcon sx={{ color: THEME.primary, fontSize: 26 }} />
            <Box>
              <Typography fontSize={16} fontWeight={800} color={THEME.textPrimary}> Official Soft-Copy Quotation Template </Typography>
              <Typography fontSize={12} color={THEME.textSecondary}> Quote ID: <strong>{currentQuote.quote_id}</strong> | Mode: {isEditing ? "Editing Template" : "Soft Copy Preview"} </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <CustomButton size="small" variant={isEditing ? "contained" : "outlined"} startIcon={isEditing ? <VisibilityIcon /> : <EditIcon />} onClick={() => setIsEditing(!isEditing)} sx={{ textTransform: "none", fontSize: 12, borderRadius: 1.5, fontWeight: 700 }}>
              {isEditing ? "Preview Template" : "Edit Template"}
            </CustomButton>
            <IconButton onClick={onClose} size="small"> <CloseIcon /> </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: isEditing ? "#ffffff" : "#f8fafc" }}>
          {isEditing ? (
            /* EDITABLE TEMPLATE MODE */
            <Box display="flex" flexDirection="column" gap={2.5}>
              <Alert severity="info" sx={{ borderRadius: 2, fontSize: 13 }}> <strong>Editable Template:</strong> Edit quotation validity date, special discounts, custom notes, item quantities, and prices before generating the final PDF soft copy. Client details are fetched automatically from Company Profile. </Alert>

              {/* Customer & Institution Info Section (Read-Only from Company) */}
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: `1px solid ${THEME.border}` }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography fontSize={14} fontWeight={700} color={THEME.textPrimary}> Company & Client Details </Typography>
                  <Chip label="Fetched from Company Profile" size="small" color="primary" variant="outlined" sx={{ fontSize: 11, fontWeight: 700 }} />
                </Box>

                <Paper elevation={0} sx={{ p: 2, mb: 2.5, bgcolor: "#f8fafc", borderRadius: 2, border: `1px solid ${THEME.border}` }}>
                  <Typography fontSize={14} fontWeight={800} color={THEME.textPrimary}> {activeCompany?.company_name || institutionName || "Kitrivo Equipment Systems"} </Typography>
                  <Typography fontSize={12} color={THEME.textSecondary} mt={0.3}> Email: <strong>{activeCompany?.email || email || "N/A"}</strong> | Phone: <strong>{activeCompany?.phone || phone || "N/A"}</strong> </Typography>
                  {(activeCompany?.billing_address || activeCompany?.address || billingAddress) && (<Typography fontSize={12} color={THEME.textSecondary} mt={0.3}> Address: {activeCompany?.billing_address || activeCompany?.address || billingAddress} </Typography>)}
                </Paper>

                <Grid container spacing={2}>
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
                  <Grid item xs={12} sm={6}>
                    <CustomInput fullWidth size="small" label="Institution / Client Name" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomInput fullWidth size="small" label="Contact Person Name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomInput fullWidth type="date" size="small" label="Quotation Validity Date" InputLabelProps={{ shrink: true }} value={validUntilDate} onChange={(e) => setValidUntilDate(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomInput fullWidth type="number" size="small" label="Special Discount (INR)" value={discountAmount} onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)} />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomInput fullWidth multiline rows={2} size="small" label="Special Notes & Terms" value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </Grid>
                </Grid>
              </Paper>

              {/* Editable Items Table */}
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: `1px solid ${THEME.border}` }}>
                <Typography fontSize={14} fontWeight={700} mb={2} color={THEME.textPrimary}> Editable Quote Line Items </Typography>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Product Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 100 }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 140 }}>Unit Price (₹)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Total (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>{item.product_id}</TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{item.product_name}</TableCell>
                        <TableCell>
                          <CustomInput type="number" size="small" value={item.quantity} onChange={(e) => handleItemQtyChange(idx, parseInt(e.target.value, 10) || 1)} inputProps={{ min: 1 }} />
                        </TableCell>
                        <TableCell>
                          <CustomInput type="number" size="small" value={item.price} onChange={(e) => handleItemPriceChange(idx, parseFloat(e.target.value) || 0)} inputProps={{ min: 0 }} />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: 13 }}> ₹{item.total.toLocaleString("en-IN")} </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          ) : (
            /* PREVIEW / SOFT COPY TEMPLATE MODE */
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2.5, border: `1px solid ${THEME.border}`, bgcolor: "#ffffff", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              {/* Soft Copy Header Banner */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" borderBottom={`2px solid ${THEME.primary}`} pb={2.5} mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                  {activeCompany?.logo_url ? (
                    <Box component="img" src={activeCompany.logo_url} alt={activeCompany.company_name} sx={{ width: 56, height: 56, objectFit: "contain", borderRadius: 1.5, border: `1px solid ${THEME.border}`, p: 0.5 }} />
                  ) : null}
                  <Box>
                    <Typography fontSize={20} fontWeight={800} color={THEME.primary}> {activeCompany?.company_name || "KITRIVO EQUIPMENT SYSTEMS"} </Typography>
                    <Typography fontSize={12} color={THEME.textSecondary} mt={0.3}> {activeCompany?.gst_number ? `GSTIN: ${activeCompany.gst_number}` : ""} {activeCompany?.pan_number ? `| PAN: ${activeCompany.pan_number}` : ""} </Typography>
                    {activeCompany?.address && (<Typography fontSize={11} color={THEME.textSecondary} mt={0.2}> {activeCompany.address} </Typography>)}
                  </Box>
                </Box>

                <Box textAlign="right">
                  <Chip label={currentQuote.quote_id} color="primary" sx={{ fontWeight: 800, fontSize: 13, mb: 0.5 }} />
                  <Typography fontSize={11} color={THEME.textSecondary}> Issue Date: {new Date(currentQuote.created_at).toLocaleDateString("en-IN")} </Typography>
                  <Typography fontSize={11} color="error" fontWeight={700}> Valid Till: {validUntilDate ? new Date(validUntilDate).toLocaleDateString("en-IN") : new Date(currentQuote.valid_until).toLocaleDateString("en-IN")} </Typography>
                </Box>
              </Box>


              {/* Customer Box */}
              <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "#f8fafc", borderRadius: 2, border: `1px solid ${THEME.border}` }}>
                <Typography fontSize={12} fontWeight={700} color={THEME.textSecondary} textTransform="uppercase" mb={0.5}> Quotation Prepared For: </Typography>
                <Typography fontSize={14} fontWeight={700} color={THEME.textPrimary}> {institutionName || "Client Institution"} </Typography>
                <Typography fontSize={13} color={THEME.textSecondary}> Attention: {contactName || "Procurement Officer"} | Email: {email || "N/A"} | Phone: {phone || "N/A"} </Typography>
              </Paper>

              {/* Items Table */}
              <Table size="small" sx={{ mb: 3 }}>
                <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Product Name</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Qty</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Unit Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Total Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, idx) => (
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

              {/* Summary Totals */}
              <Box display="flex" justifyContent="flex-end" mb={3}>
                <Paper elevation={0} sx={{ p: 2, minWidth: 280, bgcolor: "#eff6ff", borderRadius: 2, border: `1px solid ${THEME.primary}30` }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography fontSize={13}>Subtotal:</Typography>
                    <Typography fontSize={13} fontWeight={600}>₹{subtotal.toLocaleString("en-IN")}</Typography>
                  </Box>
                  {discountAmount > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={0.5} color="error.main">
                      <Typography fontSize={13}>Discount:</Typography>
                      <Typography fontSize={13} fontWeight={600}>- ₹{discountAmount.toLocaleString("en-IN")}</Typography>
                    </Box>
                  )}
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography fontSize={13}>GST (18% Est.):</Typography>
                    <Typography fontSize={13} fontWeight={600}>₹{taxAmount.toLocaleString("en-IN")}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography fontSize={15} fontWeight={800} color={THEME.primary}>Total Amount:</Typography>
                    <Typography fontSize={15} fontWeight={800} color={THEME.primary}>₹{totalAmount.toLocaleString("en-IN")}</Typography>
                  </Box>
                </Paper>
              </Box>

              {/* Terms */}
              <Box>
                <Typography fontSize={12} fontWeight={700} color={THEME.textPrimary} mb={0.5}> Terms & Notes: </Typography>
                <Typography fontSize={12} color={THEME.textSecondary} lineHeight={1.5}> {notes || "Standard 18% GST applies. Formal purchase orders accepted via quote checkout."} </Typography>
              </Box>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${THEME.border}`, justifyContent: "space-between" }}>
          <Box display="flex" gap={1}>
            {isEditing && (
              <CustomButton variant="contained" startIcon={<SaveIcon />} onClick={handleSaveQuotation} disabled={saving} sx={{ bgcolor: THEME.primary, borderRadius: 1.5, textTransform: "none", fontWeight: 700 }}>
                {saving ? "Saving Edits..." : "Save Template Edits"}
              </CustomButton>
            )}
            <CustomButton variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadPDF} sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600, borderColor: THEME.primary, color: THEME.primary }}>
              Download Soft Copy PDF
            </CustomButton>
          </Box>
          <CustomButton variant="contained" color="success" endIcon={<ArrowForwardIcon />} onClick={handleProceedToCheckout} sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700, px: 3 }}>
            Checkout with Quote ID ({currentQuote.quote_id})
          </CustomButton>
        </DialogActions>
      </Dialog>

      <Snackbar open={toastOpen} autoHideDuration={3000} onClose={() => setToastOpen(false)}>
        <Alert severity="success" onClose={() => setToastOpen(false)}> {toastMsg} </Alert>
      </Snackbar>
    </>
  );
};

export default QuotationTemplateModal;
