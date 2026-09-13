import { FONTSIZE, SIDEBAR_WIDTH, THEME, useAppTheme } from '@/assets/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthService } from '@/services/auth.service';
import type { MenuItem, Permission } from '@/models/auth.models';
import { ExpandMore as ExpandMoreIcon, CircleOutlined as CircleOutlinedIcon, Logout } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CustomButton } from './Buttons/CustomButton';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAuthStore((state) => state.user);
    const theme = useAppTheme();
    const [expandedModule, setExpandedModule] = useState<string | null>(null);

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

        // Ensure Customer Management is visible in sidebar
        if (!visibleMenuItems.some((it) => it.path === "/customers")) {
            visibleMenuItems.push({
                id: 998,
                name: "Customer Management",
                code: "CUSTOMER_READ",
                module: "Customer Management",
                is_menu: true,
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
                path: "/customers",
                sort_order: 1,
            });
        }

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


    useEffect(() => {
        let activeMod: string | null = null;
        for (const [mod, items] of Object.entries(groupedMenu)) {
            if (items.some((item) => item.path === location.pathname)) {
                activeMod = mod;
                break;
            }
        }
        if (activeMod) {
            setExpandedModule(activeMod);
        } else if (Object.keys(groupedMenu).length > 0 && !expandedModule) {
            setExpandedModule(Object.keys(groupedMenu)[0]);
        }
    }, [location.pathname, groupedMenu]);

    const handleAccordionChange = (moduleName: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedModule(isExpanded ? moduleName : null);
    };

    return (
        <Box height="100vh" width={SIDEBAR_WIDTH} borderRight={`1px solid ${theme.border}`} position="fixed" left={0} top={0} bgcolor={theme.sidebarBg} display="flex" flexDirection="column" sx={{ transition: 'all 0.25s ease-in-out' }}>
            {/* Fixed Top Logo Header */}
            <Box px={3} pt={3} pb={2} flexShrink={0}>
                <Box p={2.5} bgcolor={THEME.warning} borderRadius={2} textAlign="center">
                    <Typography fontWeight={700} color="#FFFFFF"> LOGO </Typography>
                </Box>
            </Box>

            {/* Scrollable Middle Menu Content */}
            <Box px={2} py={1} flex={1} sx={{ overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: `${theme.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'} transparent`, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-track': { background: 'transparent' }, '&::-webkit-scrollbar-thumb': { background: theme.isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.18)', borderRadius: '10px', '&:hover': { background: THEME.primary } } }}>
                {Object.keys(groupedMenu).length === 0 ? (
                    <Box p={2}>
                        <Typography fontSize={FONTSIZE.small} color={theme.textSecondary}> No menu items available </Typography>
                    </Box>
                ) : (
                    Object.entries(groupedMenu).map(([moduleName, items]) => (
                        <Accordion key={moduleName} disableGutters elevation={0} expanded={expandedModule === moduleName} onChange={handleAccordionChange(moduleName)} sx={{ '&:before': { display: 'none' }, bgcolor: 'transparent', mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: theme.textSecondary }} />} sx={{ minHeight: 44, px: 1.5, borderRadius: 1.5, '&:hover': { bgcolor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : `${THEME.border}40` } }}>
                                <Typography fontSize={FONTSIZE.small} fontWeight={700} color={theme.textPrimary}> {moduleName} </Typography>
                            </AccordionSummary>

                            <AccordionDetails sx={{ p: 0, pl: 1 }}>
                                {items.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Box key={item.id} onClick={() => item.path && navigate(item.path)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.2, my: 0.5, borderRadius: 1.5, cursor: 'pointer', bgcolor: isActive ? THEME.primary : 'transparent', color: isActive ? '#FFFFFF' : theme.textPrimary, transition: 'all 0.2s ease', '&:hover': { bgcolor: isActive ? THEME.primaryDark : (theme.isDark ? 'rgba(255, 255, 255, 0.08)' : `${THEME.border}60`) } }}>
                                            {/* Left Icon */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, flexShrink: 0, '& svg': { width: 20, height: 20, stroke: isActive ? '#FFFFFF' : (theme.isDark ? '#60A5FA' : THEME.primary), fill: 'none' } }}>
                                                {item.icon ? (
                                                    <span dangerouslySetInnerHTML={{ __html: item.icon }} />
                                                ) : (
                                                    <CircleOutlinedIcon sx={{ fontSize: 18, color: isActive ? '#FFFFFF' : (theme.isDark ? '#60A5FA' : THEME.primary) }} />
                                                )}
                                            </Box>

                                            {/* Name */}
                                            <Typography fontSize={FONTSIZE.small} fontWeight={isActive ? 600 : 400} noWrap color="inherit"> {item.name} </Typography>
                                        </Box>
                                    );
                                })}
                            </AccordionDetails>
                        </Accordion>
                    ))
                )}
            </Box>

            {/* Fixed Bottom Logout Section */}
            <Box p={2.5} flexShrink={0} borderTop={`1px solid ${theme.border}`}>
                <CustomButton text='Logout' height={46} width="100%" bgc={THEME.transparent} color={THEME.error} hoverTextColor={'#FFFFFF'} border={`1px solid ${THEME.error}`} hov={THEME.error} Sicon={<Logout />} onClick={handleLogout} />
            </Box>
        </Box>
    );
};

export default Sidebar;