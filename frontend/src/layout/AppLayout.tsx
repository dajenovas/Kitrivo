import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <Box ml={'300px'} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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