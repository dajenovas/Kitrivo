import { useState } from "react";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { Box, Snackbar, Alert } from "@mui/material";
import RoleListTable from "./RoleListTable";
import AddRoleOverlay from "./AddRoleOverlay";
import AssignPermissionsModal from "./AssignPermissionsModal";
import type { UserRole } from "@/models/auth.models";

const RolesListPage = () => {
    const [isAddRoleOpen, setIsAddRoleOpen] = useState<boolean>(false);
    const [roleToEdit, setRoleToEdit] = useState<UserRole | null>(null);

    const [isAssignPermsOpen, setIsAssignPermsOpen] = useState<boolean>(false);
    const [roleToAssignPerms, setRoleToAssignPerms] = useState<UserRole | null>(null);

    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false,
        message: "",
        severity: "success",
    });

    const handleOpenAddRole = () => {
        setRoleToEdit(null);
        setIsAddRoleOpen(true);
    };

    const handleOpenEditRole = (role: UserRole) => {
        setRoleToEdit(role);
        setIsAddRoleOpen(true);
    };

    const handleCloseRoleOverlay = () => {
        setIsAddRoleOpen(false);
        setRoleToEdit(null);
    };

    const handleOpenAssignPermissions = (role: UserRole) => {
        setRoleToAssignPerms(role);
        setIsAssignPermsOpen(true);
    };

    const handleCloseAssignPermsModal = () => {
        setIsAssignPermsOpen(false);
        setRoleToAssignPerms(null);
    };

    const handleRoleSaved = (message?: string) => {
        setRefreshTrigger((prev) => prev + 1);
        setSnackbar({
            open: true,
            message: message || (roleToEdit ? "Role updated successfully!" : "Role created successfully!"),
            severity: "success",
        });
    };

    const handleRoleDeleted = (message?: string) => {
        setRefreshTrigger((prev) => prev + 1);
        setSnackbar({
            open: true,
            message: message || "Role deleted successfully!",
            severity: "success",
        });
    };

    const handlePermissionsAssigned = (message?: string) => {
        setRefreshTrigger((prev) => prev + 1);
        setSnackbar({
            open: true,
            message: message || "Permissions assigned successfully!",
            severity: "success",
        });
    };

    return (
        <Box>
            {/* Top Action Bar */}
            <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
                <CustomButton text="Add Role +" onClick={handleOpenAddRole} width={180} />
            </Box>

            {/* Body Table */}
            <Box>
                <RoleListTable
                    refreshTrigger={refreshTrigger}
                    onEditRole={handleOpenEditRole}
                    onAssignPermissions={handleOpenAssignPermissions}
                    onRoleDeleted={handleRoleDeleted}
                />
            </Box>

            {/* Add / Edit Role Modal Overlay */}
            <AddRoleOverlay
                open={isAddRoleOpen}
                roleToEdit={roleToEdit}
                onClose={handleCloseRoleOverlay}
                onSuccess={handleRoleSaved}
            />

            {/* Assign Permissions Modal */}
            <AssignPermissionsModal
                open={isAssignPermsOpen}
                role={roleToAssignPerms}
                onClose={handleCloseAssignPermsModal}
                onSuccess={handlePermissionsAssigned}
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

export default RolesListPage;
