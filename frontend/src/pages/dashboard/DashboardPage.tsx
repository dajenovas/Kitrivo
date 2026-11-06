import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Grid, Button, IconButton, Tooltip, Alert, Snackbar } from "@mui/material";
import {
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { useAppTheme, THEME } from "@/assets/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardService } from "@/services/dashboard.service";
import type { DashboardAnalyticsResponse } from "@/models/dashboard.models";
import { DashboardStatsCard } from "./components/DashboardStatsCard";
import { DashboardTrendChart } from "./components/DashboardTrendChart";
import { DashboardRankingList } from "./components/DashboardRankingList";
import { DashboardRecentTable } from "./components/DashboardRecentTable";

const DashboardPage: React.FC = () => {
    const theme = useAppTheme();
    const { user } = useAuthStore();
    const [data, setData] = useState<DashboardAnalyticsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const fetchDashboardStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await DashboardService.getStats();
            if (res && res.data) {
                setData(res.data);
            } else {
                setError("Failed to retrieve dashboard analytics.");
            }
        } catch (err: any) {
            console.error("Error loading dashboard data:", err);
            setError(err.message || "Failed to load dashboard metrics.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const handleRefresh = () => {
        fetchDashboardStats();
        setToastMsg("Dashboard analytics refreshed");
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, background: theme.background, minHeight: "100vh" }}>
            {/* Header Banner */}
            <Paper elevation={0} sx={{ p: 3, mb: 3.5, borderRadius: 3, bgcolor: theme.isDark ? THEME.blue900 : THEME.blue50, border: `2px solid ${THEME.primary}`, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ width: 50, height: 50, borderRadius: 2.5, bgcolor: THEME.primary, color: THEME.white, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px ${THEME.primary}4D` }}>
                        <DashboardIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: theme.textPrimary, letterSpacing: "-0.5px", fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
                            Welcome back, {user?.full_name || user?.username || "Admin"} 👋
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.textSecondary, fontWeight: 500, mt: 0.25 }}>
                            Here is an overview of your real-time revenue, quotations, inventory, and activity history.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Tooltip title="Refresh Dashboard Data">
                        <IconButton onClick={handleRefresh} disabled={loading} sx={{ bgcolor: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.textPrimary, "&:hover": { bgcolor: theme.isDark ? "rgba(255,255,255,0.1)" : THEME.border } }}>
                            <RefreshIcon sx={{ fontSize: 20, animation: loading ? "spin 1s linear infinite" : "none", "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } } }} />
                        </IconButton>
                    </Tooltip>

                    <Button
                        variant="contained"
                        onClick={() => {
                            const reportType = prompt("Enter report type to export (bills, quotations, stock, customers):", "bills");
                            if (reportType) {
                                window.open(DashboardService.exportReportUrl(reportType.trim()), "_blank");
                                setToastMsg(`Exporting ${reportType} report...`);
                            }
                        }}
                        startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
                        sx={{ borderRadius: 2.5, px: 2.5, py: 1, fontWeight: 700, textTransform: "none", bgcolor: THEME.primary, boxShadow: `0 4px 12px ${THEME.primary}4D`, "&:hover": { bgcolor: THEME.primaryDark } }}
                    >
                        Export CSV Report
                    </Button>
                </Box>
            </Paper>

            {/* Alert on Error */}
            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {/* 1. SECTION: 4 Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3.5 }}>
                {loading || !data ? (
                    [1, 2, 3, 4].map((i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <DashboardStatsCard loading={true} />
                        </Grid>
                    ))
                ) : (
                    data.stats.map((statItem) => (
                        <Grid item xs={12} sm={6} md={3} key={statItem.id}>
                            <DashboardStatsCard data={statItem} />
                        </Grid>
                    ))
                )}
            </Grid>

            {/* 2. SECTION: Graph (Trend Chart) & Ranking List */}
            <Grid container spacing={3} sx={{ mb: 3.5 }}>
                {/* 1 Graph / Chart */}
                <Grid item xs={12} lg={8}>
                    <DashboardTrendChart data={data?.chart_data} loading={loading} />
                </Grid>

                {/* 1 Ranking List */}
                <Grid item xs={12} lg={4}>
                    <DashboardRankingList data={data?.ranking_list} loading={loading} />
                </Grid>
            </Grid>

            {/* 3. SECTION: 1 Recent Activity Table */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <DashboardRecentTable data={data?.recent_transactions} loading={loading} />
                </Grid>
            </Grid>

            {/* Notification Toast */}
            <Snackbar open={Boolean(toastMsg)} autoHideDuration={3000} onClose={() => setToastMsg(null)} message={toastMsg} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} />
        </Box>
    );
};

export default DashboardPage;