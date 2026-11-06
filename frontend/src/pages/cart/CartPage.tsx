import React, { useEffect, useState } from "react";
import { THEME, COLOR_PRIMARY_DARK, COLOR_BLUE_50, COLOR_SLATE_50, COLOR_SLATE_500 } from "@/assets/theme";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/useCartStore";
import { QuotationService } from "@/services/quotation.service";
import QuotationTemplateModal from "@/components/QuotationTemplateModal";
import { Box, Typography, Paper, Grid, IconButton, Divider, Chip } from "@mui/material";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { ShoppingCart as ShoppingCartIcon, Storefront as StorefrontIcon, Delete as DeleteIcon, Add as AddIcon, Remove as RemoveIcon, ReceiptLong as ReceiptLongIcon } from "@mui/icons-material";
import { CompanyService } from "@/services/company.service";
import type { QuotationModel } from "@/models/quotation.models";
import type { Company } from "@/models/company.models";

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getItemCount } = useCartStore();

  const [generatingQuote, setGeneratingQuote] = useState<boolean>(false);
  const [createdQuote, setCreatedQuote] = useState<QuotationModel | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState<boolean>(false);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);

  useEffect(() => {
    CompanyService.getActiveCompany().then((res) => {
      if (res.data) {
        setActiveCompany(res.data);
      }
    });
  }, []);

  const subtotal = getTotalPrice();
  const taxEstimate = Math.round(subtotal * 0.18 * 100) / 100;
  const totalEstimate = Math.round((subtotal + taxEstimate) * 100) / 100;

  const handleGenerateQuotation = async () => {
    if (items.length === 0) return;

    setGeneratingQuote(true);
    try {
      // Fetch custom validity setting if saved in localStorage
      const savedValidityDays = localStorage.getItem("quotation_validity_days");
      let customValidityDate: string | undefined = undefined;

      if (savedValidityDays) {
        const days = parseInt(savedValidityDays, 10);
        if (!isNaN(days) && days > 0) {
          const d = new Date();
          d.setDate(d.getDate() + days);
          customValidityDate = d.toISOString();
        }
      }

      const quoteItems = items.map((item) => ({
        product_id: item.product.product_id,
        product_name: item.product.product_name,
        model_number: item.product.model_number || undefined,
        price: item.product.price,
        quantity: item.quantity,
        total: Math.round(item.product.price * item.quantity * 100) / 100,
      }));

      const res = await QuotationService.createQuotation({
        items: quoteItems,
        institution_name: activeCompany?.company_name || undefined,
        contact_name: activeCompany?.company_name || undefined,
        email: activeCompany?.email || undefined,
        phone: activeCompany?.phone || undefined,
        billing_address: activeCompany?.billing_address || activeCompany?.address || undefined,
        valid_until: customValidityDate,
      });

      if (res.data) {
        setCreatedQuote(res.data);
        setQuoteModalOpen(true);
      }
    } catch (err: any) {
      console.error("Failed to generate quotation:", err);
    } finally {
      setGeneratingQuote(false);
    }
  };

  return (
    <Box p={3.5} sx={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header Banner */}
      <Paper elevation={0} sx={{ p: 3.5, mb: 3.5, borderRadius: 3, background: `linear-gradient(135deg, ${THEME.primary} 0%, ${COLOR_PRIMARY_DARK} 100%)`, color: THEME.white, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.3)" }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: "rgba(255, 255, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", }}>
            <ShoppingCartIcon sx={{ fontSize: 30, color: THEME.white }} />
          </Box>
          <Box>
            <Typography fontSize={24} fontWeight={800} letterSpacing="-0.5px"> Product Inquiry Cart & Quotation Builder </Typography>
            <Typography fontSize={14} sx={{ color: "rgba(255, 255, 255, 0.85)", mt: 0.3 }}> Manage selected trainer equipment, lab kits, and generate official soft-copy quotations. </Typography>
          </Box>
        </Box>

        <Chip label={`${getItemCount()} Items Selected`} sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", color: THEME.white, fontWeight: 700, fontSize: 13, px: 1, py: 2 }} />
      </Paper>

      {/* Cart Content */}
      {items.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: "center", borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
          <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: COLOR_BLUE_50, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
            <ShoppingCartIcon sx={{ fontSize: 40, color: THEME.primary }} />
          </Box>
          <Typography fontSize={20} fontWeight={800} color={THEME.textPrimary}> Your Inquiry Cart is Empty </Typography>
          <Typography fontSize={14} color={THEME.textSecondary} sx={{ maxWidth: 500, mx: "auto", mt: 1 }}> Explore our Product Showcase or Lab Manuals catalog to add products and request formal quotations. </Typography>
          <Box display="flex" justifyContent="center" gap={2} mt={3.5}>
            <CustomButton variant="contained" startIcon={<StorefrontIcon />} onClick={() => navigate("/showcase")} sx={{ bgcolor: THEME.primary, px: 3.5, py: 1.2, borderRadius: 2, textTransform: "none", fontWeight: 700 }}> Browse Product Showcase </CustomButton>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={3.5}>
          {/* Cart Items List */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                <Typography fontSize={16} fontWeight={800} color={THEME.textPrimary}> Inquiry Items ({items.length}) </Typography>
                <CustomButton size="small" color="error" onClick={clearCart} sx={{ textTransform: "none", fontSize: 12, fontWeight: 600 }}>
                  Clear All Items
                </CustomButton>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box display="flex" flexDirection="column" gap={2}>
                {items.map(({ product, quantity }) => {
                  const itemTotal = product.price * quantity;
                  return (
                    <Paper key={product.id} elevation={0} sx={{ p: 2, borderRadius: 2.5, border: `1px solid ${THEME.border}`, display: "flex", gap: 2, alignItems: "center" }}>
                      <Box component="img" src={product.images?.[0] || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80"} alt={product.product_name} sx={{ width: 72, height: 72, borderRadius: 2, objectFit: "contain", bgcolor: COLOR_SLATE_50, p: 1 }} />

                      <Box flex={1}>
                        <Typography fontSize={15} fontWeight={700} color={THEME.textPrimary}>
                          {product.product_name}
                        </Typography>
                        <Typography fontSize={12} color={THEME.textSecondary} mt={0.3}>
                          SKU: <strong>{product.product_id}</strong> {product.model_number ? `| Model: ${product.model_number}` : ""}
                        </Typography>
                        <Typography fontSize={14} fontWeight={800} color={THEME.primary} mt={0.5}>
                          ₹{product.price.toLocaleString("en-IN")}{" "}
                          <span style={{ fontSize: 11, fontWeight: 400, color: COLOR_SLATE_500 }}>(unit price)</span>
                        </Typography>
                      </Box>

                      {/* Quantity Controls */}
                      <Box display="flex" alignItems="center" border={`1px solid ${THEME.border}`} borderRadius={2} p={0.5}>
                        <IconButton size="small" onClick={() => updateQuantity(product.id, quantity - 1)}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography fontSize={14} fontWeight={700} sx={{ px: 1.5 }}>
                          {quantity}
                        </Typography>
                        <IconButton size="small" onClick={() => updateQuantity(product.id, quantity + 1)}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* Total & Delete */}
                      <Box textAlign="right" minWidth={100}>
                        <Typography fontSize={15} fontWeight={800} color={THEME.textPrimary}>
                          ₹{itemTotal.toLocaleString("en-IN")}
                        </Typography>
                        <IconButton size="small" color="error" onClick={() => removeItem(product.id)} sx={{ mt: 0.5 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            </Paper>
          </Grid>

          {/* Quotation Summary & Institution Info */}
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" gap={2.5}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
                <Typography fontSize={16} fontWeight={800} mb={1.5} color={THEME.textPrimary}>
                  Quotation & Organization Details
                </Typography>

                <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, bgcolor: COLOR_SLATE_50, borderRadius: 2.5, border: `1px solid ${THEME.primary}30` }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography fontSize={11} fontWeight={700} color={THEME.primary} textTransform="uppercase">
                      Quotation Issuer & Company Profile
                    </Typography>
                    <Chip label="Auto-Fetched" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
                  </Box>

                  {activeCompany ? (
                    <Box display="flex" flexDirection="column" gap={0.8} mt={1}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        {activeCompany.logo_url && (
                          <Box component="img" src={activeCompany.logo_url} alt={activeCompany.company_name} sx={{ width: 40, height: 40, objectFit: "contain", borderRadius: 1.5, border: `1px solid ${THEME.border}`, p: 0.3 }} />
                        )}
                        <Box>
                          <Typography fontSize={15} fontWeight={800} color={THEME.textPrimary}>
                            {activeCompany.company_name}
                          </Typography>
                          <Typography fontSize={12} color={THEME.textSecondary}>
                            {activeCompany.gst_number ? `GSTIN: ${activeCompany.gst_number}` : ""} {activeCompany.pan_number ? `| PAN: ${activeCompany.pan_number}` : ""}
                          </Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Typography fontSize={12} color={THEME.textSecondary}>
                        <strong>Email:</strong> {activeCompany.email || "N/A"}
                      </Typography>
                      <Typography fontSize={12} color={THEME.textSecondary}>
                        <strong>Phone:</strong> {activeCompany.phone || "N/A"}
                      </Typography>
                      {(activeCompany.billing_address || activeCompany.address) && (
                        <Typography fontSize={12} color={THEME.textSecondary}>
                          <strong>Address:</strong> {activeCompany.billing_address || activeCompany.address}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography fontSize={13} color={THEME.textSecondary} mt={1}>
                      Loading active company details...
                    </Typography>
                  )}
                </Paper>

                <Divider sx={{ mb: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography fontSize={14} color={THEME.textSecondary}>Subtotal:</Typography>
                  <Typography fontSize={14} fontWeight={700}>₹{subtotal.toLocaleString("en-IN")}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography fontSize={14} color={THEME.textSecondary}>GST (18% Est.):</Typography>
                  <Typography fontSize={14} fontWeight={700}>₹{taxEstimate.toLocaleString("en-IN")}</Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box display="flex" justifyContent="space-between" mb={2.5}>
                  <Typography fontSize={16} fontWeight={800} color={THEME.primary}>Estimated Total:</Typography>
                  <Typography fontSize={16} fontWeight={800} color={THEME.primary}>₹{totalEstimate.toLocaleString("en-IN")}</Typography>
                </Box>

                <CustomButton fullWidth variant="contained" disabled={generatingQuote} startIcon={<ReceiptLongIcon />} onClick={handleGenerateQuotation} sx={{ bgcolor: THEME.primary, py: 1.4, borderRadius: 2, textTransform: "none", fontWeight: 800, fontSize: 14 }}>
                  {generatingQuote ? "Generating Quote..." : "Generate & Edit Quotation"}
                </CustomButton>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* EDITABLE QUOTATION TEMPLATE MODAL */}
      <QuotationTemplateModal open={quoteModalOpen} quotation={createdQuote} onClose={() => setQuoteModalOpen(false)} onQuotationUpdated={(updated) => setCreatedQuote(updated)} />
    </Box>
  );
};

export default CartPage;
