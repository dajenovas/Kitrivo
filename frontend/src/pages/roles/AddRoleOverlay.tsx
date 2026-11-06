import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    IconButton,
    Alert,
    CircularProgress,
    Grid,
} from "@mui/material";
import { Close as CloseIcon, Security as SecurityIcon, Edit as EditIcon } from "@mui/icons-material";
import { THEME, FONTSIZE, FONTWEIGHT } from "@/assets/theme";
import { CustomInput } from "@/components/Inputs/CustomInput";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { RoleServices, type CreateRolePayload, type UpdateRolePayload } from "@/services/roles.service";
import type { UserRole } from "@/models/auth.models";

interface AddRoleOverlayProps {
    open: boolean;
    roleToEdit?: UserRole | null;
    onClose: () => void;
    onSuccess: (message?: string) => void;
}

const initialFormState: CreateRolePayload = {
    name: "",
    code: "",
    description: "",
};

export const AddRoleOverlay: React.FC<AddRoleOverlayProps> = ({
    open,
    roleToEdit,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<CreateRolePayload>(initialFormState);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchingRole, setFetchingRole] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const isEditMode = Boolean(roleToEdit);

    useEffect(() => {
        if (open) {
            if (roleToEdit) {
                setFormData({
                    name: roleToEdit.name || "",
                    code: roleToEdit.code || "",
                    description: roleToEdit.description || "",
                });

                const loadRoleDetails = async () => {
                    try {
                        setFetchingRole(true);
                        const response = await RoleServices.getRoleById(roleToEdit.id);
                        if (response.success && response.data) {
                            const r = response.data;
                            setFormData({
                                name: r.name || "",
                                code: r.code || "",
                                description: r.description || "",
                            });
                        }
                    } catch (err: any) {
                        console.error("Failed to load role details:", err);
                    } finally {
                        setFetchingRole(false);
                    }
                };

                loadRoleDetails();
            } else {
                setFormData(initialFormState);
            }
            setError(null);
            setFieldErrors({});
        }
    }, [open, roleToEdit]);

    const handleInputChange = (field: keyof CreateRolePayload, value: string) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value };
            // Auto sluggify code field if user types name in Create Mode
            if (!isEditMode && field === "name" && !prev.code) {
                updated.code = "ROLE_" + value.toUpperCase().replace(/[^A-Z0-9]/g, "_");
            }
            return updated;
        });

        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: "" }));
        }
        if (error) setError(null);
    };

    const validate = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = "Role Name is required";
        }

        if (!formData.code.trim()) {
            errors.code = "Role Code is required";
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

            if (isEditMode && roleToEdit) {
                const payload: UpdateRolePayload = {
                    name: formData.name.trim(),
                    code: formData.code.trim().toUpperCase(),
                    description: formData.description?.trim() || undefined,
                };
                const response = await RoleServices.updateRole(roleToEdit.id, payload);
                if (response.success) {
                    onSuccess(response.message || "Role updated successfully!");
                    onClose();
                } else {
                    setError(response.message || "Failed to update role");
                }
            } else {
                const payload: CreateRolePayload = {
                    name: formData.name.trim(),
                    code: formData.code.trim().toUpperCase(),
                    description: formData.description?.trim() || undefined,
                };
                const response = await RoleServices.createRole(payload);
                if (response.success) {
                    onSuccess(response.message || "Role created successfully!");
                    onClose();
                } else {
                    setError(response.message || "Failed to create role");
                }
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                `An unexpected error occurred while ${isEditMode ? "updating" : "creating"} role.`;
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    p: 1,
                    border: `1px solid ${THEME.border}`,
                    boxShadow: `0 20px 40px ${THEME.slate900}26`,
                },
            }}
        >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                <Box width="100%" display="flex" alignItems="center" justifyContent="space-between" gap={1.5}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: `${THEME.primary}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: THEME.primary,
                        }}
                    >
                        {isEditMode ? <EditIcon fontSize="small" /> : <SecurityIcon fontSize="small" />}
                    </Box>
                    <Box flex={1}>
                        <Typography fontSize={FONTSIZE.title} fontWeight={FONTWEIGHT.title} color={THEME.textPrimary}>
                            {isEditMode ? "Edit Role" : "Add New Role"}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ borderTop: `1px solid ${THEME.border}`, py: 2.5 }}>
                {fetchingRole && (
                    <Box display="flex" justifyContent="center" alignItems="center" py={1.5} mb={1.5} sx={{ bgcolor: `${THEME.primary}08`, borderRadius: 2 }}>
                        <CircularProgress size={20} sx={{ mr: 1.5 }} />
                        <Typography fontSize={FONTSIZE.small} color="text.secondary">
                            Fetching latest role details...
                        </Typography>
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={2}>
                        {/* Role Name */}
                        <Grid item xs={12} sm={6}>
                            <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}>
                                Role Name *
                            </Typography>
                            <CustomInput
                                placeholder="e.g. Manager"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                borderA={fieldErrors.name ? `1px solid ${THEME.error}` : undefined}
                            />
                            {fieldErrors.name && (
                                <Typography fontSize="12px" color={THEME.error} mt={0.5}>
                                    {fieldErrors.name}
                                </Typography>
                            )}
                        </Grid>

                        {/* Role Code */}
                        <Grid item xs={12} sm={6}>
                            <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}>
                                Role Code *
                            </Typography>
                            <CustomInput
                                placeholder="e.g. ROLE_MANAGER"
                                value={formData.code}
                                onChange={(e) => handleInputChange("code", e.target.value)}
                                borderA={fieldErrors.code ? `1px solid ${THEME.error}` : undefined}
                            />
                            {fieldErrors.code && (
                                <Typography fontSize="12px" color={THEME.error} mt={0.5}>
                                    {fieldErrors.code}
                                </Typography>
                            )}
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                            <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}>
                                Description
                            </Typography>
                            <CustomInput
                                placeholder="Describe the access permissions for this role..."
                                value={formData.description || ""}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 1.5, gap: 1 }}>
                <CustomButton
                    text="Cancel"
                    width={110}
                    height="40px"
                    bgc={THEME.transparent}
                    color={THEME.textSecondary}
                    border={`1px solid ${THEME.border}`}
                    hov={`${THEME.border}40`}
                    onClick={onClose}
                    isDisabled={loading}
                />
                <CustomButton
                    text={loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Role" : "Create Role")}
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

export default AddRoleOverlay;
