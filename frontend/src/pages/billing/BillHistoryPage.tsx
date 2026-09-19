import React, { useState, useEffect } from "react";
import type { BillModel, PaymentRecordModel } from "@/models/bill.models";
import { BillService } from "@/services/bill.service";
import { BillPreviewModal } from "@/components/BillPreviewModal";
import { CustomInput } from "@/components/Inputs/CustomInput";
import { THEME } from "@/assets/theme";
import { Box, Typography, Paper, Grid, Chip, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Drawer, Divider, List, ListItem, ListItemText } from "@mui/material";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { CustomSearchSelect } from "@/components/Inputs/CustomSearchSelect";
import { Receipt as BillIcon, Search as SearchIcon, Refresh as RefreshIcon, CheckCircle as CheckCircleIcon, AttachMoney as MoneyIcon, Print as PrintIcon, History as HistoryIcon } from "@mui/icons-material";
import { PaymentMethods } from "@/utils/StaticData";

export const BillHistoryPage: React.FC = () => {
  const [bills, setBills] = useState<BillModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("ALL");

  // Selected bill for preview/print modal
  const [selectedBill, setSelectedBill] = useState<BillModel | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);

  // Payment Recording Modal State
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [activePaymentBill, setActivePaymentBill] = useState<BillModel | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<string>("CASH");
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");

  // Payment History Drawer State
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState<boolean>(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecordModel[]>([]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await BillService.getAllBills(searchQuery, paymentMethodFilter === "ALL" ? undefined : paymentMethodFilter);
      if (res.data) {
        setBills(res.data);
      }
    } catch (err) {
      console.error("Failed to load bills:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [paymentMethodFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBills();
  };

  const handleOpenPreview = (bill: BillModel) => {
    setSelectedBill(bill);
    setPreviewModalOpen(true);
  };

  const handleOpenPaymentDialog = (bill: BillModel) => {
    setActivePaymentBill(bill);
    setPaymentAmount(String(bill.balance_due ?? bill.total_amount));
    setPaymentDialogOpen(true);
  };

  const handleRecordPaymentSubmit = async () => {
    if (!activePaymentBill || !paymentAmount || parseFloat(paymentAmount) <= 0) return;
    try {
      const res = await BillService.recordPayment(activePaymentBill.bill_number, {
        amount: parseFloat(paymentAmount),
        payment_method: paymentMode,
        transaction_reference: paymentRef,
        notes: paymentNotes
      });
      if (res.data) {
        alert(`Payment of ₹${paymentAmount} successfully recorded!`);
        setPaymentDialogOpen(false);
        fetchBills();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to record payment.");
    }
  };

  const handleViewHistory = async (bill: BillModel) => {
    setActivePaymentBill(bill);
    try {
      const res = await BillService.getPaymentHistory(bill.bill_number);
      if (res.data) {
        setPaymentHistory(res.data);
        setHistoryDrawerOpen(true);
      }
    } catch (err) {
      console.error("Failed to fetch payment history:", err);
    }
  };

  // Metrics
  const totalBills = bills.length;
  const totalRevenue = bills.reduce((sum, b) => sum + b.total_amount, 0);
  const totalOutstanding = bills.reduce((sum, b) => sum + (b.balance_due ?? (b.payment_status === "UNPAID" ? b.total_amount : 0)), 0);
  const paidBillsCount = bills.filter((b) => (b.payment_status || b.status) === "PAID").length;

  return (
    <Box p={3.5} maxWidth={1400} margin="0 auto">
      {/* Header Banner */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3.5}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <BillIcon sx={{ fontSize: 32, color: THEME.primary }} />
            <Typography variant="h4" fontWeight={800} color={THEME.textPrimary}> Bill & Billing History </Typography>
          </Box>
          <Typography fontSize={14} color={THEME.textSecondary}> View official tax invoices, billing records, payment receipts, and customer balances. </Typography>
        </Box>
        <Box display="flex" gap={1.5}>
          <CustomButton variant="outlined" startIcon={<RefreshIcon />} onClick={fetchBills} sx={{ borderRadius: 2.5, px: 2.5 }}> Refresh </CustomButton>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} mb={3.5}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
            <Typography fontSize={13} fontWeight={700} color={THEME.textSecondary} textTransform="uppercase"> Total Invoices </Typography>
            <Typography variant="h4" fontWeight={800} color={THEME.textPrimary} mt={1}> {totalBills} </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
            <Typography fontSize={13} fontWeight={700} color={THEME.success} textTransform="uppercase" display="flex" alignItems="center" gap={0.5}> <MoneyIcon fontSize="small" /> Total Invoiced Revenue </Typography>
            <Typography variant="h4" fontWeight={800} color={THEME.success} mt={1}> ₹{totalRevenue.toLocaleString("en-IN")} </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
            <Typography fontSize={13} fontWeight={700} color={THEME.error} textTransform="uppercase"> Outstanding Balance </Typography>
            <Typography variant="h4" fontWeight={800} color={THEME.error} mt={1}> ₹{totalOutstanding.toLocaleString("en-IN")} </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
            <Typography fontSize={13} fontWeight={700} color={THEME.primary} textTransform="uppercase" display="flex" alignItems="center" gap={0.5}> <CheckCircleIcon fontSize="small" /> Paid Invoices </Typography>
            <Typography variant="h4" fontWeight={800} color={THEME.primary} mt={1}> {paidBillsCount} </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search & Filter Controls */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
        <Box component="form" onSubmit={handleSearchSubmit} display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <Box flex={1} minWidth={280}>
            <CustomInput placeholder="Search by Bill No (e.g. BILL-2026-...), Customer Name..." value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} />
          </Box>
          <Box width={200}>
            <CustomSearchSelect placeholder="All Payment Methods" value={paymentMethodFilter} onChange={(val: any) => setPaymentMethodFilter(val)} enableSearch={false} options={PaymentMethods} />
          </Box>
          <CustomButton type="submit" variant="contained" startIcon={<SearchIcon />} sx={{ borderRadius: 2.5, px: 3, py: 1 }}> Search </CustomButton>
        </Box>
      </Paper>

      {/* Bills Data Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white, overflow: "hidden" }}>
        {loading ? (
          <Box p={5} textAlign="center"> <CircularProgress size={36} sx={{ color: THEME.primary }} /> </Box>
        ) : (
          <Table sx={{ minWidth: 900 }}>
            <TableHead sx={{ bgcolor: THEME.background }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>BILL NUMBER</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>BILLED TO</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>TOTAL AMOUNT</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>PAID / DUE</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>STATUS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5, color: THEME.textSecondary }}> No generated bills or invoices found. </TableCell>
                </TableRow>
              ) : (
                bills.map((bill) => {
                  const pStatus = bill.payment_status || bill.status || "PAID";
                  const balDue = bill.balance_due ?? (pStatus === "PAID" ? 0 : bill.total_amount);
                  const amtPaid = bill.amount_paid ?? (pStatus === "PAID" ? bill.total_amount : 0);

                  return (
                    <TableRow key={bill.id} hover>
                      <TableCell>
                        <Typography fontWeight={700} color={THEME.primary} fontSize={14}> {bill.bill_number} </Typography>
                        <Typography fontSize={12} color={THEME.textSecondary}> {new Date(bill.created_at).toLocaleDateString("en-IN")} </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={700} fontSize={14} color={THEME.textPrimary}> {bill.customer_name} </Typography>
                        {bill.institution_name && (<Typography fontSize={12} color={THEME.textSecondary}> {bill.institution_name} </Typography>)}
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={800} fontSize={15} color={THEME.textPrimary}> ₹{bill.total_amount.toLocaleString("en-IN")} </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontSize={13} color={THEME.success} fontWeight={700}> Paid: ₹{amtPaid.toLocaleString("en-IN")} </Typography>
                        {balDue > 0 && (<Typography fontSize={12} color={THEME.error} fontWeight={700}> Due: ₹{balDue.toLocaleString("en-IN")} </Typography>)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pStatus}
                          color={pStatus === "PAID" ? "success" : pStatus === "PARTIAL" ? "warning" : "error"}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: 11 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end" gap={1} alignItems="center">
                          <Tooltip title="View History Log">
                            <CustomButton size="small" variant="text" onClick={() => handleViewHistory(bill)} sx={{ minWidth: 32, p: 0.5 }}>
                              <HistoryIcon fontSize="small" />
                            </CustomButton>
                          </Tooltip>

                          {balDue > 0 && (
                            <CustomButton size="small" variant="contained" onClick={() => handleOpenPaymentDialog(bill)} sx={{ borderRadius: 2, fontSize: 12, fontWeight: 700 }}>
                              Record Payment
                            </CustomButton>
                          )}

                          <Tooltip title="View Tax Invoice Receipt">
                            <CustomButton size="small" variant="outlined" startIcon={<PrintIcon fontSize="small" />} onClick={() => handleOpenPreview(bill)} sx={{ borderRadius: 2, fontSize: 12, fontWeight: 700 }}>
                              View
                            </CustomButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Record Payment - {activePaymentBill?.bill_number}</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Box bgcolor={THEME.background} p={2} borderRadius={2}>
              <Typography fontSize={13} color={THEME.textSecondary}>Outstanding Balance:</Typography>
              <Typography variant="h5" fontWeight={800} color={THEME.error}>
                ₹{(activePaymentBill?.balance_due ?? activePaymentBill?.total_amount ?? 0).toLocaleString("en-IN")}
              </Typography>
            </Box>
            <CustomInput label="Payment Amount (₹)" type="number" value={paymentAmount} onChange={(e: any) => setPaymentAmount(e.target.value)} />
            <CustomSearchSelect label="Payment Method" value={paymentMode} onChange={(val: any) => setPaymentMode(val)} enableSearch={false} options={PaymentMethods} />
            <CustomInput label="Transaction Ref / Cheque No." value={paymentRef} onChange={(e: any) => setPaymentRef(e.target.value)} />
            <CustomInput label="Notes" value={paymentNotes} onChange={(e: any) => setPaymentNotes(e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <CustomButton onClick={() => setPaymentDialogOpen(false)} variant="outlined">Cancel</CustomButton>
          <CustomButton onClick={handleRecordPaymentSubmit} variant="contained">Save Payment</CustomButton>
        </DialogActions>
      </Dialog>

      {/* Payment History Log Drawer */}
      <Drawer anchor="right" open={historyDrawerOpen} onClose={() => setHistoryDrawerOpen(false)}>
        <Box width={360} p={3}>
          <Typography variant="h6" fontWeight={800} mb={2}>Payment History Log</Typography>
          <Divider sx={{ mb: 2 }} />
          {paymentHistory.length === 0 ? (
            <Typography fontSize={14} color={THEME.textSecondary} mt={3}>No past payment transactions recorded.</Typography>
          ) : (
            <List>
              {paymentHistory.map((rec) => (
                <ListItem key={rec.id} divider alignItems="flex-start">
                  <ListItemText
                    primary={<Typography fontWeight={700} color={THEME.success}>+ ₹{rec.amount.toLocaleString("en-IN")}</Typography>}
                    secondary={
                      <>
                        <Typography fontSize={12} color={THEME.textPrimary}>Method: {rec.payment_method}</Typography>
                        {rec.transaction_reference && <Typography fontSize={12} color={THEME.textSecondary}>Ref: {rec.transaction_reference}</Typography>}
                        <Typography fontSize={11} color={THEME.textSecondary}>{new Date(rec.payment_date).toLocaleString("en-IN")}</Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>

      {/* Bill Preview Modal */}
      <BillPreviewModal open={previewModalOpen} bill={selectedBill} onClose={() => setPreviewModalOpen(false)} />
    </Box>
  );
};

