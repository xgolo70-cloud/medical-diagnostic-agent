import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Sidebar, SIDEBAR_WIDTH } from './Sidebar';

export const Layout: React.FC = () => {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
                    backgroundColor: 'background.default',
                    minHeight: '100vh',
                    padding: 3,
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
