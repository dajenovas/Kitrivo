import React, { useEffect, useState } from "react";
import { RoleServices } from "@/services/roles.service";
import type { UserRole } from "@/models/auth.models";
import { RoleManagementTableHeaders } from "@/utils/StaticData";
import { THEME, useAppTheme } from "@/assets/theme";
import { CustomButton } from "@/components/Buttons/CustomButton";
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
    Key as KeyIcon,
} from "@mui/icons-material";

interface RoleListTableProps {
    refreshTrigger?: number;
    onEditRole?: (role: UserRole) => void;
    onAssignPermissions?: (role: UserRole) => void;
    onRoleDeleted?: (message?: string) => void;
}

export const RoleListTable: React.FC<RoleListTableProps> = ({
    refreshTrigger,
    onEditRole,
    onAssignPermissions,
    onRoleDeleted,
}) => {
    const theme = useAppTheme();
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [totalCount, setTotalCount] = useState<number>(0);

    // Menu State
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

    // Delete Confirmation State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [roleToDelete, setRoleToDelete] = useState<UserRole | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const fetchRoles = async (currentPage: number, currentRowsPerPage: number) => {
        try {
            setLoading(true);
            setError(null);
            const skip = currentPage * currentRowsPerPage;
            const response = await RoleServices.listRoles(skip, currentRowsPerPage);
            if (response.success && Array.isArray(response.data)) {
                setRoles(response.data);
                if (response.data.length < currentRowsPerPage && currentPage === 0) {
                    setTotalCount(response.data.length);
                } else if (response.data.length < currentRowsPerPage) {
                    setTotalCount(skip + response.data.length);
                } else {
                    setTotalCount((currentPage + 2) * currentRowsPerPage);
                }
            } else {
                setError(response.message || "Failed to load roles");
            }
        } catch (err: any) {
            console.error("Error loading roles:", err);
            setError("Failed to fetch roles list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles(page, rowsPerPage);
    }, [page, rowsPerPage, refreshTrigger]);

    const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, role: UserRole) => {
        setAnchorEl(event.currentTarget);
        setSelectedRole(role);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedRole(null);
    };

    const handleEdit = () => {
        if (selectedRole && onEditRole) {
            onEditRole(selectedRole);
        }
        handleCloseMenu();
    };

    const handleAssignPermissions = () => {
        if (selectedRole && onAssignPermissions) {
            onAssignPermissions(selectedRole);
        }
        handleCloseMenu();
    };

    const handleDeleteClick = () => {
        if (selectedRole) {
            setRoleToDelete(selectedRole);
            setDeleteDialogOpen(true);
            setDeleteError(null);
        }
        handleCloseMenu();
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setRoleToDelete(null);
        setDeleteError(null);
    };

    const handleConfirmDelete = async () => {
        if (!roleToDelete) return;

        try {
            setDeleting(true);
            setDeleteError(null);
            const response = await RoleServices.deleteRole(roleToDelete.id);
            if (response.success) {
                setDeleteDialogOpen(false);
                const msg = response.message || "Role deleted successfully!";
                setRoleToDelete(null);
                if (onRoleDeleted) {
                    onRoleDeleted(msg);
                } else {
                    fetchRoles(page, rowsPerPage);
                }
            } else {
                setDeleteError(response.message || "Failed to delete role.");
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                "Failed to delete role.";
            setDeleteError(msg);
        } finally {
            setDeleting(false);
        }
    };

    if (loading && roles.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" py={6}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && roles.length === 0) {
        return (
            <Box p={3} textAlign="center">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.border}`, borderRadius: 2, bgcolor: theme.paperBg }}>
                <Table>
                    <TableHead sx={{ bgcolor: theme.isDark ? "#0f172a" : THEME.background }}>
                        <TableRow>
                            {RoleManagementTableHeaders.map((header) => (
                                <TableCell key={header} sx={{ fontWeight: 600, color: theme.textPrimary, borderColor: theme.border }}>
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {roles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={RoleManagementTableHeaders.length} align="center" sx={{ py: 4, borderColor: theme.border }}>
                                    <Typography color={theme.textSecondary}>No roles found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            roles.map((role, index) => (
                                <TableRow key={role.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    {/* S.no */}
                                    <TableCell sx={{ color: theme.textPrimary, borderColor: theme.border }}>{page * rowsPerPage + index + 1}</TableCell>

                                    {/* Role Name */}
                                    <TableCell sx={{ fontWeight: 600, color: theme.textPrimary, borderColor: theme.border }}>
                                        {role.name}
                                    </TableCell>

                                    {/* Code */}
                                    <TableCell sx={{ fontWeight: 600, color: THEME.primary, borderColor: theme.border }}>
                                        <Chip label={role.code} size="small" variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
                                    </TableCell>

                                    {/* Description */}
                                    <TableCell sx={{ color: theme.textSecondary, maxWidth: 280, borderColor: theme.border }}>
                                        {role.description || "No description provided"}
                                    </TableCell>

                                    {/* Permissions Count */}
                                    <TableCell sx={{ borderColor: theme.border }}>
                                        <Chip
                                            label={`${role.permissions ? role.permissions.length : 0} Permissions`}
                                            size="small"
                                            color="info"
                                            sx={{ fontWeight: 500 }}
                                        />
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell sx={{ borderColor: theme.border }}>
                                        <IconButton size="small" onClick={(e) => handleOpenMenu(e, role)} sx={{ color: theme.textPrimary }}>
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
                    sx={{
                        borderTop: `1px solid ${theme.border}`,
                        color: theme.textPrimary,
                        "& .MuiTablePagination-selectIcon": { color: theme.textSecondary },
                        "& .MuiTablePagination-actions .MuiIconButton-root": { color: theme.textPrimary },
                    }}
                />
            </TableContainer>


            {/* 3-Dot Ellipsis Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ elevation: 2, sx: { borderRadius: 1.5, minWidth: 170 } }}
            >
                <MenuItem onClick={handleEdit}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Edit Role" />
                </MenuItem>
                <MenuItem onClick={handleAssignPermissions}>
                    <ListItemIcon>
                        <KeyIcon fontSize="small" sx={{ color: THEME.primary }} />
                    </ListItemIcon>
                    <ListItemText primary="Assign Permissions" />
                </MenuItem>
                <MenuItem onClick={handleDeleteClick}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Delete Role" sx={{ color: THEME.error }} />
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
                        Delete Role
                    </Typography>
                </DialogTitle>

                <DialogContent dividers sx={{ borderTop: `1px solid ${THEME.border}`, py: 2 }}>
                    {deleteError && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {deleteError}
                        </Alert>
                    )}
                    <Typography fontSize="14px" color={THEME.textSecondary}>
                        Are you sure you want to delete role{" "}
                        <Box component="span" sx={{ fontWeight: 600, color: THEME.textPrimary }}>
                            "{roleToDelete?.name}"
                        </Box>
                        ? User accounts assigned to this role will lose permissions.
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

export default RoleListTable;
