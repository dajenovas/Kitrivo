import React, { useState } from "react";
import { jsPDF } from "jspdf";
import type { Product } from "@/models/product.models";
import { useCartStore } from "@/store/useCartStore";
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
  Snackbar,
  Alert,
} from "@mui/material";
import { CustomButton } from "@/components/Buttons/CustomButton";
import {
  Close as CloseIcon,
  Verified as VerifiedIcon,
  Category as CategoryIcon,
  Sell as SellIcon,
  Memory as MemoryIcon,
  LocalShipping as LocalShippingIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  GetApp as DownloadIcon,
  MenuBook as CatalogIcon,
  MenuBook as MenuBookIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
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

  const generateProductPDF = (prod: Product): jsPDF => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const primaryColor = [30, 64, 175]; // #1e40af
    const secondaryColor = [71, 85, 105]; // #475569

    // Header Banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 32, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("KITRIVO EQUIPMENT SYSTEMS", 14, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("OFFICIAL TECHNICAL DATASHEET & PRODUCT CATALOG", 14, 22);

    doc.setFontSize(8);
    doc.text(`DATE: ${new Date().toLocaleDateString("en-IN")}`, 155, 22);

    let y = 42;

    // Product Title
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(prod.product_name, 14, y);
    y += 7;

    // SKU / Model / Category Subtitle
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(
      `Product ID: ${prod.product_id}  |  Model: ${prod.model_number || "N/A"}  |  Category: ${prod.category?.name || "General"}`,
      14,
      y
    );
    y += 9;

    // Price Card Box
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(14, y, 182, 14, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Price: INR ${prod.price.toLocaleString("en-IN")} (Excl. Taxes)`, 20, y + 9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(`Status: ${prod.status}   |   HSN: ${prod.hsn_code || "N/A"}`, 130, y + 9);
    y += 22;

    // Product Description
    if (prod.description) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
      doc.text("Product Overview & Description", 14, y);
      y += 5.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);

      const splitDesc = doc.splitTextToSize(prod.description, 182);
      doc.text(splitDesc, 14, y);
      y += splitDesc.length * 4.8 + 6;
    }

    // Technical Specifications Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text("Technical Specifications & Performance Parameters", 14, y);
    y += 5.5;

    const specs = Object.entries(prod.specifications || {});
    if (specs.length > 0) {
      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 7.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text("Parameter / Feature", 18, y + 5);
      doc.text("Value / Specification", 95, y + 5);
      y += 7.5;

      specs.forEach(([key, val], idx) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, 182, 6.5, "F");
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text(String(key), 18, y + 4.5);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(String(val), 95, y + 4.5);

        y += 6.5;
      });
      y += 6;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Standard manufacturer technical specifications apply.", 14, y);
      y += 8;
    }

    // Physical Dimensions & Environmental
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text("Physical Dimensions & Net Weight", 14, y);
    y += 5.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    const dims = prod.dimensions;
    const dimText = dims
      ? `Length: ${dims.length} ${dims.length_unit}   |   Width: ${dims.width} ${dims.width_unit}   |   Height: ${dims.height} ${dims.height_unit}   |   Net Weight: ${dims.weight} ${dims.weight_unit}`
      : "Dimensions not specified";
    doc.text(dimText, 14, y);
    y += 10;

    // Warranty & Support
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text("Warranty & Service Terms", 14, y);
    y += 5.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const wPeriod = prod.warranty_service?.warranty_period || "Standard Manufacturer Support";
    const wType = prod.warranty_service?.service_type || "Carry-In Service";
    doc.text(`Warranty Period: ${wPeriod}   |   Service Type: ${wType}`, 14, y);
    y += 12;

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 280, 196, 280);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("Generated by Kitrivo Technical Equipment & Catalog System", 14, 285);
      doc.text(`Page ${i} of ${pageCount}`, 180, 285);
    }

    return doc;
  };

  const handleViewCatalog = () => {
    if (product.catalog_document?.url && product.catalog_document.url.toLowerCase().endsWith(".pdf")) {
      window.open(product.catalog_document.url, "_blank");
    } else {
      const pdfDoc = generateProductPDF(product);
      const pdfBlobUrl = pdfDoc.output("bloburl");
      window.open(pdfBlobUrl, "_blank");
    }
  };

  const handleDownloadCatalog = () => {
    if (product.catalog_document?.url && product.catalog_document.url.toLowerCase().endsWith(".pdf")) {
      const link = document.createElement("a");
      link.href = product.catalog_document.url;
      link.download = product.catalog_document.title || `${product.product_id}_Catalog.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const pdfDoc = generateProductPDF(product);
      pdfDoc.save(`${product.product_id}_Technical_Catalog_Datasheet.pdf`);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: THEME.white, borderBottom: `1px solid ${THEME.border}` }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography fontSize={FONTSIZE.large} fontWeight={700} color={THEME.textPrimary}>
              Product Specification & Client Overview
            </Typography>
            <Chip label={product.product_id} size="small" sx={{ bgcolor: `${THEME.primary}15`, color: THEME.primary, fontWeight: 700 }} />
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
              <Paper elevation={0} sx={{ width: "100%", height: 280, borderRadius: 2.5, overflow: "hidden", border: `1px solid ${THEME.border}`, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: THEME.white }}>
                position: "relative",
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
                        border: `2px solid ${selectedImageIndex === idx ? THEME.primary : THEME.border
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

            {/* Right Column: Dimensions, Warranty, Catalog Actions & Explanation */}
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

              {/* Catalog & Datasheet Action Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${THEME.primary}40`,
                  bgcolor: "#eff6ff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <CatalogIcon sx={{ color: THEME.primary, fontSize: 26 }} />
                    <Box>
                      <Typography fontSize={FONTSIZE.small} fontWeight={700} color={THEME.textPrimary}>
                        {product.catalog_document?.title || `${product.product_name} Catalog`}
                      </Typography>
                      <Typography fontSize={11} color={THEME.textSecondary}>
                        Format: {(product.catalog_document?.file_type || "PDF / Technical Specification").toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip label="Official Catalog" size="small" color="primary" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                </Box>

                <Box display="flex" gap={1} flexWrap="wrap">
                  <CustomButton
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon fontSize="small" />}
                    onClick={handleViewCatalog}
                    sx={{
                      flex: 1,
                      minWidth: 120,
                      borderRadius: 1.5,
                      textTransform: "none",
                      fontSize: 12,
                      fontWeight: 600,
                      borderColor: THEME.primary,
                      color: THEME.primary,
                    }}
                  >
                    View Catalog
                  </CustomButton>
                  <CustomButton
                    size="small"
                    variant="contained"
                    startIcon={<DownloadIcon fontSize="small" />}
                    onClick={handleDownloadCatalog}
                    sx={{
                      flex: 1,
                      minWidth: 130,
                      bgcolor: THEME.primary,
                      borderRadius: 1.5,
                      textTransform: "none",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Download Catalog
                  </CustomButton>
                </Box>
              </Paper>

              {/* Lab Manual Download Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${product.lab_manual ? "#16a34a40" : THEME.border}`,
                  bgcolor: product.lab_manual ? "#f0fdf4" : THEME.white,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <MenuBookIcon sx={{ color: product.lab_manual ? "#16a34a" : THEME.textSecondary, fontSize: 26 }} />
                    <Box>
                      <Typography fontSize={FONTSIZE.small} fontWeight={700} color={THEME.textPrimary}>
                        {product.lab_manual?.title || "Product Lab Manual"}
                      </Typography>
                      <Typography fontSize={11} color={THEME.textSecondary}>
                        {product.lab_manual ? "Format: PDF Practical Guide" : "No lab manual attached yet"}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={product.lab_manual ? "Lab Manual Available" : "Manual Portal Coming Soon"}
                    size="small"
                    color={product.lab_manual ? "success" : "default"}
                    variant="outlined"
                    sx={{ fontSize: 10, height: 20 }}
                  />
                </Box>

                {product.lab_manual ? (
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <CustomButton
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon fontSize="small" />}
                      onClick={() => {
                        if (product.lab_manual?.url) {
                          window.open(product.lab_manual.url, "_blank");
                        }
                      }}
                      sx={{
                        flex: 1,
                        minWidth: 120,
                        borderRadius: 1.5,
                        textTransform: "none",
                        fontSize: 12,
                        fontWeight: 600,
                        borderColor: "#16a34a",
                        color: "#16a34a",
                      }}
                    >
                      View Manual
                    </CustomButton>
                    <CustomButton
                      size="small"
                      variant="contained"
                      startIcon={<DownloadIcon fontSize="small" />}
                      onClick={() => {
                        if (product.lab_manual?.url) {
                          const link = document.createElement("a");
                          link.href = product.lab_manual.url;
                          link.download = product.lab_manual.title || `${product.product_id}_Lab_Manual.pdf`;
                          link.target = "_blank";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                      sx={{
                        flex: 1,
                        minWidth: 130,
                        bgcolor: "#16a34a",
                        "&:hover": { bgcolor: "#15803d" },
                        borderRadius: 1.5,
                        textTransform: "none",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Download Lab Manual
                    </CustomButton>
                  </Box>
                ) : (
                  <Typography fontSize={11} color={THEME.textSecondary}>
                    Optional. In future releases, a dedicated Lab Manual page will feature complete experiment guides.
                  </Typography>
                )}
              </Paper>

              {/* Demo Video Player Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${product.demo_video ? THEME.primary + "40" : THEME.border}`,
                  bgcolor: THEME.white,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <PlayCircleOutlineIcon sx={{ color: product.demo_video ? THEME.primary : THEME.textSecondary, fontSize: 26 }} />
                    <Box>
                      <Typography fontSize={FONTSIZE.small} fontWeight={700} color={THEME.textPrimary}>
                        {product.demo_video?.title || "Equipment Demo Video"}
                      </Typography>
                      <Typography fontSize={11} color={THEME.textSecondary}>
                        {product.demo_video ? "Native HTML5 Video Player" : "No demo video attached yet"}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={product.demo_video ? "Demo Video Available" : "Video Portal Coming Soon"}
                    size="small"
                    color={product.demo_video ? "primary" : "default"}
                    variant="outlined"
                    sx={{ fontSize: 10, height: 20 }}
                  />
                </Box>

                {product.demo_video?.url ? (
                  <Box sx={{ width: "100%", borderRadius: 2, overflow: "hidden", bgcolor: "#000", border: `1px solid ${THEME.border}` }}>
                    <video
                      controls
                      src={product.demo_video.url}
                      style={{ width: "100%", maxHeight: 240, display: "block" }}
                    >
                      Your browser does not support native HTML5 video playback.
                    </video>
                  </Box>
                ) : (
                  <Typography fontSize={11} color={THEME.textSecondary}>
                    Optional. In future releases, a dedicated Demo Video portal page will feature setup video demonstrations.
                  </Typography>
                )}
              </Paper>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${THEME.border}`, bgcolor: THEME.white, justifyContent: "space-between" }}>
          <CustomButton onClick={onClose} variant="outlined" sx={{ borderRadius: 1.5 }}>
            Close
          </CustomButton>

          <Box display="flex" gap={1.5}>
            <CustomButton
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              onClick={() => {
                if (product) {
                  useCartStore.getState().addItem(product);
                  setToastMessage(`Product '${product.product_name}' added to your Inquiry Cart!`);
                  setToastOpen(true);
                }
              }}
              sx={{ bgcolor: THEME.primary, borderRadius: 1.5, textTransform: "none", fontWeight: 600, px: 3 }}
            >
              Add to Inquiry List
            </CustomButton>
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
