import { useThemeStore } from "@/store/useThemeStore";

export const SIDEBAR_WIDTH = 300;

export const THEME = {
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    secondary: '#7C3AED',
    tertiary: '#1E40AF',
    background: '#F8FAFC',
    white: '#FFFFFF',
    black: '#000000',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#DC2626',
    transparent: 'transparent'
};

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
        background: isDark ? '#0F172A' : '#F8FAFC',
        cardBg: isDark ? '#1E293B' : '#FFFFFF',
        paperBg: isDark ? '#1E293B' : '#FFFFFF',
        white: isDark ? '#1E293B' : '#FFFFFF',
        black: isDark ? '#FFFFFF' : '#000000',
        textPrimary: isDark ? '#F8FAFC' : '#0F172A',
        textSecondary: isDark ? '#94A3B8' : '#64748B',
        border: isDark ? '#334155' : '#E2E8F0',
        inputBg: isDark ? '#0F172A' : '#FFFFFF',
        headerBg: isDark ? '#1E293B' : '#FFFFFF',
        sidebarBg: isDark ? '#0F172A' : '#FFFFFF',
        hoverBg: isDark ? '#334155' : '#E2E8F0',
        success: THEME.success,
        warning: THEME.warning,
        error: THEME.error,
        transparent: 'transparent'
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