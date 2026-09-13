import React, { useState } from "react";
import { Box, Card, Typography, Skeleton, Chip } from "@mui/material";
import { ShowChart as ShowChartIcon } from "@mui/icons-material";
import { useAppTheme, THEME } from "@/assets/theme";
import type { ChartPointData } from "@/models/dashboard.models";

interface DashboardTrendChartProps {
    data?: ChartPointData[];
    loading?: boolean;
}

export const DashboardTrendChart: React.FC<DashboardTrendChartProps> = ({ data = [], loading }) => {
    const theme = useAppTheme();
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const [filter, setFilter] = useState<"all" | "revenue" | "quotations">("all");

    if (loading || !data || data.length === 0) {
        return (
            <Card elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: theme.cardBg, border: `1px solid ${theme.border}`, height: "100%", minHeight: 340, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Skeleton variant="text" width="40%" height={32} />
                <Skeleton variant="rectangular" width="100%" height={220} sx={{ borderRadius: 2, my: 2 }} />
            </Card>
        );
    }

    // Chart dimensions
    const width = 640;
    const height = 210;
    const paddingX = 50;
    const paddingY = 30;

    const maxRev = Math.max(...data.map((d) => d.revenue), 1000);
    const maxQuot = Math.max(...data.map((d) => d.quotations), 5);

    // Calculate (x, y) coordinates
    const pointsRev = data.map((d, i) => {
        const x = paddingX + (i * (width - paddingX * 2)) / (data.length - 1 || 1);
        const y = height - paddingY - (d.revenue / maxRev) * (height - paddingY * 2);
        return { x, y, val: d.revenue, label: d.month };
    });

    const pointsQuot = data.map((d, i) => {
        const x = paddingX + (i * (width - paddingX * 2)) / (data.length - 1 || 1);
        const y = height - paddingY - (d.quotations / maxQuot) * (height - paddingY * 2);
        return { x, y, val: d.quotations, label: d.month };
    });

    // Helper for smooth Bezier path
    const getBezierPath = (pts: { x: number; y: number }[]) => {
        if (pts.length === 0) return "";
        let path = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const curr = pts[i];
            const next = pts[i + 1];
            const cp1x = curr.x + (next.x - curr.x) / 2;
            const cp1y = curr.y;
            const cp2x = curr.x + (next.x - curr.x) / 2;
            const cp2y = next.y;
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
        }
        return path;
    };

    const pathRev = getBezierPath(pointsRev);
    const pathQuot = getBezierPath(pointsQuot);

    // Area path for gradient fill
    const areaRevPath = `${pathRev} L ${pointsRev[pointsRev.length - 1].x} ${height - paddingY} L ${pointsRev[0].x} ${height - paddingY} Z`;
    const areaQuotPath = `${pathQuot} L ${pointsQuot[pointsQuot.length - 1].x} ${height - paddingY} L ${pointsQuot[0].x} ${height - paddingY} Z`;

    const activePoint = hoverIdx !== null ? data[hoverIdx] : data[data.length - 1];

    return (
        <Card elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: theme.cardBg, border: `1px solid ${theme.border}`, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {/* Header Controls */}
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: theme.isDark ? "rgba(37, 99, 235, 0.15)" : "#EFF6FF", color: THEME.primary, display: "flex" }}>
                        <ShowChartIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.textPrimary, fontSize: "1.1rem" }}>
                            Revenue & Quotations Analytics
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.textSecondary, fontSize: "0.78rem" }}>
                            Performance trend over the past 6 months
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip label="All Metrics" onClick={() => setFilter("all")} size="small" sx={{ fontWeight: 600, fontSize: "0.75rem", bgcolor: filter === "all" ? THEME.primary : theme.isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9", color: filter === "all" ? "#fff" : theme.textPrimary, cursor: "pointer", "&:hover": { opacity: 0.9 } }} />
                    <Chip label="Revenue (₹)" onClick={() => setFilter("revenue")} size="small" sx={{ fontWeight: 600, fontSize: "0.75rem", bgcolor: filter === "revenue" ? THEME.primary : theme.isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9", color: filter === "revenue" ? "#fff" : theme.textPrimary, cursor: "pointer", "&:hover": { opacity: 0.9 } }} />
                    <Chip label="Quotations" onClick={() => setFilter("quotations")} size="small" sx={{ fontWeight: 600, fontSize: "0.75rem", bgcolor: filter === "quotations" ? THEME.secondary : theme.isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9", color: filter === "quotations" ? "#fff" : theme.textPrimary, cursor: "pointer", "&:hover": { opacity: 0.9 } }} />
                </Box>
            </Box>

            {/* Active Hover Display / Metric Summary */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 1, px: 1, py: 0.75, borderRadius: 2, bgcolor: theme.isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC", border: `1px solid ${theme.border}` }}>
                <Box>
                    <Typography variant="caption" sx={{ color: theme.textSecondary, display: "block", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}>
                        Selected Period
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: THEME.primary }}>
                        {activePoint ? activePoint.month : "Overall"}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="caption" sx={{ color: theme.textSecondary, display: "block", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}>
                        Revenue
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: theme.textPrimary }}>
                        ₹{activePoint ? activePoint.revenue.toLocaleString() : "0"}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="caption" sx={{ color: theme.textSecondary, display: "block", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}>
                        Quotations / Bills
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: THEME.secondary }}>
                        {activePoint ? `${activePoint.quotations} Quotes (${activePoint.bills} Paid Bills)` : "0"}
                    </Typography>
                </Box>
            </Box>

            {/* SVG Interactive Chart */}
            <Box sx={{ width: "100%", overflowX: "auto", position: "relative" }}>
                <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
                    <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="quotGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    {[0.2, 0.5, 0.8].map((ratio, idx) => {
                        const y = paddingY + ratio * (height - paddingY * 2);
                        return <line key={idx} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke={theme.isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"} strokeDasharray="4 4" strokeWidth="1" />;
                    })}

                    {/* Revenue Area & Curve */}
                    {(filter === "all" || filter === "revenue") && (
                        <>
                            <path d={areaRevPath} fill="url(#revGrad)" />
                            <path d={pathRev} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
                        </>
                    )}

                    {/* Quotations Area & Curve */}
                    {(filter === "all" || filter === "quotations") && (
                        <>
                            <path d={areaQuotPath} fill="url(#quotGrad)" />
                            <path d={pathQuot} fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" />
                        </>
                    )}

                    {/* X-Axis Month Labels & Interactive Dots */}
                    {data.map((d, i) => {
                        const ptRev = pointsRev[i];
                        const ptQuot = pointsQuot[i];
                        const isHovered = hoverIdx === i;

                        return (
                            <g key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} style={{ cursor: "pointer" }}>
                                {/* Transparent trigger column */}
                                <rect x={ptRev.x - 20} y={paddingY} width={40} height={height - paddingY * 2} fill="transparent" />

                                {/* X-Axis Text */}
                                <text x={ptRev.x} y={height - 8} textAnchor="middle" fill={isHovered ? THEME.primary : theme.textSecondary} fontSize="11" fontWeight={isHovered ? "bold" : "normal"}>
                                    {d.month}
                                </text>

                                {/* Revenue Dot */}
                                {(filter === "all" || filter === "revenue") && <circle cx={ptRev.x} cy={ptRev.y} r={isHovered ? 6 : 4} fill="#2563EB" stroke={theme.cardBg} strokeWidth={isHovered ? 3 : 2} style={{ transition: "all 0.2s" }} />}

                                {/* Quotations Dot */}
                                {(filter === "all" || filter === "quotations") && <circle cx={ptQuot.x} cy={ptQuot.y} r={isHovered ? 5 : 3.5} fill="#7C3AED" stroke={theme.cardBg} strokeWidth={isHovered ? 2.5 : 1.5} style={{ transition: "all 0.2s" }} />}

                                {/* Vertical Hover Line */}
                                {isHovered && <line x1={ptRev.x} y1={paddingY} x2={ptRev.x} y2={height - paddingY} stroke={THEME.primary} strokeWidth="1.5" strokeDasharray="3 3" />}
                            </g>
                        );
                    })}
                </svg>
            </Box>
        </Card>
    );
};
