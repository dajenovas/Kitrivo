import React from "react";
import { Box } from "@mui/material";
import { THEME } from "@/assets/theme";
import { Key as KeyIcon } from "@mui/icons-material";
import type { RenderSvgIconProps } from "@/types/common.types";

export const RenderSvgIcon: React.FC<RenderSvgIconProps> = ({ svgString, size = 20, color = THEME.primary }) => {
  if (!svgString || typeof svgString !== "string" || !svgString.trim().includes("<svg")) {
    return (
      <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, color }}>
        <KeyIcon sx={{ fontSize: size, color }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, color, "& svg": { width: size, height: size, stroke: "currentColor", fill: "none", verticalAlign: "middle" } }} dangerouslySetInnerHTML={{ __html: svgString }} />
  );
};

export default RenderSvgIcon;
