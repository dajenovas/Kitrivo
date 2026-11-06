import React, { useState } from "react";
import { Box, Card, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton, Skeleton, TextField, InputAdornment, Button } from "@mui/material";
import {
    History as HistoryIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    Receipt as ReceiptIcon,
    Description as DescriptionIcon,
    ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppTheme, THEME } from "@/assets/theme";
import type { RecentTransactionData } from "@/models/dashboard.models";

interface DashboardRecentTableProps {
    data?: RecentTransactionData[];
    loading?: boolean;
}

export const DashboardRecentTable: React.FC<DashboardRecentTableProps> = ({ data = [], loading }) => {
    const theme = useAppTheme();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [tabFilter, setTabFilter] = useState<"ALL" | "INVOICE" | "QUOTATION">("ALL");

    if (loading) {
        return (
            <Card elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: theme.cardBg, border: `1px solid ${theme.border}` }}>
                <Skeleton variant="text" width="40%" height={32} />
                <Skeleton variant="rectangular" width="100%" height={240} sx={{ borderRadius: 2, my: 2 }} />
            </Card>
        );
    }

    // Filtered data
    const filteredData = data.filter((item) => {
        const matchesTab = tabFilter === "ALL" || item.type === tabFilter;
        const matchesSearch =
            !search.trim() ||
            item.ref_number.toLowerCase().includes(search.toLowerCase()) ||
            item.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            (item.institution_name && item.institution_name.toLowerCase().includes(search.toLowerCase()));
        return matchesTab && matchesSearch;
    });

    const getStatusChip = (status: string) => {
        const s = status.toUpperCase();
        if (s === "PAID") {
            return <Chip label="PAID" size="small" sx={{ height: 24, fontSize: "0.72rem", fontWeight: 700, borderRadius: 1.5, bgcolor: theme.isDark ? `${THEME.success}33` : THEME.green100, color: theme.isDark ? THEME.green500 : THEME.green700 }} />;
        }
        if (s === "GENERATED") {
            return <Chip label="GENERATED" size="small" sx={{ height: 24, fontSize: "0.72rem", fontWeight: 700, borderRadius: 1.5, bgcolor: theme.isDark ? `${THEME.primary}33` : THEME.blue50, color: theme.isDark ? THEME.blue400 : THEME.primaryDark }} />;
        }
        if (s === "CHECKED_OUT") {
            return <Chip label="CHECKED OUT" size="small" sx={{ height: 24, fontSize: "0.72rem", fontWeight: 700, borderRadius: 1.5, bgcolor: theme.isDark ? `${THEME.emerald600}33` : THEME.emerald100, color: theme.isDark ? THEME.emerald500 : THEME.emerald700 }} />;
        }
        return <Chip label={status} size="small" sx={{ height: 24, fontSize: "0.72rem", fontWeight: 700, borderRadius: 1.5, bgcolor: theme.isDark ? `${THEME.warning}33` : THEME.amber100, color: theme.isDark ? THEME.warning : THEME.amber700 }} />;
    };

    return (
        <Card elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: theme.cardBg, border: `1px solid ${theme.border}` }}>
            {/* Header & Controls */}
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: theme.isDark ? `${THEME.emerald600}26` : THEME.emerald100, color: THEME.emerald600, display: "flex" }}>
                        <HistoryIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.textPrimary, fontSize: "1.1rem" }}>
                            Recent Transactions & Orders
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.textSecondary, fontSize: "0.78rem" }}>
                            Latest invoices and customer quotations activity
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                    {/* Tabs */}
                    <Box sx={{ display: "flex", p: 0.5, borderRadius: 2, bgcolor: theme.isDark ? "rgba(255,255,255,0.05)" : THEME.slate100 }}>
                        <Button size="small" onClick={() => setTabFilter("ALL")} sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, fontSize: "0.75rem", fontWeight: 700, textTransform: "none", bgcolor: tabFilter === "ALL" ? theme.cardBg : "transparent", color: tabFilter === "ALL" ? THEME.primary : theme.textSecondary, boxShadow: tabFilter === "ALL" ? `0 2px 6px ${THEME.slate900}14` : "none" }}>
                            All
                        </Button>
                        <Button size="small" onClick={() => setTabFilter("INVOICE")} sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, fontSize: "0.75rem", fontWeight: 700, textTransform: "none", bgcolor: tabFilter === "INVOICE" ? theme.cardBg : "transparent", color: tabFilter === "INVOICE" ? THEME.primary : theme.textSecondary, boxShadow: tabFilter === "INVOICE" ? `0 2px 6px ${THEME.slate900}14` : "none" }}>
                            Invoices
                        </Button>
                        <Button size="small" onClick={() => setTabFilter("QUOTATION")} sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, fontSize: "0.75rem", fontWeight: 700, textTransform: "none", bgcolor: tabFilter === "QUOTATION" ? theme.cardBg : "transparent", color: tabFilter === "QUOTATION" ? THEME.secondary : theme.textSecondary, boxShadow: tabFilter === "QUOTATION" ? `0 2px 6px ${THEME.slate900}14` : "none" }}>
                            Quotations
                        </Button>
                    </Box>

                    {/* Search */}
                    <TextField placeholder="Search ref or client..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: theme.textSecondary }} /></InputAdornment>) }} sx={{ width: { xs: "100%", sm: 200 }, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: theme.isDark ? "rgba(255,255,255,0.03)" : THEME.white, fontSize: "0.82rem" } }} />
                </Box>
            </Box>

            {/* Table */}
            <TableContainer sx={{ borderRadius: 2, border: `1px solid ${theme.border}`, overflowX: "auto" }}>
                <Table size="medium">
                    <TableHead sx={{ bgcolor: theme.isDark ? "rgba(255,255,255,0.03)" : THEME.slate50 }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: theme.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Reference #</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: theme.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: theme.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Client / Institution</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: theme.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Date</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: theme.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Amount (₹)</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: theme.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: theme.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4, color: theme.textSecondary }}>
                                    No transaction records found matching criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((row) => (
                                <TableRow key={`${row.type}-${row.id}`} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                    <TableCell sx={{ fontWeight: 700, color: THEME.primary, fontSize: "0.85rem" }}>
                                        {row.ref_number}
                                    </TableCell>

                                    <TableCell>
                                        <Chip icon={row.type === "INVOICE" ? <ReceiptIcon style={{ fontSize: 14 }} /> : <DescriptionIcon style={{ fontSize: 14 }} />} label={row.type} size="small" sx={{ height: 24, fontSize: "0.72rem", fontWeight: 700, borderRadius: 1.5, bgcolor: row.type === "INVOICE" ? (theme.isDark ? `${THEME.primary}26` : THEME.blue50) : (theme.isDark ? `${THEME.secondary}26` : THEME.purple50), color: row.type === "INVOICE" ? THEME.primary : THEME.secondary, "& .MuiChip-icon": { color: "inherit" } }} />
                                    </TableCell>

                                    <TableCell sx={{ color: theme.textPrimary }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                            {row.customer_name}
                                        </Typography>
                                        {row.institution_name && (
                                            <Typography variant="caption" sx={{ color: theme.textSecondary, display: "block", fontSize: "0.72rem" }}>
                                                {row.institution_name}
                                            </Typography>
                                        )}
                                    </TableCell>

                                    <TableCell sx={{ color: theme.textSecondary, fontSize: "0.82rem" }}>
                                        {row.date}
                                    </TableCell>

                                    <TableCell align="right" sx={{ fontWeight: 800, color: theme.textPrimary, fontSize: "0.875rem" }}>
                                        ₹{row.amount.toLocaleString()}
                                    </TableCell>

                                    <TableCell align="center">
                                        {getStatusChip(row.status)}
                                    </TableCell>

                                    <TableCell align="center">
                                        <IconButton size="small" onClick={() => navigate(row.type === "INVOICE" ? "/billing/history" : "/quotations/history")} sx={{ color: THEME.primary, bgcolor: theme.isDark ? `${THEME.primary}1A` : THEME.blue50, "&:hover": { bgcolor: THEME.primary, color: THEME.white } }}>
                                            <VisibilityIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Footer view all link */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />} onClick={() => navigate("/billing/history")} sx={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "none", color: THEME.primary }}>
                    View All History & Reports
                </Button>
            </Box>
        </Card>
    );
};
