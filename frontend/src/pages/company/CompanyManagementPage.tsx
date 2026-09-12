import React, { useEffect, useState } from "react";
import { THEME, useAppTheme } from "@/assets/theme";
import type { Company } from "@/models/company.models";
import { CompanyService } from "@/services/company.service";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { CustomInput } from "@/components/Inputs/CustomInput";
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox, CircularProgress, Alert, Snackbar, Divider, Tooltip } from "@mui/material";
import { Business as BusinessIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, CheckCircle as CheckCircleIcon, Star as StarIcon, StarBorder as StarBorderIcon, CloudUpload as CloudUploadIcon, Email as EmailIcon, Phone as PhoneIcon, LocationOn as LocationIcon, ReceiptLong as ReceiptLongIcon, Badge as BadgeIcon } from "@mui/icons-material";

export const CompanyManagementPage: React.FC = () => {
  const theme = useAppTheme();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Form Fields
  const [companyName, setCompanyName] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [gstNumber, setGstNumber] = useState<string>("");
  const [panNumber, setPanNumber] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [billingAddress, setBillingAddress] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(false);

  // Delete Confirm State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

  const showToast = (message: string, severity: "success" | "error" = "success") => {
    setToast({ open: true, message, severity });
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await CompanyService.getCompanies();
      if (res.data) {
        setCompanies(res.data);
      }
    } catch (err: any) {
      showToast("Failed to fetch companies list.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const activeCompany = companies.find((c) => c.is_active);

  const handleOpenAddDialog = () => {
    setEditingCompany(null);
    setCompanyName("");
    setLogoUrl("");
    setGstNumber("");
    setPanNumber("");
    setAddress("");
    setBillingAddress("");
    setEmail("");
    setPhone("");
    setWebsite("");
    setIsActive(companies.length === 0);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (company: Company) => {
    setEditingCompany(company);
    setCompanyName(company.company_name);
    setLogoUrl(company.logo_url || "");
    setGstNumber(company.gst_number || "");
    setPanNumber(company.pan_number || "");
    setAddress(company.address || "");
    setBillingAddress(company.billing_address || "");
    setEmail(company.email || "");
    setPhone(company.phone || "");
    setWebsite(company.website || "");
    setIsActive(company.is_active);
    setDialogOpen(true);
  };

  const handleLogoFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const res = await CompanyService.uploadLogo(file);
      if (res.data?.url) {
        setLogoUrl(res.data.url);
        showToast("Company logo uploaded successfully!");
      }
    } catch (err: any) {
      showToast("Failed to upload company logo.", "error");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!companyName.trim()) {
      showToast("Company Name is required.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        company_name: companyName.trim(),
        logo_url: logoUrl || undefined,
        gst_number: gstNumber.trim() || undefined,
        pan_number: panNumber.trim() || undefined,
        address: address.trim() || undefined,
        billing_address: billingAddress.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        is_active: isActive,
      };

      if (editingCompany) {
        await CompanyService.updateCompany(editingCompany.id, payload);
        showToast(`Company '${companyName}' updated successfully!`);
      } else {
        await CompanyService.createCompany(payload);
        showToast(`Company '${companyName}' created successfully!`);
      }

      setDialogOpen(false);
      fetchCompanies();
    } catch (err: any) {
      showToast("Failed to save company details.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetActive = async (company: Company) => {
    if (company.is_active) return;

    try {
      await CompanyService.setActiveCompany(company.id);
      showToast(`'${company.company_name}' is now set as the Active Company!`);
      fetchCompanies();
    } catch (err: any) {
      showToast("Failed to set active company.", "error");
    }
  };

  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;

    try {
      await CompanyService.deleteCompany(companyToDelete.id);
      showToast(`Company '${companyToDelete.company_name}' deleted successfully.`);
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
      fetchCompanies();
    } catch (err: any) {
      showToast("Failed to delete company.", "error");
    }
  };

  return (
    <Box p={3.5} sx={{ maxWidth: 1250, margin: "0 auto" }}>
      {/* Top Banner Header */}
      <Paper elevation={0} sx={{ p: 3.5, mb: 3.5, borderRadius: 3, background: theme.isDark ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: theme.isDark ? "0 10px 25px -5px rgba(0, 0, 0, 0.5)" : "0 10px 25px -5px rgba(15, 23, 42, 0.4)" }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ width: 54, height: 54, borderRadius: 2.5, bgcolor: "rgba(255, 255, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
            <BusinessIcon sx={{ fontSize: 32, color: THEME.warning }} />
          </Box>
          <Box>
            <Typography fontSize={22} fontWeight={800} letterSpacing="-0.5px" color="#ffffff">
              Organization & Company Module
            </Typography>
            <Typography fontSize={13.5} sx={{ color: "rgba(255, 255, 255, 0.8)", mt: 0.3 }}>
              Manage registered company entities. Super Admin can select which company is active for quotations and billing.
            </Typography>
          </Box>
        </Box>

        <CustomButton
          text="Add New Company"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          bgc={THEME.primary}
          color="#ffffff"
          width="auto"
          height="42px"
          sx={{ px: 3, borderRadius: 2 }}
        />
      </Paper>

      {/* Active Company Highlight Banner */}
      {activeCompany && (
        <Paper elevation={0} sx={{ p: 3, mb: 3.5, borderRadius: 3, bgcolor: theme.isDark ? "rgba(37, 99, 235, 0.12)" : "#eff6ff", border: `2px solid ${THEME.primary}`, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box display="flex" alignItems="center" gap={2.5}>
            {activeCompany.logo_url ? (
              <Box component="img" src={activeCompany.logo_url} alt={activeCompany.company_name} sx={{ width: 64, height: 64, borderRadius: 2, objectFit: "contain", bgcolor: theme.isDark ? "#1e293b" : "#ffffff", p: 0.8, border: `1px solid ${theme.border}` }} />
            ) : (
              <Box sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: THEME.primary, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24 }}>
                {activeCompany.company_name.charAt(0)}
              </Box>
            )}

            <Box>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Typography fontSize={18} fontWeight={800} color={theme.textPrimary}>
                  {activeCompany.company_name}
                </Typography>
                <Chip icon={<CheckCircleIcon sx={{ fontSize: "16px !important", color: "#ffffff !important" }} />} label="ACTIVE SYSTEM COMPANY" sx={{ bgcolor: "#16a34a", color: "#ffffff", fontWeight: 800, fontSize: 11, height: 24 }} />
              </Box>
              <Typography fontSize={13} color={theme.textSecondary} mt={0.5}>
                GST: <strong style={{ color: theme.textPrimary }}>{activeCompany.gst_number || "N/A"}</strong> | PAN: <strong style={{ color: theme.textPrimary }}>{activeCompany.pan_number || "N/A"}</strong> | Phone: <strong style={{ color: theme.textPrimary }}>{activeCompany.phone || "N/A"}</strong> | Email: <strong style={{ color: theme.textPrimary }}>{activeCompany.email || "N/A"}</strong>
              </Typography>
            </Box>
          </Box>

          <CustomButton size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => handleOpenEditDialog(activeCompany)} sx={{ borderColor: THEME.primary, color: theme.isDark ? "#60a5fa" : THEME.primary, fontWeight: 700, borderRadius: 1.5, textTransform: "none" }}>
            Edit Active Company
          </CustomButton>
        </Paper>
      )}

      {/* Companies List */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={40} />
        </Box>
      ) : companies.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: "center", borderRadius: 3, border: `1px solid ${theme.border}`, bgcolor: theme.paperBg }}>
          <BusinessIcon sx={{ fontSize: 50, color: theme.textSecondary, mb: 1.5 }} />
          <Typography fontSize={18} fontWeight={700} color={theme.textPrimary}>
            No Companies Registered Yet
          </Typography>
          <Typography fontSize={13} color={theme.textSecondary} mt={0.5} mb={2.5}>
            Click below to create your organization company profile for quotations.
          </Typography>
          <CustomButton variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddDialog}>
            Create Company
          </CustomButton>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {companies.map((company) => (
            <Grid item xs={12} md={6} key={company.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${company.is_active ? THEME.primary : theme.border}`,
                  bgcolor: company.is_active
                    ? (theme.isDark ? "rgba(37, 99, 235, 0.1)" : "#f8fafc")
                    : theme.cardBg,
                  boxShadow: company.is_active ? "0 4px 20px rgba(37, 99, 235, 0.15)" : "none",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      {company.logo_url ? (
                        <Box
                          component="img"
                          src={company.logo_url}
                          alt={company.company_name}
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 2,
                            objectFit: "contain",
                            bgcolor: theme.isDark ? "#0f172a" : "#ffffff",
                            p: 0.5,
                            border: `1px solid ${theme.border}`,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 2,
                            bgcolor: company.is_active ? THEME.primary : (theme.isDark ? "#334155" : "#94a3b8"),
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: 20,
                          }}
                        >
                          {company.company_name.charAt(0)}
                        </Box>
                      )}

                      <Box>
                        <Typography fontSize={16} fontWeight={800} color={theme.textPrimary}>
                          {company.company_name}
                        </Typography>
                        {company.is_active ? (
                          <Chip
                            label="ACTIVE COMPANY"
                            size="small"
                            sx={{
                              bgcolor: "#16a34a",
                              color: "#ffffff",
                              fontWeight: 800,
                              fontSize: 10,
                              mt: 0.3,
                            }}
                          />
                        ) : (
                          <Chip
                            label="INACTIVE"
                            size="small"
                            sx={{
                              bgcolor: theme.isDark ? "#334155" : "#e2e8f0",
                              color: theme.isDark ? "#94a3b8" : "#64748b",
                              fontWeight: 700,
                              fontSize: 10,
                              mt: 0.3,
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="Edit Company">
                        <IconButton size="small" onClick={() => handleOpenEditDialog(company)} sx={{ color: theme.textSecondary }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Company">
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(company)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1.5, borderColor: theme.border }} />

                  {/* Company Details Grid */}
                  <Grid container spacing={1.5} sx={{ fontSize: 13, color: theme.textSecondary }}>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={0.8}>
                        <ReceiptLongIcon sx={{ fontSize: 16, color: THEME.primary }} />
                        <span>GST: <strong style={{ color: theme.textPrimary }}>{company.gst_number || "Optional"}</strong></span>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={0.8}>
                        <BadgeIcon sx={{ fontSize: 16, color: THEME.primary }} />
                        <span>PAN: <strong style={{ color: theme.textPrimary }}>{company.pan_number || "Optional"}</strong></span>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={0.8}>
                        <EmailIcon sx={{ fontSize: 16, color: THEME.primary }} />
                        <span>{company.email || "N/A"}</span>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={0.8}>
                        <PhoneIcon sx={{ fontSize: 16, color: THEME.primary }} />
                        <span>{company.phone || "N/A"}</span>
                      </Box>
                    </Grid>
                    {company.address && (
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="flex-start" gap={0.8}>
                          <LocationIcon sx={{ fontSize: 16, color: THEME.primary, mt: 0.3 }} />
                          <span>Address: {company.address}</span>
                        </Box>
                      </Grid>
                    )}
                  </Grid>

                  {/* Set Active Button */}
                  <Box mt={2.5} display="flex" justifyContent="flex-end">
                    {company.is_active ? (
                      <CustomButton
                        disabled
                        size="small"
                        startIcon={<StarIcon />}
                        sx={{ color: "#16a34a", fontWeight: 700, textTransform: "none" }}
                      >
                        Currently Active Company
                      </CustomButton>
                    ) : (
                      <CustomButton
                        size="small"
                        variant="contained"
                        startIcon={<StarBorderIcon />}
                        onClick={() => handleSetActive(company)}
                        sx={{
                          bgcolor: THEME.primary,
                          color: "#ffffff",
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: 1.5,
                        }}
                      >
                        Set as Active Company
                      </CustomButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* CREATE / EDIT COMPANY DIALOG */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: theme.paperBg, color: theme.textPrimary } }}>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: `1px solid ${theme.border}`, p: 2.5, color: theme.textPrimary }}>
          {editingCompany ? "Edit Company Details" : "Create New Company"}
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            {/* Logo Upload Section */}
            <Box display="flex" alignItems="center" gap={2.5}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 2.5,
                  border: `2px dashed ${theme.border}`,
                  bgcolor: theme.isDark ? "#0f172a" : "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {logoUrl ? (
                  <Box component="img" src={logoUrl} alt="Logo" sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <BusinessIcon sx={{ fontSize: 32, color: theme.textSecondary }} />
                )}
              </Box>

              <Box>
                <CustomButton
                  component="label"
                  variant="outlined"
                  size="small"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploadingLogo}
                  sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
                >
                  {uploadingLogo ? "Uploading..." : "Upload Logo File"}
                  <input type="file" accept="image/*" hidden onChange={handleLogoFileUpload} />
                </CustomButton>
                <Typography fontSize={11} color={theme.textSecondary} mt={0.5}>
                  PNG, JPG, SVG allowed. Displayed on official quotations & invoices.
                </Typography>
              </Box>
            </Box>

            <CustomInput
              required
              fullWidth
              size="small"
              label="Company Name"
              placeholder="e.g. Kitrivo Equipment Systems Pvt Ltd"
              value={companyName}
              onChange={(e: any) => setCompanyName(e.target.value)}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <CustomInput
                  fullWidth
                  size="small"
                  label="GST Number (Optional)"
                  placeholder="e.g. 33AAACK1234F1Z9"
                  value={gstNumber}
                  onChange={(e: any) => setGstNumber(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomInput
                  fullWidth
                  size="small"
                  label="PAN Number (Optional)"
                  placeholder="e.g. AAACK1234F"
                  value={panNumber}
                  onChange={(e: any) => setPanNumber(e.target.value)}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <CustomInput
                  fullWidth
                  size="small"
                  label="Email Address"
                  placeholder="e.g. info@company.com"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomInput
                  fullWidth
                  size="small"
                  label="Phone Number"
                  placeholder="e.g. +91 44 2345 6789"
                  value={phone}
                  onChange={(e: any) => setPhone(e.target.value)}
                />
              </Grid>
            </Grid>

            <CustomInput
              fullWidth
              size="small"
              label="Website URL"
              placeholder="e.g. https://www.company.com"
              value={website}
              onChange={(e: any) => setWebsite(e.target.value)}
            />

            <CustomInput
              fullWidth
              multiline
              rows={2}
              size="small"
              label="Company Address"
              placeholder="Registered office / headquarters address"
              value={address}
              onChange={(e: any) => setAddress(e.target.value)}
            />

            <CustomInput
              fullWidth
              multiline
              rows={2}
              size="small"
              label="Billing Address"
              placeholder="Billing address for quotations (if different from registered address)"
              value={billingAddress}
              onChange={(e: any) => setBillingAddress(e.target.value)}
            />

            <FormControlLabel
              control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} color="primary" />}
              label={
                <Typography fontSize={13} fontWeight={700} color={theme.textPrimary}>
                  Set as Active System Company (used across all quotations)
                </Typography>
              }
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.border}`, gap: 1 }}>
          <CustomButton
            text="Cancel"
            variant="outlined"
            width="auto"
            onClick={() => setDialogOpen(false)}
            color={theme.textSecondary}
          />
          <CustomButton
            text={submitting ? "Saving..." : "Save Company"}
            disabled={submitting}
            onClick={handleSaveCompany}
            width="auto"
            bgc={THEME.primary}
            color="#ffffff"
            sx={{ px: 3, fontWeight: 700 }}
          />
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRM DIALOG */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: theme.paperBg, color: theme.textPrimary } }}>
        <DialogTitle sx={{ fontWeight: 800, color: theme.textPrimary }}>Confirm Company Deletion</DialogTitle>
        <DialogContent>
          <Typography fontSize={14} color={theme.textPrimary}>
            Are you sure you want to delete company <strong>{companyToDelete?.company_name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.border}` }}>
          <CustomButton onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: "none", color: theme.textSecondary }}>
            Cancel
          </CustomButton>
          <CustomButton variant="contained" color="error" onClick={handleConfirmDelete} sx={{ textTransform: "none", fontWeight: 700 }}>
            Delete Company
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* TOAST FEEDBACK */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyManagementPage;
