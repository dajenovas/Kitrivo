import React, { useMemo, useState } from 'react';
import { THEME, FONTSIZE, FONTWEIGHT } from '@/assets/theme';
import { Box, Typography, Avatar, IconButton, Tooltip } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import ProfileOverlay from '@/components/ProfileOverlay';

/**
 * Dynamically converts any URL pathname into a human-readable title.
 * Eliminates hardcoded route maps.
 */
const formatPathToTitle = (pathname: string): string => {
    const cleanPath = pathname.replace(/\/$/, '');
    if (!cleanPath || cleanPath === '/') return 'Dashboard';

    const segments = cleanPath.split('/').filter(Boolean);
    const moduleSegments = segments.filter(
        (seg) => !['list', 'view', 'details', 'index'].includes(seg.toLowerCase())
    );

    const targetSegment = moduleSegments.length > 0 ? moduleSegments[moduleSegments.length - 1] : segments[0];
    if (!targetSegment) return 'Dashboard';

    const formatted = targetSegment
        .replace(/[-_]/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    if (!/management|settings|dashboard|profile|details/i.test(formatted)) {
        return `${formatted} Management`;
    }

    return formatted;
};

const Header = () => {
    const location = useLocation();
    const user = useAuthStore((state) => state.user);
    const [profileOpen, setProfileOpen] = useState<boolean>(false);

    const headingTitle = useMemo(() => {
        const path = location.pathname;

        if (user) {
            // 1. Check dynamic menu_tree provided by auth/me API
            if (user.menu_tree && user.menu_tree.length > 0) {
                const foundInMenu = user.menu_tree.find(
                    (item) => item.path === path || (item.path && path.startsWith(item.path) && item.path !== '/')
                );
                if (foundInMenu?.name) return foundInMenu.name;
            }

            // 2. Check dynamic permissions assigned to current user's roles
            if (user.roles) {
                const perms = user.roles.flatMap((r) => r.permissions || []);
                const foundPerm = perms.find(
                    (p) => p.path === path || (p.path && path.startsWith(p.path) && p.path !== '/')
                );
                if (foundPerm?.name) return foundPerm.name;
            }
        }

        // 3. Pure dynamic path parser fallback (no hardcoding)
        return formatPathToTitle(path);
    }, [location.pathname, user]);

    const initials = (user?.full_name || user?.username || 'U')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <Box
            height={80}
            position="fixed"
            top={0}
            right={0}
            left="300px"
            bgcolor={THEME.white}
            borderBottom={`1px solid ${THEME.border}`}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={4}
            zIndex={1100}
            sx={{
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                transition: 'all 0.2s ease-in-out',
            }}
        >
            {/* Title */}
            <Typography fontSize={FONTSIZE.title} fontWeight={FONTWEIGHT.title} color={THEME.textPrimary}>
                {headingTitle}
            </Typography>

            {/* Profile Avatar Icon & Details Overlay Trigger */}
            {user && (
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box textAlign="right" display={{ xs: 'none', sm: 'block' }}>
                        <Typography fontSize={FONTSIZE.small} fontWeight={600} color={THEME.textPrimary}>
                            {user.full_name || user.username}
                        </Typography>
                        <Typography fontSize="12px" color={THEME.textSecondary}>
                            {user.roles && user.roles.length > 0 ? user.roles[0].name : 'User'}
                        </Typography>
                    </Box>

                    <Tooltip title="View Account Details & Profile Picture">
                        <IconButton
                            onClick={() => setProfileOpen(true)}
                            sx={{
                                p: 0.5,
                                border: `2px solid ${THEME.primary}30`,
                                '&:hover': { border: `2px solid ${THEME.primary}` },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <Avatar
                                src={user.profile_picture || undefined}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: THEME.primary,
                                    fontSize: '16px',
                                    fontWeight: 700,
                                }}
                            >
                                {!user.profile_picture && initials}
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    {/* Me Details Profile Overlay */}
                    <ProfileOverlay open={profileOpen} onClose={() => setProfileOpen(false)} />
                </Box>
            )}
        </Box>
    );
};

export default Header;