import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QuotationService } from "@/services/quotation.service";
import { QuotationTemplateModal } from "@/components/QuotationTemplateModal";
import { CustomInput } from "@/components/Inputs/CustomInput";
import { THEME } from "@/assets/theme";
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
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { CustomSearchSelect } from "@/components/Inputs/CustomSearchSelect";
import {
  Description as QuoteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  ShoppingCartCheckout as CheckoutIcon,
  CheckCircle as CheckCircleIcon,
  Error as ExpiredIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import type { QuotationModel } from "@/models/quotation.models";

export const QuotationHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<QuotationModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selected quotation for template view/edit
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationModel | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState<boolean>(false);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await QuotationService.getAllQuotations(
        searchQuery,
        statusFilter === "ALL" ? undefined : statusFilter
      );
      if (res.data) {
        setQuotations(res.data);
      }
    } catch (err) {
      console.error("Failed to load quotations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuotations();
  };

  const handleOpenTemplate = (quote: QuotationModel) => {
    setSelectedQuotation(quote);
    setTemplateModalOpen(true);
  };

  const handleProceedCheckout = (quoteId: string) => {
    navigate(`/checkout?quote_id=${quoteId}`);
  };

  // Metrics
  const totalCount = quotations.length;
  const activeCount = quotations.filter((q) => q.status === "GENERATED" && q.is_valid).length;
  const checkedOutCount = quotations.filter((q) => q.status === "CHECKED_OUT").length;
  const expiredCount = quotations.filter((q) => q.status === "EXPIRED" || (!q.is_valid && q.status === "GENERATED")).length;

  return (
    <Box p={3.5} maxWidth={1400} margin="0 auto">
      {/* Header Banner */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3.5}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <QuoteIcon sx={{ fontSize: 32, color: THEME.primary }} />
            <Typography variant="h4" fontWeight={800} color={THEME.textPrimary}>
              Quotation Generated History
            </Typography>
          </Box>
          <Typography fontSize={14} color={THEME.textSecondary}>
            Track, view, preview, and checkout all proforma equipment quotations generated across the system.
          </Typography>
        </Box>
        <Box display="flex" gap={1.5}>
          <CustomButton
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchQuotations}
            sx={{ borderRadius: 2.5, px: 2.5 }}
          >
            Refresh
          </CustomButton>
          <CustomButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/cart")}
            sx={{ borderRadius: 2.5, px: 3, fontWeight: 700 }}
          >
            New Quotation
          </CustomButton>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} mb={3.5}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
            <Typography fontSize={13} fontWeight={700} color={THEME.textSecondary} textTransform="uppercase">
              Total Quotations
            </Typography>
            <Typography variant="h4" fontWeight={800} color={THEME.textPrimary} mt={1}>
              {totalCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
            <Typography fontSize={13} fontWeight={700} color={THEME.success} textTransform="uppercase" display="flex" alignItems="center" gap={0.5}>
              <CheckCircleIcon fontSize="small" /> Active Valid
            </Typography>
            <Typography variant="h4" fontWeight={800} color={THEME.success} mt={1}>
              {activeCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
            <Typography fontSize={13} fontWeight={700} color={THEME.primary} textTransform="uppercase" display="flex" alignItems="center" gap={0.5}>
              <ReceiptIcon fontSize="small" /> Checked Out
            </Typography>
            <Typography variant="h4" fontWeight={800} color={THEME.primary} mt={1}>
              {checkedOutCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
            <Typography fontSize={13} fontWeight={700} color={THEME.error} textTransform="uppercase" display="flex" alignItems="center" gap={0.5}>
              <ExpiredIcon fontSize="small" /> Expired
            </Typography>
            <Typography variant="h4" fontWeight={800} color={THEME.error} mt={1}>
              {expiredCount}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search & Filter Controls */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
        <Box component="form" onSubmit={handleSearchSubmit} display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <Box flex={1} minWidth={280}>
            <CustomInput
              placeholder="Search by Quote ID (e.g. QT-2026-...), Institution, Email..."
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
            />
          </Box>
          <Box width={200}>
            <CustomSearchSelect
              placeholder="All Statuses"
              value={statusFilter}
              onChange={(val: any) => setStatusFilter(val)}
              enableSearch={false}
              options={[
                { id: "ALL", label: "All Statuses" },
                { id: "GENERATED", label: "Active / Generated" },
                { id: "CHECKED_OUT", label: "Checked Out" },
                { id: "EXPIRED", label: "Expired" },
              ]}
            />
          </Box>
          <CustomButton type="submit" variant="contained" startIcon={<SearchIcon />} sx={{ borderRadius: 2.5, px: 3, py: 1 }}>
            Search
          </CustomButton>
        </Box>
      </Paper>

      {/* Quotations Data Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white, overflow: "hidden" }}>
        {loading ? (
          <Box p={5} textAlign="center">
            <CircularProgress size={36} sx={{ color: THEME.primary }} />
          </Box>
        ) : (
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: THEME.background }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>QUOTE ID</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>INSTITUTION / CUSTOMER</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>ITEMS & TOTAL</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>VALIDITY</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>STATUS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 13, color: THEME.textPrimary }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5, color: THEME.textSecondary }}>
                    No generated quotations found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                quotations.map((quote) => {
                  const isExpired = quote.status === "EXPIRED" || (!quote.is_valid && quote.status === "GENERATED");

                  return (
                    <TableRow key={quote.id} hover>
                      <TableCell>
                        <Typography fontWeight={700} color={THEME.primary} fontSize={14}>
                          {quote.quote_id}
                        </Typography>
                        <Typography fontSize={12} color={THEME.textSecondary}>
                          {new Date(quote.created_at).toLocaleDateString("en-IN")}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={600} fontSize={14} color={THEME.textPrimary}>
                          {quote.institution_name || quote.contact_name || "N/A"}
                        </Typography>
                        <Typography fontSize={12} color={THEME.textSecondary}>
                          {quote.email || quote.phone || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={700} fontSize={14} color={THEME.textPrimary}>
                          ₹{quote.total_amount.toLocaleString("en-IN")}
                        </Typography>
                        <Typography fontSize={12} color={THEME.textSecondary}>
                          {quote.items.length} product line(s)
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography fontSize={13} fontWeight={600} color={isExpired ? THEME.error : THEME.textPrimary}>
                          {new Date(quote.valid_until).toLocaleDateString("en-IN")}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            isExpired
                              ? "EXPIRED"
                              : quote.status === "CHECKED_OUT"
                                ? "CHECKED OUT"
                                : "ACTIVE"
                          }
                          color={
                            isExpired
                              ? "error"
                              : quote.status === "CHECKED_OUT"
                                ? "success"
                                : "primary"
                          }
                          size="small"
                          sx={{ fontWeight: 700, fontSize: 12 }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end" gap={1} alignItems="center">
                          <Tooltip title="View / Print Quotation Template">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenTemplate(quote)}
                              sx={{ color: THEME.primary, bgcolor: `${THEME.primary}10` }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Share via WhatsApp">
                            <IconButton
                              size="small"
                              onClick={() => {
                                const text = encodeURIComponent(`Hello ${quote.contact_name || 'Customer'},\nHere is your Quotation Details (${quote.quote_id}) for Total Amount: ₹${quote.total_amount.toLocaleString('en-IN')}.\nValid until: ${new Date(quote.valid_until).toLocaleDateString('en-IN')}`);
                                window.open(`https://wa.me/?text=${text}`, '_blank');
                              }}
                              sx={{ color: THEME.whatsapp, bgcolor: THEME.whatsappBg }}
                            >
                              <ReceiptIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {quote.status !== "INVOICED" && quote.status !== "CHECKED_OUT" && (
                            <CustomButton
                              size="small"
                              variant="outlined"
                              onClick={async () => {
                                try {
                                  const res = await QuotationService.convertQuotationToBill(quote.quote_id);
                                  if (res.data) {
                                    alert(`Quotation ${quote.quote_id} converted to Bill ${res.data.bill_number}!`);
                                    fetchQuotations();
                                  }
                                } catch (err: any) {
                                  alert(err.response?.data?.message || "Failed to convert quotation");
                                }
                              }}
                              sx={{ borderRadius: 2, fontSize: 12, fontWeight: 700, borderColor: THEME.primary }}
                            >
                              Convert to Bill
                            </CustomButton>
                          )}

                          {quote.status !== "CHECKED_OUT" && quote.status !== "INVOICED" && !isExpired && (
                            <CustomButton
                              size="small"
                              variant="contained"
                              startIcon={<CheckoutIcon fontSize="small" />}
                              onClick={() => handleProceedCheckout(quote.quote_id)}
                              sx={{ borderRadius: 2, fontSize: 12, fontWeight: 700 }}
                            >
                              Checkout
                            </CustomButton>
                          )}
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

      {/* Template Modal */}
      <QuotationTemplateModal
        open={templateModalOpen}
        quotation={selectedQuotation}
        onClose={() => setTemplateModalOpen(false)}
        onQuotationUpdated={() => fetchQuotations()}
      />
    </Box>
  );
};
