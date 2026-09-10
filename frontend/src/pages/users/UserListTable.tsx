import { useEffect, useState } from "react";
import { UserServices } from "@/services/users.services";
import type { UserProfile } from "@/models/auth.models";
import { UserManagementTableHeaders } from "@/utils/StaticData";
import { FONTSIZE, THEME } from "@/assets/theme";
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
    Avatar,
} from "@mui/material";
import {
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    LockReset as LockResetIcon,
} from "@mui/icons-material";
import { CustomInput } from "@/components/Inputs/CustomInput";

interface UserListTableProps {
    refreshTrigger?: number;
    onEditUser?: (user: UserProfile) => void;
    onUserDeleted?: (message?: string) => void;
}

const UserListTable: React.FC<UserListTableProps> = ({ refreshTrigger, onEditUser, onUserDeleted }) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [totalCount, setTotalCount] = useState<number>(0);

    // Action Menu state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    // Delete Confirmation Modal state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Reset Password Modal state
    const [resetPasswordOpen, setResetPasswordOpen] = useState<boolean>(false);
    const [userToResetPassword, setUserToResetPassword] = useState<UserProfile | null>(null);
    const [newPassword, setNewPassword] = useState<string>("");
    const [resettingPassword, setResettingPassword] = useState<boolean>(false);
    const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

    const fetchUsers = async (currentPage: number, currentRowsPerPage: number) => {
        try {
            setLoading(true);
            setError(null);
            const skip = currentPage * currentRowsPerPage;
            const response = await UserServices.listAllUsers(skip, currentRowsPerPage);
            if (response.success && Array.isArray(response.data)) {
                setUsers(response.data);
                if (response.data.length < currentRowsPerPage && currentPage === 0) {
                    setTotalCount(response.data.length);
                } else if (response.data.length < currentRowsPerPage) {
                    setTotalCount(skip + response.data.length);
                } else {
                    setTotalCount((currentPage + 2) * currentRowsPerPage);
                }
            } else {
                setError(response.message || "Failed to load users");
            }
        } catch (err: unknown) {
            console.error("Error loading users:", err);
            setError("Failed to fetch user list. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(page, rowsPerPage);
    }, [page, rowsPerPage, refreshTrigger]);

    const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, user: UserProfile) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const handleEdit = () => {
        if (selectedUser && onEditUser) {
            onEditUser(selectedUser);
        }
        handleCloseMenu();
    };

    const handleResetPassword = () => {
        if (selectedUser) {
            setUserToResetPassword(selectedUser);
            setNewPassword("");
            setResetPasswordError(null);
            setResetPasswordOpen(true);
        }
        handleCloseMenu();
    };

    const handleCancelResetPassword = () => {
        setResetPasswordOpen(false);
        setUserToResetPassword(null);
        setNewPassword("");
        setResetPasswordError(null);
    };

    const handleConfirmResetPassword = async () => {
        if (!userToResetPassword) return;

        if (!newPassword) {
            setResetPasswordError("New password is required");
            return;
        }

        if (newPassword.length < 6) {
            setResetPasswordError("Password must be at least 6 characters long");
            return;
        }

        try {
            setResettingPassword(true);
            setResetPasswordError(null);
            const response = await UserServices.resetPassword(userToResetPassword.id, newPassword);
            if (response.success) {
                setResetPasswordOpen(false);
                setUserToResetPassword(null);
                setNewPassword("");
                if (onUserDeleted) {
                    onUserDeleted(response.message || "Password reset successfully!");
                }
            } else {
                setResetPasswordError(response.message || "Failed to reset password.");
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                "Failed to reset password.";
            setResetPasswordError(msg);
        } finally {
            setResettingPassword(false);
        }
    };

    const handleDeleteClick = () => {
        if (selectedUser) {
            setUserToDelete(selectedUser);
            setDeleteDialogOpen(true);
            setDeleteError(null);
        }
        handleCloseMenu();
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        setDeleteError(null);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        try {
            setDeleting(true);
            setDeleteError(null);
            const response = await UserServices.deleteUser(userToDelete.id);
            if (response.success) {
                setDeleteDialogOpen(false);
                const msg = response.message || "User deleted successfully!";
                setUserToDelete(null);
                if (onUserDeleted) {
                    onUserDeleted(msg);
                } else {
                    fetchUsers(page, rowsPerPage);
                }
            } else {
                setDeleteError(response.message || "Failed to delete user.");
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                "Failed to delete user.";
            setDeleteError(msg);
        } finally {
            setDeleting(false);
        }
    };

    if (loading && users.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" py={6}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && users.length === 0) {
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
                            {UserManagementTableHeaders.map((header) => (
                                <TableCell key={header} sx={{ fontWeight: 600, color: THEME.textPrimary }}>
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={UserManagementTableHeaders.length} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">No users found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user, index) => (
                                <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    {/* S.no */}
                                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>

                                    {/* Employee ID */}
                                    <TableCell sx={{ fontWeight: 600, color: THEME.primary }}>
                                        {user.employee_id || "N/A"}
                                    </TableCell>

                                    {/* Full Name */}
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Avatar
                                                src={user.profile_picture || undefined}
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor: THEME.primary,
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {!user.profile_picture && (user.full_name || user.username || "U")[0].toUpperCase()}
                                            </Avatar>
                                            <Typography fontSize={FONTSIZE.small} fontWeight={500}>
                                                {user.full_name || user.username}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {/* Email */}
                                    <TableCell>{user.email}</TableCell>

                                    {/* Role */}
                                    <TableCell>
                                        {user.roles && user.roles.length > 0 ? (
                                            user.roles.map((role) => (
                                                <Chip
                                                    key={role.id}
                                                    label={role.name}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ mr: 0.5, mb: 0.5 }}
                                                />
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">No Role</Typography>
                                        )}
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        <Chip
                                            label={user.is_active ? "Active" : "Inactive"}
                                            size="small"
                                            color={user.is_active ? "success" : "default"}
                                            sx={{ fontWeight: 500 }}
                                        />
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleOpenMenu(e, user)}
                                        >
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

            {/* 3-Dot Ellipsis Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    elevation: 2,
                    sx: { borderRadius: 1.5, minWidth: 160 }
                }}
            >
                <MenuItem onClick={handleEdit}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Edit" />
                </MenuItem>
                <MenuItem onClick={handleResetPassword}>
                    <ListItemIcon>
                        <LockResetIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText primary="Reset Password" />
                </MenuItem>
                <MenuItem onClick={handleDeleteClick}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Delete" sx={{ color: THEME.error }} />
                </MenuItem>
            </Menu>

            {/* Delete User Confirmation Dialog */}
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
                        Delete User
                    </Typography>
                </DialogTitle>

                <DialogContent dividers sx={{ borderTop: `1px solid ${THEME.border}`, py: 2 }}>
                    {deleteError && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {deleteError}
                        </Alert>
                    )}
                    <Typography fontSize="14px" color={THEME.textSecondary}>
                        Are you sure you want to delete user{" "}
                        <Box component="span" sx={{ fontWeight: 600, color: THEME.textPrimary }}>
                            "{userToDelete?.full_name || userToDelete?.username}"
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

            {/* Reset Password Modal */}
            <Dialog
                open={resetPasswordOpen}
                onClose={handleCancelResetPassword}
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
                            bgcolor: `${THEME.primary}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: THEME.primary,
                        }}
                    >
                        <LockResetIcon fontSize="small" />
                    </Box>
                    <Typography fontSize="18px" fontWeight={600} color={THEME.textPrimary}>
                        Reset Password
                    </Typography>
                </DialogTitle>

                <DialogContent dividers sx={{ borderTop: `1px solid ${THEME.border}`, py: 2 }}>
                    {resetPasswordError && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {resetPasswordError}
                        </Alert>
                    )}
                    <Typography fontSize="14px" color={THEME.textSecondary} mb={2}>
                        Set a new password for{" "}
                        <Box component="span" sx={{ fontWeight: 600, color: THEME.textPrimary }}>
                            "{userToResetPassword?.full_name || userToResetPassword?.username}"
                        </Box>
                        . No original password is required.
                    </Typography>

                    <Typography fontSize="13px" fontWeight={500} mb={0.5} color={THEME.textPrimary}>
                        New Password *
                    </Typography>
                    <CustomInput
                        placeholder="Enter new password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (resetPasswordError) setResetPasswordError(null);
                        }}
                    />
                </DialogContent>

                <DialogActions sx={{ p: 2, pt: 1.5, gap: 1 }}>
                    <CustomButton
                        text="Cancel"
                        height="38px"
                        bgc={THEME.transparent}
                        color={THEME.textSecondary}
                        border={`1px solid ${THEME.border}`}
                        hov={`${THEME.border}40`}
                        onClick={handleCancelResetPassword}
                        isDisabled={resettingPassword}
                    />
                    <CustomButton
                        text={resettingPassword ? "Saving..." : "Reset Password"}
                        height="38px"
                        bgc={THEME.primary}
                        color={THEME.white}
                        hov={THEME.primaryDark}
                        onClick={handleConfirmResetPassword}
                        isDisabled={resettingPassword}
                        Sicon={resettingPassword ? <CircularProgress size={16} color="inherit" /> : undefined}
                    />
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserListTable;