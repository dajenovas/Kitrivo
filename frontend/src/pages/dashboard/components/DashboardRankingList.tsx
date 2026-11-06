import React from "react";
import { Box, Card, Typography, Avatar, LinearProgress, Skeleton, Chip } from "@mui/material";
import {
    EmojiEvents as EmojiEventsIcon,
    Category as CategoryIcon,
} from "@mui/icons-material";
import { useAppTheme, THEME } from "@/assets/theme";
import type { RankingItemData } from "@/models/dashboard.models";

interface DashboardRankingListProps {
    data?: RankingItemData[];
    loading?: boolean;
}

export const DashboardRankingList: React.FC<DashboardRankingListProps> = ({ data = [], loading }) => {
    const theme = useAppTheme();

    if (loading || !data || data.length === 0) {
        return (
            <Card elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: theme.cardBg, border: `1px solid ${theme.border}`, height: "100%", minHeight: 340, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Skeleton variant="text" width="50%" height={32} />
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} variant="rectangular" width="100%" height={48} sx={{ borderRadius: 2, my: 1 }} />
                ))}
            </Card>
        );
    }

    const getRankBadgeBg = (rank: number) => {
        switch (rank) {
            case 1:
                return `linear-gradient(135deg, ${THEME.warning} 0%, ${THEME.amber600} 100%)`;
            case 2:
                return `linear-gradient(135deg, ${THEME.slate400} 0%, ${THEME.slate500} 100%)`;
            case 3:
                return `linear-gradient(135deg, ${THEME.amber600} 0%, ${THEME.amber700} 100%)`;
            default:
                return theme.isDark ? "rgba(255,255,255,0.08)" : THEME.border;
        }
    };

    return (
        <Card elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: theme.cardBg, border: `1px solid ${theme.border}`, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: theme.isDark ? `${THEME.warning}26` : THEME.amber100, color: THEME.warning, display: "flex" }}>
                        <EmojiEventsIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.textPrimary, fontSize: "1.1rem" }}>
                            Top Performing Products
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.textSecondary, fontSize: "0.78rem" }}>
                            Ranked by order volume & revenue
                        </Typography>
                    </Box>
                </Box>
                <Chip label={`Top ${data.length}`} size="small" sx={{ fontWeight: 700, fontSize: "0.72rem", bgcolor: theme.isDark ? `${THEME.primary}26` : THEME.blue50, color: THEME.primary }} />
            </Box>

            {/* Ranking Items */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
                {data.map((item) => {
                    const rankColor = item.rank <= 3 ? THEME.white : theme.textPrimary;
                    return (
                        <Box key={item.id || item.rank} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: theme.isDark ? "rgba(255,255,255,0.02)" : THEME.slate50, border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: 1, transition: "transform 0.2s ease", "&:hover": { transform: "translateX(3px)", bgcolor: theme.isDark ? "rgba(255,255,255,0.04)" : THEME.slate100 } }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
                                {/* Rank & Avatar */}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                                    <Avatar sx={{ width: 28, height: 28, fontSize: "0.8rem", fontWeight: 800, background: getRankBadgeBg(item.rank), color: rankColor, boxShadow: item.rank <= 3 ? `0 2px 8px ${THEME.slate900}26` : "none" }}>
                                        {item.rank}
                                    </Avatar>
                                    <Avatar src={item.image || undefined} sx={{ width: 36, height: 36, bgcolor: THEME.primary, fontSize: "0.9rem", fontWeight: 700, borderRadius: 2 }}>
                                        {item.title ? item.title.charAt(0) : "P"}
                                    </Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: theme.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "0.875rem" }}>
                                            {item.title}
                                        </Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                            <CategoryIcon sx={{ fontSize: 13, color: theme.textSecondary }} />
                                            <Typography variant="caption" sx={{ color: theme.textSecondary, fontSize: "0.75rem" }}>
                                                {item.category}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Sales & Revenue */}
                                <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: THEME.primary, fontSize: "0.875rem" }}>
                                        ₹{item.total_revenue.toLocaleString()}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: theme.textSecondary, fontSize: "0.72rem", fontWeight: 600 }}>
                                        {item.quantity_sold} Units Sold
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Progress bar */}
                            <Box sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1 }}>
                                <LinearProgress variant="determinate" value={item.percentage} sx={{ flexGrow: 1, height: 6, borderRadius: 3, bgcolor: theme.isDark ? "rgba(255,255,255,0.08)" : THEME.border, "& .MuiLinearProgress-bar": { borderRadius: 3, background: item.rank === 1 ? `linear-gradient(90deg, ${THEME.warning} 0%, ${THEME.amber600} 100%)` : `linear-gradient(90deg, ${THEME.primary} 0%, ${THEME.secondary} 100%)` } }} />
                                <Typography variant="caption" sx={{ color: theme.textSecondary, fontWeight: 700, fontSize: "0.7rem", minWidth: 32, textAlign: "right" }}>
                                    {item.percentage}%
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Card>
    );
};
