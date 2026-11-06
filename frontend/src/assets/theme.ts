import { useThemeStore } from "@/store/useThemeStore";

export const SIDEBAR_WIDTH = 300;

// Individual exported color variables
export const COLOR_PRIMARY = '#2563EB';
export const COLOR_PRIMARY_DARK = '#1D4ED8';
export const COLOR_SECONDARY = '#7C3AED';
export const COLOR_TERTIARY = '#1E40AF';
export const COLOR_BG_GRADIENT = 'linear-gradient(270deg, #5C4AE4 0%, rgba(92, 74, 228, 0.5) 23.08%, rgba(92, 74, 228, 0.24) 54.33%, rgba(92, 74, 228, 0) 100%)';
export const COLOR_WHITE = '#FFFFFF';
export const COLOR_BLACK = '#000000';
export const COLOR_TRANSPARENT = 'transparent';
export const COLOR_SUCCESS = '#16A34A';
export const COLOR_WARNING = '#F59E0B';
export const COLOR_ERROR = '#DC2626';

// Slate palette
export const COLOR_SLATE_50 = '#F8FAFC';
export const COLOR_SLATE_100 = '#F1F5F9';
export const COLOR_SLATE_200 = '#E2E8F0';
export const COLOR_SLATE_300 = '#CBD5E1';
export const COLOR_SLATE_400 = '#94A3B8';
export const COLOR_SLATE_500 = '#64748B';
export const COLOR_SLATE_600 = '#475569';
export const COLOR_SLATE_700 = '#334155';
export const COLOR_SLATE_800 = '#1E293B';
export const COLOR_SLATE_900 = '#0F172A';

// Blue palette
export const COLOR_BLUE_50 = '#EFF6FF';
export const COLOR_BLUE_100 = '#DBEAFE';
export const COLOR_BLUE_200 = '#BFDBFE';
export const COLOR_BLUE_300 = '#93C5FD';
export const COLOR_BLUE_400 = '#60A5FA';
export const COLOR_BLUE_500 = '#3B82F6';
export const COLOR_BLUE_600 = '#2563EB';
export const COLOR_BLUE_700 = '#1D4ED8';
export const COLOR_BLUE_800 = '#1E40AF';
export const COLOR_BLUE_900 = '#1E3A8A';
export const COLOR_NAVY_900 = '#1D3557';

// Green palette
export const COLOR_GREEN_50 = '#F0FDF4';
export const COLOR_GREEN_100 = '#DCFCE7';
export const COLOR_GREEN_500 = '#22C55E';
export const COLOR_GREEN_600 = '#16A34A';
export const COLOR_GREEN_700 = '#15803D';
export const COLOR_GREEN_800 = '#166534';

// Red palette
export const COLOR_RED_50 = '#FEF2F2';
export const COLOR_RED_100 = '#FEE2E2';
export const COLOR_RED_500 = '#EF4444';
export const COLOR_RED_600 = '#DC2626';
export const COLOR_RED_700 = '#B91C1C';
export const COLOR_RED_800 = '#991B1B';
export const COLOR_RED_DARK = '#C62828';

// Amber palette
export const COLOR_AMBER_50 = '#FFFBEB';
export const COLOR_AMBER_100 = '#FEF3C7';
export const COLOR_AMBER_500 = '#F59E0B';
export const COLOR_AMBER_600 = '#D97706';
export const COLOR_AMBER_700 = '#B45309';
export const COLOR_AMBER_800 = '#92400E';

// Purple / Violet palette
export const COLOR_PURPLE_50 = '#FAF5FF';
export const COLOR_PURPLE_100 = '#F3E8FF';
export const COLOR_PURPLE_500 = '#A855F7';
export const COLOR_PURPLE_600 = '#7C3AED';
export const COLOR_PURPLE_700 = '#6D28D9';
export const COLOR_PURPLE_800 = '#6B21A8';
export const COLOR_ACCENT_PURPLE = '#5C4AE4';

// Sky palette
export const COLOR_SKY_100 = '#E0F2FE';
export const COLOR_SKY_400 = '#38BDF8';
export const COLOR_SKY_600 = '#0284C7';
export const COLOR_SKY_800 = '#075985';

// Emerald palette
export const COLOR_EMERALD_100 = '#D1FAE5';
export const COLOR_EMERALD_500 = '#10B981';
export const COLOR_EMERALD_600 = '#059669';
export const COLOR_EMERALD_700 = '#047857';

// Gray & Neutral palette
export const COLOR_GRAY_100 = '#F3F4F6';
export const COLOR_GRAY_200 = '#E5E7EB';
export const COLOR_NEUTRAL_300 = '#D4D4D4';

// Overlay & Translucent colors
export const COLOR_OVERLAY_DARK_05 = 'rgba(0, 0, 0, 0.05)';
export const COLOR_OVERLAY_DARK_08 = 'rgba(0, 0, 0, 0.08)';
export const COLOR_OVERLAY_DARK_10 = 'rgba(0, 0, 0, 0.1)';
export const COLOR_OVERLAY_DARK_15 = 'rgba(0, 0, 0, 0.15)';
export const COLOR_OVERLAY_DARK_50 = 'rgba(0, 0, 0, 0.5)';
export const COLOR_OVERLAY_DARK_60 = 'rgba(0, 0, 0, 0.6)';

export const COLOR_OVERLAY_WHITE_02 = 'rgba(255, 255, 255, 0.02)';
export const COLOR_OVERLAY_WHITE_03 = 'rgba(255, 255, 255, 0.03)';
export const COLOR_OVERLAY_WHITE_05 = 'rgba(255, 255, 255, 0.05)';
export const COLOR_OVERLAY_WHITE_08 = 'rgba(255, 255, 255, 0.08)';
export const COLOR_OVERLAY_WHITE_10 = 'rgba(255, 255, 255, 0.1)';
export const COLOR_OVERLAY_WHITE_18 = 'rgba(255, 255, 255, 0.18)';
export const COLOR_OVERLAY_WHITE_20 = 'rgba(255, 255, 255, 0.2)';

export const COLOR_PRIMARY_ALPHA_10 = 'rgba(37, 99, 235, 0.1)';
export const COLOR_PRIMARY_ALPHA_12 = 'rgba(37, 99, 235, 0.12)';
export const COLOR_PRIMARY_ALPHA_15 = 'rgba(37, 99, 235, 0.15)';
export const COLOR_PRIMARY_ALPHA_30 = 'rgba(37, 99, 235, 0.3)';

export const COLOR_SUCCESS_ALPHA_12 = 'rgba(34, 197, 94, 0.12)';
export const COLOR_ERROR_ALPHA_12 = 'rgba(239, 68, 68, 0.12)';
export const COLOR_WARNING_ALPHA_12 = 'rgba(245, 158, 11, 0.12)';
// WhatsApp & Social
export const COLOR_WHATSAPP = '#25D366';
export const COLOR_WHATSAPP_ALPHA_15 = 'rgba(37, 211, 102, 0.15)';

// Rose & Indigo palette
export const COLOR_ROSE_500 = '#F43F5E';
export const COLOR_INDIGO_400 = '#818CF8';
export const COLOR_INDIGO_950 = '#1E1B4B';
export const COLOR_DARK_HERO_BG = '#090D16';

export const THEME = {
    whatsapp: COLOR_WHATSAPP,
    whatsappBg: COLOR_WHATSAPP_ALPHA_15,
    primary: COLOR_PRIMARY,
    primaryDark: COLOR_PRIMARY_DARK,
    secondary: COLOR_SECONDARY,
    tertiary: COLOR_TERTIARY,
    background: COLOR_BG_GRADIENT,
    white: COLOR_WHITE,
    black: COLOR_BLACK,
    textPrimary: COLOR_SLATE_900,
    textSecondary: COLOR_SLATE_500,
    border: COLOR_SLATE_200,
    success: COLOR_SUCCESS,
    warning: COLOR_WARNING,
    error: COLOR_ERROR,
    transparent: COLOR_TRANSPARENT,
    
    // Convenience color aliases used across components
    blueLight: COLOR_BLUE_100,
    blue: COLOR_BLUE_500,
    blueDark: COLOR_BLUE_700,
    
    emeraldLight: COLOR_EMERALD_100,
    emerald: COLOR_EMERALD_500,
    emeraldDark: COLOR_EMERALD_700,
    
    amberLight: COLOR_AMBER_100,
    amber: COLOR_AMBER_500,
    amberDark: COLOR_AMBER_700,
    
    purpleLight: COLOR_PURPLE_100,
    purple: COLOR_PURPLE_500,
    purpleDark: COLOR_PURPLE_700,
    
    redLight: COLOR_RED_100,
    red: COLOR_RED_500,
    redDark: COLOR_RED_700,
    
    skyLight: COLOR_SKY_100,
    sky: COLOR_SKY_400,
    skyDark: COLOR_SKY_800,
    
    shadowPrimary: 'rgba(37, 99, 235, 0.15)',
    
    // Extended theme tokens
    slate50: COLOR_SLATE_50,
    slate100: COLOR_SLATE_100,
    slate200: COLOR_SLATE_200,
    slate300: COLOR_SLATE_300,
    slate400: COLOR_SLATE_400,
    slate500: COLOR_SLATE_500,
    slate600: COLOR_SLATE_600,
    slate700: COLOR_SLATE_700,
    slate800: COLOR_SLATE_800,
    slate900: COLOR_SLATE_900,
    
    blue50: COLOR_BLUE_50,
    blue100: COLOR_BLUE_100,
    blue200: COLOR_BLUE_200,
    blue300: COLOR_BLUE_300,
    blue400: COLOR_BLUE_400,
    blue500: COLOR_BLUE_500,
    blue600: COLOR_BLUE_600,
    blue700: COLOR_BLUE_700,
    blue800: COLOR_BLUE_800,
    blue900: COLOR_BLUE_900,
    
    green50: COLOR_GREEN_50,
    green100: COLOR_GREEN_100,
    green500: COLOR_GREEN_500,
    green600: COLOR_GREEN_600,
    green700: COLOR_GREEN_700,
    green800: COLOR_GREEN_800,
    
    red50: COLOR_RED_50,
    red100: COLOR_RED_100,
    red500: COLOR_RED_500,
    red600: COLOR_RED_600,
    red700: COLOR_RED_700,
    red800: COLOR_RED_800,
    redDark: COLOR_RED_DARK,
    
    amber50: COLOR_AMBER_50,
    amber100: COLOR_AMBER_100,
    amber500: COLOR_AMBER_500,
    amber600: COLOR_AMBER_600,
    amber700: COLOR_AMBER_700,
    amber800: COLOR_AMBER_800,
    
    purple50: COLOR_PURPLE_50,
    purple100: COLOR_PURPLE_100,
    purple500: COLOR_PURPLE_500,
    purple600: COLOR_PURPLE_600,
    purple700: COLOR_PURPLE_700,
    purple800: COLOR_PURPLE_800,
    
    sky100: COLOR_SKY_100,
    sky400: COLOR_SKY_400,
    sky600: COLOR_SKY_600,
    sky800: COLOR_SKY_800,
    
    emerald100: COLOR_EMERALD_100,
    emerald500: COLOR_EMERALD_500,
    emerald600: COLOR_EMERALD_600,
    emerald700: COLOR_EMERALD_700,
    
    gray100: COLOR_GRAY_100,
    gray200: COLOR_GRAY_200,
    neutral300: COLOR_NEUTRAL_300,
};

export const COLORS = THEME;

export const useAppTheme = () => {
    const mode = useThemeStore((state) => state.mode);
    const isDark = mode === "dark";

    return {
        mode,
        isDark,
        primary: THEME.primary,
        primaryDark: THEME.primaryDark,
        secondary: THEME.secondary,
        tertiary: THEME.tertiary,
        background: isDark ? COLOR_SLATE_900 : THEME.background,
        cardBg: isDark ? COLOR_SLATE_800 : COLOR_WHITE,
        paperBg: isDark ? COLOR_SLATE_800 : COLOR_WHITE,
        white: isDark ? COLOR_SLATE_800 : COLOR_WHITE,
        black: isDark ? COLOR_WHITE : COLOR_BLACK,
        textPrimary: isDark ? COLOR_SLATE_50 : COLOR_SLATE_900,
        textSecondary: isDark ? COLOR_SLATE_400 : COLOR_SLATE_500,
        border: isDark ? COLOR_SLATE_700 : COLOR_SLATE_200,
        inputBg: isDark ? COLOR_SLATE_900 : COLOR_WHITE,
        headerBg: isDark ? COLOR_SLATE_800 : COLOR_WHITE,
        sidebarBg: isDark ? COLOR_SLATE_900 : COLOR_WHITE,
        hoverBg: isDark ? COLOR_SLATE_700 : COLOR_SLATE_200,
        success: THEME.success,
        warning: THEME.warning,
        error: THEME.error,
        transparent: COLOR_TRANSPARENT
    };
};

export const FONTSIZE = {
    heading: '32px',
    subHeading: '24px',
    xlarge: '22px',
    title: '20px',
    large: '18px',
    body: '16px',
    medium: '15px',
    small: '14px',
    caption: '12px',
};

export const FONTWEIGHT = {
    heading: 700,
    subHeading: 600,
    title: 600,
    body: 400,
    small: 400,
    caption: 400,
};

export const BOXSHADOW = '0px 0px 10px 4px #d4d4d4ff';