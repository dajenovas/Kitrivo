import React, { useEffect, useMemo, useState } from "react";
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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Checkbox,
    FormControlLabel,
    Chip,
    Switch,
} from "@mui/material";
import {
    Close as CloseIcon,
    Key as KeyIcon,
    ExpandMore as ExpandMoreIcon,
    Search as SearchIcon,
    SelectAll as SelectAllIcon,
    Deselect as DeselectIcon,
} from "@mui/icons-material";
import { THEME, FONTSIZE, FONTWEIGHT } from "@/assets/theme";
import { CustomInput } from "@/components/Inputs/CustomInput";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { RenderSvgIcon } from "@/components/RenderSvgIcon";
import { RoleServices } from "@/services/roles.service";
import { PermissionServices, type GroupedPermissionsModule } from "@/services/permissions.service";
import type { UserRole, Permission } from "@/models/auth.models";

interface AssignPermissionsModalProps {
    open: boolean;
    role: UserRole | null;
    onClose: () => void;
    onSuccess: (message?: string) => void;
}

export const AssignPermissionsModal: React.FC<AssignPermissionsModalProps> = ({
    open,
    role,
    onClose,
    onSuccess,
}) => {
    const [groupedModules, setGroupedModules] = useState<GroupedPermissionsModule[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && role) {
            // Populate initially assigned permission IDs from role
            const initialIds = role.permissions ? role.permissions.map((p) => p.id) : [];
            setSelectedIds(initialIds);
            setSearchTerm("");
            setError(null);

            // Fetch grouped permissions from backend API
            const loadPermissions = async () => {
                try {
                    setFetching(true);
                    const response = await PermissionServices.getGroupedPermissions();
                    if (response.success && response.data) {
                        setGroupedModules(response.data);
                    }
                } catch (err: any) {
                    console.error("Failed to load permissions:", err);
                    setError("Failed to fetch permissions list.");
                } finally {
                    setFetching(false);
                }
            };

            loadPermissions();
        }
    }, [open, role]);

    // Calculate total count of all permissions across modules
    const totalPermissionsCount = useMemo(() => {
        return groupedModules.reduce((acc, m) => acc + m.permissions.length, 0);
    }, [groupedModules]);

    // Filter grouped modules by search term
    const filteredModules = useMemo(() => {
        if (!searchTerm.trim()) return groupedModules;
        const term = searchTerm.toLowerCase().trim();

        return groupedModules
            .map((g) => {
                const matchingPerms = g.permissions.filter(
                    (p) =>
                        p.name.toLowerCase().includes(term) ||
                        p.code.toLowerCase().includes(term) ||
                        (p.description && p.description.toLowerCase().includes(term)) ||
                        (p.module && p.module.toLowerCase().includes(term))
                );
                return {
                    module: g.module,
                    permissions: matchingPerms,
                };
            })
            .filter((g) => g.permissions.length > 0);
    }, [groupedModules, searchTerm]);

    const handleTogglePermission = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
        );
    };

    const handleToggleModule = (modulePermissions: Permission[], shouldSelect: boolean) => {
        const moduleIds = modulePermissions.map((p) => p.id);
        if (shouldSelect) {
            setSelectedIds((prev) => Array.from(new Set([...prev, ...moduleIds])));
        } else {
            setSelectedIds((prev) => prev.filter((id) => !moduleIds.includes(id)));
        }
    };

    const handleSelectAllGlobal = () => {
        const allIds: number[] = [];
        groupedModules.forEach((m) => m.permissions.forEach((p) => allIds.push(p.id)));
        setSelectedIds(allIds);
    };

    const handleDeselectAllGlobal = () => {
        setSelectedIds([]);
    };

    const handleSubmit = async () => {
        if (!role) return;

        try {
            setLoading(true);
            setError(null);
            const response = await RoleServices.assignPermissionsToRole(role.id, selectedIds);
            if (response.success) {
                onSuccess(response.message || "Permissions assigned to role successfully!");
                onClose();
            } else {
                setError(response.message || "Failed to assign permissions.");
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                "Failed to assign permissions.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1, maxHeight: "90vh", border: `1px solid ${THEME.border}`, boxShadow: `0 20px 40px ${THEME.slate900}26` } }}>
            {/* Header */}
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: `${THEME.primary}15`, display: "flex", alignItems: "center", justifyContent: "center", color: THEME.primary }}>
                            <KeyIcon fontSize="small" />
                        </Box>
                        <Box>
                            <Typography fontSize={FONTSIZE.title} fontWeight={FONTWEIGHT.title} color={THEME.textPrimary}>
                                Assign Permissions
                            </Typography>
                            <Typography fontSize={FONTSIZE.caption} color={THEME.textSecondary}>
                                Role:{" "}
                                <Box component="span" fontWeight={600} color={THEME.primary}>
                                    {role?.name || "N/A"}
                                </Box>{" "}
                                ({role?.code})
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ borderTop: `1px solid ${THEME.border}`, py: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Filter and Quick Stats Toolbar */}
                <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={2} mb={2.5}>
                    <Box flex={1} maxWidth={{ sm: 360 }}>
                        <CustomInput
                            placeholder="Search permissions by name, code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sIcon={<SearchIcon fontSize="small" sx={{ color: THEME.textSecondary }} />}
                        />
                    </Box>

                    <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                        <Chip
                            label={`Selected ${selectedIds.length} of ${totalPermissionsCount}`}
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600, height: 32 }}
                        />
                        <CustomButton
                            text="Select All"
                            onClick={handleSelectAllGlobal}
                            width={130}
                            height="32px"
                            bgc={`${THEME.primary}10`}
                            color={THEME.primary}
                            hov={`${THEME.primary}20`}
                            Sicon={<SelectAllIcon fontSize="small" />}
                        />
                        <CustomButton
                            text="Clear All"
                            onClick={handleDeselectAllGlobal}
                            width={130}
                            height="32px"
                            bgc={THEME.transparent}
                            color={THEME.textSecondary}
                            border={`1px solid ${THEME.border}`}
                            hov={`${THEME.border}40`}
                            Sicon={<DeselectIcon fontSize="small" />}
                        />
                    </Box>
                </Box>

                {fetching ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={6}>
                        <CircularProgress size={32} />
                    </Box>
                ) : filteredModules.length === 0 ? (
                    <Box textAlign="center" py={5}>
                        <Typography color="text.secondary">No matching permissions found.</Typography>
                    </Box>
                ) : (
                    <Box display="flex" flexDirection="column" gap={1.5}>
                        {filteredModules.map((moduleGroup) => {
                            const modulePermIds = moduleGroup.permissions.map((p) => p.id);
                            const selectedCountInModule = modulePermIds.filter((id) => selectedIds.includes(id)).length;
                            const isAllSelected = modulePermIds.length > 0 && selectedCountInModule === modulePermIds.length;
                            const isSomeSelected = selectedCountInModule > 0 && selectedCountInModule < modulePermIds.length;

                            return (
                                <Accordion
                                    key={moduleGroup.module}
                                    defaultExpanded
                                    elevation={0}
                                    sx={{
                                        border: `1px solid ${THEME.border}`,
                                        borderRadius: "12px !important",
                                        "&:before": { display: "none" },
                                        overflow: "hidden",
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon sx={{ color: THEME.textSecondary }} />}
                                        sx={{ bgcolor: THEME.background, px: 2, py: 0.5 }}
                                    >
                                        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" pr={1} onClick={(e) => e.stopPropagation()}>
                                            <Box display="flex" alignItems="center" gap={1.5}>
                                                <Typography fontWeight={600} fontSize={FONTSIZE.title} color={THEME.textPrimary}>
                                                    {moduleGroup.module}
                                                </Typography>
                                                <Chip
                                                    label={`${selectedCountInModule} / ${moduleGroup.permissions.length}`}
                                                    size="small"
                                                    color={selectedCountInModule > 0 ? "primary" : "default"}
                                                    sx={{ fontSize: "11px", fontWeight: 600, height: 20 }}
                                                />
                                            </Box>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={isAllSelected}
                                                        indeterminate={isSomeSelected}
                                                        onChange={(e) => handleToggleModule(moduleGroup.permissions, e.target.checked)}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label="Select Module"
                                                onClick={(e) => e.stopPropagation()}
                                                sx={{ m: 0, "& .MuiFormControlLabel-label": { fontSize: "12px", color: THEME.textSecondary } }}
                                            />
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 1.5, bgcolor: THEME.white }}>
                                        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={1.5}>
                                            {moduleGroup.permissions.map((perm) => {
                                                const isChecked = selectedIds.includes(perm.id);
                                                return (
                                                    <Box
                                                        key={perm.id}
                                                        onClick={() => handleTogglePermission(perm.id)}
                                                        sx={{
                                                            p: 1.5,
                                                            borderRadius: 2,
                                                            border: `1px solid ${isChecked ? `${THEME.primary}40` : THEME.border}`,
                                                            bgcolor: isChecked ? `${THEME.primary}06` : THEME.white,
                                                            cursor: "pointer",
                                                            transition: "all 0.15s ease",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                            gap: 1.5,
                                                            "&:hover": {
                                                                bgcolor: isChecked ? `${THEME.primary}10` : `${THEME.border}30`,
                                                            },
                                                        }}
                                                    >
                                                        <Box display="flex" alignItems="center" gap={1.5} overflow="hidden">
                                                            {/* SVG Icon Visual */}
                                                            <Box
                                                                sx={{
                                                                    width: 36,
                                                                    height: 36,
                                                                    borderRadius: 1.5,
                                                                    bgcolor: isChecked ? `${THEME.primary}15` : `${THEME.border}40`,
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                <RenderSvgIcon svgString={perm.icon} size={20} color={isChecked ? THEME.primary : THEME.textSecondary} />
                                                            </Box>

                                                            <Box overflow="hidden">
                                                                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                                                    <Typography fontSize={FONTSIZE.small} fontWeight={600} color={THEME.textPrimary} noWrap>
                                                                        {perm.name}
                                                                    </Typography>
                                                                    {perm.is_menu && (
                                                                        <Chip label="Menu" size="small" color="info" variant="outlined" sx={{ height: 16, fontSize: "10px" }} />
                                                                    )}
                                                                </Box>
                                                                <Typography fontSize="11px" color={THEME.textSecondary} noWrap>
                                                                    {perm.code}
                                                                </Typography>
                                                            </Box>
                                                        </Box>

                                                        <Switch
                                                            checked={isChecked}
                                                            onChange={() => handleTogglePermission(perm.id)}
                                                            color="primary"
                                                            size="small"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 1.5, gap: 1 }}>
                <CustomButton
                    text="Cancel"
                    width={100}
                    height="40px"
                    bgc={THEME.transparent}
                    color={THEME.textSecondary}
                    border={`1px solid ${THEME.border}`}
                    hov={`${THEME.border}40`}
                    onClick={onClose}
                    isDisabled={loading}
                />
                <CustomButton
                    text={loading ? "Saving..." : "Save Permissions"}
                    width={160}
                    height="40px"
                    bgc={THEME.primary}
                    color={THEME.white}
                    hov={THEME.primaryDark}
                    onClick={handleSubmit}
                    isDisabled={loading || fetching}
                    Sicon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
                />
            </DialogActions>
        </Dialog>
    );
};

export default AssignPermissionsModal;
