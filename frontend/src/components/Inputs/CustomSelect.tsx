import React, { useMemo, useState, useEffect } from "react";
import { THEME } from "@/assets/theme";
import type { CustomSelectProps } from "@/types/input.types";
import { ExpandMore as ExpandMoreIcon, Search as SearchIcon } from "@mui/icons-material";
import { Box, Checkbox, Chip, CircularProgress, FormControl, FormHelperText, InputLabel, ListItemText, ListSubheader, MenuItem, OutlinedInput, Select, type SelectChangeEvent, Typography } from "@mui/material";

import { CustomInput } from "./CustomInput";

export const CustomSelect: React.FC<CustomSelectProps> = ({ height = "40px", width = "100%", value, placeholder = "", label, options = [], state, onChange, fontSize, bgc, fontW = 400, bod, colorC, disabled = false, isMultiple = false, enableSearch = false, searchTerm: externalSearchTerm, onSearchChange, onScrollEnd, hasMore, isLoading = false, isFetchingMore = false, pageSize = 20, error }) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState(externalSearchTerm || "");
  const activeSearchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;

  const [visibleCount, setVisibleCount] = useState<number>(pageSize);

  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      setInternalSearchTerm(externalSearchTerm);
    }
  }, [externalSearchTerm]);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [activeSearchTerm, options.length, pageSize]);

  const handleSearchInputChange = (term: string) => {
    setInternalSearchTerm(term);
    if (onSearchChange) {
      onSearchChange(term);
    }
  };

  // Filter options client-side if no external search handler is provided
  const filteredOptions = useMemo(() => {
    if (!enableSearch || !activeSearchTerm.trim() || onSearchChange) return options;
    const term = activeSearchTerm.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        (opt.code && opt.code.toLowerCase().includes(term)) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(term))
    );
  }, [options, enableSearch, activeSearchTerm, onSearchChange]);

  const displayedOptions = useMemo(() => {
    if (onScrollEnd) return filteredOptions;
    return filteredOptions.slice(0, visibleCount);
  }, [filteredOptions, onScrollEnd, visibleCount]);

  const handleSelectChange = (event: SelectChangeEvent<any>) => {
    const rawVal = event.target.value;
    let finalVal: any;

    if (isMultiple) {
      finalVal = typeof rawVal === "string" ? rawVal.split(",") : rawVal;
    } else {
      finalVal = rawVal;
    }

    if (onChange) {
      onChange(finalVal);
    } else if (state) {
      state(finalVal);
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 25;
    if (isAtBottom) {
      if (onScrollEnd) {
        if (hasMore && !isFetchingMore && !isLoading) {
          onScrollEnd();
        }
      } else if (visibleCount < filteredOptions.length) {
        setVisibleCount((prev) => prev + pageSize);
      }
    }
  };

  const selectedArray = Array.isArray(value) ? value : value !== undefined && value !== null && value !== "" ? [value] : [];

  return (
    <FormControl fullWidth disabled={disabled} error={Boolean(error)} variant="outlined" sx={{ width: width }}>
      {label && (
        <InputLabel id={`custom-select-label-${label}`} size="small" sx={{ fontSize: fontSize || "14px" }}> {label} </InputLabel>
      )}

      <Select labelId={label ? `custom-select-label-${label}` : undefined} multiple={isMultiple} value={isMultiple ? selectedArray : value || ""} onChange={handleSelectChange} disabled={disabled} IconComponent={ExpandMoreIcon} displayEmpty input={label ? <OutlinedInput label={label} size="small" /> : undefined}
        renderValue={(selected) => {
          if (isMultiple) {
            const arr = Array.isArray(selected) ? selected : [];
            if (arr.length === 0) {
              return placeholder ? (
                <Typography fontSize={fontSize || "14px"} color={THEME.textSecondary}>
                  {placeholder}
                </Typography>
              ) : null;
            }
            return (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {arr.map((val) => {
                  const opt = options.find((o) => String(o.id) === String(val));
                  return (
                    <Chip key={String(val)} label={opt ? opt.label : String(val)} size="small" sx={{ bgcolor: `${THEME.primary}15`, color: THEME.primary, fontWeight: 600, fontSize: "12px" }} />
                  );
                })}
              </Box>
            );
          }

          const singleVal = String(selected || "");
          if (!singleVal) {
            return placeholder ? (
              <Typography fontSize={fontSize || "14px"} color={THEME.textSecondary}> {placeholder} </Typography>
            ) : null;
          }
          const opt = options.find((o) => String(o.id) === singleVal);
          return opt ? opt.label : singleVal;
        }}
        MenuProps={{
          PaperProps: {
            onScroll: handleScroll,
            sx: {
              maxHeight: 320,
              border: `1px solid ${THEME.border}`,
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              zIndex: (theme) => theme.zIndex.modal + 20,
            },
          },
          autoFocus: false,
        }}
        sx={{
          height: height || "40px",
          borderRadius: "8px",
          backgroundColor: bgc || "transparent",
          color: colorC || THEME.textPrimary,
          fontWeight: fontW,
          fontSize: fontSize || "14px",
          "& .MuiOutlinedInput-notchedOutline": {
            border: bod || `1px solid ${THEME.border}`,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            border: bod || `1px solid ${THEME.primary}`,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: bod || `1px solid ${THEME.primary}`,
          },
          "& .MuiSvgIcon-root": { color: THEME.textSecondary },
        }}
      >
        {/* Search Header */}
        {enableSearch && (
          <ListSubheader disableSticky={false} onClick={(e) => e.stopPropagation()} sx={{ bgcolor: THEME.white, p: 1, zIndex: 2, borderBottom: `1px solid ${THEME.border}` }}>
            <CustomInput size="small" fullWidth placeholder="Search..." value={activeSearchTerm} onChange={(e: any) => handleSearchInputChange(e.target.value)} onKeyDown={(e: any) => e.stopPropagation()} onClick={(e: any) => e.stopPropagation()} InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ color: THEME.textSecondary, mr: 0.5 }} /> }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", fontSize: "13px" } }} />
          </ListSubheader>
        )}

        {/* Initial Loading */}
        {isLoading && options.length === 0 ? (
          <MenuItem disabled sx={{ justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} sx={{ color: THEME.primary }} />
            <Typography fontSize="14px" sx={{ ml: 1.5, color: THEME.textSecondary }}> Loading options... </Typography>
          </MenuItem>
        ) : displayedOptions.length === 0 ? (
          <MenuItem disabled sx={{ justifyContent: "center", py: 2 }}>
            <Typography fontSize="13px" color={THEME.textSecondary}> No options found </Typography>
          </MenuItem>
        ) : (
          displayedOptions.map((opt) => {
            const isChecked = selectedArray.some((v) => String(v) === String(opt.id));
            return (
              <MenuItem key={String(opt.id)} value={opt.id} sx={{ py: 0.8, px: 1.5, borderRadius: "4px", mx: 0.5, my: 0.2, "&:hover": { bgcolor: `${THEME.primary}10` } }}>
                {isMultiple && (
                  <Checkbox checked={isChecked} size="small" sx={{ color: THEME.border, "&.Mui-checked": { color: THEME.primary } }} />
                )}
                <ListItemText primary={<Typography fontSize="14px" fontWeight={500} color={THEME.textPrimary}> {opt.label} </Typography>} secondary={opt.code || opt.subLabel ? (<Typography fontSize="11px" color={THEME.textSecondary}> {opt.code} {opt.subLabel ? `• ${opt.subLabel}` : ""} </Typography>) : undefined} />
              </MenuItem>
            );
          })
        )}

        {/* Infinite Scroll Spinner */}
        {isFetchingMore && (
          <MenuItem disabled sx={{ justifyContent: "center", py: 1.5 }}>
            <CircularProgress size={18} sx={{ color: THEME.primary }} />
            <Typography fontSize="12px" sx={{ ml: 1, color: THEME.textSecondary }}> Loading more... </Typography>
          </MenuItem>
        )}

        {/* End of Pagination Indicator / Client-side pagination indicator */}
        {onScrollEnd && hasMore === false && options.length > 0 && !isFetchingMore && (
          <Box textAlign="center" py={1} borderTop={`1px dashed ${THEME.border}`}>
            <Typography fontSize="11px" color={THEME.textSecondary}> All {options.length} items loaded </Typography>
          </Box>
        )}
        {!onScrollEnd && visibleCount < filteredOptions.length && (
          <Box textAlign="center" py={1} borderTop={`1px dashed ${THEME.border}`}>
            <Typography fontSize="11px" color={THEME.textSecondary}> Showing {displayedOptions.length} of {filteredOptions.length} items (scroll for more) </Typography>
          </Box>
        )}
      </Select>

      {error && <FormHelperText error>{error}</FormHelperText>}
    </FormControl>
  );
};

export default CustomSelect;