import React, { useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
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
    FormHelperText,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Send as SendIcon,
    CloudUpload as UploadIcon,
    CheckCircle as CheckIcon,
    Description as FileIcon,
    RestartAlt as ResetIcon,
    Image as ImageIcon,
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services';
import type { PatientData } from '../../types';
import { patientDataSchema, type PatientDataFormValues, commonSymptoms, commonMedicalHistory } from './schemas';
import { storage, supabaseAuth, db, type Diagnosis } from '../../lib/supabase';

interface DiagnosisFormProps {
    unified?: boolean;
}

export const DiagnosisForm: React.FC<DiagnosisFormProps> = ({ unified = false }) => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageType, setImageType] = useState<string>('xray');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isImageDragging, setIsImageDragging] = useState(false);
    const navigate = useNavigate();

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
        onSuccess: async (data) => {
            // Save diagnosis to Supabase if user is logged in
            try {
                const { user } = await supabaseAuth.getUser();
                if (user) {
                     // Extract confidence from differential diagnosis (taking the highest)
                     // Assuming structure of data matches what we expect from backend
                     const topResult = data?.differential_diagnosis?.[0];
                     const confidence = topResult?.confidence || 0;

                     await db.createDiagnosis({
                        user_id: user.id,
                        image_url: imageUrl,
                        diagnosis_text: JSON.stringify(data),
                        confidence: confidence,
                        model_used: 'Gemini 1.5 Flash',
                        image_type: (imageFile && imageType) ? (imageType as Diagnosis['image_type']) : null,
                     });
                     console.log('Diagnosis saved to history');
                }
            } catch (err) {
                console.error('Failed to save diagnosis history:', err);
                // Don't block navigation on save error
            }

            // Navigate to result
             navigate('/diagnosis/result', { state: data });
        },
    });

    const onSubmit: SubmitHandler<PatientDataFormValues> = (data) => {
        const patientData: PatientData = {
            ...data,
            medical_history: data.medical_history ?? [],
            vitals: data.vitals && (data.vitals.temperature || data.vitals.blood_pressure || data.vitals.heart_rate)
                ? data.vitals
                : null,
            image_url: imageUrl,
            image_type: imageFile ? imageType : null,
        };
        diagnoseMutation.mutate(patientData);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
        }
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            await uploadImage(file);
        }
    };

    const uploadImage = async (file: File) => {
        setIsUploadingImage(true);
        try {
            const { user } = await supabaseAuth.getUser();
            if (user) {
                const { path, error } = await storage.uploadImage(file, user.id);
                if (error) {
                    console.error('Error uploading image:', error);
                    alert('Failed to upload image: ' + error.message);
                    setImageFile(null);
                } else if (path) {
                    // For private buckets, we need a signed URL.
                    // The backend will use this URL to download the image.
                    const { signedUrl } = await storage.getSignedUrl(path);
                    setImageUrl(signedUrl || null);
                }
            } else {
                 alert('You must be logged in to upload images.');
                 setImageFile(null);
            }
        } catch (e) {
            console.error('Upload failed:', e);
        } finally {
            setIsUploadingImage(false);
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

    const handleImageDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsImageDragging(true);
    };

    const handleImageDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsImageDragging(false);
    };

    const handleImageDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsImageDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            await uploadImage(file);
        }
    };

    const handleReset = () => {
        reset();
        setPdfFile(null);
        setImageFile(null);
        setImageFile(null);
        setImageUrl(null);
        setImageType('xray');
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
                    border: '1px solid #eaeaea',
                    bgcolor: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    overflow: 'visible',
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
                                        bgcolor: '#171717',
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
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                                <Box>
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
                                                        bgcolor: '#fafafa',
                                                        '& fieldset': { borderColor: '#eaeaea' },
                                                        '&:hover fieldset': { borderColor: '#d4d4d4' },
                                                        '&.Mui-focused fieldset': { borderColor: '#171717', borderWidth: 1 },
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': { color: '#171717' }
                                                }}
                                            />
                                        )}
                                    />
                                </Box>
                                <Box>
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
                                                        bgcolor: '#fafafa',
                                                        '& fieldset': { borderColor: '#eaeaea' },
                                                        '&:hover fieldset': { borderColor: '#d4d4d4' },
                                                        '&.Mui-focused fieldset': { borderColor: '#171717', borderWidth: 1 },
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': { color: '#171717' }
                                                }}
                                            />
                                        )}
                                    />
                                </Box>
                                <Box>
                                    <Controller
                                        name="gender"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth error={!!errors.gender}>
                                                <InputLabel sx={{ '&.Mui-focused': { color: '#171717' } }}>Gender</InputLabel>
                                                <Select 
                                                    {...field} 
                                                    label="Gender" 
                                                    disabled={diagnoseMutation.isPending}
                                                    sx={{
                                                        borderRadius: 2,
                                                        bgcolor: '#fafafa',
                                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#eaeaea' },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d4d4d4' },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#171717', borderWidth: 1 },
                                                    }}
                                                >
                                                    <MenuItem value="male">Male</MenuItem>
                                                    <MenuItem value="female">Female</MenuItem>
                                                    <MenuItem value="other">Other</MenuItem>
                                                </Select>
                                                {errors.gender && (
                                                    <FormHelperText>{errors.gender.message}</FormHelperText>
                                                )}
                                            </FormControl>
                                        )}
                                    />
                                </Box>
                            </Box>
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
                                        bgcolor: '#171717',
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
                                                        bgcolor: '#fafafa',
                                                        '& fieldset': { borderColor: '#eaeaea' },
                                                        '&:hover fieldset': { borderColor: '#d4d4d4' },
                                                        '&.Mui-focused fieldset': { borderColor: '#171717', borderWidth: 1 },
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': { color: '#171717' }
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
                                        bgcolor: '#171717',
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
                                                        error={!!errors.medical_history}
                                                        helperText={errors.medical_history?.message}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2,
                                                                bgcolor: '#fafafa',
                                                                '& fieldset': { borderColor: '#eaeaea' },
                                                                '&:hover fieldset': { borderColor: '#d4d4d4' },
                                                                '&.Mui-focused fieldset': { borderColor: '#171717', borderWidth: 1 },
                                                            },
                                                            '& .MuiInputLabel-root.Mui-focused': { color: '#171717' }
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
                                borderColor: '#eaeaea',
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
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                                    <Box>
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
                                                    error={!!errors.vitals?.temperature}
                                                    helperText={errors.vitals?.temperature?.message}
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
                                    </Box>
                                    <Box>
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
                                    </Box>
                                    <Box>
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
                                                    error={!!errors.vitals?.heart_rate}
                                                    helperText={errors.vitals?.heart_rate?.message}
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
                                    </Box>
                                </Box>
                            </AccordionDetails>
                        </Accordion>

                        {/* Medical Image Upload */}
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
                                        bgcolor: '#171717',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    {unified ? 4 : 4}
                                </Box>
                                <Typography variant="h6" fontWeight={600} fontSize="1rem" letterSpacing="-0.01em" color="text.primary">
                                    Medical Image Analysis
                                </Typography>
                            </Box>
                            
                            <Box
                                onDragOver={handleImageDragOver}
                                onDragLeave={handleImageDragLeave}
                                onDrop={handleImageDrop}
                                sx={{
                                    border: '1px dashed',
                                    borderColor: imageFile ? '#171717' : isImageDragging ? '#171717' : '#d4d4d4',
                                    borderRadius: 3,
                                    p: 4,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'block',
                                    width: '100%',
                                    bgcolor: imageFile
                                        ? '#fafafa'
                                        : isImageDragging
                                            ? '#f3f4f6'
                                            : '#ffffff',
                                    '&:hover': {
                                        borderColor: '#171717',
                                        bgcolor: '#fafafa',
                                    },
                                    position: 'relative',
                                }}
                                component="label"
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handleImageChange}
                                    disabled={diagnoseMutation.isPending || isUploadingImage}
                                />
                                {isUploadingImage ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                        <CircularProgress size={32} />
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Uploading image...
                                        </Typography>
                                    </Box>
                                ) : imageFile ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            component="img"
                                            src={imageUrl || URL.createObjectURL(imageFile)}
                                            alt="Preview"
                                            sx={{
                                                height: 120,
                                                width: 'auto',
                                                borderRadius: 1,
                                                objectFit: 'contain',
                                                mb: 1,
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            }}
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CheckIcon sx={{ fontSize: 20, color: '#10b981' }} />
                                            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                                                {imageFile.name}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {(imageFile.size / 1024 / 1024).toFixed(2)} MB • Click to replace
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: isImageDragging ? '#e5e5e5' : '#f3f4f6',
                                                mb: 1,
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            {isImageDragging ? (
                                                <UploadIcon sx={{ fontSize: 24, color: '#171717' }} />
                                            ) : (
                                                <ImageIcon sx={{ fontSize: 24, color: '#737373' }} />
                                            )}
                                        </Box>
                                        <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                                            {isImageDragging ? 'Drop your image here' : 'Click or drop Medical Image here'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            X-ray, MRI, CT, Ultrasound or other medical images
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                            
                            {imageUrl && (
                                <Box sx={{ mt: 3 }}>
                                     <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                                        Image uploaded successfully. Select image type below:
                                    </Alert>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Image Type</InputLabel>
                                        <Select
                                            value={imageType}
                                            label="Image Type"
                                            onChange={(e) => setImageType(e.target.value)}
                                            sx={{
                                                borderRadius: 2,
                                                bgcolor: '#fafafa',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#eaeaea' },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d4d4d4' },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#171717', borderWidth: 1 },
                                            }}
                                        >
                                            <MenuItem value="xray">X-Ray</MenuItem>
                                            <MenuItem value="mri">MRI</MenuItem>
                                            <MenuItem value="ct">CT Scan</MenuItem>
                                            <MenuItem value="ultrasound">Ultrasound</MenuItem>
                                            <MenuItem value="other">Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            )}
                        </Box>

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
                                            bgcolor: '#171717',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        5
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
                                        borderColor: pdfFile ? '#171717' : isDragging ? '#171717' : '#d4d4d4',
                                        borderRadius: 3,
                                        p: 4,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'block',
                                        width: '100%',
                                        bgcolor: pdfFile
                                            ? '#fafafa'
                                            : isDragging
                                                ? '#f3f4f6'
                                                : '#ffffff',
                                        '&:hover': {
                                            borderColor: '#171717',
                                            bgcolor: '#fafafa',
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
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: '#171717',
                                                    mb: 1,
                                                }}
                                            >
                                                <CheckIcon sx={{ fontSize: 24, color: 'white' }} />
                                            </Box>
                                            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
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
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: isDragging ? '#e5e5e5' : '#f3f4f6',
                                                    mb: 1,
                                                    transition: 'all 0.2s ease',
                                                }}
                                            >
                                                {isDragging ? (
                                                    <UploadIcon sx={{ fontSize: 24, color: '#171717' }} />
                                                ) : (
                                                    <FileIcon sx={{ fontSize: 24, color: '#737373' }} />
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
                                borderColor: '#eaeaea',
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
                                    color: '#171717',
                                    borderColor: '#e5e7eb',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    '&:hover': {
                                        borderColor: '#171717',
                                        bgcolor: '#fafafa',
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
                                    bgcolor: '#171717',
                                    color: 'white',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    '&:hover': {
                                        bgcolor: '#000000',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    },
                                    '&.Mui-disabled': {
                                        bgcolor: '#f5f5f5',
                                        color: '#a3a3a3'
                                    }
                                }}
                            >
                                {diagnoseMutation.isPending ? 'Analyzing...' : 'Get Diagnosis'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Results - handling via redirection now */}
        </Box>
    );
};

export default DiagnosisForm;
