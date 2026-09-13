import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, IconButton, Tabs, Tab, Chip, Paper, Grid, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Divider, Avatar } from "@mui/material";
import { Close as CloseIcon, Person as PersonIcon, Phone as PhoneIcon, Email as EmailIcon, History as HistoryIcon, Description as QuoteIcon, Receipt as BillIcon, CheckCircle as CheckIcon, TrendingUp as TrendingUpIcon } from "@mui/icons-material";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { useAppTheme, THEME } from "@/assets/theme";
import { CustomerService } from "@/services/customer.service";
import type { CustomerDetailModel } from "@/models/customer.models";

interface CustomerDetailsModalProps {
    open: boolean;
    customerId: number | null;
    onClose: () => void;
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ open, customerId, onClose }) => {
    const theme = useAppTheme();
    const [details, setDetails] = useState<CustomerDetailModel | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<number>(0);

    useEffect(() => {
        if (open && customerId) {
            fetchCustomerDetails(customerId);
        } else {
            setDetails(null);
        }
    }, [open, customerId]);

    const fetchCustomerDetails = async (id: number) => {
        setLoading(true);
        try {
            const res = await CustomerService.getCustomerById(id);
            if (res.data) {
                setDetails(res.data);
            }
        } catch (err) {
            console.error("Failed to load customer details:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    const getTimelineBadgeBg = (eventType: string) => {
        switch (eventType) {
            case "QUOTATION_CREATED":
                return { bg: theme.isDark ? "rgba(37,99,235,0.15)" : "#EFF6FF", color: THEME.primary };
            case "QUOTATION_CHECKED_OUT":
                return { bg: theme.isDark ? "rgba(124,58,237,0.15)" : "#F5F3FF", color: THEME.secondary };
            case "INVOICE_GENERATED":
            case "PAYMENT_RECEIVED":
                return { bg: theme.isDark ? "rgba(22,163,74,0.15)" : "#DCFCE7", color: "#16A34A" };
            case "ACCOUNT_CREATED":
                return { bg: theme.isDark ? "rgba(245,158,11,0.15)" : "#FEF3C7", color: THEME.warning };
            default:
                return { bg: theme.isDark ? "rgba(148,163,184,0.15)" : "#F1F5F9", color: theme.textSecondary };
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: theme.paperBg, minHeight: 600 } }}>
            {/* Header */}
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: `1px solid ${theme.border}` }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ width: 44, height: 44, bgcolor: THEME.primary, fontWeight: 800, fontSize: "1.1rem" }}>
                        {details?.company_name ? details.company_name.charAt(0) : "C"}
                    </Avatar>
                    <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.textPrimary, fontSize: "1.15rem" }}>
                                {details?.company_name || "Customer Profile"}
                            </Typography>
                            {details?.customer_type && (
                                <Chip label={details.customer_type} size="small" sx={{ fontWeight: 700, fontSize: "0.72rem", bgcolor: theme.isDark ? "rgba(37,99,235,0.2)" : "#EFF6FF", color: THEME.primary }} />
                            )}
                        </Box>
                        <Typography variant="caption" sx={{ color: theme.textSecondary }}>
                            Code: {details?.customer_code} • {details?.city ? `${details.city}, ${details.state}` : "Institutional Account"}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: theme.textSecondary }}>
                    <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {loading || !details ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                        <CircularProgress size={36} sx={{ color: THEME.primary }} />
                    </Box>
                ) : (
                    <>
                        {/* Metrics Bar */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={3}>
                                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: theme.isDark ? "rgba(37,99,235,0.12)" : "#EFF6FF", border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 1.5 }}>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: THEME.primary, color: "#fff", display: "flex" }}>
                                        <TrendingUpIcon sx={{ fontSize: 22 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: theme.textSecondary, fontWeight: 600 }}>Total Business Value</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.primary, fontSize: "1.1rem" }}>₹{details.total_business_value.toLocaleString()}</Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={3}>
                                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: theme.isDark ? "rgba(220,38,38,0.12)" : "#FEE2E2", border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 1.5 }}>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: THEME.error, color: "#fff", display: "flex" }}>
                                        <BillIcon sx={{ fontSize: 22 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: theme.textSecondary, fontWeight: 600 }}>Outstanding Balance</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.error, fontSize: "1.1rem" }}>₹{details.outstanding_payments.toLocaleString()}</Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={3}>
                                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: theme.isDark ? "rgba(124,58,237,0.12)" : "#F5F3FF", border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 1.5 }}>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: THEME.secondary, color: "#fff", display: "flex" }}>
                                        <QuoteIcon sx={{ fontSize: 22 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: theme.textSecondary, fontWeight: 600 }}>Quotations Created</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.secondary, fontSize: "1.1rem" }}>{details.quotations_count}</Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={3}>
                                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: theme.isDark ? "rgba(22,163,74,0.12)" : "#DCFCE7", border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 1.5 }}>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: "#16A34A", color: "#fff", display: "flex" }}>
                                        <CheckIcon sx={{ fontSize: 22 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: theme.textSecondary, fontWeight: 600 }}>Orders / Invoices</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: "#16A34A", fontSize: "1.1rem" }}>{details.orders_count}</Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Navigation Tabs */}
                        <Box sx={{ borderBottom: 1, borderColor: theme.border, mb: 3 }}>
                            <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ "& .MuiTab-root": { textTransform: "none", fontWeight: 700, fontSize: "0.875rem" } }}>
                                <Tab label="Overview & Contacts" icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                                <Tab label={`Timeline (${details.timeline.length})`} icon={<HistoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                                <Tab label={`Quotations (${details.previous_quotations.length})`} icon={<QuoteIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                                <Tab label={`Orders / Bills (${details.previous_orders.length})`} icon={<BillIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                            </Tabs>
                        </Box>

                        {/* TAB 0: Overview & Contact Persons */}
                        {activeTab === 0 && (
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={7}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: THEME.primary, mb: 1.5, textTransform: "uppercase", fontSize: "0.75rem" }}>
                                        Contact Persons ({details.contact_persons.length})
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {details.contact_persons.map((cp, idx) => (
                                            <Grid item xs={12} sm={6} key={idx}>
                                                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: theme.isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC", border: `1px solid ${theme.border}` }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: theme.textPrimary }}>{cp.name}</Typography>
                                                    {cp.designation && <Typography variant="caption" sx={{ color: THEME.primary, fontWeight: 600, display: "block" }}>{cp.designation}</Typography>}
                                                    {cp.phone && (
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                                                            <PhoneIcon sx={{ fontSize: 14, color: theme.textSecondary }} />
                                                            <Typography variant="caption" sx={{ color: theme.textSecondary }}>{cp.phone}</Typography>
                                                        </Box>
                                                    )}
                                                    {cp.email && (
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                                            <EmailIcon sx={{ fontSize: 14, color: theme.textSecondary }} />
                                                            <Typography variant="caption" sx={{ color: theme.textSecondary }}>{cp.email}</Typography>
                                                        </Box>
                                                    )}
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>

                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: THEME.primary, mt: 3, mb: 1, textTransform: "uppercase", fontSize: "0.75rem" }}>
                                        Notes & Terms
                                    </Typography>
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: theme.isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC", border: `1px solid ${theme.border}` }}>
                                        <Typography variant="body2" sx={{ color: theme.textPrimary, fontStyle: details.notes ? "normal" : "italic" }}>
                                            {details.notes || "No custom notes recorded."}
                                        </Typography>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={5}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: THEME.primary, mb: 1.5, textTransform: "uppercase", fontSize: "0.75rem" }}>
                                        Tax & Addresses
                                    </Typography>
                                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, bgcolor: theme.isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: 1.5 }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: theme.textSecondary, fontWeight: 600 }}>GSTIN</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: theme.textPrimary }}>{details.gstin || "N/A"}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: theme.textSecondary, fontWeight: 600 }}>PAN</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: theme.textPrimary }}>{details.pan || "N/A"}</Typography>
                                        </Box>
                                        <Divider />
                                        <Box>
                                            <Typography variant="caption" sx={{ color: theme.textSecondary, fontWeight: 600 }}>Billing Address</Typography>
                                            <Typography variant="body2" sx={{ color: theme.textPrimary, mt: 0.25 }}>{details.billing_address || "Not specified"}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: theme.textSecondary, fontWeight: 600 }}>Shipping / Delivery Address</Typography>
                                            <Typography variant="body2" sx={{ color: theme.textPrimary, mt: 0.25 }}>{details.shipping_address || "Same as billing"}</Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        )}

                        {/* TAB 1: Interactive Customer Timeline */}
                        {activeTab === 1 && (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pl: 2, borderLeft: `3px solid ${THEME.primary}` }}>
                                {details.timeline.length === 0 ? (
                                    <Typography variant="body2" sx={{ color: theme.textSecondary }}>No timeline events recorded.</Typography>
                                ) : (
                                    details.timeline.map((evt) => {
                                        const badge = getTimelineBadgeBg(evt.event_type);
                                        return (
                                            <Paper key={evt.id} elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: theme.isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC", border: `1px solid ${theme.border}`, position: "relative" }}>
                                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
                                                    <Chip label={evt.event_type.replace("_", " ")} size="small" sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700, bgcolor: badge.bg, color: badge.color }} />
                                                    <Typography variant="caption" sx={{ color: theme.textSecondary, fontWeight: 600 }}>{evt.date}</Typography>
                                                </Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.textPrimary }}>{evt.title}</Typography>
                                                <Typography variant="body2" sx={{ color: theme.textSecondary, mt: 0.5, fontSize: "0.85rem" }}>{evt.description}</Typography>
                                            </Paper>
                                        );
                                    })
                                )}
                            </Box>
                        )}

                        {/* TAB 2: Quotations History */}
                        {activeTab === 2 && (
                            <Table sx={{ border: `1px solid ${theme.border}`, borderRadius: 2 }}>
                                <TableHead sx={{ bgcolor: theme.isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC" }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Quote ID</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>Total Amount</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {details.previous_quotations.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} align="center">No quotations generated yet for this customer.</TableCell></TableRow>
                                    ) : (
                                        details.previous_quotations.map((q) => (
                                            <TableRow key={q.id} hover>
                                                <TableCell sx={{ fontWeight: 700, color: THEME.primary }}>{q.quote_id}</TableCell>
                                                <TableCell>{q.created_at}</TableCell>
                                                <TableCell>{q.items_count} items</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 800 }}>₹{q.total_amount.toLocaleString()}</TableCell>
                                                <TableCell align="center">
                                                    <Chip label={q.status} size="small" sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700 }} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}

                        {/* TAB 3: Orders / Bills History */}
                        {activeTab === 3 && (
                            <Table sx={{ border: `1px solid ${theme.border}`, borderRadius: 2 }}>
                                <TableHead sx={{ bgcolor: theme.isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC" }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Invoice #</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Quote Ref</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Payment Method</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {details.previous_orders.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} align="center">No orders / bills found for this customer.</TableCell></TableRow>
                                    ) : (
                                        details.previous_orders.map((b) => (
                                            <TableRow key={b.id} hover>
                                                <TableCell sx={{ fontWeight: 700, color: THEME.primary }}>{b.bill_number}</TableCell>
                                                <TableCell>{b.quote_id || "Direct"}</TableCell>
                                                <TableCell>{b.created_at}</TableCell>
                                                <TableCell>{b.payment_method}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 800 }}>₹{b.total_amount.toLocaleString()}</TableCell>
                                                <TableCell align="center">
                                                    <Chip label={b.status} size="small" sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700, bgcolor: b.status === "PAID" ? "#DCFCE7" : "#FEF3C7", color: b.status === "PAID" ? "#16A34A" : "#B45309" }} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.border}` }}>
                <CustomButton text="Close" onClick={onClose} bgc={THEME.primary} color="#FFFFFF" height={38} />
            </DialogActions>
        </Dialog>
    );
};
