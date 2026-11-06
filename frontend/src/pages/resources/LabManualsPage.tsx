import React, { useEffect, useState } from "react";
import type { Product, ProductCategory } from "@/models/product.models";
import { ResourceService } from "@/services/resources.service";
import { ProductService } from "@/services/products.service";
import { THEME } from "@/assets/theme";
import { ClientProductDetailModal } from "@/pages/showcase/ClientProductDetailModal";
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
  Menu,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { CustomInput } from "@/components/Inputs/CustomInput";
import {
  Search as SearchIcon,
  MenuBook as MenuBookIcon,
  Visibility as VisibilityIcon,
  GetApp as DownloadIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Close as CloseIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";

export const LabManualsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [filterAvailability, setFilterAvailability] = useState<string>("WITH_MANUAL");
  const [sortBy, setSortBy] = useState<string>("name_asc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);

  // PDF Preview Modal State
  const [pdfPreviewModalOpen, setPdfPreviewModalOpen] = useState<boolean>(false);
  const [pdfPreviewProduct, setPdfPreviewProduct] = useState<Product | null>(null);

  // Ellipsis Actions Menu State
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [actionMenuProduct, setActionMenuProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchLabManuals();
  }, [searchQuery, selectedCategory, filterAvailability]);

  const fetchCategories = async () => {
    try {
      const res = await ProductService.listCategories();
      if (res.data) setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchLabManuals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ResourceService.getLabManuals({
        q: searchQuery.trim() || undefined,
        category_id: selectedCategory !== "ALL" ? parseInt(selectedCategory, 10) : undefined,
        has_manual: filterAvailability === "WITH_MANUAL" ? true : filterAvailability === "NO_MANUAL" ? false : undefined,
        limit: 100,
      });
      if (res.data) {
        setProducts(res.data.items || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load lab manuals.");
    } finally {
      setLoading(false);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "name_asc") return a.product_name.localeCompare(b.product_name);
    if (sortBy === "name_desc") return b.product_name.localeCompare(a.product_name);
    if (sortBy === "model") return (a.model_number || "").localeCompare(b.model_number || "");
    return 0;
  });

  const handleOpenActionMenu = (event: React.MouseEvent<HTMLElement>, prod: Product) => {
    setActionMenuAnchorEl(event.currentTarget);
    setActionMenuProduct(prod);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchorEl(null);
    setActionMenuProduct(null);
  };

  const handleOpenPdfPreview = (prod: Product) => {
    setPdfPreviewProduct(prod);
    setPdfPreviewModalOpen(true);
  };

  const handleDownloadManual = (prod: Product) => {
    if (prod.lab_manual?.url) {
      const link = document.createElement("a");
      link.href = prod.lab_manual.url;
      link.download = prod.lab_manual.title || `${prod.product_id}_Lab_Manual.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenProductDetail = (prod: Product) => {
    setSelectedProduct(prod);
    setDetailModalOpen(true);
  };

  return (
    <Box p={3.5} sx={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Header Banner */}
      <Paper elevation={0} sx={{ p: 3.5, mb: 3.5, borderRadius: 3, background: `linear-gradient(135deg, ${THEME.blue800} 0%, ${THEME.primary} 100%)`, color: THEME.white, display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 2.5, boxShadow: "0 10px 25px -5px rgba(30, 64, 175, 0.25)" }}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: "rgba(255, 255, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
              <MenuBookIcon sx={{ fontSize: 26, color: THEME.white }} />
            </Box>
            <Typography fontSize={24} fontWeight={800} letterSpacing="-0.5px">
              Product Lab Manuals & Technical Guides
            </Typography>
          </Box>
          <Typography fontSize={14} sx={{ color: "rgba(255, 255, 255, 0.85)", maxWidth: 680 }}>
            List view catalog of practical experiment lab manuals, operating procedures, and technical documentation
            for equipment & trainer kits.
          </Typography>
        </Box>

        {/* Quick Metrics */}
        <Box display="flex" gap={2} flexWrap="wrap">
          <Box sx={{ px: 2.5, py: 1.5, bgcolor: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(8px)", borderRadius: 2.5, border: "1px solid rgba(255, 255, 255, 0.2)", textAlign: "center", minWidth: 120 }}>
            <Typography fontSize={22} fontWeight={800}>
              {products.length}
            </Typography>
            <Typography fontSize={11} sx={{ opacity: 0.85, textTransform: "uppercase", fontWeight: 600 }}>
              Manual Entries
            </Typography>
          </Box>

          <Box sx={{ px: 2.5, py: 1.5, bgcolor: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(8px)", borderRadius: 2.5, border: "1px solid rgba(255, 255, 255, 0.2)", textAlign: "center", minWidth: 120 }}>
            <Typography fontSize={22} fontWeight={800}>
              {categories.length}
            </Typography>
            <Typography fontSize={11} sx={{ opacity: 0.85, textTransform: "uppercase", fontWeight: 600 }}>
              Categories
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Filter & Search Bar Card */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2.5, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search Field */}
          <Grid item xs={12} md={4}>
            <CustomInput
              fullWidth
              size="small"
              placeholder="Search by manual title, product name, model..."
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: THEME.textSecondary, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Category Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <CustomInput
              fullWidth
              select
              size="small"
              label="Product Category"
              value={selectedCategory}
              onChange={(e: any) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </MenuItem>
              ))}
            </CustomInput>
          </Grid>

          {/* Availability Filter */}
          <Grid item xs={12} sm={6} md={2.5}>
            <CustomInput
              fullWidth
              select
              size="small"
              label="Manual Status"
              value={filterAvailability}
              onChange={(e: any) => setFilterAvailability(e.target.value)}
            >
              <MenuItem value="WITH_MANUAL">With Lab Manual Only</MenuItem>
              <MenuItem value="ALL">All Products</MenuItem>
              <MenuItem value="NO_MANUAL">Pending Manual</MenuItem>
            </CustomInput>
          </Grid>

          {/* Sort By */}
          <Grid item xs={8} sm={4} md={1.5}>
            <CustomInput
              fullWidth
              select
              size="small"
              label="Sort By"
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
            >
              <MenuItem value="name_asc">Name (A-Z)</MenuItem>
              <MenuItem value="name_desc">Name (Z-A)</MenuItem>
              <MenuItem value="model">Model No.</MenuItem>
            </CustomInput>
          </Grid>

          {/* View Mode Toggle */}
          <Grid item xs={4} sm={2} md={1} display="flex" justifyContent="flex-end">
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, next) => next && setViewMode(next)}
            >
              <ToggleButton value="table" aria-label="List View">
                <ViewListIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="grid" aria-label="Grid View">
                <GridViewIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content Area */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={10}>
          <CircularProgress size={44} />
        </Box>
      ) : error ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: 2, bgcolor: THEME.redLight, border: `1px solid ${THEME.redLight}` }}>
          <Typography color="error" fontWeight={600}>
            {error}
          </Typography>
          <CustomButton onClick={fetchLabManuals} variant="outlined" color="error" sx={{ mt: 2 }}>
            Retry Loading
          </CustomButton>
        </Paper>
      ) : sortedProducts.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: "center", borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
          <MenuBookIcon sx={{ fontSize: 56, color: THEME.textSecondary, opacity: 0.5, mb: 1.5 }} />
          <Typography fontSize={18} fontWeight={700} color={THEME.textPrimary}>
            No Lab Manuals Found
          </Typography>
          <Typography fontSize={14} color={THEME.textSecondary} sx={{ maxW: 460, mx: "auto", mt: 0.5 }}>
            No products matched your search or filter criteria. Try adjusting the search query or category filter.
          </Typography>
          <CustomButton
            variant="outlined"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setFilterAvailability("WITH_MANUAL");
            }}
            sx={{ mt: 2.5, textTransform: "none" }}
          >
            Reset All Filters
          </CustomButton>
        </Paper>
      ) : viewMode === "table" ? (
        /* LIST (TABLE) VIEW - ONLY PRODUCT NAME, LAB MANUAL NAME, AND ELLIPSIS ACTIONS */
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: `1px solid ${THEME.border}`, overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ bgcolor: THEME.slate100 }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: THEME.textPrimary, py: 2 }}>Product Name</TableCell>
                <TableCell sx={{ fontWeight: 800, color: THEME.textPrimary }}>Lab Manual Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: THEME.textPrimary, pr: 3 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedProducts.map((product) => {
                const hasManual = Boolean(product.lab_manual?.url);
                return (
                  <TableRow
                    key={product.id}
                    hover
                    sx={{
                      transition: "all 0.15s ease",
                      "&:hover": { bgcolor: THEME.slate50 },
                    }}
                  >
                    {/* 1. Product Name */}
                    <TableCell sx={{ py: 2 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          component="img"
                          src={product.images?.[0] || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80"}
                          alt={product.product_name}
                          sx={{ width: 48, height: 48, borderRadius: 2, objectFit: "cover", bgcolor: THEME.slate100, border: `1px solid ${THEME.border}` }}
                        />
                        <Box>
                          <Typography fontSize={14} fontWeight={700} color={THEME.textPrimary}>
                            {product.product_name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} mt={0.3}>
                            <Chip
                              label={product.product_id}
                              size="small"
                              sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: THEME.blueLight, color: THEME.primary }}
                            />
                            {product.model_number && (
                              <Typography fontSize={12} color={THEME.textSecondary}>
                                Model: <strong>{product.model_number}</strong>
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* 2. Lab Manual Name */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.2}>
                        <PictureAsPdfIcon sx={{ color: hasManual ? THEME.emerald : THEME.textSecondary, fontSize: 22 }} />
                        <Box>
                          <Typography fontSize={13} fontWeight={700} color={hasManual ? THEME.textPrimary : THEME.textSecondary}>
                            {product.lab_manual?.title || "No Lab Manual Attached"}
                          </Typography>
                          {hasManual && (
                            <Typography fontSize={11} color={THEME.emerald} fontWeight={600}>
                              PDF Document Available
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* 3. Actions Ellipsis Button */}
                    <TableCell align="right" sx={{ pr: 3 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenActionMenu(e, product)}
                        sx={{
                          color: THEME.textSecondary,
                          "&:hover": { bgcolor: `${THEME.primary}15`, color: THEME.primary },
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        /* GRID VIEW */
        <Grid container spacing={3}>
          {sortedProducts.map((product) => {
            const hasManual = Boolean(product.lab_manual?.url);
            const coverImg = product.images?.[0] || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80";

            return (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2.5,
                    border: `1px solid ${hasManual ? THEME.border : THEME.redLight}`,
                    bgcolor: THEME.white,
                    transition: "all 0.25s ease",
                    "&:hover": {
                      boxShadow: "0 12px 24px -6px rgba(0, 0, 0, 0.08)",
                      transform: "translateY(-3px)",
                      borderColor: hasManual ? THEME.primary : THEME.redLight,
                    },
                  }}
                >
                  <Box position="relative" sx={{ height: 170, bgcolor: THEME.slate50, overflow: "hidden" }}>
                    <CardMedia
                      component="img"
                      image={coverImg}
                      alt={product.product_name}
                      sx={{ height: "100%", width: "100%", objectFit: "contain", p: 1.5 }}
                    />
                    <Chip
                      label={hasManual ? "PDF Manual" : "Pending"}
                      size="small"
                      color={hasManual ? "success" : "default"}
                      sx={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        fontWeight: 700,
                        fontSize: 10,
                      }}
                    />
                  </Box>

                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Box>
                      <Typography fontSize={11} fontWeight={700} color={THEME.primary} letterSpacing="0.5px">
                        {product.product_id} {product.model_number ? `| Model: ${product.model_number}` : ""}
                      </Typography>
                      <Typography fontSize={15} fontWeight={700} color={THEME.textPrimary} lineHeight={1.3} mt={0.3}>
                        {product.product_name}
                      </Typography>
                    </Box>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: hasManual ? THEME.emeraldLight : THEME.slate50,
                        border: `1px solid ${hasManual ? THEME.emeraldLight : THEME.border}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                      }}
                    >
                      <PictureAsPdfIcon sx={{ color: hasManual ? THEME.emerald : THEME.textSecondary, fontSize: 24 }} />
                      <Box flex={1} overflow="hidden">
                        <Typography fontSize={12} fontWeight={700} color={THEME.textPrimary} noWrap>
                          {product.lab_manual?.title || "Standard Lab Manual"}
                        </Typography>
                        <Typography fontSize={10} color={THEME.textSecondary}>
                          {hasManual ? "Format: PDF Practical Guide" : "No lab manual attached yet"}
                        </Typography>
                      </Box>
                    </Paper>

                    <Box mt="auto" pt={1.5} display="flex" gap={1} flexWrap="wrap">
                      {hasManual && (
                        <>
                          <CustomButton
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon fontSize="small" />}
                            onClick={() => handleOpenPdfPreview(product)}
                            sx={{ flex: 1, minWidth: 100, borderRadius: 1.5, textTransform: "none", fontSize: 12, fontWeight: 600, borderColor: THEME.emerald, color: THEME.emerald }}
                          >
                            View
                          </CustomButton>
                          <CustomButton
                            size="small"
                            variant="contained"
                            startIcon={<DownloadIcon fontSize="small" />}
                            onClick={() => handleDownloadManual(product)}
                            sx={{ flex: 1, minWidth: 110, bgcolor: THEME.emerald, "&:hover": { bgcolor: THEME.emeraldDark }, borderRadius: 1.5, textTransform: "none", fontSize: 12, fontWeight: 600 }}
                          >
                            Download
                          </CustomButton>
                        </>
                      )}
                      <CustomButton
                        size="small"
                        variant="text"
                        onClick={() => handleOpenProductDetail(product)}
                        sx={{ borderRadius: 1.5, textTransform: "none", fontSize: 11, fontWeight: 600, color: THEME.textSecondary, width: hasManual ? "100%" : "auto" }}
                      >
                        Product Details
                      </CustomButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ELLIPSIS ACTIONS DROPDOWN MENU */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleCloseActionMenu}
        elevation={4}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            minWidth: 180,
            borderRadius: 2.5,
            p: 0.5,
            border: `1px solid ${THEME.border}`,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        {actionMenuProduct?.lab_manual?.url && (
          <MenuItem
            onClick={() => {
              if (actionMenuProduct) handleOpenPdfPreview(actionMenuProduct);
              handleCloseActionMenu();
            }}
            sx={{ gap: 1.5, fontSize: 13, fontWeight: 600, color: THEME.emerald, borderRadius: 1.5, py: 1 }}
          >
            <VisibilityIcon fontSize="small" />
            View PDF Manual
          </MenuItem>
        )}
        {actionMenuProduct?.lab_manual?.url && (
          <MenuItem
            onClick={() => {
              if (actionMenuProduct) handleDownloadManual(actionMenuProduct);
              handleCloseActionMenu();
            }}
            sx={{ gap: 1.5, fontSize: 13, fontWeight: 600, color: THEME.emerald, borderRadius: 1.5, py: 1 }}
          >
            <DownloadIcon fontSize="small" />
            Download PDF
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            if (actionMenuProduct) handleOpenProductDetail(actionMenuProduct);
            handleCloseActionMenu();
          }}
          sx={{ gap: 1.5, fontSize: 13, fontWeight: 600, color: THEME.textPrimary, borderRadius: 1.5, py: 1 }}
        >
          <InfoIcon fontSize="small" />
          Product Details
        </MenuItem>
      </Menu>

      {/* PDF PREVIEW MODAL */}
      <Dialog
        open={pdfPreviewModalOpen}
        onClose={() => setPdfPreviewModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, minHeight: 620 } }}
      >
        <DialogTitle
          sx={{
            p: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${THEME.border}`,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <PictureAsPdfIcon sx={{ color: THEME.emerald, fontSize: 28 }} />
            <Box>
              <Typography fontSize={16} fontWeight={700} color={THEME.textPrimary}>
                {pdfPreviewProduct?.lab_manual?.title || "Lab Manual Preview"}
              </Typography>
              <Typography fontSize={12} color={THEME.textSecondary}>
                Product: {pdfPreviewProduct?.product_name} ({pdfPreviewProduct?.product_id})
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {pdfPreviewProduct?.lab_manual?.url && (
              <CustomButton
                size="small"
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadManual(pdfPreviewProduct)}
                sx={{ bgcolor: THEME.emerald, "&:hover": { bgcolor: THEME.emeraldDark }, borderRadius: 1.5, textTransform: "none", fontSize: 12 }}
              >
                Download PDF
              </CustomButton>
            )}
            <IconButton onClick={() => setPdfPreviewModalOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, bgcolor: THEME.slate50, display: "flex", flexDirection: "column" }}>
          {pdfPreviewProduct?.lab_manual?.url ? (
            <Box sx={{ width: "100%", height: 560, border: "none" }}>
              <iframe
                src={pdfPreviewProduct.lab_manual.url}
                title="Lab Manual PDF Preview"
                width="100%"
                height="100%"
                style={{ border: "none" }}
              />
            </Box>
          ) : (
            <Box p={6} textAlign="center">
              <Typography color={THEME.textSecondary}>PDF preview unavailable.</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* CLIENT PRODUCT DETAIL MODAL */}
      <ClientProductDetailModal
        open={detailModalOpen}
        product={selectedProduct}
        onClose={() => setDetailModalOpen(false)}
      />
    </Box>
  );
};

export default LabManualsPage;
