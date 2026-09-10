import { useState } from "react";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { Box, Snackbar, Alert } from "@mui/material";
import UserListTable from "./UserListTable";
import { AddUserOverlay } from "./AddUserOverlay";
import type { UserProfile } from "@/models/auth.models";

const UserManagementPage = () => {
  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleOpenAddUser = () => {
    setUserToEdit(null);
    setIsAddUserOpen(true);
  };

  const handleOpenEditUser = (user: UserProfile) => {
    setUserToEdit(user);
    setIsAddUserOpen(true);
  };

  const handleCloseOverlay = () => {
    setIsAddUserOpen(false);
    setUserToEdit(null);
  };

  const handleUserSaved = (message?: string) => {
    setRefreshTrigger((prev) => prev + 1);
    setSnackbar({
      open: true,
      message: message || (userToEdit ? "User updated successfully!" : "User created successfully!"),
      severity: "success",
    });
  };

  const handleUserDeleted = (message?: string) => {
    setRefreshTrigger((prev) => prev + 1);
    setSnackbar({
      open: true,
      message: message || "User deleted successfully!",
      severity: "success",
    });
  };

  return (
    <Box>
      {/* Top Action Bar */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
        <CustomButton text="Add User +" onClick={handleOpenAddUser} width={180} />
      </Box>

      {/* Body Table */}
      <Box>
        <UserListTable refreshTrigger={refreshTrigger} onEditUser={handleOpenEditUser} onUserDeleted={handleUserDeleted} />
      </Box>

      {/* Add / Edit User Modal Overlay */}
      <AddUserOverlay
        open={isAddUserOpen}
        userToEdit={userToEdit}
        onClose={handleCloseOverlay}
        onSuccess={handleUserSaved}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagementPage;
