import React from "react";
import { THEME } from "@/assets/theme";
import type { CustomButtonProps } from "@/types/button.types";
import { Box, Button } from "@mui/material";

export const CustomButton: React.FC<CustomButtonProps> = ({ text, children, width, height, isDisabled, disabled, font, border, borderRadius, color, textColor, onClick, bgc, Sicon, Eicon, startIcon, endIcon, boxShad, hov, hovBoxShad, type = "button", hoverTextColor, variant = "contained", size, fullWidth, component, href, target, rel, autoFocus, sx, ...rest }) => {
  const isButtonDisabled = disabled !== undefined ? disabled : isDisabled;
  const computedStartIcon = startIcon || (typeof Sicon === "string" ? <Box component="img" src={Sicon} sx={{ width: 20, height: 20 }} /> : Sicon);
  const computedEndIcon = endIcon || (typeof Eicon === "string" ? <Box component="img" src={Eicon} sx={{ width: 20, height: 20 }} /> : Eicon);

  const isMuiColor = color && ["primary", "secondary", "success", "error", "info", "warning", "inherit"].includes(color);

  return (
    <Button type={type} variant={variant} size={size} color={isMuiColor ? (color as any) : undefined} fullWidth={fullWidth} disabled={isButtonDisabled} onClick={onClick} component={component} href={href} target={target} rel={rel} autoFocus={autoFocus} disableFocusRipple disableRipple disableTouchRipple startIcon={computedStartIcon} endIcon={computedEndIcon} sx={{ height: height || (size === "small" ? "32px" : "40px"), width: width || (fullWidth ? "100%" : undefined), textTransform: "none", border: border || (variant === "outlined" ? `1px solid ${THEME.border}` : "1px solid transparent"), borderRadius: borderRadius || "8px", fontSize: font || (size === "small" ? "12px" : "14px"), backgroundColor: bgc ? bgc : isMuiColor ? undefined : variant === "outlined" || variant === "text" ? "transparent" : THEME.primary, color: textColor ? textColor : !isMuiColor && !color ? (variant === "outlined" || variant === "text" ? THEME.textPrimary : THEME.white) : !isMuiColor && color ? color : undefined, boxShadow: boxShad || "none", "&:hover": { backgroundColor: hov || (variant === "outlined" || variant === "text" ? `${THEME.primary}10` : THEME.tertiary), boxShadow: hovBoxShad || "none", color: hoverTextColor }, ...sx, }} {...rest}>
      {text !== undefined ? text : children}
    </Button>
  );
};

export default CustomButton;