import React, { useEffect, useState } from "react";
import type { Product, ProductCategory } from "@/models/product.models";
import { ProductService } from "@/services/products.service";
import { FONTSIZE, THEME } from "@/assets/theme";
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
  Button,
  TextField,
  InputAdornment,
  Alert,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Storefront as StorefrontIcon,
  Verified as VerifiedIcon,
} from "@mui/icons-material";
import { ProductDetailsModal } from "./ProductDetailsModal";

interface ProductListTableProps {
  refreshTrigger?: number;
  onEditProduct?: (product: Product) => void;
  onProductDeleted?: (message?: string) => void;
}

export const ProductListTable: React.FC<ProductListTableProps> = ({
  refreshTrigger,
  onEditProduct,
  onProductDeleted,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Pagination State
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Action Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals State
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, refreshTrigger, selectedCategory, selectedStatus]);

  const fetchCategories = async () => {
    try {
      const res = await ProductService.listCategories();
      if (res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ProductService.getProducts({
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        q: searchQuery.trim() || undefined,
        category_id: selectedCategory ? Number(selectedCategory) : undefined,
        status: selectedStatus || undefined,
      });
      if (res.data) {
        setProducts(res.data.items || []);
        setTotalCount(res.data.total || 0);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to load products.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, product: Product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDetails = () => {
    handleMenuClose();
    setDetailsOpen(true);
  };

  const handleOpenEdit = () => {
    const prod = selectedProduct;
    handleMenuClose();
    if (prod && onEditProduct) {
      onEditProduct(prod);
    }
  };

  const handleOpenDelete = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    setDeleting(true);
    try {
      await ProductService.deleteProduct(selectedProduct.product_id);
      setDeleteDialogOpen(false);
      if (onProductDeleted) {
        onProductDeleted(`Product "${selectedProduct.product_name}" deleted successfully.`);
      }
      fetchProducts();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete product.";
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusChip = (statusStr: string) => {
    switch (statusStr) {
      case "ACTIVE":
        return <Chip label="ACTIVE" size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 700 }} />;
      case "INACTIVE":
        return <Chip label="INACTIVE" size="small" sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: 700 }} />;
      case "OUTOFSTOCK":
        return <Chip label="OUT OF STOCK" size="small" sx={{ bgcolor: "#ffebee", color: "#c62828", fontWeight: 700 }} />;
      case "DISCONTINUED":
        return <Chip label="DISCONTINUED" size="small" sx={{ bgcolor: "#f5f5f5", color: "#616161", fontWeight: 700 }} />;
      default:
        return <Chip label={statusStr} size="small" />;
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Search & Filter Bar */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          gap={2}
          alignItems="center"
        >
          <TextField
            size="small"
            placeholder="Search by SKU, Product Name, HSN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 260 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: THEME.textSecondary }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            size="small"
            label="Category"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value ? Number(e.target.value) : "");
              setPage(0);
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Status"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
            <MenuItem value="OUTOFSTOCK">OUT OF STOCK</MenuItem>
            <MenuItem value="DISCONTINUED">DISCONTINUED</MenuItem>
          </TextField>

          <Button
            type="submit"
            variant="contained"
            sx={{ bgcolor: THEME.primary, px: 3, height: 40, borderRadius: 1.5 }}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 2, border: `1px solid ${THEME.border}`, overflow: "hidden" }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: `${THEME.border}30` }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: THEME.textPrimary }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 700, color: THEME.textPrimary }}>SKU / Product ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: THEME.textPrimary }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700, color: THEME.textPrimary }}>Price (₹)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: THEME.textPrimary }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: THEME.textPrimary }}>E-Commerce Store</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: THEME.textPrimary }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                  <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary} mt={1}>
                    Loading products...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography fontSize={FONTSIZE.medium} color={THEME.textSecondary}>
                    No products found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              products.map((prod) => {
                const thumb = prod.images && prod.images.length > 0 ? prod.images[0] : "";
                const isStoreReflected = prod.status === "ACTIVE";

                return (
                  <TableRow key={prod.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    {/* Product Name & Image */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          component="img"
                          src={thumb}
                          alt={prod.product_name}
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1.5,
                            objectFit: "cover",
                            border: `1px solid ${THEME.border}`,
                            bgcolor: "#f5f5f5",
                          }}
                          onError={(e: any) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80";
                          }}
                        />
                        <Box>
                          <Typography fontSize={FONTSIZE.medium} fontWeight={600} color={THEME.textPrimary}>
                            {prod.product_name}
                          </Typography>
                          {prod.model_number && (
                            <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>
                              Model: {prod.model_number}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* SKU */}
                    <TableCell>
                      <Typography fontSize={FONTSIZE.small} fontWeight={600} color={THEME.primary}>
                        {prod.product_id}
                      </Typography>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <Typography fontSize={FONTSIZE.small} color={THEME.textPrimary}>
                        {prod.category?.name || "General"}
                      </Typography>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <Typography fontSize={FONTSIZE.medium} fontWeight={700} color={THEME.textPrimary}>
                        ₹{prod.price.toLocaleString("en-IN")}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell>{getStatusChip(prod.status)}</TableCell>

                    {/* E-Commerce Store Badge */}
                    <TableCell>
                      <Chip
                        icon={
                          isStoreReflected ? (
                            <VerifiedIcon style={{ color: "#2e7d32", fontSize: 14 }} />
                          ) : (
                            <StorefrontIcon style={{ color: "#ed6c02", fontSize: 14 }} />
                          )
                        }
                        label={isStoreReflected ? "Reflected on Store" : "Internal / Draft"}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: isStoreReflected ? "#a5d6a7" : "#ffe0b2",
                          bgcolor: isStoreReflected ? "#f1f8e9" : "#fffde7",
                          color: isStoreReflected ? "#2e7d32" : "#e65100",
                          fontWeight: 600,
                          fontSize: FONTSIZE.small,
                        }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, prod)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleOpenDetails}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" color="action" />
          </ListItemIcon>
          <ListItemText primary="View Details" />
        </MenuItem>

        <MenuItem onClick={handleOpenEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Edit Product" />
        </MenuItem>

        <MenuItem onClick={handleOpenDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete Product" />
        </MenuItem>
      </Menu>

      {/* Details Preview Modal */}
      <ProductDetailsModal
        open={detailsOpen}
        product={selectedProduct}
        onClose={() => setDetailsOpen(false)}
        onEdit={(prod) => {
          if (onEditProduct) onEditProduct(prod);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete Product</DialogTitle>
        <DialogContent>
          <Typography fontSize={FONTSIZE.medium} color={THEME.textPrimary}>
            Are you sure you want to delete product <strong>"{selectedProduct?.product_name}"</strong> (SKU: {selectedProduct?.product_id})?
          </Typography>
          <Typography fontSize={FONTSIZE.small} color={THEME.error} mt={1}>
            This action cannot be undone and will remove the product from the inventory and e-commerce catalog.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
