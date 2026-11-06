import React, { useState, useEffect } from "react";
import { THEME } from "@/assets/theme";
import { AuthService } from "@/services/auth.service";
import { useThemeStore } from "@/store/useThemeStore";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from "@mui/material";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { CustomInput } from "@/components/Inputs/CustomInput";
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon,
  Extension as ExtensionIcon,
  ShoppingCart as ShoppingCartIcon,
  Key as KeyIcon,
  Shield as ShieldIcon,
  Save as SaveIcon,
  Event as EventIcon,
} from "@mui/icons-material";

export const SettingsPage: React.FC = () => {
  const { mode, setMode } = useThemeStore();
  const [activeTab, setActiveTab] = useState<number>(0);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [submittingPassword, setSubmittingPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Quotation Validity Settings State
  const [validityDays, setValidityDays] = useState<string>("14");

  // Toast Alert State
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");

  useEffect(() => {
    const savedDays = localStorage.getItem("quotation_validity_days") || "14";
    setValidityDays(savedDays);
  }, []);

  const handleSaveValiditySettings = () => {
    localStorage.setItem("quotation_validity_days", validityDays);
    setToastMessage(`Quotation validity setting saved! Default validity set to ${validityDays} days.`);
    setToastSeverity("success");
    setToastOpen(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm new password do not match.");
      return;
    }

    setSubmittingPassword(true);
    try {
      await AuthService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      });

      setToastMessage("Password changed successfully!");
      setToastSeverity("success");
      setToastOpen(true);

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to change password. Please verify current password.";
      setPasswordError(msg);
      setToastMessage(msg);
      setToastSeverity("error");
      setToastOpen(true);
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <Box p={3.5} sx={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Settings Header Banner */}
      <Paper elevation={0} sx={{ p: 3.5, mb: 3.5, borderRadius: 3, background: `linear-gradient(135deg, ${THEME.slate800} 0%, ${THEME.slate900} 100%)`, color: THEME.white, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)" }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: "rgba(255, 255, 255, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <SettingsIcon sx={{ fontSize: 30, color: THEME.sky }} />
          </Box>
          <Box>
            <Typography fontSize={24} fontWeight={800} letterSpacing="-0.5px">
              System Settings & Configuration
            </Typography>
            <Typography fontSize={14} sx={{ color: "rgba(255, 255, 255, 0.8)", mt: 0.3 }}>
              Manage password security, quotation validity rules, dark mode theme preferences, and system roadmap.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabs Navigation */}
      <Paper elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${THEME.border}`, mb: 3, bgcolor: THEME.white }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ borderBottom: `1px solid ${THEME.border}` }}
        >
          <Tab
            icon={<LockIcon fontSize="small" />}
            iconPosition="start"
            label="Change Password"
            sx={{ textTransform: "none", fontWeight: 700, fontSize: 14, py: 2 }}
          />
          <Tab
            icon={<EventIcon fontSize="small" />}
            iconPosition="start"
            label="Quotation Validity Rules"
            sx={{ textTransform: "none", fontWeight: 700, fontSize: 14, py: 2 }}
          />
          <Tab
            icon={mode === "dark" ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
            iconPosition="start"
            label="Appearance & Dark Mode"
            sx={{ textTransform: "none", fontWeight: 700, fontSize: 14, py: 2 }}
          />
          <Tab
            icon={<ExtensionIcon fontSize="small" />}
            iconPosition="start"
            label="System Feature Roadmap"
            sx={{ textTransform: "none", fontWeight: 700, fontSize: 14, py: 2 }}
          />
        </Tabs>

        {/* TAB 0: CHANGE PASSWORD */}
        {activeTab === 0 && (
          <Box p={3.5} component="form" onSubmit={handleChangePassword}>
            <Box mb={3}>
              <Typography fontSize={18} fontWeight={700} color={THEME.textPrimary}>
                Account Security & Password Management
              </Typography>
              <Typography fontSize={13} color={THEME.textSecondary} mt={0.5}>
                Ensure your account is using a strong password. You will need your current password to make changes.
              </Typography>
            </Box>

            {passwordError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {passwordError}
              </Alert>
            )}

            <Grid container spacing={3} sx={{ maxWidth: 640 }}>
              {/* Current Password */}
              <Grid item xs={12}>
                <CustomInput
                  fullWidth
                  required
                  type={showCurrentPassword ? "text" : "password"}
                  label="Current Password"
                  value={currentPassword}
                  onChange={(e: any) => setCurrentPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon sx={{ color: THEME.textSecondary }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* New Password */}
              <Grid item xs={12} sm={6}>
                <CustomInput
                  fullWidth
                  required
                  type={showNewPassword ? "text" : "password"}
                  label="New Password"
                  value={newPassword}
                  onChange={(e: any) => setNewPassword(e.target.value)}
                  helperText="Minimum 6 characters"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: THEME.textSecondary }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                          {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Confirm New Password */}
              <Grid item xs={12} sm={6}>
                <CustomInput
                  fullWidth
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e: any) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: THEME.textSecondary }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <CustomButton
                  type="submit"
                  variant="contained"
                  disabled={submittingPassword}
                  startIcon={<SaveIcon />}
                  sx={{
                    bgcolor: THEME.primary,
                    px: 4,
                    py: 1.2,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {submittingPassword ? "Updating Password..." : "Update Password"}
                </CustomButton>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 1: QUOTATION VALIDITY RULES */}
        {activeTab === 1 && (
          <Box p={3.5}>
            <Box mb={3}>
              <Typography fontSize={18} fontWeight={700} color={THEME.textPrimary}>
                Quotation Validity Duration & Expiration Rules
              </Typography>
              <Typography fontSize={13} color={THEME.textSecondary} mt={0.5}>
                Set the default expiration period for generated quotations. This date is automatically applied to Quote IDs and can also be overridden per quotation.
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ maxWidth: 640 }}>
              <Grid item xs={12}>
                <CustomInput
                  fullWidth
                  select
                  label="Default Quotation Validity Period"
                  value={validityDays}
                  onChange={(e: any) => setValidityDays(e.target.value)}
                  helperText="Generated quotations will expire after this number of days."
                >
                  <MenuItem value="7">7 Days (1 Week)</MenuItem>
                  <MenuItem value="14">14 Days (2 Weeks - Recommended)</MenuItem>
                  <MenuItem value="30">30 Days (1 Month)</MenuItem>
                  <MenuItem value="60">60 Days (2 Months)</MenuItem>
                  <MenuItem value="90">90 Days (3 Months)</MenuItem>
                </CustomInput>
              </Grid>

              <Grid item xs={12}>
                <CustomButton
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveValiditySettings}
                  sx={{
                    bgcolor: THEME.primary,
                    px: 4,
                    py: 1.2,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  Save Validity Setting
                </CustomButton>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 2: DARK / LIGHT MODE THEME SETTINGS */}
        {activeTab === 2 && (
          <Box p={3.5}>
            <Box mb={3}>
              <Typography fontSize={18} fontWeight={700} color={THEME.textPrimary}>
                Appearance & Theme Mode
              </Typography>
              <Typography fontSize={13} color={THEME.textSecondary} mt={0.5}>
                Customize the application theme interface. Select between Light Mode and Dark Mode.
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ maxWidth: 800 }}>
              <Grid item xs={12} sm={6}>
                <Card
                  elevation={0}
                  onClick={() => setMode("light")}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `2px solid ${mode === "light" ? THEME.primary : THEME.border}`,
                    bgcolor: THEME.white,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": { borderColor: THEME.primary },
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <LightModeIcon sx={{ color: THEME.amber, fontSize: 28 }} />
                      <Typography fontSize={16} fontWeight={700} color={THEME.slate900}>
                        Light Mode
                      </Typography>
                    </Box>
                    <Chip
                      label={mode === "light" ? "Active" : "Select"}
                      size="small"
                      color={mode === "light" ? "primary" : "default"}
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                  <Typography fontSize={12} color={THEME.slate500} lineHeight={1.5}>
                    Clean high-contrast bright theme tailored for daylight usage and clear documentation readability.
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card
                  elevation={0}
                  onClick={() => setMode("dark")}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `2px solid ${mode === "dark" ? THEME.primary : THEME.border}`,
                    bgcolor: THEME.slate900,
                    color: THEME.white,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": { borderColor: THEME.primary },
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <DarkModeIcon sx={{ color: THEME.sky, fontSize: 28 }} />
                      <Typography fontSize={16} fontWeight={700} color={THEME.white}>
                        Dark Mode
                      </Typography>
                    </Box>
                    <Chip
                      label={mode === "dark" ? "Active" : "Select"}
                      size="small"
                      color={mode === "dark" ? "primary" : "default"}
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                  <Typography fontSize={12} color={THEME.slate400} lineHeight={1.5}>
                    Sleek slate dark theme optimized for low-light environments and reduced eye strain.
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 3: IMPLEMENTABLE FEATURES ROADMAP */}
        {activeTab === 3 && (
          <Box p={3.5}>
            <Box mb={3}>
              <Typography fontSize={18} fontWeight={700} color={THEME.textPrimary}>
                System Features & Capabilities Roadmap
              </Typography>
              <Typography fontSize={13} color={THEME.textSecondary} mt={0.5}>
                Comprehensive list of advanced features that can be implemented in future platform updates.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    border: `1px solid ${THEME.border}`,
                    bgcolor: THEME.white,
                    height: "100%",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <ShieldIcon sx={{ color: THEME.primary, fontSize: 24 }} />
                    <Typography fontSize={16} fontWeight={700} color={THEME.textPrimary}>
                      1. Security & Access Governance
                    </Typography>
                  </Box>
                  <List dense disablePadding>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon sx={{ color: THEME.success, fontSize: 18 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Two-Factor Authentication (2FA)"
                        secondary="TOTP authenticator app support (Google Authenticator / Authy) for admin logins."
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon sx={{ color: THEME.success, fontSize: 18 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Session Auto-Lock & Inactivity Timeout"
                        secondary="Configurable auto-logout after X minutes of inactivity for security compliance."
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon sx={{ color: THEME.success, fontSize: 18 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="User Audit Logging & Activity Trace"
                        secondary="Real-time audit trails recording IP addresses, login timestamps, and record edits."
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    border: `1px solid ${THEME.border}`,
                    bgcolor: THEME.white,
                    height: "100%",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <ShoppingCartIcon sx={{ color: THEME.primary, fontSize: 24 }} />
                    <Typography fontSize={16} fontWeight={700} color={THEME.textPrimary}>
                      2. Cart & Inquiry Quotation Engine
                    </Typography>
                  </Box>
                  <List dense disablePadding>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon sx={{ color: THEME.success, fontSize: 18 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Product Cart & Formal RFQ Builder"
                        secondary="Cart system enabling client users to aggregate trainer equipment and submit RFQs."
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon sx={{ color: THEME.success, fontSize: 18 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Instant Quotation PDF Generator"
                        secondary="Generate automated formal proforma invoices & quotation PDFs with tax breakdowns."
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Snackbar Alert */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toastSeverity} onClose={() => setToastOpen(false)} sx={{ borderRadius: 2 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
