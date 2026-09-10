// Custom Input
export interface CustomInputProps {
    placeholder?: string;
    width?: string | number;
    height?: string | number;
    value?: string;
    isDisabled?: boolean;
    bgc?: string;
    borderA?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    startIcon?: string;
    endIcon?: string;
    placeholderColor?: string;
    boxShad?: string;
    type?: string;
    isPassword?: boolean;
    showPasswordIcon?: string;
    hidePasswordIcon?: string;
    onKeyDown?: () => void;
    borderRad?: string | number;
    minRow?: number;
    maxRow?: number;
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