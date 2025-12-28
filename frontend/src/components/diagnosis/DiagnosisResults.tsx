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
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Science as ScienceIcon,
    MenuBook as CitationIcon,
    ExpandMore as ExpandMoreIcon,
    LocalHospital as DiagnosisIcon,
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

const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.4) return 'Moderate';
    return 'Low';
};

export const DiagnosisResults: React.FC<DiagnosisResultsProps> = ({ result }) => {
    return (
        <Box sx={{ mt: 4 }}>
            {/* Header */}
            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                    background: 'linear-gradient(135deg, #1976d2 0%, #00897b 100%)',
                    color: 'white',
                }}
            >
                <Typography variant="h5" fontWeight={700} gutterBottom>
                    Diagnosis Results
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Patient ID: {result.patient_id} • Generated: {new Date(result.timestamp).toLocaleString()}
                </Typography>
            </Paper>

            {/* Differential Diagnosis */}
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DiagnosisIcon color="primary" />
                Differential Diagnosis
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                {result.differential_diagnosis.map((diagnosis, index) => (
                    <Card key={diagnosis.diagnosis_id} variant="outlined">
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                        label={`#${index + 1}`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                    <Typography variant="h6" fontWeight={600}>
                                        {diagnosis.primary_diagnosis}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={`${getConfidenceLabel(diagnosis.confidence)} (${Math.round(diagnosis.confidence * 100)}%)`}
                                    color={getConfidenceColor(diagnosis.confidence)}
                                    size="small"
                                />
                            </Box>

                            {/* Confidence Bar */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                    Confidence Level
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={diagnosis.confidence * 100}
                                    color={getConfidenceColor(diagnosis.confidence)}
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                            </Box>

                            {/* Rationale */}
                            <Accordion elevation={0} sx={{ bgcolor: 'grey.50' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="body2" fontWeight={500}>
                                        Clinical Rationale
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography variant="body2" color="text.secondary">
                                        {diagnosis.rationale}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Recommended Tests */}
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScienceIcon color="secondary" />
                Recommended Tests
            </Typography>
            <Card variant="outlined" sx={{ mb: 4 }}>
                <List dense>
                    {result.recommended_tests.map((test, index) => (
                        <ListItem key={index}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <CheckIcon color="secondary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={test} />
                        </ListItem>
                    ))}
                </List>
            </Card>

            {/* Citations */}
            {result.citations.length > 0 && (
                <>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CitationIcon color="info" />
                        Citations & References
                    </Typography>
                    <Card variant="outlined" sx={{ mb: 4 }}>
                        <List dense>
                            {result.citations.map((citation, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            [{index + 1}]
                                        </Typography>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={citation}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                </>
            )}

            {/* Clinical Notes */}
            {result.clinical_notes && (
                <Card variant="outlined" sx={{ bgcolor: 'info.50' }}>
                    <CardContent>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Clinical Notes
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {result.clinical_notes}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default DiagnosisResults;
