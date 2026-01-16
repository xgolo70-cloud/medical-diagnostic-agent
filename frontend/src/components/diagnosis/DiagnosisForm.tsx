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
    LinearProgress,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Send as SendIcon,
    CloudUpload as UploadIcon,
    CheckCircle as CheckIcon,
    Description as FileIcon,
    RestartAlt as ResetIcon,
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
    const [isDragging, setIsDragging] = useState(false);

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

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
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
            {/* Loading Progress */}
            {diagnoseMutation.isPending && (
                <Box sx={{ mb: 3 }}>
                    <LinearProgress
                        sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#f3f4f6',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: '#111827',
                            },
                        }}
                    />
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1, textAlign: 'center', fontWeight: 500 }}
                    >
                        Analyzing patient data with AI...
                    </Typography>
                </Box>
            )}

            {/* Error Alert */}
            {diagnoseMutation.isError && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        borderRadius: 2,
                        animation: 'fadeIn 0.3s ease-out',
                    }}
                >
                    {diagnoseMutation.error instanceof Error
                        ? diagnoseMutation.error.message
                        : 'An error occurred while processing the diagnosis.'}
                </Alert>
            )}

            {/* Form */}
            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: '1px solid #e5e7eb',
                    overflow: 'visible', // Changed to visible for better shadow rendering if needed
                }}
            >
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                        {/* Patient Information Section */}
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
                                        bgcolor: '#111827',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    1
                                </Box>
                                <Typography variant="h6" fontWeight={600} fontSize="1rem" letterSpacing="-0.01em" color="text.primary">
                                    Patient Information
                                </Typography>
                            </Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <Controller
                                        name="patient_id"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Patient ID"
                                                placeholder="e.g., PT-2024-001"
                                                variant="outlined"
                                                error={!!errors.patient_id}
                                                helperText={errors.patient_id?.message}
                                                disabled={diagnoseMutation.isPending}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        bgcolor: '#f9fafb',
                                                        '& fieldset': { borderColor: '#e5e7eb' },
                                                        '&:hover fieldset': { borderColor: '#d1d5db' },
                                                        '&.Mui-focused fieldset': { borderColor: '#111827', borderWidth: 1 },
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': { color: '#111827' }
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Controller
                                        name="age"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                type="number"
                                                label="Age"
                                                placeholder="e.g., 45"
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                error={!!errors.age}
                                                helperText={errors.age?.message}
                                                disabled={diagnoseMutation.isPending}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        bgcolor: '#f9fafb',
                                                        '& fieldset': { borderColor: '#e5e7eb' },
                                                        '&:hover fieldset': { borderColor: '#d1d5db' },
                                                        '&.Mui-focused fieldset': { borderColor: '#111827', borderWidth: 1 },
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': { color: '#111827' }
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Controller
                                        name="gender"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth error={!!errors.gender}>
                                                <InputLabel sx={{ '&.Mui-focused': { color: '#111827' } }}>Gender</InputLabel>
                                                <Select 
                                                    {...field} 
                                                    label="Gender" 
                                                    disabled={diagnoseMutation.isPending}
                                                    sx={{
                                                        borderRadius: 2,
                                                        bgcolor: '#f9fafb',
                                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#111827', borderWidth: 1 },
                                                    }}
                                                >
                                                    <MenuItem value="male">Male</MenuItem>
                                                    <MenuItem value="female">Female</MenuItem>
                                                    <MenuItem value="other">Other</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Symptoms Section */}
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
                                        bgcolor: '#111827',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    2
                                </Box>
                                <Typography variant="h6" fontWeight={600} fontSize="1rem" letterSpacing="-0.01em" color="text.primary">
                                    Symptoms
                                </Typography>
                            </Box>
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
                                                        label={option}
                                                        {...tagProps}
                                                        key={tagProps.key}
                                                        sx={{
                                                            bgcolor: '#f3f4f6',
                                                            color: '#1f2937',
                                                            border: '1px solid #e5e7eb',
                                                            fontWeight: 500,
                                                            borderRadius: 1.5,
                                                            '& .MuiChip-deleteIcon': {
                                                                color: '#6b7280',
                                                                '&:hover': { color: '#374151' }
                                                            },
                                                        }}
                                                    />
                                                );
                                            })
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Symptoms"
                                                placeholder="Type or select symptoms..."
                                                error={!!errors.symptoms}
                                                helperText={errors.symptoms?.message}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        bgcolor: '#f9fafb',
                                                        '& fieldset': { borderColor: '#e5e7eb' },
                                                        '&:hover fieldset': { borderColor: '#d1d5db' },
                                                        '&.Mui-focused fieldset': { borderColor: '#111827', borderWidth: 1 },
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': { color: '#111827' }
                                                }}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Box>

                        {/* Medical History Section */}
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
                                        bgcolor: '#111827',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    3
                                </Box>
                                <Typography variant="h6" fontWeight={600} fontSize="1rem" letterSpacing="-0.01em" color="text.primary">
                                    Medical History
                                </Typography>
                            </Box>
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
                                                        label={option}
                                                        {...tagProps}
                                                        key={tagProps.key}
                                                        sx={{
                                                            bgcolor: '#f3f4f6',
                                                            color: '#1f2937',
                                                            border: '1px solid #e5e7eb',
                                                            fontWeight: 500,
                                                            borderRadius: 1.5,
                                                            '& .MuiChip-deleteIcon': {
                                                                color: '#6b7280',
                                                                '&:hover': { color: '#374151' }
                                                            },
                                                        }}
                                                    />
                                                );
                                            })
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Medical History"
                                                placeholder="Type or select conditions..."
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        bgcolor: '#f9fafb',
                                                        '& fieldset': { borderColor: '#e5e7eb' },
                                                        '&:hover fieldset': { borderColor: '#d1d5db' },
                                                        '&.Mui-focused fieldset': { borderColor: '#111827', borderWidth: 1 },
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': { color: '#111827' }
                                                }}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Box>

                        {/* Vitals Section */}
                        <Accordion
                            sx={{
                                mb: 5,
                                borderRadius: '12px !important',
                                '&:before': { display: 'none' },
                                boxShadow: 'none',
                                border: '1px solid',
                                borderColor: '#e5e7eb',
                                bgcolor: '#ffffff',
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ borderRadius: 3 }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: '#f3f4f6',
                                            color: '#374151',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        +
                                    </Box>
                                    <Typography fontWeight={500} fontSize="0.95rem" color="text.primary">Vitals (Optional)</Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <Controller
                                            name="vitals.temperature"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    type="number"
                                                    label="Temperature (°C)"
                                                    placeholder="e.g., 37.5"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                                    disabled={diagnoseMutation.isPending}
                                                    slotProps={{ htmlInput: { step: 0.1 } }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            bgcolor: '#f9fafb',
                                                            '& fieldset': { borderColor: '#e5e7eb' },
                                                            '&:hover fieldset': { borderColor: '#d1d5db' },
                                                            '&.Mui-focused fieldset': { borderColor: '#111827', borderWidth: 1 },
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': { color: '#111827' }
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Controller
                                            name="vitals.blood_pressure"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    label="Blood Pressure"
                                                    placeholder="e.g., 120/80"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value || null)}
                                                    error={!!errors.vitals?.blood_pressure}
                                                    helperText={errors.vitals?.blood_pressure?.message}
                                                    disabled={diagnoseMutation.isPending}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            bgcolor: '#f9fafb',
                                                            '& fieldset': { borderColor: '#e5e7eb' },
                                                            '&:hover fieldset': { borderColor: '#d1d5db' },
                                                            '&.Mui-focused fieldset': { borderColor: '#111827', borderWidth: 1 },
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': { color: '#111827' }
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Controller
                                            name="vitals.heart_rate"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    type="number"
                                                    label="Heart Rate (bpm)"
                                                    placeholder="e.g., 72"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                                    disabled={diagnoseMutation.isPending}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            bgcolor: '#f9fafb',
                                                            '& fieldset': { borderColor: '#e5e7eb' },
                                                            '&:hover fieldset': { borderColor: '#d1d5db' },
                                                            '&.Mui-focused fieldset': { borderColor: '#111827', borderWidth: 1 },
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': { color: '#111827' }
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        {/* PDF Upload (Unified mode only) */}
                        {unified && (
                            <Box sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                    <Box
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: '#111827',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        4
                                    </Box>
                                    <Typography variant="h6" fontWeight={600} fontSize="1rem" letterSpacing="-0.01em" color="text.primary">
                                        Lab Report (PDF)
                                    </Typography>
                                </Box>
                                <Box
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    sx={{
                                        border: '1px dashed',
                                        borderColor: pdfFile ? 'success.main' : isDragging ? '#111827' : '#d1d5db',
                                        borderRadius: 3,
                                        p: 4,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        bgcolor: pdfFile
                                            ? '#ecfdf5'
                                            : isDragging
                                                ? '#f9fafb'
                                                : '#ffffff',
                                        '&:hover': {
                                            borderColor: '#111827',
                                            bgcolor: '#f9fafb',
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
                                    {pdfFile ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: '#10b981',
                                                    mb: 1,
                                                }}
                                            >
                                                <CheckIcon sx={{ fontSize: 28, color: 'white' }} />
                                            </Box>
                                            <Typography variant="subtitle2" fontWeight={600} color="#059669">
                                                {pdfFile.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {(pdfFile.size / 1024 / 1024).toFixed(2)} MB • Click to replace
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: isDragging ? '#e5e7eb' : '#f3f4f6',
                                                    mb: 1,
                                                    transition: 'all 0.2s ease',
                                                }}
                                            >
                                                {isDragging ? (
                                                    <FileIcon sx={{ fontSize: 24, color: '#374151' }} />
                                                ) : (
                                                    <UploadIcon sx={{ fontSize: 24, color: '#9ca3af' }} />
                                                )}
                                            </Box>
                                            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                                                {isDragging ? 'Drop your file here' : 'Click or drop PDF here'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                PDF files only
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        )}

                        {/* Submit Buttons */}
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 2,
                                justifyContent: 'flex-end',
                                pt: 3,
                                borderTop: '1px solid',
                                borderColor: '#e5e7eb',
                            }}
                        >
                            <Button
                                variant="outlined"
                                onClick={handleReset}
                                disabled={diagnoseMutation.isPending}
                                startIcon={<ResetIcon />}
                                sx={{
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    color: '#374151',
                                    borderColor: '#e5e7eb',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    '&:hover': {
                                        borderColor: '#d1d5db',
                                        bgcolor: '#f9fafb',
                                        color: '#111827'
                                    }
                                }}
                            >
                                Reset Form
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={diagnoseMutation.isPending || (unified && !pdfFile)}
                                startIcon={diagnoseMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                                sx={{
                                    px: 4,
                                    py: 1,
                                    borderRadius: 2,
                                    bgcolor: '#111827',
                                    color: 'white',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    '&:hover': {
                                        bgcolor: '#000000',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    },
                                    '&.Mui-disabled': {
                                        bgcolor: '#e5e7eb',
                                        color: '#9ca3af'
                                    }
                                }}
                            >
                                {diagnoseMutation.isPending ? 'Analyzing...' : 'Get Diagnosis'}
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
