import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAppTheme } from '@/assets/theme';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
    const theme = useAppTheme();
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: theme.background, transition: 'background 0.25s ease' }}>
            {/* Sidebar */}
            <Sidebar />
            {/* Main Content Area */}
            <Box ml={'300px'} maxHeight={'100vh'} my={3} mr={3} sx={{ flexGrow: 1, background: theme.white, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                {/* Fixed Top Header */}
                <Header />
                {/* Page Body */}
                <Box m={3} mt="100px" sx={{ flexGrow: 1 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default AppLayout;