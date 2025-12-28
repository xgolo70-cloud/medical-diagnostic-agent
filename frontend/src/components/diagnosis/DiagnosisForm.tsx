import React, { useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Autocomplete,
    Alert,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Send as SendIcon,
    CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services';
import type { DiagnosisResult, PatientData } from '../../types';
import { patientDataSchema, type PatientDataFormValues, commonSymptoms, commonMedicalHistory } from './schemas';
import { DiagnosisResults } from './DiagnosisResults';

interface DiagnosisFormProps {
    unified?: boolean;
}

export const DiagnosisForm: React.FC<DiagnosisFormProps> = ({ unified = false }) => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [result, setResult] = useState<DiagnosisResult | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<PatientDataFormValues>({
        resolver: zodResolver(patientDataSchema),
        defaultValues: {
            patient_id: '',
            age: 0,
            gender: 'male',
            symptoms: [],
            medical_history: [],
            vitals: {
                temperature: null,
                blood_pressure: null,
                heart_rate: null,
            },
        },
    });

    const diagnoseMutation = useMutation({
        mutationFn: async (data: PatientData) => {
            if (unified && pdfFile) {
                return api.diagnoseUnified(data, pdfFile);
            }
            return api.diagnose(data);
        },
        onSuccess: (data) => {
            setResult(data);
        },
    });

    const onSubmit: SubmitHandler<PatientDataFormValues> = (data) => {
        const patientData: PatientData = {
            ...data,
            medical_history: data.medical_history ?? [],
            vitals: data.vitals && (data.vitals.temperature || data.vitals.blood_pressure || data.vitals.heart_rate)
                ? data.vitals
                : null,
        };
        diagnoseMutation.mutate(patientData);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
        }
    };

    const handleReset = () => {
        reset();
        setPdfFile(null);
        setResult(null);
        diagnoseMutation.reset();
    };

    return (
        <Box>
            {/* Header */}
            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                    background: 'linear-gradient(135deg, #1976d2 0%, #00897b 100%)',
                    color: 'white',
                }}
            >
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    {unified ? 'Unified Diagnosis' : 'Manual Diagnosis'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {unified
                        ? 'Upload a PDF lab report along with patient details for comprehensive AI analysis.'
                        : 'Enter patient details manually for AI-powered differential diagnosis.'}
                </Typography>
            </Paper>

            {/* Error Alert */}
            {diagnoseMutation.isError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {diagnoseMutation.error instanceof Error
                        ? diagnoseMutation.error.message
                        : 'An error occurred while processing the diagnosis.'}
                </Alert>
            )}

            {/* Form */}
            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                        {/* Basic Info */}
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Patient Information
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="patient_id"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Patient ID"
                                            error={!!errors.patient_id}
                                            helperText={errors.patient_id?.message}
                                            disabled={diagnoseMutation.isPending}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="age"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            type="number"
                                            label="Age"
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            error={!!errors.age}
                                            helperText={errors.age?.message}
                                            disabled={diagnoseMutation.isPending}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="gender"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.gender}>
                                            <InputLabel>Gender</InputLabel>
                                            <Select {...field} label="Gender" disabled={diagnoseMutation.isPending}>
                                                <MenuItem value="male">Male</MenuItem>
                                                <MenuItem value="female">Female</MenuItem>
                                                <MenuItem value="other">Other</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                        </Grid>

                        {/* Symptoms */}
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Symptoms
                        </Typography>
                        <Controller
                            name="symptoms"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    multiple
                                    freeSolo
                                    options={commonSymptoms}
                                    value={field.value}
                                    onChange={(_, newValue) => field.onChange(newValue)}
                                    disabled={diagnoseMutation.isPending}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => {
                                            const tagProps = getTagProps({ index });
                                            return (
                                                <Chip
                                                    variant="outlined"
                                                    label={option}
                                                    {...tagProps}
                                                    key={tagProps.key}
                                                />
                                            );
                                        })
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Symptoms"
                                            placeholder="Type or select symptoms"
                                            error={!!errors.symptoms}
                                            helperText={errors.symptoms?.message}
                                        />
                                    )}
                                    sx={{ mb: 3 }}
                                />
                            )}
                        />

                        {/* Medical History */}
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Medical History
                        </Typography>
                        <Controller
                            name="medical_history"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    multiple
                                    freeSolo
                                    options={commonMedicalHistory}
                                    value={field.value ?? []}
                                    onChange={(_, newValue) => field.onChange(newValue)}
                                    disabled={diagnoseMutation.isPending}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => {
                                            const tagProps = getTagProps({ index });
                                            return (
                                                <Chip
                                                    variant="outlined"
                                                    label={option}
                                                    {...tagProps}
                                                    key={tagProps.key}
                                                />
                                            );
                                        })
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Medical History"
                                            placeholder="Type or select conditions"
                                        />
                                    )}
                                    sx={{ mb: 3 }}
                                />
                            )}
                        />

                        {/* Vitals (Collapsible) */}
                        <Accordion sx={{ mb: 3 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography fontWeight={500}>Vitals (Optional)</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Controller
                                            name="vitals.temperature"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    type="number"
                                                    label="Temperature (°C)"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                                    disabled={diagnoseMutation.isPending}
                                                    slotProps={{ htmlInput: { step: 0.1 } }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Controller
                                            name="vitals.blood_pressure"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    label="Blood Pressure"
                                                    placeholder="120/80"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value || null)}
                                                    error={!!errors.vitals?.blood_pressure}
                                                    helperText={errors.vitals?.blood_pressure?.message}
                                                    disabled={diagnoseMutation.isPending}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Controller
                                            name="vitals.heart_rate"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    type="number"
                                                    label="Heart Rate (bpm)"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                                    disabled={diagnoseMutation.isPending}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        {/* PDF Upload (Unified mode only) */}
                        {unified && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Lab Report (PDF)
                                </Typography>
                                <Box
                                    sx={{
                                        border: '2px dashed',
                                        borderColor: pdfFile ? 'primary.main' : 'grey.300',
                                        borderRadius: 2,
                                        p: 3,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            bgcolor: 'grey.50',
                                        },
                                    }}
                                    component="label"
                                >
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        hidden
                                        onChange={handleFileChange}
                                        disabled={diagnoseMutation.isPending}
                                    />
                                    <UploadIcon sx={{ fontSize: 48, color: pdfFile ? 'primary.main' : 'grey.400', mb: 1 }} />
                                    {pdfFile ? (
                                        <Typography color="primary">{pdfFile.name}</Typography>
                                    ) : (
                                        <Typography color="text.secondary">
                                            Click or drag to upload PDF lab report
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        )}

                        {/* Submit Buttons */}
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={handleReset}
                                disabled={diagnoseMutation.isPending}
                            >
                                Reset
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={diagnoseMutation.isPending || (unified && !pdfFile)}
                                startIcon={diagnoseMutation.isPending ? <CircularProgress size={20} /> : <SendIcon />}
                                sx={{
                                    background: 'linear-gradient(135deg, #1976d2 0%, #00897b 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1565c0 0%, #00796b 100%)',
                                    },
                                }}
                            >
                                {diagnoseMutation.isPending ? 'Processing...' : 'Get Diagnosis'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Results */}
            {result && <DiagnosisResults result={result} />}
        </Box>
    );
};

export default DiagnosisForm;
