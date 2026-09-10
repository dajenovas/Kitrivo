import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { Close as CloseIcon, VpnKey as VpnKeyIcon, Edit as EditIcon } from "@mui/icons-material";
import { THEME, FONTSIZE, FONTWEIGHT } from "@/assets/theme";
import { CustomInput } from "@/components/Inputs/CustomInput";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { RenderSvgIcon } from "@/components/RenderSvgIcon";
import { PermissionServices, type CreatePermissionPayload, type UpdatePermissionPayload } from "@/services/permissions.service";
import type { Permission } from "@/models/auth.models";

interface AddPermissionOverlayProps {
    open: boolean;
    permissionToEdit?: Permission | null;
    onClose: () => void;
    onSuccess: (message?: string) => void;
}

const initialFormState: CreatePermissionPayload = {
    name: "",
    code: "",
    module: "General",
    description: "",
    is_menu: false,
    icon: "",
    path: "",
    sort_order: 0,
};

export const AddPermissionOverlay: React.FC<AddPermissionOverlayProps> = ({
    open,
    permissionToEdit,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<CreatePermissionPayload>(initialFormState);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchingPerm, setFetchingPerm] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const isEditMode = Boolean(permissionToEdit);

    useEffect(() => {
        if (open) {
            if (permissionToEdit) {
                setFormData({
                    name: permissionToEdit.name || "",
                    code: permissionToEdit.code || "",
                    module: permissionToEdit.module || "General",
                    description: permissionToEdit.description || "",
                    is_menu: permissionToEdit.is_menu ?? false,
                    icon: permissionToEdit.icon || "",
                    path: permissionToEdit.path || "",
                    sort_order: permissionToEdit.sort_order ?? 0,
                });

                const loadPermissionDetails = async () => {
                    try {
                        setFetchingPerm(true);
                        const response = await PermissionServices.getPermissionById(permissionToEdit.id);
                        if (response.success && response.data) {
                            const p = response.data;
                            setFormData({
                                name: p.name || "",
                                code: p.code || "",
                                module: p.module || "General",
                                description: p.description || "",
                                is_menu: p.is_menu ?? false,
                                icon: p.icon || "",
                                path: p.path || "",
                                sort_order: p.sort_order ?? 0,
                            });
                        }
                    } catch (err: any) {
                        console.error("Failed to load permission details:", err);
                    } finally {
                        setFetchingPerm(false);
                    }
                };

                loadPermissionDetails();
            } else {
                setFormData(initialFormState);
            }
            setError(null);
            setFieldErrors({});
        }
    }, [open, permissionToEdit]);

    const handleInputChange = (field: keyof CreatePermissionPayload, value: any) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value };
            if (!isEditMode && field === "name" && !prev.code) {
                updated.code = value.toUpperCase().replace(/[^A-Z0-9]/g, "_");
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
            errors.name = "Permission Name is required";
        }

        if (!formData.code.trim()) {
            errors.code = "Permission Code is required";
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

            if (isEditMode && permissionToEdit) {
                const payload: UpdatePermissionPayload = {
                    name: formData.name.trim(),
                    code: formData.code.trim().toUpperCase(),
                    module: formData.module?.trim() || undefined,
                    description: formData.description?.trim() || undefined,
                    is_menu: formData.is_menu,
                    icon: formData.icon?.trim() || undefined,
                    path: formData.path?.trim() || undefined,
                    sort_order: Number(formData.sort_order) || 0,
                };
                const response = await PermissionServices.updatePermission(permissionToEdit.id, payload);
                if (response.success) {
                    onSuccess(response.message || "Permission updated successfully!");
                    onClose();
                } else {
                    setError(response.message || "Failed to update permission");
                }
            } else {
                const payload: CreatePermissionPayload = {
                    name: formData.name.trim(),
                    code: formData.code.trim().toUpperCase(),
                    module: formData.module?.trim() || "General",
                    description: formData.description?.trim() || undefined,
                    is_menu: formData.is_menu,
                    icon: formData.icon?.trim() || undefined,
                    path: formData.path?.trim() || undefined,
                    sort_order: Number(formData.sort_order) || 0,
                };
                const response = await PermissionServices.createPermission(payload);
                if (response.success) {
                    onSuccess(response.message || "Permission created successfully!");
                    onClose();
                } else {
                    setError(response.message || "Failed to create permission");
                }
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                `An unexpected error occurred while ${isEditMode ? "updating" : "creating"} permission.`;
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
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
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
                        {isEditMode ? <EditIcon fontSize="small" /> : <VpnKeyIcon fontSize="small" />}
                    </Box>
                    <Box flex={1}>
                        <Typography fontSize={FONTSIZE.title} fontWeight={FONTWEIGHT.title} color={THEME.textPrimary}>
                            {isEditMode ? "Edit Permission" : "Add New Permission"}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ borderTop: `1px solid ${THEME.border}`, py: 2.5 }}>
                {fetchingPerm && (
                    <Box display="flex" justifyContent="center" alignItems="center" py={1.5} mb={1.5} sx={{ bgcolor: `${THEME.primary}08`, borderRadius: 2 }}>
                        <CircularProgress size={20} sx={{ mr: 1.5 }} />
                        <Typography fontSize={FONTSIZE.small} color="text.secondary">
                            Fetching latest permission details...
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
                        {/* Name */}
                        <Grid item xs={12} sm={6}>
                            <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}>
                                Permission Name *
                            </Typography>
                            <CustomInput
                                placeholder="e.g. View Reports"
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

                        {/* Code */}
                        <Grid item xs={12} sm={6}>
                            <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}>
                                Code *
                            </Typography>
                            <CustomInput
                                placeholder="e.g. REPORT_VIEW"
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

                        {/* Module */}
                        <Grid item xs={12} sm={6}>
                            <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}>
                                Module
                            </Typography>
                            <CustomInput
                                placeholder="e.g. User, Role, Report"
                                value={formData.module || ""}
                                onChange={(e) => handleInputChange("module", e.target.value)}
                            />
                        </Grid>

                        {/* Path */}
                        <Grid item xs={12} sm={6}>
                            <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}>
                                Path (for Menu navigation)
                            </Typography>
                            <CustomInput
                                placeholder="e.g. /reports"
                                value={formData.path || ""}
                                onChange={(e) => handleInputChange("path", e.target.value)}
                            />
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                            <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}>
                                Description
                            </Typography>
                            <CustomInput
                                placeholder="Describe what access this permission grants..."
                                value={formData.description || ""}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                            />
                        </Grid>

                        {/* Icon SVG Input & Live Preview */}
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                <Typography fontSize={FONTSIZE.small} fontWeight={500} color={THEME.textPrimary}>
                                    Icon (SVG Markup)
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography fontSize="12px" color={THEME.textSecondary}>Preview:</Typography>
                                    <Box
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: 1,
                                            bgcolor: `${THEME.primary}15`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: `1px solid ${THEME.border}`,
                                        }}
                                    >
                                        <RenderSvgIcon svgString={formData.icon} size={18} color={THEME.primary} />
                                    </Box>
                                </Box>
                            </Box>
                            <CustomInput
                                placeholder='<svg xmlns="http://www.w3.org/2000/svg"...></svg>'
                                value={formData.icon || ""}
                                onChange={(e) => handleInputChange("icon", e.target.value)}
                            />
                        </Grid>

                        {/* Sort Order & Menu Switch */}
                        <Grid item xs={12} sm={6}>
                            <Typography fontSize={FONTSIZE.small} fontWeight={500} mb={0.5} color={THEME.textPrimary}>
                                Sort Order
                            </Typography>
                            <CustomInput
                                type="number"
                                placeholder="0"
                                value={String(formData.sort_order ?? 0)}
                                onChange={(e) => handleInputChange("sort_order", Number(e.target.value))}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 1, borderRadius: 2, bgcolor: THEME.background, border: `1px solid ${THEME.border}` }}>
                                <Box>
                                    <Typography fontSize={FONTSIZE.small} fontWeight={600} color={THEME.textPrimary}>
                                        Menu Item
                                    </Typography>
                                    <Typography fontSize={FONTSIZE.caption} color={THEME.textSecondary}>
                                        Appears in Sidebar Menu
                                    </Typography>
                                </Box>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.is_menu ?? false}
                                            onChange={(e) => handleInputChange("is_menu", e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={formData.is_menu ? "Yes" : "No"}
                                    labelPlacement="start"
                                />
                            </Box>
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
                    text={loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Permission" : "Create Permission")}
                    width={160}
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

export default AddPermissionOverlay;
