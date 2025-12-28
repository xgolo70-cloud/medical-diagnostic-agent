import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Paper } from '@mui/material';
import {
    LocalHospital as DiagnosisIcon,
    History as HistoryIcon,
    TrendingUp as TrendingIcon,
    People as PeopleIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../store/hooks';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                        {value}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `${color}15`,
                    }}
                >
                    {React.cloneElement(icon as React.ReactElement<{ style?: React.CSSProperties }>, { style: { fontSize: 28, color } })}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

export const DashboardPage: React.FC = () => {
    const user = useAppSelector((state) => state.auth.user);

    const getRoleLabel = (role?: string) => {
        switch (role) {
            case 'gp': return 'General Practitioner';
            case 'specialist': return 'Specialist';
            case 'auditor': return 'Auditor';
            default: return 'User';
        }
    };

    return (
        <Box>
            {/* Welcome Section */}
            <Paper
                sx={{
                    p: 4,
                    mb: 4,
                    background: 'linear-gradient(135deg, #1976d2 0%, #00897b 100%)',
                    color: 'white',
                    borderRadius: 2,
                }}
            >
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Welcome back, {user?.username || 'User'}!
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    You are logged in as <strong>{getRoleLabel(user?.role)}</strong>.
                    Use the sidebar to navigate to diagnosis features or view history.
                </Typography>
            </Paper>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Total Diagnoses"
                        value="147"
                        icon={<DiagnosisIcon />}
                        color="#1976d2"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="This Week"
                        value="23"
                        icon={<TrendingIcon />}
                        color="#00897b"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Pending Review"
                        value="5"
                        icon={<HistoryIcon />}
                        color="#ed6c02"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Patients Served"
                        value="89"
                        icon={<PeopleIcon />}
                        color="#9c27b0"
                    />
                </Grid>
            </Grid>

            {/* Quick Actions */}
            <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Actions
            </Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ p: 3, cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <DiagnosisIcon color="primary" fontSize="large" />
                            <Box>
                                <Typography variant="h6">New Manual Diagnosis</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Enter patient data manually for AI analysis
                                </Typography>
                            </Box>
                        </Box>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ p: 3, cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <HistoryIcon color="secondary" fontSize="large" />
                            <Box>
                                <Typography variant="h6">View Diagnosis History</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Review past diagnoses and audit logs
                                </Typography>
                            </Box>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
