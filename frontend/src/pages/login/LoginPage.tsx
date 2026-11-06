import React, { useState } from "react";
import {
  THEME,
  COLOR_SLATE_900,
  COLOR_DARK_HERO_BG,
  COLOR_INDIGO_950,
  COLOR_SKY_400,
  COLOR_INDIGO_400,
  COLOR_GREEN_500,
  COLOR_ROSE_500,
  COLOR_BLUE_300,
  COLOR_PURPLE_100,
  COLOR_BLUE_500
} from "@/assets/theme";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { CustomInput } from "@/components/Inputs/CustomInput";
import { AuthService } from "@/services/auth.service";
import { Alert, Box, IconButton, InputAdornment, Paper, Snackbar, Typography, Tab, Tabs, Chip } from "@mui/material";
import { Visibility, VisibilityOff, Security as SecurityIcon, Description as QuoteIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");

  // Login Form State
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Register Form State
  const [regFullName, setRegFullName] = useState<string>("");
  const [regUsername, setRegUsername] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("");
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>("");
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setSnackbar({ open: true, message: "Please enter both username and password.", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      await AuthService.login({ username, password });
      setSnackbar({ open: true, message: "Welcome back! Login successful.", severity: "success" });
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Login failed. Please check your credentials.";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
      setSnackbar({ open: true, message: "Please fill in all required fields (username, email, password).", severity: "error" });
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setSnackbar({ open: true, message: "Passwords do not match.", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      await AuthService.register({
        username: regUsername,
        email: regEmail,
        password: regPassword,
        full_name: regFullName || undefined,
      });
      setSnackbar({ open: true, message: "Account created successfully! Redirecting to dashboard...", severity: "success" });
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Registration failed. Please try again.";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: COLOR_SLATE_900, color: THEME.textPrimary }}>
      {/* Keyframe Animation Styles */}
      <style>{`
        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(40px, -50px) scale(1.2); opacity: 0.55; }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.25; }
          50% { transform: translate(-45px, 35px) scale(1.25); opacity: 0.45; }
        }
        @keyframes floatOrb3 {
          0%, 100% { transform: translate(0, 0) scale(0.9); opacity: 0.2; }
          50% { transform: translate(30px, 40px) scale(1.15); opacity: 0.4; }
        }
        @keyframes rotateRing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes gridWave {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes floatParticle {
          0% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
          50% { opacity: 0.8; transform: translateY(-30px) scale(1.2); }
          100% { transform: translateY(-60px) scale(0.8); opacity: 0.2; }
        }
        @keyframes floatCard1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatCard2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes floatCard3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.5; }
        }
        @keyframes borderShimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.9; }
        }
        @keyframes shootingStar {
          0% { transform: translateX(-100px) translateY(-100px) rotate(-45deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(800px) translateY(800px) rotate(-45deg); opacity: 0; }
        }
        @keyframes textGradientShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes logoGlow {
          0%, 100% { boxShadow: "0 0 15px rgba(37,99,235,0.4)"; transform: scale(1); }
          50% { boxShadow: "0 0 30px rgba(37,99,235,0.8)"; transform: scale(1.05); }
        }
        @keyframes formSlideUp {
          0% { opacity: 0; transform: translateY(20px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0px) scale(1); }
        }
      `}</style>

      {/* Left Animated Hero Banner */}
      <Box sx={{ width: { xs: "0%", md: "50%" }, display: { xs: "none", md: "flex" }, flexDirection: "column", justifyContent: "space-between", p: 6, position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${COLOR_DARK_HERO_BG} 0%, ${COLOR_SLATE_900} 40%, ${COLOR_INDIGO_950} 100%)` }}>
        {/* Tech Grid Pattern Background Overlay */}
        <Box sx={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.3, animation: "gridWave 20s linear infinite", pointerEvents: "none" }} />

        {/* Animated Background Spheres & Glowing Orbs */}
        <Box sx={{ position: "absolute", top: -100, right: -100, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.45) 0%, rgba(0,0,0,0) 70%)", filter: "blur(60px)", animation: "floatOrb1 10s ease-in-out infinite" }} />
        <Box sx={{ position: "absolute", bottom: -120, left: -80, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.4) 0%, rgba(0,0,0,0) 70%)", filter: "blur(60px)", animation: "floatOrb2 12s ease-in-out infinite" }} />
        <Box sx={{ position: "absolute", top: "35%", left: "20%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(0,0,0,0) 70%)", filter: "blur(55px)", animation: "floatOrb3 14s ease-in-out infinite" }} />

        {/* Rotating Concentric Tech Accent Rings */}
        <Box sx={{ position: "absolute", top: "20%", right: "-10%", width: 420, height: 420, borderRadius: "50%", border: "1px dashed rgba(255, 255, 255, 0.08)", animation: "rotateRing 40s linear infinite", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", top: "15%", right: "-15%", width: 520, height: 520, borderRadius: "50%", border: "1px solid rgba(255, 255, 255, 0.04)", animation: "rotateRing 60s linear infinite reverse", pointerEvents: "none" }} />

        {/* Diagonal Laser / Shooting Star Light Streaks */}
        <Box sx={{ position: "absolute", top: "10%", left: "20%", width: 180, height: 2, background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.9), transparent)", animation: "shootingStar 7s linear infinite", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", top: "40%", left: "5%", width: 220, height: 2, background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.9), transparent)", animation: "shootingStar 10s linear infinite 3s", pointerEvents: "none" }} />

        {/* Floating Glowing Particle Nodes */}
        <Box sx={{ position: "absolute", top: "70%", left: "15%", width: 6, height: 6, borderRadius: "50%", bgcolor: COLOR_SKY_400, boxShadow: `0 0 10px ${COLOR_SKY_400}`, animation: "floatParticle 6s ease-in-out infinite" }} />
        <Box sx={{ position: "absolute", top: "30%", left: "70%", width: 8, height: 8, borderRadius: "50%", bgcolor: COLOR_INDIGO_400, boxShadow: `0 0 12px ${COLOR_INDIGO_400}`, animation: "floatParticle 8s ease-in-out infinite 2s" }} />
        <Box sx={{ position: "absolute", top: "50%", left: "45%", width: 5, height: 5, borderRadius: "50%", bgcolor: COLOR_GREEN_500, boxShadow: `0 0 8px ${COLOR_GREEN_500}`, animation: "floatParticle 7s ease-in-out infinite 1s" }} />
        <Box sx={{ position: "absolute", top: "80%", left: "65%", width: 7, height: 7, borderRadius: "50%", bgcolor: COLOR_ROSE_500, boxShadow: `0 0 10px ${COLOR_ROSE_500}`, animation: "floatParticle 9s ease-in-out infinite 3s" }} />

        {/* Vertical Shimmer Divider Line */}
        <Box sx={{ position: "absolute", top: 0, right: 0, width: 2, height: "100%", background: "linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.8) 50%, transparent 100%)", animation: "borderShimmer 3s ease-in-out infinite" }} />

        {/* Top Header & Status Chip */}
        <Box display="flex" alignItems="center" justifyContent="space-between" zIndex={1}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: THEME.primary, display: "flex", alignItems: "center", justifyContent: "center", color: THEME.white, fontWeight: 900, fontSize: 22, boxShadow: "0 8px 20px rgba(37,99,235,0.6)", animation: "logoGlow 3s ease-in-out infinite" }}> K </Box>
            <Typography fontSize={20} fontWeight={800} color={THEME.white} letterSpacing="-0.5px"> KITRIVO EQUIPMENT </Typography>
          </Box>

          <Chip icon={<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: COLOR_GREEN_500, animation: "pulseDot 2s infinite" }} />} label="SYSTEM ONLINE v2.4" size="small" sx={{ bgcolor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.15)", fontSize: 11, fontWeight: 700, px: 1 }} />
        </Box>

        {/* Hero Body Content & Floating Animated Cards */}
        <Box my="auto" zIndex={1} maxWidth={500}>
          <Typography fontSize={34} fontWeight={800} lineHeight={1.2} mb={2} letterSpacing="-0.8px" sx={{ background: `linear-gradient(90deg, ${THEME.white} 0%, ${COLOR_BLUE_300} 50%, ${COLOR_PURPLE_100} 100%)`, backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "textGradientShimmer 6s ease infinite" }}> Enterprise Equipment & Soft-Copy Quotation System </Typography>
          <Typography fontSize={15} color="rgba(255,255,255,0.7)" lineHeight={1.6} mb={4}> Manage technical lab kits, generate commercial PDF soft-copy quotes, and govern role permissions efficiently. </Typography>

          {/* Floating Animated Card 1 */}
          <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2.5, bgcolor: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.12)", animation: "floatCard1 4s ease-in-out infinite", boxShadow: "0 10px 25px rgba(0,0,0,0.3)", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px) scale(1.02)", bgcolor: "rgba(255,255,255,0.1)" } }}>
            <Box display="flex" alignItems="center" gap={1.8}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: "rgba(37,99,235,0.2)", color: COLOR_BLUE_500, display: "flex", alignItems: "center", justifyContent: "center" }}> <QuoteIcon fontSize="small" /> </Box>
              <Box>
                <Typography fontSize={13} fontWeight={700} color={THEME.white}> Real-time Quotation Builder & Soft-Copy PDF </Typography>
                <Typography fontSize={11} color="rgba(255,255,255,0.65)"> Automated 18% GST calculation, discount overrides & instant export </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Floating Animated Card 2 */}
          <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2.5, bgcolor: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.12)", animation: "floatCard2 5s ease-in-out infinite 0.5s", boxShadow: "0 10px 25px rgba(0,0,0,0.3)", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px) scale(1.02)", bgcolor: "rgba(255,255,255,0.1)" } }}>
            <Box display="flex" alignItems="center" gap={1.8}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: "rgba(34,197,94,0.2)", color: COLOR_GREEN_500, display: "flex", alignItems: "center", justifyContent: "center" }}> <SecurityIcon fontSize="small" /> </Box>
              <Box>
                <Typography fontSize={13} fontWeight={700} color={THEME.white}> Granular Role & Permission Control </Typography>
                <Typography fontSize={11} color="rgba(255,255,255,0.65)"> Secure JWT authentication with 401 automatic token refresh </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Floating Animated Card 3 */}
          <Paper elevation={0} sx={{ p: 1.8, borderRadius: 2.5, bgcolor: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", animation: "floatCard3 4.5s ease-in-out infinite 1s", boxShadow: "0 10px 25px rgba(0,0,0,0.3)", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px) scale(1.02)", bgcolor: "rgba(255,255,255,0.1)" } }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography fontSize={12} fontWeight={700} color={COLOR_SKY_400}> ⚡ High Performance Architecture </Typography>
              <Typography fontSize={11} color="rgba(255,255,255,0.6)"> Fast 100ms API response time </Typography>
            </Box>
          </Paper>
        </Box>

        <Typography fontSize={12} color="rgba(255,255,255,0.4)" zIndex={1}> © 2026 Kitrivo Equipment Systems. All rights reserved. </Typography>
      </Box>

      {/* Right Form Card Section */}
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 3, bgcolor: THEME.white, position: "relative", overflow: "hidden" }}>
        {/* Soft Ambient Floating Glow Behind Form */}
        <Box sx={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, rgba(0,0,0,0) 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.08) 0%, rgba(0,0,0,0) 70%)", filter: "blur(40px)", pointerEvents: "none" }} />

        <Paper elevation={0} key={mode} sx={{ width: "100%", maxWidth: 440, p: 4, borderRadius: 3, border: `1px solid ${THEME.border}`, boxShadow: "0 12px 35px rgba(0,0,0,0.08)", animation: "formSlideUp 0.4s ease-out forwards" }}>
          {/* Header & Mode Tabs */}
          <Box textAlign="center" mb={3}>
            <Typography fontSize={24} fontWeight={800} color={THEME.textPrimary} letterSpacing="-0.5px"> {mode === "login" ? "Welcome Back" : "Create Account"} </Typography>
            <Typography fontSize={13} color={THEME.textSecondary} mt={0.5}> {mode === "login" ? "Sign in to access your Kitrivo account" : "Register a new user account below"} </Typography>

            <Tabs value={mode} onChange={(_, val) => setMode(val)} variant="fullWidth" sx={{ mt: 2.5, minHeight: 40, borderBottom: `1px solid ${THEME.border}`, "& .MuiTab-root": { textTransform: "none", fontWeight: 700, fontSize: 14 } }}>
              <Tab value="login" label="Sign In" />
              <Tab value="register" label="Register" />
            </Tabs>
          </Box>

          {/* Mode 1: LOGIN FORM */}
          {mode === "login" ? (
            <Box component="form" onSubmit={handleLogin} display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography fontSize="13px" fontWeight={600} mb={0.5} color={THEME.textPrimary}> Username or Email </Typography>
                <CustomInput placeholder="Enter username or email" value={username} onChange={(e: any) => setUsername(e.target.value)} autoFocus />
              </Box>

              <Box>
                <Typography fontSize="13px" fontWeight={600} mb={0.5} color={THEME.textPrimary}> Password </Typography>
                <CustomInput placeholder="Enter password" type={showPassword ? "text" : "password"} value={password} onChange={(e: any) => setPassword(e.target.value)} InputProps={{ endAdornment: (<InputAdornment position="end"> <IconButton size="small" onClick={() => setShowPassword(!showPassword)}> {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />} </IconButton> </InputAdornment>) }} />
              </Box>

              <Box mt={1}>
                <CustomButton type="submit" text={loading ? "Signing in..." : "Sign In"} disabled={loading} fullWidth height="42px" bgc={THEME.primary} color={THEME.white} font={14} sx={{ fontWeight: 700 }} />
              </Box>

              <Box textAlign="center" mt={1}>
                <Typography fontSize={13} color={THEME.textSecondary}> Don't have an account? <span style={{ color: THEME.primary, fontWeight: 700, cursor: "pointer" }} onClick={() => setMode("register")}> Register Now </span> </Typography>
              </Box>
            </Box>
          ) : (
            /* Mode 2: REGISTER FORM */
            <Box component="form" onSubmit={handleRegister} display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography fontSize="13px" fontWeight={600} mb={0.5} color={THEME.textPrimary}> Full Name (Optional) </Typography>
                <CustomInput placeholder="e.g. John Doe" value={regFullName} onChange={(e: any) => setRegFullName(e.target.value)} autoFocus />
              </Box>

              <Box>
                <Typography fontSize="13px" fontWeight={600} mb={0.5} color={THEME.textPrimary}> Username </Typography>
                <CustomInput placeholder="e.g. johndoe" value={regUsername} onChange={(e: any) => setRegUsername(e.target.value)} required />
              </Box>

              <Box>
                <Typography fontSize="13px" fontWeight={600} mb={0.5} color={THEME.textPrimary}> Email Address </Typography>
                <CustomInput placeholder="e.g. john@example.com" type="email" value={regEmail} onChange={(e: any) => setRegEmail(e.target.value)} required />
              </Box>

              <Box>
                <Typography fontSize="13px" fontWeight={600} mb={0.5} color={THEME.textPrimary}> Password </Typography>
                <CustomInput placeholder="Create password" type={showRegPassword ? "text" : "password"} value={regPassword} onChange={(e: any) => setRegPassword(e.target.value)} required InputProps={{ endAdornment: (<InputAdornment position="end"> <IconButton size="small" onClick={() => setShowRegPassword(!showRegPassword)}> {showRegPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />} </IconButton> </InputAdornment>) }} />
              </Box>

              <Box>
                <Typography fontSize="13px" fontWeight={600} mb={0.5} color={THEME.textPrimary}> Confirm Password </Typography>
                <CustomInput placeholder="Re-enter password" type={showRegConfirmPassword ? "text" : "password"} value={regConfirmPassword} onChange={(e: any) => setRegConfirmPassword(e.target.value)} required InputProps={{ endAdornment: (<InputAdornment position="end"> <IconButton size="small" onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}> {showRegConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />} </IconButton> </InputAdornment>) }} />
              </Box>

              <Box mt={1}>
                <CustomButton type="submit" text={loading ? "Creating Account..." : "Create Account"} disabled={loading} fullWidth height="42px" bgc={THEME.primary} color={THEME.white} font={14} sx={{ fontWeight: 700 }} />
              </Box>

              <Box textAlign="center" mt={1}>
                <Typography fontSize={13} color={THEME.textSecondary}> Already have an account? <span style={{ color: THEME.primary, fontWeight: 700, cursor: "pointer" }} onClick={() => setMode("login")}> Sign In </span> </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}> {snackbar.message} </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;
