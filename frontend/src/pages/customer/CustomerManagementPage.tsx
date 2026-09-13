import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Grid, Button, IconButton, TextField, InputAdornment, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, Skeleton, Tooltip, Snackbar } from "@mui/material";
import { Search as SearchIcon, Add as AddIcon, Refresh as RefreshIcon, Visibility as ViewIcon, Edit as EditIcon, Delete as DeleteIcon, Business as BusinessIcon, School as SchoolIcon, AccountBalanceWallet as WalletIcon, TrendingUp as TrendingUpIcon } from "@mui/icons-material";
import { useAppTheme, THEME } from "@/assets/theme";
import { CustomerService } from "@/services/customer.service";
import type { CustomerModel } from "@/models/customer.models";
import { AddEditCustomerOverlay } from "./AddEditCustomerOverlay";
import { CustomerDetailsModal } from "./CustomerDetailsModal";

const CustomerManagementPage: React.FC = () => {
    const theme = useAppTheme();
    const [customers, setCustomers] = useState<CustomerModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [stateFilter, setStateFilter] = useState<string>("");
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    // Modal states
    const [addEditOpen, setAddEditOpen] = useState<boolean>(false);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerModel | null>(null);
    
    const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
    const [viewCustomerId, setViewCustomerId] = useState<number | null>(null);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await CustomerService.getAllCustomers(
                search,
                typeFilter === "ALL" ? undefined : typeFilter,
                stateFilter.trim() || undefined
            );
            if (res.data) {
                setCustomers(res.data);
            }
        } catch (err: any) {
            console.error("Error fetching customers:", err);
            setToastMsg("Failed to load customer list");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [typeFilter]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCustomers();
    };

    const handleOpenAdd = () => {
        setSelectedCustomer(null);
        setAddEditOpen(true);
    };

    const handleOpenEdit = (customer: CustomerModel) => {
        setSelectedCustomer(customer);
        setAddEditOpen(true);
    };

    const handleOpenDetails = (id: number) => {
        setViewCustomerId(id);
        setDetailsModalOpen(true);
    };

    const handleDelete = async (customer: CustomerModel) => {
        if (window.confirm(`Are you sure you want to delete customer '${customer.company_name}'?`)) {
            try {
                await CustomerService.deleteCustomer(customer.id);
                setToastMsg(`Customer '${customer.company_name}' deleted successfully.`);
                fetchCustomers();
            } catch (err: any) {
                setToastMsg("Failed to delete customer account.");
            }
        }
    };

    // Calculate Summary Metrics
    const totalBusinessValue = customers.reduce((sum, c) => sum + (c.total_business_value || 0), 0);
    const totalOutstanding = customers.reduce((sum, c) => sum + (c.outstanding_payments || 0), 0);
    const totalColleges = customers.filter((c) => c.customer_type === "COLLEGE" || c.customer_type === "UNIVERSITY" || c.customer_type === "POLYTECHNIC").length;

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: theme.background, minHeight: "100vh" }}>
            {/* Top Banner Header */}
            <Paper elevation={0} sx={{ p: 3, mb: 3.5, borderRadius: 3, bgcolor: theme.isDark ? "rgba(37, 99, 235, 0.12)" : "#EFF6FF", border: `2px solid ${THEME.primary}`, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ width: 50, height: 50, borderRadius: 2.5, bgcolor: THEME.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(37,99,235,0.3)" }}>
                        <BusinessIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: theme.textPrimary, letterSpacing: "-0.5px", fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
                            Customer & Institutional Accounts
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.textSecondary, fontWeight: 500, mt: 0.25 }}>
                            Manage repeat engineering colleges, universities, contact persons, GSTIN, and business history in one unified CRM view.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Tooltip title="Refresh Customer List">
                        <IconButton onClick={fetchCustomers} disabled={loading} sx={{ bgcolor: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.textPrimary, "&:hover": { bgcolor: theme.isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0" } }}>
                            <RefreshIcon sx={{ fontSize: 20, animation: loading ? "spin 1s linear infinite" : "none", "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } } }} />
                        </IconButton>
                    </Tooltip>

                    <Button variant="contained" onClick={handleOpenAdd} startIcon={<AddIcon sx={{ fontSize: 18 }} />} sx={{ borderRadius: 2.5, px: 2.5, py: 1, fontWeight: 700, textTransform: "none", bgcolor: THEME.primary, boxShadow: "0 4px 12px rgba(37,99,235,0.3)", "&:hover": { bgcolor: THEME.primaryDark } }}>
                        Add Customer
                    </Button>
                </Box>
            </Paper>

            {/* Metrics Overview Grid */}
            <Grid container spacing={3} sx={{ mb: 3.5 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.cardBg, border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box>
                            <Typography variant="caption" sx={{ color: theme.textSecondary, fontWeight: 600, textTransform: "uppercase" }}>Total Customers</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: theme.textPrimary, mt: 0.5 }}>{customers.length}</Typography>
                        </Box>
                        <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: theme.isDark ? "rgba(37,99,235,0.15)" : "#EFF6FF", color: THEME.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <BusinessIcon sx={{ fontSize: 24 }} />
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.cardBg, border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box>
                            <Typography variant="caption" sx={{ color: theme.textSecondary, fontWeight: 600, textTransform: "uppercase" }}>Total Business Value</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: THEME.primary, mt: 0.5 }}>₹{totalBusinessValue.toLocaleString()}</Typography>
                        </Box>
                        <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: theme.isDark ? "rgba(37,99,235,0.15)" : "#EFF6FF", color: THEME.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <TrendingUpIcon sx={{ fontSize: 24 }} />
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.cardBg, border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box>
                            <Typography variant="caption" sx={{ color: theme.textSecondary, fontWeight: 600, textTransform: "uppercase" }}>Educational Inst.</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: THEME.secondary, mt: 0.5 }}>{totalColleges}</Typography>
                        </Box>
                        <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: theme.isDark ? "rgba(124,58,237,0.15)" : "#F5F3FF", color: THEME.secondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <SchoolIcon sx={{ fontSize: 24 }} />
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.cardBg, border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box>
                            <Typography variant="caption" sx={{ color: theme.textSecondary, fontWeight: 600, textTransform: "uppercase" }}>Outstanding Balance</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: THEME.error, mt: 0.5 }}>₹{totalOutstanding.toLocaleString()}</Typography>
                        </Box>
                        <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: theme.isDark ? "rgba(220,38,38,0.15)" : "#FEE2E2", color: THEME.error, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <WalletIcon sx={{ fontSize: 24 }} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Filter & Search Bar */}
            <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, bgcolor: theme.cardBg, border: `1px solid ${theme.border}` }}>
                <form onSubmit={handleSearchSubmit}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={5}>
                            <TextField placeholder="Search by institution name, GSTIN, code, city..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" fullWidth InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 20, color: theme.textSecondary }} /></InputAdornment>) }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: theme.isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF" } }} />
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <TextField select label="Customer Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} size="small" fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                                <MenuItem value="ALL">All Customer Types</MenuItem>
                                <MenuItem value="COLLEGE">College</MenuItem>
                                <MenuItem value="UNIVERSITY">University</MenuItem>
                                <MenuItem value="POLYTECHNIC">Polytechnic</MenuItem>
                                <MenuItem value="RESEARCH_LAB">Research Lab</MenuItem>
                                <MenuItem value="CORPORATE">Corporate</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <TextField placeholder="Filter by State..." value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} size="small" fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                        </Grid>

                        <Grid item xs={12} sm={1}>
                            <Button type="submit" variant="contained" fullWidth sx={{ height: 40, borderRadius: 2, bgcolor: THEME.primary }}>
                                Filter
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* Customer Table */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.cardBg, border: `1px solid ${theme.border}` }}>
                <TableContainer sx={{ overflowX: "auto" }}>
                    <Table size="medium">
                        <TableHead sx={{ bgcolor: theme.isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC" }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: theme.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Customer Code</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: theme.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Institution / Company</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: theme.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Primary Contact</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: theme.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>City / State</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: theme.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>GSTIN</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: theme.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Business Value</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, color: theme.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                [1, 2, 3, 4].map((i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={7}><Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1.5 }} /></TableCell>
                                    </TableRow>
                                ))
                            ) : customers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5, color: theme.textSecondary }}>
                                        No customer records found. Click <strong>Add Customer</strong> to create your first client.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customers.map((c) => {
                                    const firstContact = c.contact_persons && c.contact_persons.length > 0 ? c.contact_persons[0] : null;
                                    return (
                                        <TableRow key={c.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                            <TableCell sx={{ fontWeight: 700, color: THEME.primary, fontSize: "0.85rem" }}>
                                                {c.customer_code}
                                            </TableCell>

                                            <TableCell sx={{ color: theme.textPrimary }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                                                        {c.company_name}
                                                    </Typography>
                                                    <Chip label={c.customer_type} size="small" sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1, bgcolor: theme.isDark ? "rgba(37,99,235,0.15)" : "#EFF6FF", color: THEME.primary }} />
                                                </Box>
                                                {c.email && (
                                                    <Typography variant="caption" sx={{ color: theme.textSecondary, display: "block" }}>
                                                        {c.email}
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {firstContact ? (
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem", color: theme.textPrimary }}>
                                                            {firstContact.name}
                                                        </Typography>
                                                        {firstContact.designation && (
                                                            <Typography variant="caption" sx={{ color: theme.textSecondary, display: "block" }}>
                                                                {firstContact.designation}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                ) : (
                                                    <Typography variant="caption" sx={{ color: theme.textSecondary }}>No contact specified</Typography>
                                                )}
                                            </TableCell>

                                            <TableCell sx={{ color: theme.textPrimary, fontSize: "0.85rem" }}>
                                                {c.city || c.state ? `${c.city || ""}${c.city && c.state ? ", " : ""}${c.state || ""}` : "N/A"}
                                            </TableCell>

                                            <TableCell sx={{ color: theme.textSecondary, fontSize: "0.82rem", fontWeight: 600 }}>
                                                {c.gstin || "N/A"}
                                            </TableCell>

                                            <TableCell align="right" sx={{ fontWeight: 800, color: THEME.primary, fontSize: "0.9rem" }}>
                                                ₹{c.total_business_value.toLocaleString()}
                                            </TableCell>

                                            <TableCell align="center">
                                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                                                    <Tooltip title="View Profile & Interactive Timeline">
                                                        <IconButton size="small" onClick={() => handleOpenDetails(c.id)} sx={{ color: THEME.primary, bgcolor: theme.isDark ? "rgba(37,99,235,0.1)" : "#EFF6FF", "&:hover": { bgcolor: THEME.primary, color: "#fff" } }}>
                                                            <ViewIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Edit Customer Profile">
                                                        <IconButton size="small" onClick={() => handleOpenEdit(c)} sx={{ color: theme.textSecondary, "&:hover": { color: THEME.primary } }}>
                                                            <EditIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Delete Account">
                                                        <IconButton size="small" onClick={() => handleDelete(c)} sx={{ color: theme.textSecondary, "&:hover": { color: THEME.error } }}>
                                                            <DeleteIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Overlays & Modals */}
            <AddEditCustomerOverlay open={addEditOpen} customer={selectedCustomer} onClose={() => setAddEditOpen(false)} onSaved={fetchCustomers} />
            <CustomerDetailsModal open={detailsModalOpen} customerId={viewCustomerId} onClose={() => setDetailsModalOpen(false)} />

            {/* Toast Snackbar */}
            <Snackbar open={Boolean(toastMsg)} autoHideDuration={3000} onClose={() => setToastMsg(null)} message={toastMsg} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} />
        </Box>
    );
};

export default CustomerManagementPage;
