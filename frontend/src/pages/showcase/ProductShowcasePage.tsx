import React, { useEffect, useState } from "react";
import type { Product, ProductCategory } from "@/models/product.models";
import { ProductService } from "@/services/products.service";
import { FONTSIZE, THEME } from "@/assets/theme";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Paper,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { CustomInput } from "@/components/Inputs/CustomInput";
import {
  Search as SearchIcon,
  Storefront as StorefrontIcon,
  Description as DescriptionIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useCartStore } from "@/store/useCartStore";
import { ClientProductDetailModal } from "./ClientProductDetailModal";

export const ProductShowcasePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Sort state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

  // Toast State
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>("");

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await ProductService.listCategories();
      if (res.data) setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ProductService.getProducts({ limit: 100 });
      if (res.data) {
        setProducts(res.data.items || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load product showcase.");
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter((prod) => {
    return (
      !searchQuery.trim() ||
      prod.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.product_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.model_number && prod.model_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "name_asc") return a.product_name.localeCompare(b.product_name);
    return 0;
  });

  const handleOpenDetail = (prod: Product) => {
    setSelectedProduct(prod);
    setDetailsOpen(true);
  };

  const handleQuickInquire = (e: React.MouseEvent, prod: Product) => {
    e.stopPropagation();
    useCartStore.getState().addItem(prod);
    setToastMsg(`Product "${prod.product_name}" added to your Inquiry Cart!`);
    setToastOpen(true);
  };


  return (
    <Box p={3}>
      {/* Header Banner */}
      <Paper elevation={0} sx={{ p: 3.5, mb: 3, borderRadius: 3, background: `linear-gradient(135deg, ${THEME.primary} 0%, #1e3a8a 100%)`, color: THEME.white, boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.3)" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box maxWidth={700}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <StorefrontIcon sx={{ fontSize: 28, color: "#93c5fd" }} />
              <Typography fontSize={12} fontWeight={700} letterSpacing={1.2} textTransform="uppercase" color="#93c5fd">
                Client Showcase & Catalog
              </Typography>
            </Box>
            <Typography fontSize="1.75rem" fontWeight={800} lineHeight={1.2} mb={1}>
              Product Showcase & Equipment Catalog
            </Typography>
            <Typography sx={{ fontSize: FONTSIZE.medium, opacity: 0.9, lineHeight: 1.5 }}>
              Browse our official collection of digital IC trainers, precision signal generators, and advanced electronic test instruments.
            </Typography>
          </Box>

          <Box display="flex" gap={2} bgcolor="rgba(255, 255, 255, 0.1)" p={2} borderRadius={2.5} sx={{ backdropFilter: "blur(8px)" }}>
            <Box textAlign="center" px={1.5}>
              <Typography fontSize={22} fontWeight={800}>{products.length}</Typography>
              <Typography sx={{ fontSize: 11, opacity: 0.8 }}>Products</Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
            <Box textAlign="center" px={1.5}>
              <Typography fontSize={22} fontWeight={800}>{categories.length}</Typography>
              <Typography sx={{ fontSize: 11, opacity: 0.8 }}>Categories</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Search & Sort Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2.5, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
        <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} alignItems="center" justifyContent="space-between">
          <CustomInput
            size="small"
            placeholder="Search products by title, SKU, model number..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: THEME.textSecondary }} />
                </InputAdornment>
              ),
            }}
          />

          <CustomInput
            select
            size="small"
            label="Sort By"
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="featured">Featured / Default</MenuItem>
            <MenuItem value="price_asc">Price: Low to High</MenuItem>
            <MenuItem value="price_desc">Price: High to Low</MenuItem>
            <MenuItem value="name_asc">Name: A to Z</MenuItem>
          </CustomInput>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Product Cards Grid */}
      {loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <CircularProgress size={40} color="primary" />
          <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary} mt={2}>
            Loading product showcase catalog...
          </Typography>
        </Box>
      ) : sortedProducts.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: "center", borderRadius: 3, border: `1px solid ${THEME.border}` }}>
          <Typography fontSize={FONTSIZE.large} fontWeight={700} color={THEME.textPrimary}>
            No products match your criteria
          </Typography>
          <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary} mt={1}>
            Try clearing filters or search for another keyword.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {sortedProducts.map((prod) => {
            const thumbnail = prod.images && prod.images.length > 0 ? prod.images[0] : "";
            const firstTwoSpecs = Object.entries(prod.specifications || {}).slice(0, 2);

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={prod.id}>
                <Card elevation={0} onClick={() => handleOpenDetail(prod)} sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 2.5, border: `1px solid ${THEME.border}`, transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)", cursor: "pointer", overflow: "hidden", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.08)", borderColor: THEME.primary } }}>
                  {/* Image Container */}
                  <Box position="relative" bgcolor="#f8fafc" height={150}>
                    <CardMedia
                      component="img"
                      height="150"
                      image={thumbnail}
                      alt={prod.product_name}
                      sx={{ objectFit: "cover" }}
                      onError={(e: any) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                    <Box
                      position="absolute"
                      top={8}
                      left={8}
                      display="flex"
                      gap={0.5}
                    >
                      <Chip
                        label={prod.category?.name || "General"}
                        size="small"
                        sx={{ bgcolor: "rgba(255,255,255,0.92)", fontWeight: 700, fontSize: 10, height: 20, backdropFilter: "blur(4px)" }}
                      />
                    </Box>
                    <Box position="absolute" top={8} right={8}>
                      <Chip
                        label={prod.product_id}
                        size="small"
                        sx={{ bgcolor: THEME.primary, color: THEME.white, fontWeight: 700, fontSize: 10, height: 20 }}
                      />
                    </Box>
                  </Box>

                  {/* Card Content */}
                  <CardContent sx={{ p: 1.75, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", "&:last-child": { pb: 1.75 } }}>
                    <Box>
                      <Typography fontSize="0.95rem" fontWeight={700} color={THEME.textPrimary} mb={0.25} lineHeight={1.3} noWrap title={prod.product_name}>
                        {prod.product_name}
                      </Typography>

                      {prod.model_number && (
                        <Typography fontSize="0.8rem" color={THEME.textSecondary} mb={1}>
                          Model: <strong>{prod.model_number}</strong>
                        </Typography>
                      )}

                      {/* Specs Snippets */}
                      {firstTwoSpecs.length > 0 && (
                        <Box display="flex" flexDirection="column" gap={0.25} mb={1}>
                          {firstTwoSpecs.map(([k, v]) => (
                            <Typography key={k} fontSize={11} color={THEME.textSecondary} noWrap>
                              • <strong>{k}:</strong> {String(v)}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </Box>

                    {/* Price & Actions */}
                    <Box>
                      <Divider sx={{ my: 1 }} />

                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Box>
                          <Typography fontSize={10} color={THEME.textSecondary}>Price</Typography>
                          <Typography fontSize="1.1rem" fontWeight={800} color={THEME.primary}>
                            ₹{prod.price.toLocaleString("en-IN")}
                          </Typography>
                        </Box>

                        {prod.catalog_document && (
                          <Chip
                            icon={<DescriptionIcon style={{ fontSize: 11 }} />}
                            label="Datasheet"
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: 9, borderColor: `${THEME.primary}40`, color: THEME.primary }}
                          />
                        )}
                      </Box>

                      <Box display="flex">
                        <CustomButton
                          fullWidth
                          size="small"
                          variant="contained"
                          startIcon={<ShoppingCartIcon sx={{ fontSize: "0.9rem !important" }} />}
                          onClick={(e: any) => handleQuickInquire(e, prod)}
                          sx={{ bgcolor: THEME.primary, borderRadius: 1.5, textTransform: "none", fontWeight: 700, fontSize: "0.8rem", py: 0.75 }}
                        >
                          Inquire
                        </CustomButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Product Detail Modal */}
      <ClientProductDetailModal
        open={detailsOpen}
        product={selectedProduct}
        onClose={() => setDetailsOpen(false)}
      />

      {/* Toast Notification */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="info"
          icon={<CheckCircleIcon fontSize="inherit" />}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductShowcasePage;
