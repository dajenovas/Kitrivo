import React, { useState, useEffect } from "react";
import { CompanyService } from "@/services/company.service";
import type { Company } from "@/models/company.models";
import { THEME } from "@/assets/theme";
import { Dialog, DialogContent, DialogActions, Box, Typography, Chip, IconButton, Paper, Divider, Table, TableBody, TableCell, TableHead, TableRow, Grid } from "@mui/material";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { Close as CloseIcon, Print as PrintIcon, Receipt as ReceiptIcon, CheckCircle as CheckCircleIcon, Business as BusinessIcon, Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon, CreditCard as PaymentIcon } from "@mui/icons-material";
import type { BillPreviewModalProps } from "@/types/common.types";


export const BillPreviewModal: React.FC<BillPreviewModalProps> = ({ open, bill, onClose }) => {
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (open) {
      CompanyService.getActiveCompany().then((res) => {
        if (res.data) setActiveCompany(res.data);
      }).catch(() => { });
    }
  }, [open]);

  if (!bill) return null;

  const handlePrint = () => { window.print(); };

  const formattedDate = new Date(bill.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" px={3} py={2} borderBottom={`1px solid ${THEME.border}`}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <ReceiptIcon sx={{ color: THEME.primary, fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={700} color={THEME.textPrimary}> Official Tax Invoice / Bill #{bill.bill_number} </Typography>
            <Typography variant="caption" color={THEME.textSecondary}> Generated on {formattedDate} </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <CustomButton variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ borderRadius: 2 }}> Print Bill </CustomButton>
          <IconButton onClick={onClose}> <CloseIcon /> </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        {/* Invoice Container for printing */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }} id="bill-print-section">
          {/* Header Banner */}
          <Grid container spacing={3} alignItems="flex-start" mb={4}>
            <Grid item xs={12} sm={7}>
              {activeCompany?.logo_url ? (
                <Box component="img" src={activeCompany.logo_url} alt="Company Logo" sx={{ maxHeight: 50, mb: 1.5, objectFit: "contain" }} />
              ) : (
                <Typography variant="h5" fontWeight={800} color={THEME.primary} mb={0.5}> {activeCompany?.company_name || "Kitrivo Equipment Systems"} </Typography>
              )}
              <Typography fontSize={13} color={THEME.textSecondary} whiteSpace="pre-line"> {activeCompany?.address || "102 Industrial Tech Park, Sector 62\nNoida, Uttar Pradesh, 201301"} </Typography>
              {activeCompany?.gst_number && (
                <Typography fontSize={12} fontWeight={700} color={THEME.primary} mt={0.5}> GSTIN: {activeCompany.gst_number} </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={5} textAlign={{ sm: "right" }}>
              <Chip icon={<CheckCircleIcon sx={{ fontSize: 16 }} />} label={bill.status} color="success" sx={{ fontWeight: 700, mb: 1 }} />
              <Typography variant="h6" fontWeight={800} color={THEME.textPrimary}> TAX INVOICE </Typography>
              <Typography fontSize={13} color={THEME.textSecondary}> Bill No: <strong>{bill.bill_number}</strong> </Typography>
              {bill.quote_id && (<Typography fontSize={13} color={THEME.textSecondary}> Quote Reference: <strong>{bill.quote_id}</strong> </Typography>)}
              <Typography fontSize={13} color={THEME.textSecondary}> Date: <strong>{formattedDate}</strong> </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 4 }} />

          {/* Customer & Payment Info */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, bgcolor: THEME.background, height: "100%" }}>
                <Typography fontSize={12} fontWeight={800} color={THEME.textSecondary} textTransform="uppercase" mb={1} display="flex" alignItems="center" gap={0.5}>
                  <PersonIcon fontSize="small" /> Billed To (Customer Details)
                </Typography>
                <Typography fontSize={15} fontWeight={700} color={THEME.textPrimary}>
                  {bill.customer_name}
                </Typography>
                {bill.institution_name && (
                  <Typography fontSize={13} color={THEME.textSecondary} display="flex" alignItems="center" gap={0.5} mt={0.5}>
                    <BusinessIcon fontSize="small" /> {bill.institution_name}
                  </Typography>
                )}
                <Typography fontSize={13} color={THEME.textSecondary} display="flex" alignItems="center" gap={0.5} mt={0.5}>
                  <EmailIcon fontSize="small" /> {bill.email}
                </Typography>
                {bill.phone && (
                  <Typography fontSize={13} color={THEME.textSecondary} display="flex" alignItems="center" gap={0.5} mt={0.5}>
                    <PhoneIcon fontSize="small" /> {bill.phone}
                  </Typography>
                )}
                {bill.billing_address && (
                  <Typography fontSize={13} color={THEME.textSecondary} mt={1}>
                    {bill.billing_address}
                  </Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, bgcolor: THEME.background, height: "100%" }}>
                <Typography fontSize={12} fontWeight={800} color={THEME.textSecondary} textTransform="uppercase" mb={1} display="flex" alignItems="center" gap={0.5}>
                  <PaymentIcon fontSize="small" /> Payment Summary
                </Typography>
                <Typography fontSize={14} color={THEME.textPrimary} mt={0.5}>
                  Payment Method: <strong>{bill.payment_method}</strong>
                </Typography>
                {bill.payment_id && (
                  <Typography fontSize={13} color={THEME.textSecondary} mt={0.5}>
                    Transaction Ref: <code>{bill.payment_id}</code>
                  </Typography>
                )}
                <Typography fontSize={14} color={THEME.textPrimary} mt={0.5}>
                  Payment Status: <strong style={{ color: THEME.success }}>{bill.status}</strong>
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Line Items Table */}
          <Table sx={{ mb: 3 }}>
            <TableHead sx={{ bgcolor: THEME.background }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>ITEM DESCRIPTION</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>QTY</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>UNIT PRICE (₹)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>TOTAL AMOUNT (₹)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bill.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ fontSize: 13 }}>{index + 1}</TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{item.product_name}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13 }}>{item.quantity}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13 }}>₹{item.unit_price.toLocaleString("en-IN")}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13, fontWeight: 700 }}>₹{item.total.toLocaleString("en-IN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals Summary */}
          <Box display="flex" justifyContent="flex-end" mb={3}>
            <Box width={280}>
              <Box display="flex" justifyContent="space-between" py={0.75}>
                <Typography fontSize={13} color={THEME.textSecondary}>Subtotal:</Typography>
                <Typography fontSize={13} fontWeight={600}>₹{bill.subtotal.toLocaleString("en-IN")}</Typography>
              </Box>
              {bill.discount_amount > 0 && (
                <Box display="flex" justifyContent="space-between" py={0.75}>
                  <Typography fontSize={13} color={THEME.textSecondary}>Discount:</Typography>
                  <Typography fontSize={13} fontWeight={600} color={THEME.error}>- ₹{bill.discount_amount.toLocaleString("en-IN")}</Typography>
                </Box>
              )}
              <Box display="flex" justifyContent="space-between" py={0.75}>
                <Typography fontSize={13} color={THEME.textSecondary}>Tax (GST 18%):</Typography>
                <Typography fontSize={13} fontWeight={600}>₹{bill.tax_amount.toLocaleString("en-IN")}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between" py={1}>
                <Typography fontSize={16} fontWeight={800} color={THEME.textPrimary}>Grand Total:</Typography>
                <Typography fontSize={18} fontWeight={800} color={THEME.primary}>₹{bill.total_amount.toLocaleString("en-IN")}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Footer Terms */}
          <Divider sx={{ my: 3 }} />
          <Box textAlign="center">
            <Typography fontSize={12} color={THEME.textSecondary}> Thank you for choosing {activeCompany?.company_name || "Kitrivo Equipment Systems"}. This is an official computer-generated invoice. </Typography>
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${THEME.border}` }}>
        <CustomButton onClick={onClose} variant="contained" sx={{ borderRadius: 2 }}> Close </CustomButton>
      </DialogActions>
    </Dialog>
  );
};
