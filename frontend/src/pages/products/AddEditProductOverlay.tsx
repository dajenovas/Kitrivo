import React, { useEffect, useState, useRef } from "react";
import type {
  Product,
  ProductCategory,
  ProductCreatePayload,
  ProductStatus,
} from "@/models/product.models";
import { ProductService } from "@/services/products.service";
import { FONTSIZE, THEME } from "@/assets/theme";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Grid,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Storefront as StorefrontIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  InsertDriveFile as InsertDriveFileIcon,
} from "@mui/icons-material";

interface AddEditProductOverlayProps {
  open: boolean;
  productToEdit: Product | null;
  onClose: () => void;
  onSuccess: (message?: string) => void;
}

interface SpecRow {
  key: string;
  value: string;
}

export const AddEditProductOverlay: React.FC<AddEditProductOverlayProps> = ({
  open,
  productToEdit,
  onClose,
  onSuccess,
}) => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File Input References
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const catalogInputRef = useRef<HTMLInputElement | null>(null);

  // Drag & upload state
  const [isDragOverImage, setIsDragOverImage] = useState<boolean>(false);
  const [isDragOverCatalog, setIsDragOverCatalog] = useState<boolean>(false);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [uploadingCatalog, setUploadingCatalog] = useState<boolean>(false);

  // Form State
  const [productId, setProductId] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [hsnCode, setHsnCode] = useState<string>("");
  const [modelNumber, setModelNumber] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [status, setStatus] = useState<ProductStatus>("ACTIVE");

  // Images state (min 3 images required)
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>("");

  // Specifications
  const [specs, setSpecs] = useState<SpecRow[]>([]);

  // Dimensions & Weight
  const [length, setLength] = useState<string>("20");
  const [lengthUnit, setLengthUnit] = useState<string>("cm");
  const [width, setWidth] = useState<string>("15");
  const [widthUnit, setWidthUnit] = useState<string>("cm");
  const [height, setHeight] = useState<string>("10");
  const [heightUnit, setHeightUnit] = useState<string>("cm");
  const [weight, setWeight] = useState<string>("1.5");
  const [weightUnit, setWeightUnit] = useState<string>("kg");

  // Warranty & Service
  const [warrantyPeriod, setWarrantyPeriod] = useState<string>("1 Year");
  const [serviceType, setServiceType] = useState<string>("Onsite Support");
  const [warrantyTerms, setWarrantyTerms] = useState<string>("Full standard manufacturer warranty.");

  // Catalog Document
  const [catalogTitle, setCatalogTitle] = useState<string>("");
  const [catalogUrl, setCatalogUrl] = useState<string>("");
  const [catalogFileType, setCatalogFileType] = useState<string>("pdf");
  const [catalogFileName, setCatalogFileName] = useState<string>("");

  useEffect(() => {
    if (open) {
      fetchCategories();
      if (productToEdit) {
        // Populate form for editing
        setProductId(productToEdit.product_id || "");
        setProductName(productToEdit.product_name || "");
        setCategoryId(productToEdit.category_id || "");
        setHsnCode(productToEdit.hsn_code || "");
        setModelNumber(productToEdit.model_number || "");
        setDescription(productToEdit.description || "");
        setPrice(productToEdit.price ? String(productToEdit.price) : "");
        setStatus(productToEdit.status || "ACTIVE");
        setImages(productToEdit.images && productToEdit.images.length > 0 ? productToEdit.images : []);

        if (productToEdit.specifications) {
          const loadedSpecs = Object.entries(productToEdit.specifications).map(([k, v]) => ({
            key: k,
            value: String(v),
          }));
          setSpecs(loadedSpecs);
        } else {
          setSpecs([]);
        }

        if (productToEdit.dimensions) {
          setLength(String(productToEdit.dimensions.length || 20));
          setLengthUnit(productToEdit.dimensions.length_unit || "cm");
          setWidth(String(productToEdit.dimensions.width || 15));
          setWidthUnit(productToEdit.dimensions.width_unit || "cm");
          setHeight(String(productToEdit.dimensions.height || 10));
          setHeightUnit(productToEdit.dimensions.height_unit || "cm");
          setWeight(String(productToEdit.dimensions.weight || 1.5));
          setWeightUnit(productToEdit.dimensions.weight_unit || "kg");
        }

        if (productToEdit.warranty_service) {
          setWarrantyPeriod(productToEdit.warranty_service.warranty_period || "1 Year");
          setServiceType(productToEdit.warranty_service.service_type || "Onsite Support");
          setWarrantyTerms(productToEdit.warranty_service.terms || "");
        }

        if (productToEdit.catalog_document) {
          setCatalogTitle(productToEdit.catalog_document.title || "");
          setCatalogUrl(productToEdit.catalog_document.url || "");
          setCatalogFileType(productToEdit.catalog_document.file_type || "pdf");
          setCatalogFileName("Uploaded Document");
        } else {
          setCatalogTitle("");
          setCatalogUrl("");
          setCatalogFileType("pdf");
          setCatalogFileName("");
        }
      } else {
        // Reset form for creation
        resetForm();
      }
      setErrorMsg(null);
      setTabIndex(0);
    }
  }, [open, productToEdit]);

  const resetForm = () => {
    setProductId(`PRD-${Math.floor(1000 + Math.random() * 9000)}`);
    setProductName("");
    setCategoryId("");
    setHsnCode("");
    setModelNumber("");
    setDescription("");
    setPrice("");
    setStatus("ACTIVE");
    setImages([]);
    setSpecs([
      { key: "Input Voltage", value: "230V AC ±10%, 50Hz" },
      { key: "Operating Temp", value: "0°C to 50°C" },
    ]);
    setLength("20");
    setLengthUnit("cm");
    setWidth("15");
    setWidthUnit("cm");
    setHeight("10");
    setHeightUnit("cm");
    setWeight("1.5");
    setWeightUnit("kg");
    setWarrantyPeriod("1 Year");
    setServiceType("Onsite Support");
    setWarrantyTerms("Standard manufacturer warranty.");
    setCatalogTitle("");
    setCatalogUrl("");
    setCatalogFileType("pdf");
    setCatalogFileName("");
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await ProductService.listCategories();
      if (res.data) {
        setCategories(res.data);
        if (res.data.length > 0 && !categoryId) {
          setCategoryId(res.data[0].id);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Image Upload Handlers (File storage backend)
  const handleImageFilesSelected = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) return;

    setUploadingImages(true);
    try {
      const res = await ProductService.uploadMultipleFiles(imageFiles);
      if (res.data) {
        const uploadedUrls = res.data.map((item) => item.url);
        setImages((prev) => [...prev, ...uploadedUrls]);
        setErrorMsg(null);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to upload images to storage.";
      setErrorMsg(msg);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleAddUrlImage = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
    setErrorMsg(null);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
    if (images.length - 1 < 3) {
      setErrorMsg("Minimum 3 product images are required.");
    } else {
      setErrorMsg(null);
    }
  };

  // Catalog Upload Handler (File storage backend)
  const handleCatalogFileSelected = async (file: File) => {
    if (!file) return;
    const titleWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

    setUploadingCatalog(true);
    try {
      const res = await ProductService.uploadSingleFile(file);
      if (res.data) {
        setCatalogUrl(res.data.url);
        setCatalogFileType(res.data.file_type || "pdf");
        setCatalogFileName(res.data.filename);
        if (!catalogTitle.trim()) {
          setCatalogTitle(titleWithoutExt);
        }
        setErrorMsg(null);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to upload catalog document.";
      setErrorMsg(msg);
    } finally {
      setUploadingCatalog(false);
    }
  };

  const handleAddSpecRow = () => {
    setSpecs((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleRemoveSpecRow = (index: number) => {
    setSpecs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSpecChange = (index: number, field: "key" | "value", val: string) => {
    setSpecs((prev) => {
      const copy = [...prev];
      copy[index][field] = val;
      return copy;
    });
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    // Validation
    if (!productId.trim()) {
      setErrorMsg("Product ID / SKU is required.");
      setTabIndex(0);
      return;
    }
    if (!productName.trim()) {
      setErrorMsg("Product Name is required.");
      setTabIndex(0);
      return;
    }
    if (!categoryId) {
      setErrorMsg("Please select a product category.");
      setTabIndex(0);
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      setErrorMsg("Please enter a valid non-negative product price.");
      setTabIndex(0);
      return;
    }
    if (images.length < 3) {
      setErrorMsg(`Product must have a minimum of 3 images. You currently have ${images.length} uploaded.`);
      setTabIndex(1);
      return;
    }

    const specificationsDict: Record<string, any> = {};
    specs.forEach((s) => {
      if (s.key.trim()) {
        specificationsDict[s.key.trim()] = s.value.trim();
      }
    });

    const payload: ProductCreatePayload = {
      product_id: productId.trim(),
      product_name: productName.trim(),
      category_id: Number(categoryId),
      hsn_code: hsnCode.trim() || undefined,
      model_number: modelNumber.trim() || undefined,
      description: description.trim() || undefined,
      price: Number(price),
      status: status,
      images: images,
      specifications: specificationsDict,
      dimensions: {
        length: Number(length) || 0,
        length_unit: lengthUnit,
        width: Number(width) || 0,
        width_unit: widthUnit,
        height: Number(height) || 0,
        height_unit: heightUnit,
        weight: Number(weight) || 0,
        weight_unit: weightUnit,
      },
      warranty_service: {
        warranty_period: warrantyPeriod.trim() || "1 Year",
        service_type: serviceType.trim() || undefined,
        terms: warrantyTerms.trim() || undefined,
      },
      catalog_document: catalogUrl.trim()
        ? {
            title: catalogTitle.trim() || "Product Datasheet",
            url: catalogUrl.trim(),
            file_type: catalogFileType || "pdf",
          }
        : undefined,
    };

    setSubmitting(true);
    try {
      if (productToEdit) {
        await ProductService.updateProduct(productToEdit.product_id, payload);
        onSuccess("Product updated successfully!");
      } else {
        await ProductService.createProduct(payload);
        onSuccess("Product created successfully!");
      }
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to save product.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Hidden File Inputs */}
      <input
        type="file"
        accept="image/*"
        multiple
        ref={imageInputRef}
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files) {
            handleImageFilesSelected(e.target.files);
            e.target.value = "";
          }
        }}
      />
      <input
        type="file"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        ref={catalogInputRef}
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleCatalogFileSelected(e.target.files[0]);
            e.target.value = "";
          }
        }}
      />

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
        <Box display="flex" alignItems="center" gap={1}>
          <Typography fontSize={FONTSIZE.large} fontWeight={700} color={THEME.textPrimary}>
            {productToEdit ? "Edit Product" : "Add New Product"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: THEME.textSecondary }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: THEME.white, px: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, val) => setTabIndex(val)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="1. Basic Info & Pricing" />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={0.8}>
                <span>2. Images & E-Commerce</span>
                {images.length < 3 ? (
                  <Chip
                    label={`${images.length}/3`}
                    size="small"
                    color="error"
                    sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                  />
                ) : (
                  <Chip
                    label={`${images.length}`}
                    size="small"
                    color="success"
                    sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                  />
                )}
              </Box>
            }
          />
          <Tab label="3. Specifications & Dimensions" />
          <Tab label="4. Warranty & Documents" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: "#fafafa" }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        )}

        {/* Tab 0: Basic Info */}
        {tabIndex === 0 && (
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product ID / SKU *"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="e.g. PRD-1001"
                disabled={Boolean(productToEdit)}
                helperText="Unique identifier for the product"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name *"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Digital Oscilloscope 100MHz"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category *"
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                disabled={loadingCategories}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name} ({cat.code})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (₹) *"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 25000"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="HSN Code"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                placeholder="e.g. 8542.31.00"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Model Number"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="e.g. MOD-9000X"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status *"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                helperText={
                  status === "ACTIVE"
                    ? "Active products are visible and reflected on the E-Commerce Store catalog."
                    : "Hidden / Draft state."
                }
              >
                <MenuItem value="ACTIVE">ACTIVE (Reflected on E-Commerce)</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                <MenuItem value="OUTOFSTOCK">OUT OF STOCK</MenuItem>
                <MenuItem value="DISCONTINUED">DISCONTINUED</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Product Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe product key features, overview, and applications..."
              />
            </Grid>
          </Grid>
        )}

        {/* Tab 1: Images & E-Commerce */}
        {tabIndex === 1 && (
          <Box display="flex" flexDirection="column" gap={2.5}>
            <Alert
              severity={images.length >= 3 ? "success" : "warning"}
              icon={images.length >= 3 ? <CheckCircleIcon /> : <WarningIcon />}
            >
              Product image upload requires a <strong>minimum of 3 images</strong> for catalog & e-commerce presentation.
              {" "}Current status: <strong>{images.length} / 3 uploaded</strong>.
            </Alert>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography fontSize={FONTSIZE.medium} fontWeight={700} color={THEME.textPrimary}>
                Product Images ({images.length})
              </Typography>
              {images.length < 3 && (
                <Chip
                  label="Minimum 3 Images Required"
                  color="error"
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>

            {/* Dropzone File Upload Placeholder */}
            <Paper
              elevation={0}
              onClick={() => !uploadingImages && imageInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverImage(true);
              }}
              onDragLeave={() => setIsDragOverImage(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverImage(false);
                if (e.dataTransfer.files && !uploadingImages) {
                  handleImageFilesSelected(e.dataTransfer.files);
                }
              }}
              sx={{
                p: 4,
                borderRadius: 3,
                border: `2px dashed ${
                  isDragOverImage
                    ? THEME.primary
                    : images.length < 3
                    ? "#ef4444"
                    : "#3b82f6"
                }`,
                bgcolor: isDragOverImage
                  ? `${THEME.primary}0D`
                  : images.length < 3
                  ? "#fef2f2"
                  : "#f0f9ff",
                textAlign: "center",
                cursor: uploadingImages ? "wait" : "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: `${THEME.primary}0F`,
                  borderColor: THEME.primary,
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                {uploadingImages ? (
                  <>
                    <CircularProgress size={40} color="primary" />
                    <Typography fontSize={FONTSIZE.medium} fontWeight={600} color={THEME.primary}>
                      Uploading images to file storage...
                    </Typography>
                  </>
                ) : (
                  <>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        bgcolor: images.length < 3 ? "#fee2e2" : "#e0f2fe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CloudUploadIcon
                        sx={{
                          fontSize: 32,
                          color: images.length < 3 ? "#dc2626" : THEME.primary,
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography fontSize={FONTSIZE.medium} fontWeight={700} color={THEME.textPrimary}>
                        Click or drag images to upload
                      </Typography>
                      <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary} mt={0.5}>
                        Supports PNG, JPG, WEBP formats (Upload at least 3 high-quality product images)
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      sx={{
                        mt: 1,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: THEME.primary,
                        color: THEME.primary,
                      }}
                    >
                      Select Image Files
                    </Button>
                  </>
                )}
              </Box>
            </Paper>

            {/* Fallback URL Input */}
            <Box display="flex" gap={1.5} alignItems="center">
              <TextField
                fullWidth
                size="small"
                label="Or paste Image URL"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/images/product.jpg"
              />
              <Button
                variant="contained"
                onClick={handleAddUrlImage}
                startIcon={<AddIcon />}
                sx={{ bgcolor: THEME.primary, flexShrink: 0 }}
              >
                Add URL
              </Button>
            </Box>

            {/* Images Grid */}
            {images.length > 0 && (
              <Grid container spacing={2}>
                {images.map((imgUrl, idx) => (
                  <Grid item xs={12} sm={4} key={idx}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: `1px solid ${THEME.border}`,
                        bgcolor: THEME.white,
                        position: "relative",
                      }}
                    >
                      <Box
                        component="img"
                        src={imgUrl}
                        alt={`Product image ${idx + 1}`}
                        sx={{
                          width: "100%",
                          height: 140,
                          objectFit: "cover",
                          borderRadius: 1.5,
                          mb: 1,
                        }}
                        onError={(e: any) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80";
                        }}
                      />
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          {idx === 0 && (
                            <Chip label="Primary" size="small" color="primary" sx={{ height: 20, fontSize: 10 }} />
                          )}
                          <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary} noWrap>
                            Image #{idx + 1}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveImage(idx)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Tab 2: Specs & Dimensions */}
        {tabIndex === 2 && (
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Dynamic Specifications */}
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography fontSize={FONTSIZE.medium} fontWeight={700}>
                  Technical Specifications (Key - Value Pairs)
                </Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={handleAddSpecRow}>
                  Add Specification Row
                </Button>
              </Box>

              {specs.map((row, idx) => (
                <Box key={idx} display="flex" gap={1.5} mb={1.5} alignItems="center">
                  <TextField
                    size="small"
                    label="Specification Key"
                    value={row.key}
                    onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                    placeholder="e.g. Frequency Range"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Specification Value"
                    value={row.value}
                    onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                    placeholder="e.g. 0.1Hz to 20MHz"
                    sx={{ flex: 1.5 }}
                  />
                  <IconButton size="small" color="error" onClick={() => handleRemoveSpecRow(idx)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Divider />

            {/* Dimensions & Weight */}
            <Box>
              <Typography fontSize={FONTSIZE.medium} fontWeight={700} mb={1.5}>
                Dimensions & Shipping Weight
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Length"
                    type="number"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Width"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

        {/* Tab 3: Warranty & Documents */}
        {tabIndex === 3 && (
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Warranty Period"
                value={warrantyPeriod}
                onChange={(e) => setWarrantyPeriod(e.target.value)}
                placeholder="e.g. 1 Year / 2 Years"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Service Type"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="e.g. Onsite Support / Carry-in"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Warranty Terms"
                value={warrantyTerms}
                onChange={(e) => setWarrantyTerms(e.target.value)}
                placeholder="Detail warranty coverage and replacement policies..."
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography fontSize={FONTSIZE.medium} fontWeight={700} my={1}>
                Catalog Document / Datasheet Upload
              </Typography>
            </Grid>

            {/* Catalog Upload Dropzone / Preview */}
            <Grid item xs={12}>
              {catalogUrl ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: `1px solid ${THEME.border}`,
                    bgcolor: THEME.white,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: "#eff6ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: THEME.primary,
                        }}
                      >
                        {catalogFileType === "pdf" ? (
                          <PictureAsPdfIcon sx={{ fontSize: 28, color: "#dc2626" }} />
                        ) : (
                          <DescriptionIcon sx={{ fontSize: 28 }} />
                        )}
                      </Box>
                      <Box>
                        <Typography fontSize={FONTSIZE.medium} fontWeight={700} color={THEME.textPrimary}>
                          {catalogTitle || "Catalog Document"}
                        </Typography>
                        <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>
                          {catalogFileName || "Uploaded File"} • {catalogFileType.toUpperCase()} Format
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => catalogInputRef.current?.click()}
                      >
                        Replace File
                      </Button>
                      <IconButton
                        color="error"
                        onClick={() => {
                          setCatalogUrl("");
                          setCatalogTitle("");
                          setCatalogFileName("");
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    label="Catalog Title"
                    value={catalogTitle}
                    onChange={(e) => setCatalogTitle(e.target.value)}
                    placeholder="e.g. Technical Datasheet 2026"
                  />
                </Paper>
              ) : (
                <Paper
                  elevation={0}
                  onClick={() => !uploadingCatalog && catalogInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOverCatalog(true);
                  }}
                  onDragLeave={() => setIsDragOverCatalog(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOverCatalog(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0] && !uploadingCatalog) {
                      handleCatalogFileSelected(e.dataTransfer.files[0]);
                    }
                  }}
                  sx={{
                    p: 3.5,
                    borderRadius: 2.5,
                    border: `2px dashed ${isDragOverCatalog ? THEME.primary : "#94a3b8"}`,
                    bgcolor: isDragOverCatalog ? `${THEME.primary}0D` : "#f8fafc",
                    textAlign: "center",
                    cursor: uploadingCatalog ? "wait" : "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      bgcolor: `${THEME.primary}0F`,
                      borderColor: THEME.primary,
                    },
                  }}
                >
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    {uploadingCatalog ? (
                      <>
                        <CircularProgress size={36} color="primary" />
                        <Typography fontSize={FONTSIZE.medium} fontWeight={600} color={THEME.primary}>
                          Uploading catalog document to storage...
                        </Typography>
                      </>
                    ) : (
                      <>
                        <InsertDriveFileIcon sx={{ fontSize: 40, color: THEME.textSecondary }} />
                        <Typography fontSize={FONTSIZE.medium} fontWeight={600} color={THEME.textPrimary}>
                          Click or drag catalog document (PDF / Doc) to upload
                        </Typography>
                        <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>
                          Supports PDF, DOC, DOCX, PNG, JPG
                        </Typography>
                      </>
                    )}
                  </Box>
                </Paper>
              )}
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${THEME.border}`, bgcolor: THEME.white }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 1.5 }} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ borderRadius: 1.5, bgcolor: THEME.primary, px: 3 }}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {submitting ? "Saving..." : productToEdit ? "Update Product" : "Save Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

