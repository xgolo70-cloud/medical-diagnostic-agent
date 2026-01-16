import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Science as ScienceIcon,
    MenuBook as CitationIcon,
    LocalHospital as DiagnosisIcon,
    TrendingUp as TrendingUpIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    CalendarToday,
    Person
} from '@mui/icons-material';
import type { DiagnosisResult } from '../../types';

interface DiagnosisResultsProps {
    result: DiagnosisResult;
}

const getConfidenceColor = (confidence: number): 'success' | 'warning' | 'error' => {
    if (confidence >= 0.7) return 'success';
    if (confidence >= 0.4) return 'warning';
    return 'error';
};

export const DiagnosisResults: React.FC<DiagnosisResultsProps> = ({ result }) => {
    return (
        <Box
            sx={{
                mt: 4,
                animation: 'fadeInUp 0.5s ease-out',
                '@keyframes fadeInUp': {
                    from: { opacity: 0, transform: 'translateY(20px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 4,
                    mb: 5,
                    bgcolor: '#111827',
                    color: 'white',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)',
                }}
            >
                 {/* Subtle pattern */}
                 <Box sx={{
                     position: 'absolute',
                     top: 0, left: 0, right: 0, bottom: 0,
                     opacity: 0.1,
                     backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                     backgroundSize: '24px 24px'
                 }} />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h5" fontWeight={600} letterSpacing="-0.02em">
                            Analysis Complete
                        </Typography>
                        <Chip 
                            label="AI Generated" 
                            size="small" 
                            sx={{ 
                                bgcolor: 'rgba(255,255,255,0.15)', 
                                color: 'white', 
                                height: 24,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                border: '1px solid rgba(255,255,255,0.1)'
                            }} 
                        />
                    </Box>
                    <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
                        {result.differential_diagnosis.length} potential diagnoses identified based on clinical parameters.
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2, px: 2, py: 1 }}>
                            <Person sx={{ fontSize: 16, opacity: 0.7 }} />
                            <Typography variant="caption" fontWeight={500}>
                                {result.patient_id || 'Unknown Patient'}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2, px: 2, py: 1 }}>
                            <CalendarToday sx={{ fontSize: 16, opacity: 0.7 }} />
                            <Typography variant="caption" fontWeight={500}>
                                {new Date(result.timestamp).toLocaleDateString()}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Differential Diagnosis */}
            <Box sx={{ mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                     <Box
                        sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: '#f3f4f6',
                            color: '#111827',
                        }}
                    >
                        <DiagnosisIcon sx={{ fontSize: 16 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} fontSize="1.1rem" color="text.primary">
                        Differential Diagnosis
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {result.differential_diagnosis.map((diagnosis, index) => (
                        <Card
                            key={diagnosis.diagnosis_id}
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: index === 0 ? '#10b981' : '#e5e7eb', // Highlight top result
                                bgcolor: index === 0 ? '#ecfdf5' : 'white',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: index === 0 ? '#10b981' : '#f3f4f6',
                                                color: index === 0 ? 'white' : '#6b7280',
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            {index + 1}
                                        </Box>
                                        <Typography variant="h6" fontWeight={700} color="text.primary" fontSize="1rem">
                                            {diagnosis.primary_diagnosis}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        icon={
                                            diagnosis.confidence >= 0.7 ? <TrendingUpIcon sx={{ fontSize: 16 }} /> :
                                                diagnosis.confidence >= 0.4 ? <WarningIcon sx={{ fontSize: 16 }} /> : <InfoIcon sx={{ fontSize: 16 }} />
                                        }
                                        label={`${Math.round(diagnosis.confidence * 100)}% Match`}
                                        size="small"
                                        color={getConfidenceColor(diagnosis.confidence)}
                                        variant={index === 0 ? 'filled' : 'outlined'}
                                        sx={{ fontWeight: 600, fontSize: '0.75rem', height: 24 }}
                                    />
                                </Box>

                                {/* Confidence Bar */}
                                <Box sx={{ mb: 3, pl: 6 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={diagnosis.confidence * 100}
                                        color={getConfidenceColor(diagnosis.confidence)}
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            bgcolor: index === 0 ? 'rgba(16, 185, 129, 0.2)' : '#f3f4f6',
                                        }}
                                    />
                                </Box>

                                {/* Rationale */}
                                <Box sx={{ pl: 6 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 1 }}>
                                        {diagnosis.rationale}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Box>

            <Divider sx={{ my: 4, borderColor: '#f3f4f6' }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                {/* Recommended Tests */}
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                         <Box sx={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f3f4f6', color: '#111827' }}>
                            <ScienceIcon sx={{ fontSize: 16 }} />
                        </Box>
                        <Typography variant="h6" fontWeight={600} fontSize="1rem" color="text.primary">
                            Recommended Tests
                        </Typography>
                    </Box>
                    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb' }}>
                        <List disablePadding>
                            {result.recommended_tests.map((test, index) => (
                                <ListItem
                                    key={index}
                                    sx={{
                                        py: 1.5,
                                        borderBottom: index < result.recommended_tests.length - 1 ? '1px solid' : 'none',
                                        borderColor: '#f3f4f6',
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <CheckIcon sx={{ fontSize: 18, color: '#10b981' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={test}
                                        primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500, color: 'text.primary' }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                </Box>

                {/* Citations */}
                {result.citations.length > 0 && (
                    <Box>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                            <Box sx={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f3f4f6', color: '#111827' }}>
                                <CitationIcon sx={{ fontSize: 16 }} />
                            </Box>
                            <Typography variant="h6" fontWeight={600} fontSize="1rem" color="text.primary">
                                References
                            </Typography>
                        </Box>
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb', height: '100%' }}>
                            <List disablePadding>
                                {result.citations.map((citation, index) => (
                                    <ListItem
                                        key={index}
                                        sx={{
                                            py: 1.5,
                                            borderBottom: index < result.citations.length - 1 ? '1px solid' : 'none',
                                            borderColor: '#f3f4f6',
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ bgcolor: '#f3f4f6', px: 0.8, py: 0.2, borderRadius: 1 }}>
                                                {index + 1}
                                            </Typography>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={citation}
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', fontSize: '0.85rem' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Card>
                    </Box>
                )}
            </Box>

            {/* Clinical Notes */}
            {result.clinical_notes && (
                <Box sx={{ mt: 4 }}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            bgcolor: '#f8fafc',
                            border: '1px dashed #cbd5e1',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <InfoIcon sx={{ fontSize: 18, color: '#64748b' }} />
                                <Typography variant="subtitle2" fontWeight={600} color="#334155">
                                    Clinical Notes
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="#475569" sx={{ lineHeight: 1.6 }}>
                                {result.clinical_notes}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Box>
    );
};

export default DiagnosisResults;
