import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Box,
    Divider,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    LocalHospital as DiagnosisIcon,
    History as HistoryIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/authSlice';

export const SIDEBAR_WIDTH = 260;

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/diagnosis', label: 'New Diagnosis', icon: <DiagnosisIcon /> },
    { path: '/history', label: 'History', icon: <HistoryIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: SIDEBAR_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: SIDEBAR_WIDTH,
                    boxSizing: 'border-box',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                },
            }}
        >
            <Toolbar sx={{ px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DiagnosisIcon color="primary" fontSize="large" />
                    <Typography variant="h6" fontWeight={700} color="primary">
                        ClinicalDX
                    </Typography>
                </Box>
            </Toolbar>
            <Divider />
            <List sx={{ px: 1, flex: 1 }}>
                {navItems.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            component={Link}
                            to={item.path}
                            selected={location.pathname === item.path}
                            sx={{
                                borderRadius: 1,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List sx={{ px: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{ borderRadius: 1 }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
};
