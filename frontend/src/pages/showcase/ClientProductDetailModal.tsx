import React, { useState } from "react";
import type { Product } from "@/models/product.models";
import { FONTSIZE, THEME } from "@/assets/theme";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  IconButton,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  Verified as VerifiedIcon,
  Category as CategoryIcon,
  Sell as SellIcon,
  Memory as MemoryIcon,
  LocalShipping as LocalShippingIcon,
  Description as DescriptionIcon,
  ShoppingCart as ShoppingCartIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

interface ClientProductDetailModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}

export const ClientProductDetailModal: React.FC<ClientProductDetailModalProps> = ({
  open,
  product,
  onClose,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [];

  const handleActionClick = (actionName: string) => {
    setToastMessage(`"${actionName}" feature will be available in future releases!`);
    setToastOpen(true);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            m: 0,
            p: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: THEME.white,
            borderBottom: `1px solid ${THEME.border}`,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography fontSize={FONTSIZE.large} fontWeight={700} color={THEME.textPrimary}>
              Product Specification & Client Overview
            </Typography>
            <Chip
              label={product.product_id}
              size="small"
              sx={{ bgcolor: `${THEME.primary}15`, color: THEME.primary, fontWeight: 700 }}
            />
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: THEME.textSecondary }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: "#fafafa" }}>
          {/* Top Section: Gallery & Quick Info */}
          <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={3} mb={3}>
            {/* Gallery Section */}
            <Box flex={1} display="flex" flexDirection="column" gap={1.5}>
              <Paper
                elevation={0}
                sx={{
                  width: "100%",
                  height: 280,
                  borderRadius: 2.5,
                  overflow: "hidden",
                  border: `1px solid ${THEME.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: THEME.white,
                  position: "relative",
                }}
              >
                {images.length > 0 ? (
                  <Box
                    component="img"
                    src={images[selectedImageIndex] || images[0]}
                    alt={product.product_name}
                    sx={{ width: "100%", height: "100%", objectFit: "contain", p: 1 }}
                    onError={(e: any) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80";
                    }}
                  />
                ) : (
                  <Typography color={THEME.textSecondary}>No Image Preview Available</Typography>
                )}
              </Paper>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <Box display="flex" gap={1} sx={{ overflowX: "auto", py: 0.5 }}>
                  {images.map((img, idx) => (
                    <Box
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        border: `2px solid ${
                          selectedImageIndex === idx ? THEME.primary : THEME.border
                        }`,
                        cursor: "pointer",
                        overflow: "hidden",
                        bgcolor: THEME.white,
                        flexShrink: 0,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Box
                        component="img"
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Main Product Info */}
            <Box flex={1.2} display="flex" flexDirection="column" gap={1.5}>
              <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                <Chip
                  label={product.status}
                  size="small"
                  sx={{
                    bgcolor: product.status === "ACTIVE" ? "#e8f5e9" : "#fff3e0",
                    color: product.status === "ACTIVE" ? "#2e7d32" : "#e65100",
                    fontWeight: 700,
                  }}
                />
                <Chip
                  icon={<VerifiedIcon style={{ color: "#2e7d32", fontSize: 14 }} />}
                  label="Official Product Line"
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: "#a5d6a7", bgcolor: "#f1f8e9", color: "#2e7d32", fontWeight: 600 }}
                />
              </Box>

              <Typography fontSize={FONTSIZE.xlarge} fontWeight={800} color={THEME.textPrimary}>
                {product.product_name}
              </Typography>

              <Box display="flex" alignItems="baseline" gap={1}>
                <Typography fontSize="1.8rem" fontWeight={800} color={THEME.primary}>
                  ₹{product.price.toLocaleString("en-IN")}
                </Typography>
                <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>
                  (Excl. GST & Taxes)
                </Typography>
              </Box>

              <Paper
                elevation={0}
                sx={{ p: 2, bgcolor: THEME.white, borderRadius: 2, border: `1px solid ${THEME.border}` }}
              >
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CategoryIcon sx={{ color: THEME.primary, fontSize: 18 }} />
                    <Box>
                      <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>
                        Category
                      </Typography>
                      <Typography fontSize={FONTSIZE.medium} fontWeight={600}>
                        {product.category?.name || "General"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <SellIcon sx={{ color: THEME.primary, fontSize: 18 }} />
                    <Box>
                      <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>
                        HSN Code
                      </Typography>
                      <Typography fontSize={FONTSIZE.medium} fontWeight={600}>
                        {product.hsn_code || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <MemoryIcon sx={{ color: THEME.primary, fontSize: 18 }} />
                    <Box>
                      <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>
                        Model Number
                      </Typography>
                      <Typography fontSize={FONTSIZE.medium} fontWeight={600}>
                        {product.model_number || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <LocalShippingIcon sx={{ color: THEME.primary, fontSize: 18 }} />
                    <Box>
                      <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>
                        Weight
                      </Typography>
                      <Typography fontSize={FONTSIZE.medium} fontWeight={600}>
                        {product.dimensions
                          ? `${product.dimensions.weight} ${product.dimensions.weight_unit}`
                          : "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {product.description && (
                <Box>
                  <Typography fontSize={FONTSIZE.medium} fontWeight={700} mb={0.5} color={THEME.textPrimary}>
                    Product Overview
                  </Typography>
                  <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary} lineHeight={1.6}>
                    {product.description}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Specs & Documents Grid */}
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={2.5}>
            {/* Technical Specifications Table */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
              <Typography fontSize={FONTSIZE.medium} fontWeight={700} mb={1.5} color={THEME.textPrimary}>
                Technical Specifications
              </Typography>
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <Table size="small">
                  <TableBody>
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <TableRow key={key}>
                        <TableCell sx={{ fontWeight: 600, color: THEME.textSecondary, width: "42%", py: 1 }}>
                          {key}
                        </TableCell>
                        <TableCell sx={{ py: 1, fontWeight: 500 }}>{String(val)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>
                  No specific parameters listed.
                </Typography>
              )}
            </Paper>

            {/* Warranty & Datasheet Column */}
            <Box display="flex" flexDirection="column" gap={2}>
              {/* Dimensions */}
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
                <Typography fontSize={FONTSIZE.medium} fontWeight={700} mb={1} color={THEME.textPrimary}>
                  Physical Dimensions
                </Typography>
                {product.dimensions ? (
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
                    <Box>
                      <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>Length</Typography>
                      <Typography fontSize={FONTSIZE.small} fontWeight={600}>{product.dimensions.length} {product.dimensions.length_unit}</Typography>
                    </Box>
                    <Box>
                      <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>Width</Typography>
                      <Typography fontSize={FONTSIZE.small} fontWeight={600}>{product.dimensions.width} {product.dimensions.width_unit}</Typography>
                    </Box>
                    <Box>
                      <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>Height</Typography>
                      <Typography fontSize={FONTSIZE.small} fontWeight={600}>{product.dimensions.height} {product.dimensions.height_unit}</Typography>
                    </Box>
                    <Box>
                      <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>Net Weight</Typography>
                      <Typography fontSize={FONTSIZE.small} fontWeight={600}>{product.dimensions.weight} {product.dimensions.weight_unit}</Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>N/A</Typography>
                )}
              </Paper>

              {/* Warranty */}
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
                <Typography fontSize={FONTSIZE.medium} fontWeight={700} mb={1} color={THEME.textPrimary}>
                  Warranty & Support Terms
                </Typography>
                {product.warranty_service ? (
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    <Typography fontSize={FONTSIZE.small}>
                      <strong>Warranty Period:</strong> {product.warranty_service.warranty_period}
                    </Typography>
                    <Typography fontSize={FONTSIZE.small}>
                      <strong>Service Type:</strong> {product.warranty_service.service_type || "Standard Manufacturer Support"}
                    </Typography>
                    {product.warranty_service.terms && (
                      <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary} mt={0.5}>
                        {product.warranty_service.terms}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>
                    Standard manufacturer warranty applies.
                  </Typography>
                )}
              </Paper>

              {/* Catalog Datasheet */}
              {product.catalog_document && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${THEME.primary}40`,
                    bgcolor: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <DescriptionIcon sx={{ color: THEME.primary, fontSize: 28 }} />
                    <Box>
                      <Typography fontSize={FONTSIZE.small} fontWeight={700} color={THEME.textPrimary}>
                        {product.catalog_document.title || "Product Datasheet"}
                      </Typography>
                      <Typography fontSize={11} color={THEME.textSecondary}>
                        Format: {(product.catalog_document.file_type || "PDF").toUpperCase()} Document
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    component="a"
                    href={product.catalog_document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={product.catalog_document.title || "datasheet"}
                    sx={{ bgcolor: THEME.primary, borderRadius: 1.5, textTransform: "none", fontSize: 12 }}
                  >
                    Download Datasheet
                  </Button>
                </Paper>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${THEME.border}`, bgcolor: THEME.white, justifyContent: "space-between" }}>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 1.5 }}>
            Close
          </Button>

          <Box display="flex" gap={1.5}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<SendIcon />}
              onClick={() => handleActionClick("Request Formal Quotation")}
              sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
            >
              Request Quote
            </Button>

            <Button
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              onClick={() => handleActionClick("Add to Cart / Order")}
              sx={{ bgcolor: THEME.primary, borderRadius: 1.5, textTransform: "none", fontWeight: 600, px: 3 }}
            >
              Add to Inquiry List
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Feature Notification Toast */}
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
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
