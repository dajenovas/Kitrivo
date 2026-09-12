import React from "react";

export interface CustomButtonProps {
  text?: React.ReactNode;
  children?: React.ReactNode;
  width?: string | number;
  height?: string | number;
  font?: string | number;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  borderRadius?: string | number;
  isDisabled?: boolean;
  disabled?: boolean;
  bgc?: string;
  color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" | string;
  textColor?: string;
  variant?: "contained" | "outlined" | "text";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  Sicon?: React.ReactNode | string;
  Eicon?: React.ReactNode | string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  boxShad?: string;
  border?: string;
  hov?: string;
  hovBoxShad?: string;
  hoverTextColor?: string;
  type?: "button" | "submit" | "reset";
  component?: any;
  href?: string;
  target?: string;
  rel?: string;
  autoFocus?: boolean;
  sx?: any;
  [key: string]: any;
}