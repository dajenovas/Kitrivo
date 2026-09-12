import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAppTheme } from '@/assets/theme';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
    const theme = useAppTheme();
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.background, transition: 'background-color 0.25s ease' }}>
            {/* Sidebar */}
            <Sidebar />
            {/* Main Content Area */}
            <Box ml={'300px'} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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