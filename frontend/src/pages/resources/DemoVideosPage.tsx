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
  CardContent,
  Chip,
  InputAdornment,
  MenuItem,
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
  Avatar,
} from "@mui/material";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { CustomInput } from "@/components/Inputs/CustomInput";
import {
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  GetApp as DownloadIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Close as CloseIcon,
  VideoLibrary as VideoLibraryIcon,
  OndemandVideo as OndemandVideoIcon,
} from "@mui/icons-material";

export const DemoVideosPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [filterAvailability, setFilterAvailability] = useState<string>("WITH_VIDEO");
  const [sortBy, setSortBy] = useState<string>("name_asc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);

  // Video Player Modal State
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);
  const [videoProduct, setVideoProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchDemoVideos();
  }, [searchQuery, selectedCategory, filterAvailability]);

  const fetchCategories = async () => {
    try {
      const res = await ProductService.listCategories();
      if (res.data) setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchDemoVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ResourceService.getDemoVideos({
        q: searchQuery.trim() || undefined,
        category_id: selectedCategory !== "ALL" ? parseInt(selectedCategory, 10) : undefined,
        has_video: filterAvailability === "WITH_VIDEO" ? true : filterAvailability === "NO_VIDEO" ? false : undefined,
        limit: 100,
      });
      if (res.data) {
        setProducts(res.data.items || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load demo videos.");
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

  const handleOpenVideoModal = (prod: Product) => {
    setVideoProduct(prod);
    setVideoModalOpen(true);
  };

  const handleDownloadVideo = (prod: Product) => {
    if (prod.demo_video?.url) {
      const link = document.createElement("a");
      link.href = prod.demo_video.url;
      link.download = prod.demo_video.title || `${prod.product_id}_Demo_Video.mp4`;
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
      {/* Top Banner */}
      <Paper elevation={0} sx={{ p: 3.5, mb: 3.5, borderRadius: 3, background: `linear-gradient(135deg, ${THEME.slate900} 0%, ${THEME.slate800} 100%)`, color: THEME.white, display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 2.5, boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.4)" }}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: THEME.red, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(255, 0, 0, 0.4)" }}>
              <PlayIcon sx={{ fontSize: 30, color: THEME.white, ml: 0.3 }} />
            </Box>
            <Typography fontSize={24} fontWeight={800} letterSpacing="-0.5px">
              YouTube-Style Equipment Video Demonstrations
            </Typography>
          </Box>
          <Typography fontSize={14} sx={{ color: "rgba(255, 255, 255, 0.8)", maxWidth: 680 }}>
            Watch high-definition equipment demonstrations, setup video guides, and operating procedure tutorials.
          </Typography>
        </Box>

        {/* Quick Metrics */}
        <Box display="flex" gap={2} flexWrap="wrap">
          <Box sx={{ px: 2.5, py: 1.5, bgcolor: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(8px)", borderRadius: 2.5, border: "1px solid rgba(255, 255, 255, 0.15)", textAlign: "center", minWidth: 120 }}>
            <Typography fontSize={22} fontWeight={800} color={THEME.sky}>
              {products.length}
            </Typography>
            <Typography fontSize={11} sx={{ opacity: 0.85, textTransform: "uppercase", fontWeight: 600 }}>
              Video Demos
            </Typography>
          </Box>

          <Box sx={{ px: 2.5, py: 1.5, bgcolor: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(8px)", borderRadius: 2.5, border: "1px solid rgba(255, 255, 255, 0.15)", textAlign: "center", minWidth: 120 }}>
            <Typography fontSize={22} fontWeight={800} color={THEME.sky}>
              {categories.length}
            </Typography>
            <Typography fontSize={11} sx={{ opacity: 0.85, textTransform: "uppercase", fontWeight: 600 }}>
              Categories
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Filter & Search Bar Card */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 2.5,
          border: `1px solid ${THEME.border}`,
          bgcolor: THEME.white,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search Field */}
          <Grid item xs={12} md={4}>
            <CustomInput
              fullWidth
              size="small"
              placeholder="Search by video title, product name, model..."
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
              label="Demo Video Status"
              value={filterAvailability}
              onChange={(e: any) => setFilterAvailability(e.target.value)}
            >
              <MenuItem value="WITH_VIDEO">With Video Only</MenuItem>
              <MenuItem value="ALL">All Products</MenuItem>
              <MenuItem value="NO_VIDEO">Pending Video</MenuItem>
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
              <ToggleButton value="grid" aria-label="YouTube Grid View">
                <GridViewIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="table" aria-label="Table View">
                <ViewListIcon fontSize="small" />
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
          <CustomButton onClick={fetchDemoVideos} variant="outlined" color="error" sx={{ mt: 2 }}>
            Retry Loading
          </CustomButton>
        </Paper>
      ) : sortedProducts.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: "center", borderRadius: 3, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
          <VideoLibraryIcon sx={{ fontSize: 56, color: THEME.textSecondary, opacity: 0.5, mb: 1.5 }} />
          <Typography fontSize={18} fontWeight={700} color={THEME.textPrimary}>
            No Demo Videos Found
          </Typography>
          <Typography fontSize={14} color={THEME.textSecondary} sx={{ maxW: 460, mx: "auto", mt: 0.5 }}>
            No products matched your search or filter criteria. Try adjusting the search query or category filter.
          </Typography>
          <CustomButton
            variant="outlined"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setFilterAvailability("WITH_VIDEO");
            }}
            sx={{ mt: 2.5, textTransform: "none" }}
          >
            Reset All Filters
          </CustomButton>
        </Paper>
      ) : viewMode === "grid" ? (
        /* YOUTUBE-STYLE VIDEO THUMBNAIL GRID */
        <Grid container spacing={3}>
          {sortedProducts.map((product) => {
            const hasVideo = Boolean(product.demo_video?.url);
            const coverImg = product.images?.[0] || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";

            return (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    overflow: "hidden",
                    border: `1px solid ${THEME.border}`,
                    bgcolor: THEME.white,
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      boxShadow: "0 14px 28px -6px rgba(0, 0, 0, 0.12)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  {/* YouTube 16:9 Widescreen Thumbnail Box */}
                  <Box
                    position="relative"
                    sx={{
                      width: "100%",
                      aspectRatio: "16 / 9",
                      bgcolor: THEME.black,
                      overflow: "hidden",
                      cursor: hasVideo ? "pointer" : "default",
                      "&:hover .yt-thumb-img": {
                        transform: "scale(1.05)",
                        opacity: 0.9,
                      },
                      "&:hover .yt-play-btn": {
                        transform: "translate(-50%, -50%) scale(1.15)",
                        bgcolor: THEME.red,
                      },
                    }}
                    onClick={() => hasVideo && handleOpenVideoModal(product)}
                  >
                    <Box
                      component="img"
                      className="yt-thumb-img"
                      src={coverImg}
                      alt={product.product_name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: hasVideo ? 0.85 : 0.4,
                        transition: "all 0.3s ease",
                      }}
                      onError={(e: any) => {
                        e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";
                      }}
                    />

                    {/* Top-Left Category Tag */}
                    <Chip
                      label={product.category?.name || "General"}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        bgcolor: "rgba(15, 23, 42, 0.8)",
                        color: THEME.white,
                        backdropFilter: "blur(6px)",
                        fontWeight: 700,
                        fontSize: 10,
                        height: 22,
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                    />

                    {/* Bottom-Right YouTube Time/Quality Pill */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        bgcolor: "rgba(0, 0, 0, 0.85)",
                        color: THEME.white,
                        px: 1,
                        py: 0.3,
                        borderRadius: 1,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: "0.5px",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {hasVideo ? "04:15 • HD 1080p" : "NO VIDEO"}
                    </Box>

                    {/* Center YouTube Play Button Overlay */}
                    {hasVideo && (
                      <Box
                        className="yt-play-btn"
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 58,
                          height: 58,
                          borderRadius: "50%",
                          bgcolor: "rgba(255, 0, 0, 0.9)",
                          color: THEME.white,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 6px 20px rgba(255, 0, 0, 0.5)",
                          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        <PlayIcon sx={{ fontSize: 34, ml: 0.3 }} />
                      </Box>
                    )}
                  </Box>

                  {/* YouTube Card Info Details */}
                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Box display="flex" gap={1.5} alignItems="flex-start">
                      {/* Brand Avatar */}
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: THEME.blue800,
                          fontSize: 14,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        K
                      </Avatar>

                      {/* Video Title & Model */}
                      <Box flex={1} overflow="hidden">
                        <Typography
                          fontSize={14}
                          fontWeight={800}
                          color={THEME.textPrimary}
                          lineHeight={1.3}
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {product.demo_video?.title || `${product.product_name} Demo Setup`}
                        </Typography>

                        <Typography fontSize={12} color={THEME.textSecondary} mt={0.5} noWrap>
                          Kitrivo Official Demo • SKU: <strong>{product.product_id}</strong>
                        </Typography>
                        {product.model_number && (
                          <Typography fontSize={11} color={THEME.textSecondary}>
                            Model: {product.model_number}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Action Bar */}
                    <Box mt="auto" pt={1.5} display="flex" gap={1} flexWrap="wrap">
                      {hasVideo ? (
                        <>
                          <CustomButton
                            size="small"
                            variant="contained"
                            startIcon={<PlayIcon />}
                            onClick={() => handleOpenVideoModal(product)}
                            sx={{
                              flex: 1,
                              minWidth: 120,
                              bgcolor: THEME.red,
                              "&:hover": { bgcolor: THEME.redDark },
                              borderRadius: 1.5,
                              textTransform: "none",
                              fontSize: 12,
                              fontWeight: 700,
                              boxShadow: "0 4px 10px rgba(255, 0, 0, 0.25)",
                            }}
                          >
                            Watch Video
                          </CustomButton>

                          <CustomButton
                            size="small"
                            variant="outlined"
                            startIcon={<DownloadIcon fontSize="small" />}
                            onClick={() => handleDownloadVideo(product)}
                            sx={{
                              borderRadius: 1.5,
                              textTransform: "none",
                              fontSize: 12,
                              fontWeight: 600,
                              borderColor: THEME.border,
                              color: THEME.textPrimary,
                            }}
                          >
                            MP4
                          </CustomButton>
                        </>
                      ) : (
                        <Typography fontSize={11} color={THEME.textSecondary}>
                          No video stream attached yet.
                        </Typography>
                      )}

                      <CustomButton
                        size="small"
                        variant="text"
                        onClick={() => handleOpenProductDetail(product)}
                        sx={{
                          borderRadius: 1.5,
                          textTransform: "none",
                          fontSize: 11,
                          fontWeight: 600,
                          color: THEME.textSecondary,
                          width: hasVideo ? "100%" : "auto",
                        }}
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
      ) : (
        /* TABLE VIEW */
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: `1px solid ${THEME.border}`, overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ bgcolor: THEME.slate100 }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: THEME.textPrimary, py: 2 }}>Product & Equipment SKU</TableCell>
                <TableCell sx={{ fontWeight: 800, color: THEME.textPrimary }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 800, color: THEME.textPrimary }}>Demo Video Title</TableCell>
                <TableCell sx={{ fontWeight: 800, color: THEME.textPrimary }}>Format & Quality</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: THEME.textPrimary, pr: 3 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedProducts.map((product) => {
                const hasVideo = Boolean(product.demo_video?.url);
                return (
                  <TableRow key={product.id} hover sx={{ "&:hover": { bgcolor: THEME.slate50 } }}>
                    <TableCell sx={{ py: 2 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          component="img"
                          src={product.images?.[0] || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80"}
                          alt={product.product_name}
                          sx={{ width: 54, height: 54, borderRadius: 2, objectFit: "cover", bgcolor: THEME.slate100, border: `1px solid ${THEME.border}` }}
                        />
                        <Box>
                          <Typography fontSize={14} fontWeight={700} color={THEME.textPrimary}>
                            {product.product_name}
                          </Typography>
                          <Typography fontSize={11} color={THEME.textSecondary}>
                            SKU: {product.product_id} {product.model_number ? `| Model: ${product.model_number}` : ""}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip label={product.category?.name || "General"} size="small" variant="outlined" sx={{ fontSize: 11, fontWeight: 600 }} />
                    </TableCell>

                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.2}>
                        <OndemandVideoIcon sx={{ color: hasVideo ? THEME.red : THEME.textSecondary, fontSize: 22 }} />
                        <Box>
                          <Typography fontSize={13} fontWeight={700} color={hasVideo ? THEME.textPrimary : THEME.textSecondary}>
                            {product.demo_video?.title || "No Demo Video Attached"}
                          </Typography>
                          <Typography fontSize={11} color={THEME.textSecondary}>
                            {hasVideo ? "Official Video Demonstration" : "Pending Video Upload"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={hasVideo ? "MP4 • 1080p HD" : "Not Available"}
                        size="small"
                        color={hasVideo ? "primary" : "default"}
                        sx={{ fontSize: 11, fontWeight: 700 }}
                      />
                    </TableCell>

                    <TableCell align="right" sx={{ pr: 3 }}>
                      <Box display="flex" justifyContent="flex-end" gap={1}>
                        {hasVideo && (
                          <>
                            <CustomButton
                              size="small"
                              variant="contained"
                              startIcon={<PlayIcon fontSize="small" />}
                              onClick={() => handleOpenVideoModal(product)}
                              sx={{ bgcolor: THEME.red, "&:hover": { bgcolor: THEME.redDark }, textTransform: "none", fontSize: 12, borderRadius: 1.5, fontWeight: 700, px: 2 }}
                            >
                              Watch
                            </CustomButton>
                            <CustomButton
                              size="small"
                              variant="outlined"
                              startIcon={<DownloadIcon fontSize="small" />}
                              onClick={() => handleDownloadVideo(product)}
                              sx={{ textTransform: "none", fontSize: 12, borderRadius: 1.5, fontWeight: 600, px: 2 }}
                            >
                              Download
                            </CustomButton>
                          </>
                        )}
                        <CustomButton
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenProductDetail(product)}
                          sx={{ textTransform: "none", fontSize: 12, borderRadius: 1.5, color: THEME.textSecondary, borderColor: THEME.border }}
                        >
                          Details
                        </CustomButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* RICH YOUTUBE-STYLE VIDEO PLAYER MODAL */}
      <Dialog
        open={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: THEME.slate900, color: THEME.white, overflow: "hidden" } }}
      >
        <DialogTitle
          sx={{
            p: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            bgcolor: THEME.slate900,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: THEME.red,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PlayIcon sx={{ fontSize: 22, color: THEME.white, ml: 0.2 }} />
            </Box>
            <Box>
              <Typography fontSize={16} fontWeight={700} color={THEME.white}>
                {videoProduct?.demo_video?.title || "Equipment Demo Video"}
              </Typography>
              <Typography fontSize={12} color={THEME.slate400}>
                Product: {videoProduct?.product_name} ({videoProduct?.product_id})
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {videoProduct?.demo_video?.url && (
              <CustomButton
                size="small"
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadVideo(videoProduct)}
                sx={{ bgcolor: THEME.red, "&:hover": { bgcolor: THEME.redDark }, borderRadius: 1.5, textTransform: "none", fontSize: 12, fontWeight: 700 }}
              >
                Download MP4
              </CustomButton>
            )}
            <IconButton onClick={() => setVideoModalOpen(false)} size="small" sx={{ color: THEME.slate400 }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, bgcolor: THEME.black, display: "flex", justifyContent: "center", alignItems: "center" }}>
          {videoProduct?.demo_video?.url ? (
            <Box sx={{ width: "100%", maxH: 520, bgcolor: THEME.black }}>
              <video
                controls
                autoPlay
                src={videoProduct.demo_video.url}
                style={{ width: "100%", maxHeight: 520, display: "block", outline: "none" }}
              >
                Your browser does not support HTML5 video playback.
              </video>
            </Box>
          ) : (
            <Box p={6} textAlign="center">
              <Typography color={THEME.slate400}>Video stream unavailable.</Typography>
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

export default DemoVideosPage;
