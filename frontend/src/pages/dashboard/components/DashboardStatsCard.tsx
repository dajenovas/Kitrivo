import React from "react";
import { Box, Card, Typography, Chip, Skeleton } from "@mui/material";
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    AttachMoney as AttachMoneyIcon,
    Description as DescriptionIcon,
    ReceiptLong as ReceiptLongIcon,
    Inventory as InventoryIcon,
    Remove as RemoveIcon,
} from "@mui/icons-material";
import { useAppTheme, THEME } from "@/assets/theme";
import type { StatCardData } from "@/models/dashboard.models";

interface DashboardStatsCardProps {
    data?: StatCardData;
    loading?: boolean;
}

export const DashboardStatsCard: React.FC<DashboardStatsCardProps> = ({ data, loading }) => {
    const theme = useAppTheme();

    if (loading || !data) {
        return (
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.cardBg, border: `1px solid ${theme.border}`, height: "100%", minHeight: 145, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="80%" height={40} sx={{ my: 1 }} />
                <Skeleton variant="text" width="40%" height={20} />
            </Card>
        );
    }

    const renderIcon = () => {
        const iconStyle = { fontSize: 24, color: THEME.white };
        switch (data.icon_type) {
            case "revenue":
                return <AttachMoneyIcon sx={iconStyle} />;
            case "quotation":
                return <DescriptionIcon sx={iconStyle} />;
            case "invoice":
                return <ReceiptLongIcon sx={iconStyle} />;
            case "product":
                return <InventoryIcon sx={iconStyle} />;
            default:
                return <TrendingUpIcon sx={iconStyle} />;
        }
    };

    const getGradientBg = () => {
        switch (data.icon_type) {
            case "revenue":
                return `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryDark} 100%)`;
            case "quotation":
                return `linear-gradient(135deg, ${THEME.secondary} 0%, ${THEME.purple700} 100%)`;
            case "invoice":
                return `linear-gradient(135deg, ${THEME.emerald600} 0%, ${THEME.emerald700} 100%)`;
            case "product":
                return `linear-gradient(135deg, ${THEME.warning} 0%, ${THEME.amber700} 100%)`;
            default:
                return `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryDark} 100%)`;
        }
    };

    const isUp = data.change_type === "up";
    const isDown = data.change_type === "down";

    return (
        <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.cardBg, border: `1px solid ${theme.border}`, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "all 0.25s ease-in-out", "&:hover": { transform: "translateY(-3px)", boxShadow: theme.isDark ? `0 12px 28px ${THEME.slate900}66` : `0 12px 28px ${THEME.primary}1F` } }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: theme.textSecondary, fontWeight: 600, fontSize: "0.875rem", letterSpacing: 0.2 }}>
                    {data.title}
                </Typography>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: getGradientBg(), display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${THEME.slate900}26` }}>
                    {renderIcon()}
                </Box>
            </Box>

            <Box sx={{ mb: 1.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: theme.textPrimary, fontSize: { xs: "1.5rem", sm: "1.75rem" }, letterSpacing: "-0.5px" }}>
                    {data.value}
                </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Chip icon={isUp ? <TrendingUpIcon style={{ fontSize: 16 }} /> : isDown ? <TrendingDownIcon style={{ fontSize: 16 }} /> : <RemoveIcon style={{ fontSize: 16 }} />} label={data.change_percentage} size="small" sx={{ height: 24, fontSize: "0.75rem", fontWeight: 700, borderRadius: 1.5, bgcolor: isUp ? (theme.isDark ? `${THEME.success}33` : THEME.green100) : isDown ? (theme.isDark ? `${THEME.error}33` : THEME.red100) : (theme.isDark ? `${THEME.slate400}33` : THEME.slate100), color: isUp ? (theme.isDark ? THEME.green500 : THEME.green700) : isDown ? (theme.isDark ? THEME.red500 : THEME.red700) : theme.textSecondary, "& .MuiChip-icon": { color: "inherit" } }} />
                <Typography variant="caption" sx={{ color: theme.textSecondary, fontSize: "0.75rem", fontWeight: 500 }}>
                    {data.subtitle}
                </Typography>
            </Box>
        </Card>
    );
};
