import { useState } from "react";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { Box, Snackbar, Alert } from "@mui/material";
import PermissionListTable from "./PermissionListTable";
import AddPermissionOverlay from "./AddPermissionOverlay";
import type { Permission } from "@/models/auth.models";

const PermissionsListPage = () => {
    const [isAddPermOpen, setIsAddPermOpen] = useState<boolean>(false);
    const [permToEdit, setPermToEdit] = useState<Permission | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false,
        message: "",
        severity: "success",
    });

    const handleOpenAddPerm = () => {
        setPermToEdit(null);
        setIsAddPermOpen(true);
    };

    const handleOpenEditPerm = (perm: Permission) => {
        setPermToEdit(perm);
        setIsAddPermOpen(true);
    };

    const handleCloseOverlay = () => {
        setIsAddPermOpen(false);
        setPermToEdit(null);
    };

    const handlePermSaved = (message?: string) => {
        setRefreshTrigger((prev) => prev + 1);
        setSnackbar({
            open: true,
            message: message || (permToEdit ? "Permission updated successfully!" : "Permission created successfully!"),
            severity: "success",
        });
    };

    const handlePermDeleted = (message?: string) => {
        setRefreshTrigger((prev) => prev + 1);
        setSnackbar({
            open: true,
            message: message || "Permission deleted successfully!",
            severity: "success",
        });
    };

    return (
        <Box>
            {/* Top Action Bar */}
            <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
                <CustomButton text="Add Permission +" onClick={handleOpenAddPerm} width={200} />
            </Box>

            {/* Body Table */}
            <Box>
                <PermissionListTable
                    refreshTrigger={refreshTrigger}
                    onEditPermission={handleOpenEditPerm}
                    onPermissionDeleted={handlePermDeleted}
                />
            </Box>

            {/* Add / Edit Permission Modal Overlay */}
            <AddPermissionOverlay
                open={isAddPermOpen}
                permissionToEdit={permToEdit}
                onClose={handleCloseOverlay}
                onSuccess={handlePermSaved}
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

export default PermissionsListPage;
