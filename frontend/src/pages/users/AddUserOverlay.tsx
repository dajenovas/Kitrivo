import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  Badge,
} from "@mui/material";
import { Close as CloseIcon, PersonAdd as PersonAddIcon, Edit as EditIcon, PhotoCamera as PhotoCameraIcon } from "@mui/icons-material";
import { THEME, FONTSIZE, FONTWEIGHT } from "@/assets/theme";
import { CustomInput } from "@/components/Inputs/CustomInput";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { CustomSelect } from "@/components/Inputs/CustomSelect";
import { useRoleStore } from "@/store/useRoleStore";
import { UserServices, type CreateUserPayload, type UpdateUserPayload } from "@/services/users.services";
import type { UserProfile } from "@/models/auth.models";

interface AddUserOverlayProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  userToEdit?: UserProfile | null;
}

const initialFormState: CreateUserPayload = {
  email: "",
  username: "",
  employee_id: "",
  full_name: "",
  profile_picture: "",
  is_active: true,
  password: "",
  role_ids: [],
};

export const AddUserOverlay: React.FC<AddUserOverlayProps> = ({
  open,
  onClose,
  onSuccess,
  userToEdit,
}) => {
  const [formData, setFormData] = useState<CreateUserPayload>(initialFormState);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingUser, setFetchingUser] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isEditMode = Boolean(userToEdit);

  const {
    roles,
    isLoading: isRolesLoading,
    isFetchingMore: isRolesFetchingMore,
    hasMore: hasMoreRoles,
    fetchRoles,
    fetchMoreRoles,
  } = useRoleStore();

  useEffect(() => {
    if (open) {
      if (roles.length === 0) {
        fetchRoles();
      }

      if (userToEdit) {
        setFormData({
          email: userToEdit.email || "",
          username: userToEdit.username || "",
          employee_id: userToEdit.employee_id || "",
          full_name: userToEdit.full_name || "",
          profile_picture: userToEdit.profile_picture || "",
          is_active: userToEdit.is_active ?? true,
          password: "",
          role_ids: userToEdit.roles ? userToEdit.roles.map((r) => r.id) : [],
        });

        const loadUserDetails = async () => {
          try {
            setFetchingUser(true);
            const response = await UserServices.getUserById(userToEdit.id);
            if (response.success && response.data) {
              const u = response.data;
              setFormData({
                email: u.email || "",
                username: u.username || "",
                employee_id: u.employee_id || "",
                full_name: u.full_name || "",
                profile_picture: u.profile_picture || "",
                is_active: u.is_active ?? true,
                password: "",
                role_ids: u.roles ? u.roles.map((r) => r.id) : [],
              });
            }
          } catch (err: any) {
            console.error("Error fetching user details:", err);
          } finally {
            setFetchingUser(false);
          }
        };

        loadUserDetails();
      } else {
        setFormData(initialFormState);
      }
      setError(null);
      setFieldErrors({});
    }
  }, [open, userToEdit, fetchRoles, roles.length]);

  const roleOptions = useMemo(
    () =>
      roles.map((r) => ({
        id: r.id,
        label: r.name,
        code: r.code,
        subLabel: r.description,
      })),
    [roles]
  );

  const handleInputChange = (field: keyof CreateUserPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (error) setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange("profile_picture", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Invalid email format";
    }

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    }

    if (!isEditMode) {
      if (!formData.password) {
        errors.password = "Password is required";
      } else if (formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
    } else {
      if (formData.password && formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setError(null);

      if (isEditMode && userToEdit) {
        const payload: UpdateUserPayload = {
          email: formData.email.trim(),
          username: formData.username.trim(),
          employee_id: formData.employee_id.trim() || undefined as any,
          full_name: formData.full_name.trim() || undefined as any,
          profile_picture: formData.profile_picture || undefined,
          is_active: formData.is_active,
          role_ids: formData.role_ids,
        };
        if (formData.password) {
          payload.password = formData.password;
        }

        const response = await UserServices.updateUser(userToEdit.id, payload);

        if (response.success) {
          handleReset();
          onSuccess(response.message || "User updated successfully!");
          onClose();
        } else {
          setError(response.message || "Failed to update user");
        }
      } else {
        const payload: CreateUserPayload = {
          email: formData.email.trim(),
          username: formData.username.trim(),
          employee_id: formData.employee_id.trim() || undefined as any,
          full_name: formData.full_name.trim() || undefined as any,
          profile_picture: formData.profile_picture || undefined,
          is_active: formData.is_active,
          password: formData.password,
          role_ids: formData.role_ids,
        };

        const response = await UserServices.createUser(payload);

        if (response.success) {
          handleReset();
          onSuccess(response.message || "User created successfully!");
          onClose();
        } else {
          setError(response.message || "Failed to create user");
        }
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        `An unexpected error occurred while ${isEditMode ? "updating" : "creating"} user.`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setError(null);
    setFieldErrors({});
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  const initials = (formData.full_name || formData.username || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={open} onClose={handleModalClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1, border: `1px solid ${THEME.border}`, boxShadow: `0 20px 40px ${THEME.slate900}26` } }}>
      {/* Dialog Header */}
      <DialogTitle sx={{ display: "flex", justify: "space-between", alignItems: "center", pb: 1 }}>
        <Box width={'100%'} display="flex" alignItems="center" justifyContent={'space-between'} gap={1.5}>
          <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: `${THEME.primary}15`, display: "flex", alignItems: "center", justifyContent: "center", color: THEME.primary }}>
            {isEditMode ? <EditIcon fontSize="small" /> : <PersonAddIcon fontSize="small" />}
          </Box>
          <Box flex={1}>
            <Typography fontSize={FONTSIZE.title} fontWeight={FONTWEIGHT.title} color={THEME.textPrimary}>
              {isEditMode ? "Edit User" : "Add New User"}
            </Typography>
          </Box>
          <IconButton onClick={handleModalClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ borderTop: `1px solid ${THEME.border}`, py: 2.5, position: "relative" }}>
        {fetchingUser && (
          <Box display="flex" justifyContent="center" alignItems="center" py={1.5} mb={1.5} sx={{ bgcolor: `${THEME.primary}08`, borderRadius: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1.5 }} />
            <Typography fontSize={FONTSIZE.small} color="text.secondary">Fetching latest user details...</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}> {error} </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            {/* Avatar Upload Banner */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2} p={1.5} borderRadius={2} bgcolor={THEME.background} border={`1px solid ${THEME.border}`}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    <IconButton
                      size="small"
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        bgcolor: THEME.primary,
                        color: THEME.white,
                        border: `2px solid ${THEME.white}`,
                        "&:hover": { bgcolor: THEME.primaryDark },
                        width: 26,
                        height: 26,
                      }}
                    >
                      <PhotoCameraIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  }
                >
                  <Avatar
                    src={formData.profile_picture || undefined}
                    sx={{ width: 56, height: 56, bgcolor: THEME.primary, fontSize: "20px", fontWeight: 700 }}
                  >
                    {!formData.profile_picture && initials}
                  </Avatar>
                </Badge>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <Box>
                  <Typography fontSize={FONTSIZE.small} fontWeight={600} color={THEME.textPrimary}>
                    Profile Avatar Picture
                  </Typography>
                  <Typography fontSize={FONTSIZE.caption} color={THEME.textSecondary}>
                    Click the camera icon to select a profile picture
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}> Email * </Typography>
              <CustomInput placeholder="user@example.com" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} borderA={fieldErrors.email ? `1px solid ${THEME.error}` : undefined} />
              {fieldErrors.email && (
                <Typography fontSize="12px" color={THEME.error} mt={0.5}> {fieldErrors.email} </Typography>
              )}
            </Grid>

            {/* Username */}
            <Grid item xs={12} sm={6}>
              <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}> Username * </Typography>
              <CustomInput placeholder="john_doe" value={formData.username} onChange={(e) => handleInputChange("username", e.target.value)} borderA={fieldErrors.username ? `1px solid ${THEME.error}` : undefined} />
              {fieldErrors.username && (
                <Typography fontSize="12px" color={THEME.error} mt={0.5}> {fieldErrors.username} </Typography>
              )}
            </Grid>

            {/* Employee ID */}
            <Grid item xs={12} sm={6}>
              <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}> Employee ID </Typography>
              <CustomInput placeholder="EMP-001" value={formData.employee_id} onChange={(e) => handleInputChange("employee_id", e.target.value)} />
            </Grid>

            {/* Full Name */}
            <Grid item xs={12} sm={6}>
              <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}> Full Name </Typography>
              <CustomInput placeholder="John Doe" value={formData.full_name} onChange={(e) => handleInputChange("full_name", e.target.value)} />
            </Grid>

            {/* Password */}
            <Grid item xs={12}>
              <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}>
                {isEditMode ? "Password (Leave blank to keep unchanged)" : "Password *"}
              </Typography>
              <CustomInput
                placeholder={isEditMode ? "Enter new password if changing" : "Enter account password"}
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                borderA={fieldErrors.password ? `1px solid ${THEME.error}` : undefined}
              />
              {fieldErrors.password && (
                <Typography fontSize="12px" color={THEME.error} mt={0.5}> {fieldErrors.password} </Typography>
              )}
            </Grid>

            {/* Roles Dropdown with Search & Infinite Scroll */}
            <Grid item xs={12}>
              <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}>
                User Roles
              </Typography>
              <CustomSelect
                label=""
                isMultiple
                enableSearch
                value={formData.role_ids}
                options={roleOptions}
                onChange={(val) => handleInputChange("role_ids", val)}
                onScrollEnd={fetchMoreRoles}
                hasMore={hasMoreRoles}
                isLoading={isRolesLoading}
                isFetchingMore={isRolesFetchingMore}
              />
            </Grid>

            {/* Active Status */}
            <Grid item xs={12}>
              <Box sx={{ width: '100%', display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, borderRadius: 2, bgcolor: THEME.background, border: `1px solid ${THEME.border}`, }}>
                <Box>
                  <Typography fontSize={FONTSIZE.small} fontWeight={600} color={THEME.textPrimary}>
                    Account Status
                  </Typography>
                  <Typography fontSize={FONTSIZE.caption} color={THEME.textSecondary}>
                    Active users can log into system resources
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch checked={formData.is_active} onChange={(e) => handleInputChange("is_active", e.target.checked)} color="primary" />
                  }
                  label={formData.is_active ? "Active" : "Inactive"}
                  labelPlacement="start"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1.5, gap: 1 }}>
        <CustomButton text="Cancel" width={110} height="40px" bgc={THEME.transparent} color={THEME.textSecondary} border={`1px solid ${THEME.border}`} hov={`${THEME.border}40`} onClick={handleModalClose} isDisabled={loading} />
        <CustomButton
          text={loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update User" : "Create User")}
          width={130}
          height="40px"
          bgc={THEME.primary}
          color={THEME.white}
          hov={THEME.primaryDark}
          onClick={handleSubmit}
          isDisabled={loading}
          Sicon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        />
      </DialogActions>
    </Dialog>
  );
};
