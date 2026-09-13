import React, { useState, useMemo } from "react";
import { THEME } from "@/assets/theme";
import type { CustomSearchSelectProps } from "@/types/input.types";
import { ExpandMore as ExpandMoreIcon, Search as SearchIcon, Clear as ClearIcon, Check as CheckIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, FilterList as FilterListIcon } from "@mui/icons-material";
import { Box, Popover, Typography, Checkbox, Chip, CircularProgress, FormHelperText, IconButton, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { CustomInput } from "@/components/Inputs/CustomInput";

export const CustomSearchSelect: React.FC<CustomSearchSelectProps> = ({ label, placeholder = "Select option...", options = [], value, onChange, isMultiple = false, enableSearch = true, searchTerm: externalSearchTerm, onSearchChange, page, totalPages, onPageChange, onScrollEnd, hasMore, isLoading = false, isFetchingMore = false, width = "100%", height = "40px", bgc, border, fontSize = "14px", disabled = false, error, buttonVariant = "outlined", startIcon }) => {

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const open = Boolean(anchorEl);
  const activeSearchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;

  const handleOpen = (event: any) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSearchChange = (term: string) => {
    if (onSearchChange) {
      onSearchChange(term);
    } else {
      setInternalSearchTerm(term);
    }
  };

  // Standardize current value into an array
  const selectedArray = useMemo(() => {
    if (Array.isArray(value)) return value;
    if (value !== undefined && value !== null && value !== "") return [value];
    return [];
  }, [value]);

  // Client-side search filter if no external search handler is provided
  const filteredOptions = useMemo(() => {
    if (!enableSearch || !activeSearchTerm.trim() || onSearchChange) return options;
    const term = activeSearchTerm.toLowerCase().trim();
    return options.filter(
      (opt) => opt.label.toLowerCase().includes(term) || (opt.code && opt.code.toLowerCase().includes(term)) || (opt.subLabel && opt.subLabel.toLowerCase().includes(term))
    );
  }, [options, enableSearch, activeSearchTerm, onSearchChange]);

  const handleToggleOption = (optId: string | number) => {
    if (isMultiple) {
      const exists = selectedArray.some((val) => String(val) === String(optId));
      let updated: (string | number)[];
      if (exists) {
        updated = selectedArray.filter((val) => String(val) !== String(optId));
      } else {
        updated = [...selectedArray, optId];
      }
      onChange(updated);
    } else {
      onChange(optId);
      handleClose();
    }
  };

  const handleSelectAll = () => {
    if (!isMultiple) return;
    const allIds = filteredOptions.map((opt) => opt.id);
    onChange(allIds);
  };

  const handleClearAll = () => {
    onChange(isMultiple ? [] : "");
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!onScrollEnd) return;
    const target = event.currentTarget;
    const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 25;
    if (isAtBottom && hasMore && !isFetchingMore && !isLoading) {
      onScrollEnd();
    }
  };

  const selectedOptions = useMemo(
    () => options.filter((opt) => selectedArray.some((v) => String(v) === String(opt.id))), [options, selectedArray]
  );

  return (
    <Box sx={{ width, display: "flex", flexDirection: "column", gap: 0.5 }}>
      {label && (<Typography fontSize="13px" fontWeight={600} color={THEME.textPrimary}> {label} </Typography>)}

      {/* Custom Button Trigger */}
      <CustomButton disabled={disabled} onClick={handleOpen} variant={buttonVariant} startIcon={startIcon || <FilterListIcon sx={{ color: THEME.primary, fontSize: 18 }} />} endIcon={<ExpandMoreIcon sx={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />} sx={{ width: "100%", height, justifyContent: "space-between", textTransform: "none", borderRadius: "8px", bgcolor: bgc || THEME.white, borderColor: error ? THEME.error : border || THEME.border, color: THEME.textPrimary, fontSize, fontWeight: 500, px: 1.8, boxShadow: "none", "&:hover": { bgcolor: `${THEME.primary}08`, borderColor: error ? THEME.error : THEME.primary } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, mr: 1 }}>
          {selectedArray.length === 0 ? (
            <Typography fontSize={fontSize} color={THEME.textSecondary} noWrap> {placeholder} </Typography>
          ) : isMultiple ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "nowrap", overflow: "hidden" }}>
              <Chip label={`${selectedArray.length} Selected`} size="small" sx={{ bgcolor: `${THEME.primary}15`, color: THEME.primary, fontWeight: 700, fontSize: "12px", height: 24 }} />
              <Typography fontSize="12px" color={THEME.textSecondary} noWrap sx={{ maxWidth: 160 }}> ({selectedOptions.map((o) => o.label).join(", ")}) </Typography>
            </Box>
          ) : (
            <Typography fontSize={fontSize} fontWeight={600} color={THEME.textPrimary} noWrap> {selectedOptions[0] ? selectedOptions[0].label : String(value)} </Typography>
          )}
        </Box>
      </CustomButton>

      {error && <FormHelperText error>{error}</FormHelperText>}

      {/* Popover Dropdown Menu */}
      <Popover open={open} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} transformOrigin={{ vertical: "top", horizontal: "left" }} PaperProps={{ sx: { width: anchorEl ? Math.max(anchorEl.clientWidth, 280) : 280, borderRadius: "10px", border: `1px solid ${THEME.border}`, boxShadow: "0 10px 25px rgba(0,0,0,0.12)", p: 1.5, mt: 0.8, display: "flex", flexDirection: "column", maxHeight: 420 } }}>
        {/* Search Header */}
        {enableSearch && (
          <Box mb={1}> <CustomInput size="small" fullWidth autoFocus placeholder="Search options..." value={activeSearchTerm} onChange={(e) => handleSearchChange(e.target.value)} InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ color: THEME.textSecondary, mr: 0.8 }} />, endAdornment: activeSearchTerm ? (<IconButton size="small" onClick={() => handleSearchChange("")}> <ClearIcon fontSize="small" /> </IconButton>) : null }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", fontSize: "13px", bgcolor: "#f8fafc" } }} /> </Box>
        )}

        {/* Quick Select Actions for Multi-Select */}
        {isMultiple && (
          <Box display="flex" justifyContent="space-between" alignItems="center" pb={1} mb={0.5} borderBottom={`1px solid ${THEME.border}`}>
            <CustomButton size="small" onClick={handleSelectAll} sx={{ fontSize: 11, fontWeight: 600, p: 0, textTransform: "none" }}> Select All </CustomButton>
            <Typography fontSize="11px" color={THEME.textSecondary}> {selectedArray.length} of {options.length} selected </Typography>
            <CustomButton size="small" color="error" onClick={handleClearAll} sx={{ fontSize: 11, fontWeight: 600, p: 0, textTransform: "none" }}> Clear </CustomButton>
          </Box>
        )}

        {/* Options List Container */}
        <Box onScroll={handleScroll} sx={{ flex: 1, overflowY: "auto", maxHeight: 240, pr: 0.5, "&::-webkit-scrollbar": { width: 5 }, "&::-webkit-scrollbar-thumb": { borderRadius: 3, bgcolor: "#cbd5e1" } }}>
          {isLoading && options.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4} gap={1.5}>
              <CircularProgress size={20} sx={{ color: THEME.primary }} />
              <Typography fontSize="13px" color={THEME.textSecondary}> Loading options... </Typography>
            </Box>
          ) : filteredOptions.length === 0 ? (
            <Box textAlign="center" py={3}>
              <Typography fontSize="13px" color={THEME.textSecondary}> No matching options found </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filteredOptions.map((opt) => {
                const isSelected = selectedArray.some((v) => String(v) === String(opt.id));
                return (
                  <ListItemButton key={String(opt.id)} onClick={() => handleToggleOption(opt.id)} disabled={opt.disabled} sx={{ borderRadius: "6px", py: 0.8, px: 1, mb: 0.4, bgcolor: isSelected ? `${THEME.primary}12` : "transparent", "&:hover": { bgcolor: isSelected ? `${THEME.primary}20` : `${THEME.primary}08` } }}>
                    {isMultiple ? (
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Checkbox edge="start" checked={isSelected} tabIndex={-1} disableRipple size="small" sx={{ color: THEME.border, "&.Mui-checked": { color: THEME.primary } }} />
                      </ListItemIcon>
                    ) : (
                      isSelected && (
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <CheckIcon sx={{ color: THEME.primary, fontSize: 18 }} />
                        </ListItemIcon>
                      )
                    )}

                    <ListItemText primary={
                      <Typography fontSize="13px" fontWeight={isSelected ? 700 : 500} color={isSelected ? THEME.primary : THEME.textPrimary}>
                        {opt.label}
                      </Typography>
                    }
                      secondary={
                        opt.code || opt.subLabel ? (<Typography fontSize="11px" color={THEME.textSecondary}> {opt.code} {opt.subLabel ? `• ${opt.subLabel}` : ""}</Typography>) : null
                      }
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}

          {/* Scroll Fetching Indicator */}
          {isFetchingMore && (
            <Box display="flex" justifyContent="center" alignItems="center" py={1.5} gap={1}>
              <CircularProgress size={16} sx={{ color: THEME.primary }} />
              <Typography fontSize="12px" color={THEME.textSecondary}> Loading more... </Typography>
            </Box>
          )}
        </Box>

        {/* Footer Section: Pagination Controls & Multi-Select Apply Button */}
        {(totalPages !== undefined && totalPages > 1) || (hasMore === false && options.length > 0) || isMultiple ? (
          <Box pt={1} mt={0.5} borderTop={`1px solid ${THEME.border}`}>
            {/* Page-based Pagination Controls */}
            {totalPages !== undefined && totalPages > 1 && onPageChange && (
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={isMultiple ? 1 : 0}>
                <IconButton size="small" disabled={!page || page <= 1} onClick={() => onPageChange((page || 1) - 1)} sx={{ border: `1px solid ${THEME.border}`, p: 0.5 }}> <ChevronLeftIcon fontSize="small" /> </IconButton>
                <Typography fontSize="12px" fontWeight={600} color={THEME.textSecondary}> Page {page || 1} of {totalPages} </Typography>
                <IconButton size="small" disabled={!page || page >= totalPages} onClick={() => onPageChange((page || 1) + 1)} sx={{ border: `1px solid ${THEME.border}`, p: 0.5 }}> <ChevronRightIcon fontSize="small" /> </IconButton>
              </Box>
            )}

            {/* Scroll Pagination Finished Notice */}
            {hasMore === false && options.length > 0 && !isFetchingMore && totalPages === undefined && (
              <Typography fontSize="11px" color={THEME.textSecondary} textAlign="center" mb={isMultiple ? 1 : 0}> All {options.length} items loaded </Typography>
            )}

            {/* Done button for multi-select */}
            {isMultiple && (
              <CustomButton fullWidth size="small" variant="contained" onClick={handleClose} sx={{ bgcolor: THEME.primary, textTransform: "none", fontWeight: 700, fontSize: "12px", borderRadius: "6px", py: 0.6 }}> Apply Selection ({selectedArray.length}) </CustomButton>
            )}
          </Box>
        ) : null}
      </Popover>
    </Box>
  );
};

export const SearchSelect = CustomSearchSelect;
export default CustomSearchSelect;
