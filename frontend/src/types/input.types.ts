import React from "react";

// Custom Input
export interface CustomInputProps {
  placeholder?: string;
  width?: string | number;
  height?: string | number;
  value?: any;
  isDisabled?: boolean;
  disabled?: boolean;
  bgc?: string;
  borderA?: string;
  onChange?: (e: any) => void;
  startIcon?: React.ReactNode | string;
  endIcon?: React.ReactNode | string;
  placeholderColor?: string;
  boxShad?: string;
  type?: string;
  isPassword?: boolean;
  showPasswordIcon?: string;
  hidePasswordIcon?: string;
  onKeyDown?: (e: any) => void;
  borderRad?: string | number;
  minRow?: number;
  maxRow?: number;
  multiline?: boolean;
  rows?: number;
  label?: string;
  error?: boolean | string;
  helperText?: React.ReactNode;
  InputProps?: any;
  InputLabelProps?: any;
  autoFocus?: boolean;
  size?: "small" | "medium";
  fullWidth?: boolean;
  required?: boolean;
  select?: boolean;
  sx?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

// Custom Select Option
export interface SelectOption {
  id: string | number;
  label: string;
  code?: string;
  subLabel?: string;
  [key: string]: any;
}

// Reusable Custom Select Props (with Search & Infinite Scroll support)
export interface CustomSelectProps {
  height?: string | number;
  width?: string | number;
  value: string | number | (string | number)[];
  placeholder?: string;
  label?: string;
  options: SelectOption[];
  state?: (value: any) => void;
  onChange?: (value: any) => void;
  fontSize?: string;
  bgc?: string;
  fontW?: number;
  bod?: string;
  colorC?: string;
  disabled?: boolean;
  isMultiple?: boolean;
  enableSearch?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onScrollEnd?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  isFetchingMore?: boolean;
  error?: string;
}

export interface CustomSearchSelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string | number | (string | number)[];
  onChange: (value: any) => void;
  isMultiple?: boolean;
  enableSearch?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  // Page-based pagination props
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  // Scroll-based pagination props
  onScrollEnd?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  isFetchingMore?: boolean;
  // Styling props
  width?: string | number;
  height?: string | number;
  bgc?: string;
  border?: string;
  fontSize?: string;
  disabled?: boolean;
  error?: string;
  buttonVariant?: "outlined" | "contained" | "text";
  startIcon?: React.ReactNode;
}