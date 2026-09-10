import React, { useEffect, useState } from "react";
import { PermissionServices } from "@/services/permissions.service";
import type { Permission } from "@/models/auth.models";
import { PermissionManagementTableHeaders } from "@/utils/StaticData";
import { THEME } from "@/assets/theme";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { RenderSvgIcon } from "@/components/RenderSvgIcon";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    Typography,
    IconButton,
    TablePagination,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
} from "@mui/material";
import {
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";

interface PermissionListTableProps {
    refreshTrigger?: number;
    onEditPermission?: (permission: Permission) => void;
    onPermissionDeleted?: (message?: string) => void;
}

export const PermissionListTable: React.FC<PermissionListTableProps> = ({
    refreshTrigger,
    onEditPermission,
    onPermissionDeleted,
}) => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [totalCount, setTotalCount] = useState<number>(0);

    // Menu State
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedPerm, setSelectedPerm] = useState<Permission | null>(null);

    // Delete Confirmation State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [permToDelete, setPermToDelete] = useState<Permission | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const fetchPermissions = async (currentPage: number, currentRowsPerPage: number) => {
        try {
            setLoading(true);
            setError(null);
            const skip = currentPage * currentRowsPerPage;
            const response = await PermissionServices.listPermissions(skip, currentRowsPerPage);
            if (response.success && Array.isArray(response.data)) {
                setPermissions(response.data);
                if (response.data.length < currentRowsPerPage && currentPage === 0) {
                    setTotalCount(response.data.length);
                } else if (response.data.length < currentRowsPerPage) {
                    setTotalCount(skip + response.data.length);
                } else {
                    setTotalCount((currentPage + 2) * currentRowsPerPage);
                }
            } else {
                setError(response.message || "Failed to load permissions");
            }
        } catch (err: any) {
            console.error("Error loading permissions:", err);
            setError("Failed to fetch permissions list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions(page, rowsPerPage);
    }, [page, rowsPerPage, refreshTrigger]);

    const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, perm: Permission) => {
        setAnchorEl(event.currentTarget);
        setSelectedPerm(perm);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedPerm(null);
    };

    const handleEdit = () => {
        if (selectedPerm && onEditPermission) {
            onEditPermission(selectedPerm);
        }
        handleCloseMenu();
    };

    const handleDeleteClick = () => {
        if (selectedPerm) {
            setPermToDelete(selectedPerm);
            setDeleteDialogOpen(true);
            setDeleteError(null);
        }
        handleCloseMenu();
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setPermToDelete(null);
        setDeleteError(null);
    };

    const handleConfirmDelete = async () => {
        if (!permToDelete) return;

        try {
            setDeleting(true);
            setDeleteError(null);
            const response = await PermissionServices.deletePermission(permToDelete.id);
            if (response.success) {
                setDeleteDialogOpen(false);
                const msg = response.message || "Permission deleted successfully!";
                setPermToDelete(null);
                if (onPermissionDeleted) {
                    onPermissionDeleted(msg);
                } else {
                    fetchPermissions(page, rowsPerPage);
                }
            } else {
                setDeleteError(response.message || "Failed to delete permission.");
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                "Failed to delete permission.";
            setDeleteError(msg);
        } finally {
            setDeleting(false);
        }
    };

    if (loading && permissions.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" py={6}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && permissions.length === 0) {
        return (
            <Box p={3} textAlign="center">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${THEME.border}`, borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: THEME.background }}>
                        <TableRow>
                            {PermissionManagementTableHeaders.map((header) => (
                                <TableCell key={header} sx={{ fontWeight: 600, color: THEME.textPrimary }}>
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {permissions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={PermissionManagementTableHeaders.length} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">No permissions found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            permissions.map((perm) => (
                                <TableRow key={perm.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    {/* 1st Column: Icon (Rendered visually as SVG graphic, NOT raw text) */}
                                    <TableCell>
                                        <Box
                                            sx={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: 1.5,
                                                bgcolor: `${THEME.primary}12`,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                border: `1px solid ${THEME.border}`,
                                            }}
                                        >
                                            <RenderSvgIcon svgString={perm.icon} size={18} color={THEME.primary} />
                                        </Box>
                                    </TableCell>

                                    {/* Name */}
                                    <TableCell sx={{ fontWeight: 600, color: THEME.textPrimary }}>
                                        {perm.name}
                                    </TableCell>

                                    {/* Code */}
                                    <TableCell sx={{ fontWeight: 600, color: THEME.primary }}>
                                        <Chip label={perm.code} size="small" variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
                                    </TableCell>

                                    {/* Module */}
                                    <TableCell>
                                        <Chip label={perm.module || "General"} size="small" color="secondary" variant="outlined" />
                                    </TableCell>

                                    {/* Description */}
                                    <TableCell sx={{ color: THEME.textSecondary, maxWidth: 220 }}>
                                        {perm.description || "N/A"}
                                    </TableCell>

                                    {/* Is Menu */}
                                    <TableCell>
                                        <Chip
                                            label={perm.is_menu ? "Yes" : "No"}
                                            size="small"
                                            color={perm.is_menu ? "success" : "default"}
                                            sx={{ fontWeight: 500 }}
                                        />
                                    </TableCell>

                                    {/* Path */}
                                    <TableCell sx={{ fontSize: "13px", color: THEME.textSecondary }}>
                                        {perm.path || "-"}
                                    </TableCell>

                                    {/* Sort Order */}
                                    <TableCell sx={{ fontWeight: 500 }}>
                                        {perm.sort_order ?? 0}
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell>
                                        <IconButton size="small" onClick={(e) => handleOpenMenu(e, perm)}>
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ borderTop: `1px solid ${THEME.border}` }}
                />
            </TableContainer>

            {/* 3-Dot Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ elevation: 2, sx: { borderRadius: 1.5, minWidth: 160 } }}
            >
                <MenuItem onClick={handleEdit}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Edit" />
                </MenuItem>
                <MenuItem onClick={handleDeleteClick}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Delete" sx={{ color: THEME.error }} />
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                maxWidth="xs"
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
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: `${THEME.error}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: THEME.error,
                        }}
                    >
                        <DeleteIcon fontSize="small" />
                    </Box>
                    <Typography fontSize="18px" fontWeight={600} color={THEME.textPrimary}>
                        Delete Permission
                    </Typography>
                </DialogTitle>

                <DialogContent dividers sx={{ borderTop: `1px solid ${THEME.border}`, py: 2 }}>
                    {deleteError && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {deleteError}
                        </Alert>
                    )}
                    <Typography fontSize="14px" color={THEME.textSecondary}>
                        Are you sure you want to delete permission{" "}
                        <Box component="span" sx={{ fontWeight: 600, color: THEME.textPrimary }}>
                            "{permToDelete?.name}"
                        </Box>
                        ? This action cannot be undone.
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ p: 2, pt: 1.5, gap: 1 }}>
                    <CustomButton
                        text="Cancel"
                        width={100}
                        height="38px"
                        bgc={THEME.transparent}
                        color={THEME.textSecondary}
                        border={`1px solid ${THEME.border}`}
                        hov={`${THEME.border}40`}
                        onClick={handleCancelDelete}
                        isDisabled={deleting}
                    />
                    <CustomButton
                        text={deleting ? "Deleting..." : "Delete"}
                        width={110}
                        height="38px"
                        bgc={THEME.error}
                        color={THEME.white}
                        hov="#c62828"
                        onClick={handleConfirmDelete}
                        isDisabled={deleting}
                        Sicon={deleting ? <CircularProgress size={16} color="inherit" /> : undefined}
                    />
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PermissionListTable;
