import React, { useState, useEffect } from "react";
import { THEME } from "@/assets/theme";
import { StockService, type StockOverviewItem, type StockSummaryResponse, type StockTransaction } from "@/services/stock.service";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { CustomInput } from "@/components/Inputs/CustomInput";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Inventory as StockIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
} from "@mui/icons-material";

export const StockManagementPage: React.FC = () => {
  const [summary, setSummary] = useState<StockSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Adjustment Modal State
  const [selectedProduct, setSelectedProduct] = useState<StockOverviewItem | null>(null);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState<boolean>(false);
  const [adjustMode, setAdjustMode] = useState<"ADD" | "SET">("ADD");
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustNotes, setAdjustNotes] = useState<string>("");
  const [submittingAdjust, setSubmittingAdjust] = useState<boolean>(false);

  // Transaction History Modal
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchStockSummary = async () => {
    setLoading(true);
    try {
      const res = await StockService.getStockSummary({ q: searchQuery, status: statusFilter || undefined });
      if (res.data) {
        setSummary(res.data);
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Failed to load stock data", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockSummary();
  }, [searchQuery, statusFilter]);

  const handleOpenAdjust = (product: StockOverviewItem) => {
    setSelectedProduct(product);
    setAdjustAmount(10);
    setAdjustNotes("");
    setAdjustMode("ADD");
    setAdjustDialogOpen(true);
  };

  const handleSaveAdjustment = async () => {
    if (!selectedProduct) return;
    setSubmittingAdjust(true);
    try {
      const isAbsolute = adjustMode === "SET";
      const quantityChange = adjustAmount;
      await StockService.adjustStock({
        product_id: selectedProduct.product_id,
        quantity_change: quantityChange,
        is_absolute: isAbsolute,
        notes: adjustNotes || (isAbsolute ? `Set stock to ${quantityChange}` : `Added ${quantityChange} units`),
      });

      setSnackbar({
        open: true,
        message: `Stock for ${selectedProduct.product_name} updated successfully! Status: ${quantityChange <= 0 && isAbsolute ? "OUT_OF_STOCK" : "ACTIVE"}`,
        severity: "success",
      });
      setAdjustDialogOpen(false);
      fetchStockSummary();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Stock adjustment failed";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setSubmittingAdjust(false);
    }
  };

  const handleQuickAdd = async (product: StockOverviewItem, delta: number) => {
    try {
      await StockService.adjustStock({
        product_id: product.product_id,
        quantity_change: delta,
        is_absolute: false,
        notes: `Quick stock update (${delta > 0 ? "+" : ""}${delta})`,
      });
      fetchStockSummary();
    } catch (err: any) {
      setSnackbar({ open: true, message: "Quick update failed", severity: "error" });
    }
  };

  const handleOpenHistory = async () => {
    setHistoryOpen(true);
    setLoadingHistory(true);
    try {
      const res = await StockService.getTransactions(50);
      if (res.data) setTransactions(res.data);
    } catch (err: any) {
      setSnackbar({ open: true, message: "Failed to load audit history", severity: "error" });
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: THEME.background, minHeight: "100vh" }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography fontSize={24} fontWeight={800} color={THEME.textPrimary} letterSpacing="-0.5px"> Inventory & Stock Management </Typography>
          <Typography fontSize={13} color={THEME.textSecondary}> Track physical equipment quantities, receive out-of-stock warnings, and monitor payment deductions </Typography>
        </Box>

        <Box display="flex" gap={1.5}>
          <CustomButton text="Audit History" bgc={THEME.white} color={THEME.textPrimary} height="40px" font={13} icon={<HistoryIcon fontSize="small" />} onClick={handleOpenHistory} sx={{ border: `1px solid ${THEME.border}`, fontWeight: 600 }} />
          <CustomButton text="Refresh Data" bgc={THEME.primary} color="#ffffff" height="40px" font={13} icon={<RefreshIcon fontSize="small" />} onClick={fetchStockSummary} sx={{ fontWeight: 600 }} />
        </Box>
      </Box>

      {/* KPI Cards Grid */}
      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography fontSize={12} fontWeight={700} color={THEME.textSecondary}> TOTAL PRODUCTS </Typography>
                <Typography fontSize={26} fontWeight={800} color={THEME.textPrimary} mt={0.5}> {summary?.total_products ?? 0} </Typography>
              </Box>
              <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: `${THEME.primary}12`, color: THEME.primary, display: "flex", alignItems: "center", justifyContent: "center" }}> <StockIcon /> </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography fontSize={12} fontWeight={700} color={THEME.textSecondary}> TOTAL UNITS IN STOCK </Typography>
                <Typography fontSize={26} fontWeight={800} color="#22c55e" mt={0.5}> {summary?.total_stock_units ?? 0} </Typography>
              </Box>
              <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: "rgba(34,197,94,0.12)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center" }}> <CheckIcon /> </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography fontSize={12} fontWeight={700} color={THEME.textSecondary}> OUT OF STOCK ITEMS </Typography>
                <Typography fontSize={26} fontWeight={800} color="#ef4444" mt={0.5}> {summary?.out_of_stock_count ?? 0} </Typography>
              </Box>
              <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: "rgba(239,68,68,0.12)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}> <ErrorIcon /> </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography fontSize={12} fontWeight={700} color={THEME.textSecondary}> LOW STOCK WARNING </Typography>
                <Typography fontSize={26} fontWeight={800} color="#f59e0b" mt={0.5}> {summary?.low_stock_count ?? 0} </Typography>
              </Box>
              <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: "rgba(245,158,11,0.12)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}> <WarningIcon /> </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Filter & Search Bar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <Box flex={1} minWidth={250}>
            <CustomInput placeholder="Search product name or SKU code..." value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} />
          </Box>
          <Box width={180}>
            <CustomInput placeholder="All Statuses" value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value)} />
          </Box>
        </Box>
      </Paper>

      {/* Main Stock Data Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white, overflow: "hidden" }}>
        {loading ? (
          <Box p={5} textAlign="center"> <CircularProgress size={36} sx={{ color: THEME.primary }} /> </Box>
        ) : (
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: THEME.background }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}> PRODUCT / SKU </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}> CATEGORY </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}> UNIT PRICE </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}> STOCK QTY </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}> STATUS </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}> ACTIONS </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summary?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: THEME.textSecondary }}> No inventory products found matching search criteria. </TableCell>
                </TableRow>
              ) : (
                summary?.items.map((prod) => {
                  const isOutOfStock = prod.stock_quantity <= 0 || prod.status === "OUT_OF_STOCK";
                  const isLowStock = prod.stock_quantity > 0 && prod.stock_quantity <= 5;

                  return (
                    <TableRow key={prod.product_id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell>
                        <Typography fontSize={14} fontWeight={700} color={THEME.textPrimary}> {prod.product_name} </Typography>
                        <Typography fontSize={12} color={THEME.textSecondary}> SKU: {prod.sku} </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip label={prod.category_name || "General"} size="small" sx={{ bgcolor: `${THEME.primary}10`, color: THEME.primary, fontWeight: 700, fontSize: 11 }} />
                      </TableCell>

                      <TableCell>
                        <Typography fontSize={14} fontWeight={700} color={THEME.textPrimary}> ₹{prod.price.toLocaleString("en-IN")} </Typography>
                      </TableCell>

                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <IconButton size="small" onClick={() => handleQuickAdd(prod, -1)} disabled={prod.stock_quantity <= 0} sx={{ border: `1px solid ${THEME.border}` }}> <RemoveIcon fontSize="small" /> </IconButton>
                          <Typography fontSize={15} fontWeight={800} color={isOutOfStock ? "#ef4444" : isLowStock ? "#f59e0b" : "#22c55e"}> {prod.stock_quantity} </Typography>
                          <IconButton size="small" onClick={() => handleQuickAdd(prod, 1)} sx={{ border: `1px solid ${THEME.border}` }}> <AddIcon fontSize="small" /> </IconButton>
                        </Box>
                      </TableCell>

                      <TableCell>
                        {isOutOfStock ? (
                          <Chip label="OUT OF STOCK" size="small" sx={{ bgcolor: "#fee2e2", color: "#dc2626", fontWeight: 800, fontSize: 11 }} />
                        ) : isLowStock ? (
                          <Chip label={`LOW STOCK (${prod.stock_quantity})`} size="small" sx={{ bgcolor: "#fef3c7", color: "#d97706", fontWeight: 800, fontSize: 11 }} />
                        ) : (
                          <Chip label="ACTIVE / IN STOCK" size="small" sx={{ bgcolor: "#dcfce7", color: "#15803d", fontWeight: 800, fontSize: 11 }} />
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <CustomButton text="Adjust Stock" bgc={`${THEME.primary}10`} color={THEME.primary} height="32px" font={12} icon={<EditIcon fontSize="small" />} onClick={() => handleOpenAdjust(prod)} sx={{ fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Adjust Stock Modal */}
      <Dialog open={adjustDialogOpen} onClose={() => setAdjustDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18 }}> Adjust Product Stock </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Typography fontSize={13} color={THEME.textSecondary}> Product: <strong>{selectedProduct?.product_name}</strong> (Current Stock: {selectedProduct?.stock_quantity}) </Typography>

            <Box display="flex" gap={1}>
              <CustomButton text="Add Quantity (+)" bgc={adjustMode === "ADD" ? THEME.primary : THEME.white} color={adjustMode === "ADD" ? "#ffffff" : THEME.textPrimary} height="36px" font={13} onClick={() => setAdjustMode("ADD")} fullWidth sx={{ border: `1px solid ${THEME.border}` }} />
              <CustomButton text="Set Exact Stock (=)" bgc={adjustMode === "SET" ? THEME.primary : THEME.white} color={adjustMode === "SET" ? "#ffffff" : THEME.textPrimary} height="36px" font={13} onClick={() => setAdjustMode("SET")} fullWidth sx={{ border: `1px solid ${THEME.border}` }} />
            </Box>

            <Box>
              <Typography fontSize={13} fontWeight={600} mb={0.5}> {adjustMode === "ADD" ? "Units to Add" : "Exact Stock Level"} </Typography>
              <CustomInput type="number" value={String(adjustAmount)} onChange={(e: any) => setAdjustAmount(parseInt(e.target.value) || 0)} />
            </Box>

            <Box>
              <Typography fontSize={13} fontWeight={600} mb={0.5}> Reason / Notes </Typography>
              <CustomInput placeholder="e.g. Received shipment, stock audit correction..." value={adjustNotes} onChange={(e: any) => setAdjustNotes(e.target.value)} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <CustomButton text="Cancel" bgc={THEME.white} color={THEME.textPrimary} height="38px" font={13} onClick={() => setAdjustDialogOpen(false)} sx={{ border: `1px solid ${THEME.border}` }} />
          <CustomButton text={submittingAdjust ? "Updating..." : "Save Stock"} bgc={THEME.primary} color="#ffffff" height="38px" font={13} disabled={submittingAdjust} onClick={handleSaveAdjustment} sx={{ fontWeight: 700 }} />
        </DialogActions>
      </Dialog>

      {/* History Modal */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18 }}> Audit Log & Stock History </DialogTitle>
        <DialogContent dividers>
          {loadingHistory ? (
            <Box p={4} textAlign="center"> <CircularProgress size={32} /> </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}> DATE / TIME </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}> PRODUCT </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}> TYPE </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}> CHANGE </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}> NEW STOCK </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}> NOTES </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell> {new Date(tx.created_at).toLocaleString()} </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}> {tx.product_name} </TableCell>
                    <TableCell> <Chip label={tx.transaction_type} size="small" sx={{ fontSize: 10, fontWeight: 700 }} /> </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: tx.change_amount >= 0 ? "#22c55e" : "#ef4444" }}> {tx.change_amount > 0 ? `+${tx.change_amount}` : tx.change_amount} </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}> {tx.new_quantity} </TableCell>
                    <TableCell sx={{ fontSize: 12, color: THEME.textSecondary }}> {tx.notes || "-"} </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <CustomButton text="Close" bgc={THEME.primary} color="#ffffff" height="36px" font={13} onClick={() => setHistoryOpen(false)} />
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}> {snackbar.message} </Alert>
      </Snackbar>
    </Box>
  );
};

export default StockManagementPage;
