import { FONTSIZE, SIDEBAR_WIDTH, THEME } from '@/assets/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthService } from '@/services/auth.service';
import type { MenuItem, Permission } from '@/models/auth.models';
import { ExpandMore as ExpandMoreIcon, CircleOutlined as CircleOutlinedIcon, Logout } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CustomButton } from './Buttons/CustomButton';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAuthStore((state) => state.user);

    const handleLogout = async () => {
        await AuthService.logout();
        navigate('/login', { replace: true });
    };

    const groupedMenu = useMemo(() => {
        let rawItems: MenuItem[] = [];

        if (user?.menu_tree && user.menu_tree.length > 0) {
            rawItems = user.menu_tree;
        } else if (user?.roles) {
            const perms = user.roles.flatMap((r) => r.permissions || []);
            rawItems = perms.map((p: Permission) => ({
                id: p.id, name: p.name, code: p.code, module: p.module,
                is_menu: p.is_menu, icon: p.icon || undefined,
                path: p.path || undefined, sort_order: p.sort_order || 0,
            }));
        }

        const visibleMenuItems = rawItems.filter((item) => item.is_menu === true && Boolean(item.path));

        const groups: Record<string, MenuItem[]> = {};
        visibleMenuItems.forEach((item) => {
            const moduleName = item.module || 'General';
            if (!groups[moduleName]) {
                groups[moduleName] = [];
            }
            groups[moduleName].push(item);
        });

        Object.keys(groups).forEach((key) => {
            groups[key].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        });

        return groups;
    }, [user]);

    return (
        <Box height="100vh" width={SIDEBAR_WIDTH} borderRight={`2px solid ${THEME.border}`} position="fixed" left={0} top={0} bgcolor={THEME.white} sx={{ overflowY: 'auto' }}>
            <Box m={3} p={3} bgcolor={THEME.warning} borderRadius={2} textAlign="center">
                <Typography fontWeight={700} color={THEME.white}> LOGO </Typography>
            </Box>

            <Box px={2} pb={4} >
                {Object.keys(groupedMenu).length === 0 ? (
                    <Box p={2}>
                        <Typography fontSize={FONTSIZE.small} color={THEME.textSecondary}>
                            No menu items available
                        </Typography>
                    </Box>
                ) : (
                    Object.entries(groupedMenu).map(([moduleName, items]) => (
                        <Accordion key={moduleName} defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, bgcolor: 'transparent', mb: 1, }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: THEME.textSecondary }} />} sx={{ minHeight: 44, px: 1.5, borderRadius: 1.5, '&:hover': { bgcolor: `${THEME.border}40` } }}>
                                <Typography fontSize={FONTSIZE.small} fontWeight={600} color={THEME.textPrimary}>
                                    {moduleName}
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails sx={{ p: 0, pl: 1 }}>
                                {items.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Box key={item.id} onClick={() => item.path && navigate(item.path)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.2, my: 0.5, borderRadius: 1.5, cursor: 'pointer', bgcolor: isActive ? THEME.primary : 'transparent', color: isActive ? THEME.white : THEME.textPrimary, transition: 'all 0.2s ease', '&:hover': { bgcolor: isActive ? THEME.primaryDark : `${THEME.border}60` } }}>
                                            {/* Left Icon */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, flexShrink: 0, '& svg': { width: 20, height: 20, stroke: isActive ? THEME.white : THEME.primary, fill: 'none' } }}>
                                                {item.icon ? (
                                                    <span dangerouslySetInnerHTML={{ __html: item.icon }} />
                                                ) : (
                                                    <CircleOutlinedIcon sx={{ fontSize: 18, color: isActive ? THEME.white : THEME.primary }} />
                                                )}
                                            </Box>

                                            {/* Name */}
                                            <Typography fontSize={FONTSIZE.small} fontWeight={isActive ? 600 : 400} noWrap>
                                                {item.name}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </AccordionDetails>
                        </Accordion>
                    ))
                )}
                <Box position={'absolute'} bottom={20}>
                    <CustomButton text='Logout' height={50} width={265} bgc={THEME.transparent} color={THEME.error} hoverTextColor={THEME.white} border={`1px solid ${THEME.error}`} hov={THEME.error} Sicon={<Logout />} onClick={handleLogout} />
                </Box>
            </Box>
        </Box>
    );
};

export default Sidebar;