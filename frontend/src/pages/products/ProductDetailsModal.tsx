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
} from "@mui/material";
import {
  Close as CloseIcon,
  Storefront as StorefrontIcon,
  Verified as VerifiedIcon,
  Category as CategoryIcon,
  Sell as SellIcon,
  Memory as MemoryIcon,
  LocalShipping as LocalShippingIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";

interface ProductDetailsModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onEdit?: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  open,
  product,
  onClose,
  onEdit,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  if (!product) return null;

  const isECommerceReflected = product.status === "ACTIVE";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { bg: "#e8f5e9", color: "#2e7d32", label: "Active" };
      case "INACTIVE":
        return { bg: "#fff3e0", color: "#e65100", label: "Inactive" };
      case "OUTOFSTOCK":
        return { bg: "#ffebee", color: "#c62828", label: "Out of Stock" };
      case "DISCONTINUED":
        return { bg: "#f5f5f5", color: "#616161", label: "Discontinued" };
      default:
        return { bg: "#f5f5f5", color: "#616161", label: status };
    }
  };

  const statusStyle = getStatusColor(product.status);
  const images = product.images && product.images.length > 0 ? product.images : [];

  return (
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
            Product Details
          </Typography>
          <Chip
            label={product.product_id}
            size="small"
            sx={{ bgcolor: `${THEME.primary}15`, color: THEME.primary, fontWeight: 600 }}
          />
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: THEME.textSecondary }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: "#fafafa" }}>
        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={3} mb={3}>
          {/* Gallery Section */}
          <Box flex={1} display="flex" flexDirection="column" gap={1.5}>
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                height: 280,
                borderRadius: 2,
                overflow: "hidden",
                border: `1px solid ${THEME.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: THEME.white,
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
                <Typography color={THEME.textSecondary}>No Image Available</Typography>
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
                      width: 60,
                      height: 60,
                      borderRadius: 1.5,
                      border: `2px solid ${
                        selectedImageIndex === idx ? THEME.primary : THEME.border
                      }`,
                      cursor: "pointer",
                      overflow: "hidden",
                      bgcolor: THEME.white,
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      component="img"
                      src={img}
                      alt={`Thumb ${idx + 1}`}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Product Overview Header */}
          <Box flex={1.2} display="flex" flexDirection="column" gap={1.5}>
            <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
              <Chip
                label={statusStyle.label}
                size="small"
                sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 700 }}
              />
              <Chip
                icon={
                  isECommerceReflected ? (
                    <VerifiedIcon style={{ color: "#2e7d32", fontSize: 16 }} />
                  ) : (
                    <StorefrontIcon style={{ color: "#ed6c02", fontSize: 16 }} />
                  )
                }
                label={
                  isECommerceReflected
                    ? "Reflected on E-Commerce Site"
                    : "Draft / Internal Only"
                }
                size="small"
                variant="outlined"
                sx={{
                  borderColor: isECommerceReflected ? "#a5d6a7" : "#ffe0b2",
                  bgcolor: isECommerceReflected ? "#f1f8e9" : "#fffde7",
                  color: isECommerceReflected ? "#2e7d32" : "#e65100",
                  fontWeight: 600,
                  fontSize: FONTSIZE.small,
                }}
              />
            </Box>

            <Typography fontSize={FONTSIZE.xlarge} fontWeight={700} color={THEME.textPrimary}>
              {product.product_name}
            </Typography>

            <Box display="flex" alignItems="baseline" gap={1}>
              <Typography fontSize={FONTSIZE.xlarge} fontWeight={800} color={THEME.primary}>
                ₹{product.price.toLocaleString("en-IN")}
              </Typography>
              <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>
                (Excl. Taxes)
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
                <Typography fontSize={FONTSIZE.medium} fontWeight={600} mb={0.5}>
                  Description
                </Typography>
                <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary} lineHeight={1.5}>
                  {product.description}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Specifications & Dimensions Section */}
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={2}>
          {/* Technical Specifications */}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
            <Typography fontSize={FONTSIZE.medium} fontWeight={700} mb={1.5} color={THEME.textPrimary}>
              Technical Specifications
            </Typography>
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              <Table size="small">
                <TableBody>
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <TableRow key={key}>
                      <TableCell sx={{ fontWeight: 600, color: THEME.textSecondary, width: "40%", py: 1 }}>
                        {key}
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>{String(val)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>
                No specifications recorded.
              </Typography>
            )}
          </Paper>

          {/* Dimensions & Warranty */}
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Dimensions */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
              <Typography fontSize={FONTSIZE.medium} fontWeight={700} mb={1.5} color={THEME.textPrimary}>
                Dimensions & Shipping
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
                    <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>Weight</Typography>
                    <Typography fontSize={FONTSIZE.small} fontWeight={600}>{product.dimensions.weight} {product.dimensions.weight_unit}</Typography>
                  </Box>
                </Box>
              ) : (
                <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>N/A</Typography>
              )}
            </Paper>

            {/* Warranty & Service */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
              <Typography fontSize={FONTSIZE.medium} fontWeight={700} mb={1} color={THEME.textPrimary}>
                Warranty & Service
              </Typography>
              {product.warranty_service ? (
                <Box display="flex" flexDirection="column" gap={0.5}>
                  <Typography fontSize={FONTSIZE.small}>
                    <strong>Period:</strong> {product.warranty_service.warranty_period}
                  </Typography>
                  <Typography fontSize={FONTSIZE.small}>
                    <strong>Service Type:</strong> {product.warranty_service.service_type || "Standard"}
                  </Typography>
                  {product.warranty_service.terms && (
                    <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>
                      <strong>Terms:</strong> {product.warranty_service.terms}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>
                  No warranty information specified.
                </Typography>
              )}
            </Paper>

            {/* Catalog Document */}
            {product.catalog_document && (
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
                <Typography fontSize={FONTSIZE.medium} fontWeight={700} mb={1} color={THEME.textPrimary}>
                  Catalog & Datasheet
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <DescriptionIcon sx={{ color: THEME.primary, fontSize: 24 }} />
                    <Box>
                      <Typography fontSize={FONTSIZE.small} fontWeight={600}>
                        {product.catalog_document.title || "Product Datasheet"}
                      </Typography>
                      <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>
                        Format: {(product.catalog_document.file_type || "PDF").toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    component="a"
                    href={product.catalog_document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={product.catalog_document.title || "catalog"}
                    sx={{ borderRadius: 1.5, textTransform: "none", fontSize: FONTSIZE.small }}
                  >
                    View / Download
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 1.5 }}>
          Close
        </Button>
        {onEdit && (
          <Button
            onClick={() => {
              onClose();
              onEdit(product);
            }}
            variant="contained"
            sx={{ borderRadius: 1.5, bgcolor: THEME.primary }}
          >
            Edit Product
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
