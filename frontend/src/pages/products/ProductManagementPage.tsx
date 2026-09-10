import React, { useState } from "react";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { Box, Snackbar, Alert, Typography } from "@mui/material";
import { ProductListTable } from "./ProductListTable";
import { AddEditProductOverlay } from "./AddEditProductOverlay";
import type { Product } from "@/models/product.models";
import { FONTSIZE, THEME } from "@/assets/theme";

const ProductManagementPage: React.FC = () => {
  const [isOverlayOpen, setIsOverlayOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsOverlayOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setProductToEdit(product);
    setIsOverlayOpen(true);
  };

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
    setProductToEdit(null);
  };

  const handleProductSaved = (message?: string) => {
    setRefreshTrigger((prev) => prev + 1);
    setSnackbar({
      open: true,
      message: message || (productToEdit ? "Product updated successfully!" : "Product created successfully!"),
      severity: "success",
    });
  };

  const handleProductDeleted = (message?: string) => {
    setRefreshTrigger((prev) => prev + 1);
    setSnackbar({
      open: true,
      message: message || "Product deleted successfully!",
      severity: "success",
    });
  };

  return (
    <Box p={3}>
      {/* Header Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography fontSize={FONTSIZE.xlarge} fontWeight={700} color={THEME.textPrimary}>
            Product Inventory & E-Commerce Management
          </Typography>
          <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>
            Manage product catalog, prices, technical specifications, and store availability.
          </Typography>
        </Box>
        <CustomButton text="Add Product +" onClick={handleOpenAdd} width={180} />
      </Box>

      {/* Main Table */}
      <ProductListTable
        refreshTrigger={refreshTrigger}
        onEditProduct={handleOpenEdit}
        onProductDeleted={handleProductDeleted}
      />

      {/* Add / Edit Overlay */}
      <AddEditProductOverlay
        open={isOverlayOpen}
        productToEdit={productToEdit}
        onClose={handleCloseOverlay}
        onSuccess={handleProductSaved}
      />

      {/* Feedback Toast */}
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

export default ProductManagementPage;
