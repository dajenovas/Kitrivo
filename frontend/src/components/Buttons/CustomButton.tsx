
import { THEME } from "@/assets/theme";
import type { CustomButtonProps } from "@/types/button.types";
import { Box, Button } from "@mui/material";

export const CustomButton = ({ text, width, height, isDisabled, font, border, borderRadius, color, onClick, bgc, Sicon, Eicon, boxShad, hov, hovBoxShad, type = "button", hoverTextColor }: CustomButtonProps) => {
  return (
    <Button type={type} variant="contained" disabled={isDisabled} onClick={onClick} disableFocusRipple disableRipple disableTouchRipple
      sx={{
        height: height || "40px", width: width || "100%", textTransform: "none",border: border || "1px solid transparent", borderRadius: borderRadius || "8px",
        fontSize: font, backgroundColor: bgc || THEME.primary, color: color || THEME.white, boxShadow: boxShad || "none",
        "&:hover": { backgroundColor: hov || THEME.tertiary, boxShadow: hovBoxShad || "none", color: hoverTextColor || THEME.black}
      }}
      startIcon={typeof Sicon === "string" ? (<Box component="img" src={Sicon} sx={{ width: 20, height: 20 }} />) : (Sicon)}
      endIcon={typeof Eicon === "string" ? (<Box component="img" src={Eicon} sx={{ width: 20, height: 20 }} />) : (Eicon)}>
      {text}
    </Button>
  )
}