import React, { useState, useEffect } from "react";
import type { BillModel } from "@/models/bill.models";
import { BillService } from "@/services/bill.service";
import { BillPreviewModal } from "@/components/BillPreviewModal";
import { CustomInput } from "@/components/Inputs/CustomInput";
import { THEME } from "@/assets/theme";
import { Box, Typography, Paper, Grid, Chip, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Tooltip } from "@mui/material";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { CustomSearchSelect } from "@/components/Inputs/CustomSearchSelect";
import { Receipt as BillIcon, Search as SearchIcon, Refresh as RefreshIcon, CheckCircle as CheckCircleIcon, AttachMoney as MoneyIcon, CreditCard as PaymentIcon, Print as PrintIcon } from "@mui/icons-material";
import { PaymentMethods } from "@/utils/StaticData";

export const BillHistoryPage: React.FC = () => {
  const [bills, setBills] = useState<BillModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("ALL");

  // Selected bill for preview/print modal
  const [selectedBill, setSelectedBill] = useState<BillModel | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);

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

  // Metrics
  const totalBills = bills.length;
  const totalRevenue = bills.reduce((sum, b) => sum + b.total_amount, 0);
  const paidBillsCount = bills.filter((b) => b.status === "PAID").length;
  const avgBillValue = totalBills > 0 ? Math.round(totalRevenue / totalBills) : 0;

  return (
    <Box p={3.5} maxWidth={1400} margin="0 auto">
      {/* Header Banner */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3.5}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <BillIcon sx={{ fontSize: 32, color: THEME.primary }} />
            <Typography variant="h4" fontWeight={800} color={THEME.textPrimary}> Bill & Billing History </Typography>
          </Box>
          <Typography fontSize={14} color={THEME.textSecondary}> View official tax invoices, billing records, payment receipts, and generated checkout history. </Typography>
        </Box>
        <Box display="flex" gap={1.5}>
          <CustomButton variant="outlined" startIcon={<RefreshIcon />} onClick={fetchBills} sx={{ borderRadius: 2.5, px: 2.5 }}> Refresh </CustomButton>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} mb={3.5}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
            <Typography fontSize={13} fontWeight={700} color={THEME.textSecondary} textTransform="uppercase"> Total Invoices Issued </Typography>
            <Typography variant="h4" fontWeight={800} color={THEME.textPrimary} mt={1}> {totalBills} </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
            <Typography fontSize={13} fontWeight={700} color={THEME.success} textTransform="uppercase" display="flex" alignItems="center" gap={0.5}> <MoneyIcon fontSize="small" /> Total Revenue </Typography>
            <Typography variant="h4" fontWeight={800} color={THEME.success} mt={1}> ₹{totalRevenue.toLocaleString("en-IN")} </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
            <Typography fontSize={13} fontWeight={700} color={THEME.primary} textTransform="uppercase" display="flex" alignItems="center" gap={0.5}> <CheckCircleIcon fontSize="small" /> Paid Receipts </Typography>
            <Typography variant="h4" fontWeight={800} color={THEME.primary} mt={1}> {paidBillsCount} </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
            <Typography fontSize={13} fontWeight={700} color={THEME.secondary} textTransform="uppercase"> Avg Order Value </Typography>
            <Typography variant="h4" fontWeight={800} color={THEME.secondary} mt={1}> ₹{avgBillValue.toLocaleString("en-IN")} </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search & Filter Controls */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
        <Box component="form" onSubmit={handleSearchSubmit} display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <Box flex={1} minWidth={280}>
            <CustomInput placeholder="Search by Bill No (e.g. BILL-2026-...), Quote ID, Customer Name..." value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} />
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
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: THEME.background }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>BILL NUMBER</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>QUOTE REF</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>BILLED TO</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>PAYMENT METHOD</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>TOTAL AMOUNT</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>DATE</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5, color: THEME.textSecondary }}> No generated bills or invoices found matching your search. </TableCell>
                </TableRow>
              ) : (
                bills.map((bill) => (
                  <TableRow key={bill.id} hover>
                    <TableCell> <Typography fontWeight={700} color={THEME.primary} fontSize={14}> {bill.bill_number} </Typography> </TableCell>
                    <TableCell> <Typography fontWeight={600} fontSize={13} color={THEME.textSecondary}> {bill.quote_id || "Direct Purchase"} </Typography> </TableCell>
                    <TableCell> <Typography fontWeight={700} fontSize={14} color={THEME.textPrimary}> {bill.customer_name} </Typography> {bill.institution_name && (<Typography fontSize={12} color={THEME.textSecondary}> {bill.institution_name} </Typography>)} </TableCell>
                    <TableCell> <Chip icon={<PaymentIcon sx={{ fontSize: 14 }} />} label={bill.payment_method} variant="outlined" size="small" sx={{ fontWeight: 700, fontSize: 11 }} /></TableCell>
                    <TableCell> <Typography fontWeight={800} fontSize={15} color={THEME.primary}> ₹{bill.total_amount.toLocaleString("en-IN")} </Typography> </TableCell>
                    <TableCell> <Typography fontSize={13} color={THEME.textSecondary}> {new Date(bill.created_at).toLocaleDateString("en-IN")} </Typography> </TableCell>

                    <TableCell align="right">
                      <Tooltip title="View / Print Tax Invoice Receipt">
                        <CustomButton size="small" variant="outlined" startIcon={<PrintIcon fontSize="small" />} onClick={() => handleOpenPreview(bill)} sx={{ borderRadius: 2, fontSize: 12, fontWeight: 700 }}> View Bill </CustomButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Bill Preview Modal */}
      <BillPreviewModal open={previewModalOpen} bill={selectedBill} onClose={() => setPreviewModalOpen(false)} />
    </Box>
  );
};
