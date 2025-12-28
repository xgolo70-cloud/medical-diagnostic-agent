import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    History as HistoryIcon,
    Refresh as RefreshIcon,
    LocalHospital as DiagnosisIcon,
    CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services';

interface AuditEntry {
    timestamp: string;
    action: string;
    user_id: string;
    details: {
        patient_id?: string;
        filename?: string;
        [key: string]: unknown;
    };
}

const getActionIcon = (action: string) => {
    switch (action) {
        case 'generate_diagnosis':
            return <DiagnosisIcon fontSize="small" />;
        case 'generate_diagnosis_unified':
            return <UploadIcon fontSize="small" />;
        default:
            return <HistoryIcon fontSize="small" />;
    }
};

const getActionColor = (action: string): 'primary' | 'secondary' | 'default' => {
    switch (action) {
        case 'generate_diagnosis':
            return 'primary';
        case 'generate_diagnosis_unified':
            return 'secondary';
        default:
            return 'default';
    }
};

const formatAction = (action: string): string => {
    switch (action) {
        case 'generate_diagnosis':
            return 'Manual Diagnosis';
        case 'generate_diagnosis_unified':
            return 'Unified Diagnosis';
        default:
            return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
};

export const HistoryPage: React.FC = () => {
    const { data: history, isLoading, isError, error, refetch } = useQuery<AuditEntry[]>({
        queryKey: ['history'],
        queryFn: () => api.getHistory() as Promise<AuditEntry[]>,
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    return (
        <Box>
            {/* Header */}
            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                    background: 'linear-gradient(135deg, #1976d2 0%, #00897b 100%)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Diagnosis History
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        View all past diagnosis requests and audit logs.
                    </Typography>
                </Box>
                <Tooltip title="Refresh">
                    <IconButton
                        onClick={() => refetch()}
                        sx={{ color: 'white' }}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Paper>

            {/* Loading State */}
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Error State */}
            {isError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error instanceof Error ? error.message : 'Failed to load history'}
                </Alert>
            )}

            {/* Empty State */}
            {!isLoading && !isError && (!history || history.length === 0) && (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <HistoryIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No History Yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Diagnosis requests will appear here once you start using the system.
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* History Table */}
            {!isLoading && history && history.length > 0 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Patient ID</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {history.map((entry, index) => (
                                <TableRow
                                    key={index}
                                    sx={{ '&:hover': { bgcolor: 'grey.50' } }}
                                >
                                    <TableCell>
                                        <Typography variant="body2">
                                            {new Date(entry.timestamp).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(entry.timestamp).toLocaleTimeString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={getActionIcon(entry.action)}
                                            label={formatAction(entry.action)}
                                            color={getActionColor(entry.action)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {entry.user_id}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontFamily="monospace">
                                            {entry.details.patient_id || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {entry.details.filename && (
                                            <Chip
                                                label={entry.details.filename}
                                                size="small"
                                                variant="outlined"
                                                sx={{ mr: 1 }}
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Stats Summary */}
            {!isLoading && history && history.length > 0 && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Card sx={{ flex: 1 }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight={700} color="primary">
                                {history.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Entries
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1 }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight={700} color="secondary">
                                {history.filter(e => e.action === 'generate_diagnosis').length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Manual Diagnoses
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1 }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight={700} sx={{ color: '#ed6c02' }}>
                                {history.filter(e => e.action === 'generate_diagnosis_unified').length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                PDF Uploads
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Box>
    );
};

export default HistoryPage;
