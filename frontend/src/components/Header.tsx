import { useMemo, useState } from "react";
import { THEME, FONTSIZE, FONTWEIGHT, useAppTheme } from "@/assets/theme";
import { Box, Typography, Avatar, IconButton, Tooltip, Badge } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useCartStore } from "@/store/useCartStore";
import ProfileOverlay from "@/components/ProfileOverlay";
import { SettingsOutlined as SettingsOutlinedIcon, ShoppingCartOutlined as ShoppingCartOutlinedIcon, DarkModeOutlined as DarkModeOutlinedIcon, LightMode as LightModeIcon } from "@mui/icons-material";
import { formatPathToTitle } from "@/utils/helpers/global.helpers";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { mode, toggleTheme } = useThemeStore();
  const theme = useAppTheme();
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const [profileOpen, setProfileOpen] = useState<boolean>(false);

  const headingTitle = useMemo(() => {
    const path = location.pathname;

    if (path === "/settings") return "System Settings & Configuration";
    if (path === "/cart") return "Product Inquiry Cart";

    if (user) {
      if (user.menu_tree && user.menu_tree.length > 0) {
        const foundInMenu = user.menu_tree.find(
          (item) => item.path === path || (item.path && path.startsWith(item.path) && item.path !== "/")
        );
        if (foundInMenu?.name) return foundInMenu.name;
      }

      if (user.roles) {
        const perms = user.roles.flatMap((r) => r.permissions || []);
        const foundPerm = perms.find(
          (p) => p.path === path || (p.path && path.startsWith(p.path) && p.path !== "/")
        );
        if (foundPerm?.name) return foundPerm.name;
      }
    }

    return formatPathToTitle(path);
  }, [location.pathname, user]);

  const initials = (user?.full_name || user?.username || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Box height={80} position="fixed" top={0} right={0} left="300px" bgcolor={theme.headerBg} borderBottom={`1px solid ${theme.border}`} display="flex" alignItems="center" justifyContent="space-between" px={4} zIndex={1100} sx={{ boxShadow: theme.isDark ? "0 2px 10px rgba(0, 0, 0, 0.3)" : "0 2px 10px rgba(0, 0, 0, 0.03)", transition: "all 0.25s ease-in-out" }}>
      {/* Title */}
      <Typography fontSize={FONTSIZE.title} fontWeight={FONTWEIGHT.title} color={theme.textPrimary}> {headingTitle} </Typography>
      <Box display="flex" alignItems="center" gap={1.5}>
        {/* Theme Mode Toggle Button */}
        <Tooltip title={`Switch to ${mode === "light" ? "Dark" : "Light"} Mode`}>
          <IconButton onClick={toggleTheme} sx={{ color: theme.textPrimary, bgcolor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : `${THEME.border}60`, "&:hover": { bgcolor: mode === "dark" ? "rgba(255, 255, 255, 0.2)" : `${THEME.border}` }, transition: "all 0.2s ease" }}>
            {mode === "dark" ? (<LightModeIcon sx={{ fontSize: 22, color: "#f59e0b" }} />) : (<DarkModeOutlinedIcon sx={{ fontSize: 22, color: "#0f172a" }} />)}
          </IconButton>
        </Tooltip>

        {/* Cart Icon */}
        <Tooltip title="View Product Inquiry Cart">
          <IconButton onClick={() => navigate("/cart")} sx={{ color: theme.textPrimary, bgcolor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : `${THEME.border}60`, "&:hover": { bgcolor: mode === "dark" ? "rgba(255, 255, 255, 0.2)" : `${THEME.border}` }, transition: "all 0.2s ease" }}>
            <Badge badgeContent={cartItemCount} color="primary" showZero={false}> <ShoppingCartOutlinedIcon sx={{ fontSize: 22, color: theme.textPrimary }} /></Badge>
          </IconButton>
        </Tooltip>

        {/* Settings Icon */}
        <Tooltip title="System Settings & Password Change">
          <IconButton onClick={() => navigate("/settings")} sx={{ color: theme.textPrimary, bgcolor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : `${THEME.border}60`, "&:hover": { bgcolor: mode === "dark" ? "rgba(255, 255, 255, 0.2)" : `${THEME.border}` }, transition: "all 0.2s ease" }}>
            <SettingsOutlinedIcon sx={{ fontSize: 22, color: theme.textPrimary }} />
          </IconButton>
        </Tooltip>

        {/* Profile Avatar & Details Trigger */}
        {user && (
          <Box display="flex" alignItems="center" gap={1.5} ml={1}>
            <Box textAlign="right" display={{ xs: "none", sm: "block" }}>
              <Typography fontSize={FONTSIZE.small} fontWeight={600} color={theme.textPrimary}> {user.full_name || user.username} </Typography>
              <Typography fontSize="12px" color={theme.textSecondary}> {user.roles && user.roles.length > 0 ? user.roles[0].name : "User"} </Typography>
            </Box>

            <Tooltip title="View Account Details & Profile Picture">
              <IconButton onClick={() => setProfileOpen(true)} sx={{ p: 0.5, border: `2px solid ${THEME.primary}30`, "&:hover": { border: `2px solid ${THEME.primary}` }, transition: "all 0.2s ease" }}>
                <Avatar src={user.profile_picture || undefined} sx={{ width: 40, height: 40, bgcolor: THEME.primary, fontSize: "16px", fontWeight: 700 }}> {!user.profile_picture && initials} </Avatar>
              </IconButton>
            </Tooltip>
            {/* Profile Overlay */}
            <ProfileOverlay open={profileOpen} onClose={() => setProfileOpen(false)} />
          </Box>
        )}
      </Box>
    </Box>
  );
};


export default Header;