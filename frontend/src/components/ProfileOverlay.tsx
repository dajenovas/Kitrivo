import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, IconButton, Avatar, Chip, Alert, CircularProgress, Divider, Grid, Badge } from "@mui/material";
import { Close as CloseIcon, PhotoCamera as PhotoCameraIcon, Logout as LogoutIcon, Person as PersonIcon, Security as SecurityIcon, VpnKey as VpnKeyIcon, Email as EmailIcon, Badge as BadgeIcon, CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { THEME, FONTSIZE, FONTWEIGHT } from "@/assets/theme";
import { CustomInput } from "@/components/Inputs/CustomInput";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthService } from "@/services/auth.service";
import { UserServices } from "@/services/users.services";
import type { ProfileOverlayProps } from "@/types/common.types";

export const ProfileOverlay: React.FC<ProfileOverlayProps> = ({ open, onClose }) => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const fetchMe = useAuthStore((state) => state.fetchMe);

    const [fullName, setFullName] = useState<string>("");
    const [profilePic, setProfilePic] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (open && user) {
            setFullName(user.full_name || ""); setProfilePic(user.profile_picture || "");
            setError(null); setSuccessMsg(null);
        }
    }, [open, user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("Image file size should be less than 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setProfilePic(base64String);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccessMsg(null);

            const response = await UserServices.updateMyProfile({ full_name: fullName.trim() || undefined, profile_picture: profilePic || undefined });

            if (response.success) {
                setSuccessMsg("Profile updated successfully!");
                await fetchMe();
            } else {
                setError(response.message || "Failed to update profile.");
            }
        } catch (err: any) {
            const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || "Failed to update profile.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutClick = async () => {
        onClose();
        await AuthService.logout();
        navigate("/login", { replace: true });
    };

    if (!user) return null;

    const initials = (user.full_name || user.username || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1, maxHeight: "90vh", border: `1px solid ${THEME.border}`, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)" } }}>
            {/* Dialog Header */}
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: `${THEME.primary}15`, display: "flex", alignItems: "center", justifyContent: "center", color: THEME.primary }}> <PersonIcon fontSize="small" /> </Box>
                        <Box>
                            <Typography fontSize={FONTSIZE.title} fontWeight={FONTWEIGHT.title} color={THEME.textPrimary}> My Account Profile </Typography>
                            <Typography fontSize={FONTSIZE.caption} color={THEME.textSecondary}> Personal information, assigned roles, and permissions </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={onClose} size="small"> <CloseIcon fontSize="small" /> </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ borderTop: `1px solid ${THEME.border}`, py: 2.5 }}>
                {error && (<Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}> {error} </Alert>)}
                {successMsg && (<Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}> {successMsg} </Alert>)}

                {/* Avatar Banner Section */}
                <Box sx={{ p: 2.5, borderRadius: 2.5, bgcolor: THEME.background, border: `1px solid ${THEME.border}`, display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", gap: 2.5, mb: 3 }}>
                    <Badge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} badgeContent={<IconButton size="small" onClick={() => fileInputRef.current?.click()} sx={{ bgcolor: THEME.primary, color: THEME.white, border: `2px solid ${THEME.white}`, "&:hover": { bgcolor: THEME.primaryDark }, width: 32, height: 32 }}> <PhotoCameraIcon fontSize="inherit" /> </IconButton>}>
                        <Avatar src={profilePic || undefined} sx={{ width: 84, height: 84, bgcolor: THEME.primary, fontSize: "28px", fontWeight: 700, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}> {!profilePic && initials} </Avatar>
                    </Badge>

                    <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />

                    <Box flex={1} textAlign={{ xs: "center", sm: "left" }}>
                        <Typography fontSize={FONTSIZE.title} fontWeight={700} color={THEME.textPrimary}> {user.full_name || user.username} </Typography>
                        <Typography fontSize={FONTSIZE.caption} color={THEME.textSecondary} mb={1}> @{user.username} • {user.email}</Typography>
                        <Box display="flex" gap={1} justifyContent={{ xs: "center", sm: "flex-start" }} flexWrap="wrap">
                            <Chip label={user.is_active ? "Active Account" : "Inactive"} color={user.is_active ? "success" : "default"} size="small" icon={<CheckCircleIcon fontSize="small" />} sx={{ fontWeight: 600 }} />
                            {user.employee_id && (<Chip label={`ID: ${user.employee_id}`} variant="outlined" size="small" sx={{ fontWeight: 600 }} />)}
                        </Box>
                    </Box>
                </Box>

                {/* Profile Fields Section */}
                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} sm={6}>
                        <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}> Full Name </Typography>
                        <CustomInput placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}> Username (Read-only) </Typography>
                        <CustomInput value={user.username} isDisabled />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}> Email Address (Read-only) </Typography>
                        <CustomInput value={user.email} isDisabled sIcon={<EmailIcon fontSize="small" color="action" />} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}> Employee ID (Read-only) </Typography>
                        <CustomInput value={user.employee_id || "N/A"} isDisabled sIcon={<BadgeIcon fontSize="small" color="action" />} />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Roles & Permissions Section */}
                <Box mb={2}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <SecurityIcon fontSize="small" sx={{ color: THEME.primary }} />
                        <Typography fontSize={FONTSIZE.small} fontWeight={600} color={THEME.textPrimary}> Assigned Roles </Typography>
                    </Box>
                    <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                        {user.roles && user.roles.length > 0 ? (
                            user.roles.map((r) => (<Chip key={r.id} label={r.name} color="primary" variant="outlined" sx={{ fontWeight: 600 }} />))
                        ) : (
                            <Typography fontSize={FONTSIZE.caption} color="text.secondary"> No roles assigned </Typography>
                        )}
                    </Box>
                </Box>

                <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <VpnKeyIcon fontSize="small" sx={{ color: THEME.primary }} />
                        <Typography fontSize={FONTSIZE.small} fontWeight={600} color={THEME.textPrimary}>
                            Granted Permission Codes ({user.permission_codes ? user.permission_codes.length : 0})
                        </Typography>
                    </Box>
                    <Box sx={{ maxHeight: 120, overflowY: "auto", p: 1.5, borderRadius: 2, bgcolor: THEME.background, border: `1px solid ${THEME.border}`, display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                        {user.permission_codes && user.permission_codes.length > 0 ? (
                            user.permission_codes.map((code) => (<Chip key={code} label={code} size="small" sx={{ fontSize: "11px", fontWeight: 500, bgcolor: THEME.white }} />))
                        ) : (
                            <Typography fontSize={FONTSIZE.caption} color="text.secondary"> No specific permission codes </Typography>
                        )}
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 1.5, justifyContent: "space-between" }}>
                <CustomButton text="Logout" width={110} height="40px" bgc={`${THEME.error}15`} color={THEME.error} hov={`${THEME.error}30`} onClick={handleLogoutClick} Sicon={<LogoutIcon fontSize="small" />} />

                <Box display="flex" gap={1}>
                    <CustomButton text="Cancel" width={100} height="40px" bgc={THEME.transparent} color={THEME.textSecondary} border={`1px solid ${THEME.border}`} hov={`${THEME.border}40`} onClick={onClose} isDisabled={loading} />
                    <CustomButton text={loading ? "Saving..." : "Save Profile"} width={130} height="40px" bgc={THEME.primary} color={THEME.white} hov={THEME.primaryDark} onClick={handleSaveProfile} isDisabled={loading} Sicon={loading ? <CircularProgress size={16} color="inherit" /> : undefined} />
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default ProfileOverlay;
