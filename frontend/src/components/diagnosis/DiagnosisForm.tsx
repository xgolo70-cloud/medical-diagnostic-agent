/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { User, Activity, Heart, ImageIcon as LucideImageIcon } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api, ValidationError } from '../../services/api';
import type { PatientData } from '../../types';
import { patientDataSchema, type PatientDataFormValues, commonSymptoms, commonMedicalHistory } from './schemas';
import { storage, supabaseAuth } from '../../lib/supabase';

// ================== Step Header Component ==================
const StepHeader: React.FC<{
    step: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    accent: string;
}> = ({ step, title, description, icon, accent }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box
            sx={{
                width: 36,
                height: 36,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: accent,
                color: 'white',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
        >
            {icon}
        </Box>
        <Box>
            <Typography fontWeight={700} fontSize="0.95rem" letterSpacing="-0.01em" color="text.primary" sx={{ lineHeight: 1.2 }}>
                <Box component="span" sx={{ color: '#a1a1aa', mr: 0.5, fontSize: '0.8rem', fontWeight: 600 }}>{step}.</Box>
                {title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
                {description}
            </Typography>
        </Box>
    </Box>
);

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
    const [streamingText, setStreamingText] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState(false);
    const navigate = useNavigate();

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setError, // Add setError
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
        onError: (error) => {
            if (error instanceof ValidationError) {
                error.errors.forEach(({ field, message }) => {
                    setError(field as any, { type: 'server', message });
                });
            }
        },
        onSuccess: async (data) => {
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

        if (unified && pdfFile) {
             // For unified with PDF we fallback to normal mutation since stream doesn't support file upload yet in the backend
             diagnoseMutation.mutate(patientData);
             return;
        }

        setIsStreaming(true);
        setStreamingText('');
        
        let accumulatedText = '';
        
        api.streamDiagnosis(
            patientData,
            (chunk) => {
                accumulatedText += chunk;
                setStreamingText(accumulatedText);
            },
            () => {
                setIsStreaming(false);
                try {
                    // Try to parse the accumulated JSON text
                    let finalJsonText = accumulatedText.trim();
                    if (finalJsonText.startsWith('```json')) finalJsonText = finalJsonText.substring(7);
                    if (finalJsonText.endsWith('```')) finalJsonText = finalJsonText.substring(0, finalJsonText.length - 3);
                    const resultData = JSON.parse(finalJsonText.trim());
                    navigate('/diagnosis/result', { state: resultData });
                } catch (e) {
                    console.error("Failed to parse streaming response", e);
                }
            },
            (error) => {
                setIsStreaming(false);
                console.error(error);
            }
        );
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
                            <StepHeader step={1} title="Patient Information" description="Enter the patient's demographics and identifiers" icon={<User size={18} />} accent="#171717" />
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
                            <StepHeader step={2} title="Symptoms" description="Search and select from common symptoms or type custom entries" icon={<Activity size={18} />} accent="#2563eb" />
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
                            <StepHeader step={3} title="Medical History" description="Add relevant medical conditions and past diagnoses" icon={<Heart size={18} />} accent="#dc2626" />
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
                                            width: 28,
                                            height: 28,
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: '#fef3c7',
                                            color: '#d97706',
                                        }}
                                    >
                                        <Heart size={14} />
                                    </Box>
                                    <Box>
                                        <Typography fontWeight={600} fontSize="0.9rem" color="text.primary" sx={{ lineHeight: 1.2 }}>Vitals (Optional)</Typography>
                                        <Typography variant="caption" color="text.secondary">Temperature, blood pressure, heart rate</Typography>
                                    </Box>
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
                            <StepHeader step={4} title="Medical Image Analysis" description="Upload X-ray, MRI, CT, or Ultrasound scans for AI analysis" icon={<LucideImageIcon size={18} />} accent="#7c3aed" />
                            
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
                                <StepHeader step={5} title="Lab Report (PDF)" description="Upload lab test results for comprehensive analysis" icon={<FileIcon sx={{ fontSize: 18 }} />} accent="#0d9488" />
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
                                disabled={diagnoseMutation.isPending || isStreaming}
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
                                disabled={diagnoseMutation.isPending || isStreaming || (unified && !pdfFile)}
                                startIcon={(diagnoseMutation.isPending || isStreaming) ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
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
                                {(diagnoseMutation.isPending || isStreaming) ? 'Analyzing...' : 'Get Diagnosis'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Streaming UI */}
            {isStreaming && (
                <Card sx={{ mt: 4, borderRadius: 3, bgcolor: '#fafafa', border: '1px solid #eaeaea', p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Sparkles size={20} className="text-amber-500 animate-pulse" />
                        AI Analysis in Progress...
                    </Typography>
                    <Box 
                        sx={{ 
                            fontFamily: 'monospace', 
                            fontSize: '0.85rem', 
                            color: '#4b5563',
                            bgcolor: '#f3f4f6', 
                            p: 2, 
                            borderRadius: 2,
                            whiteSpace: 'pre-wrap',
                            maxHeight: 300,
                            overflowY: 'auto'
                        }}
                    >
                        {streamingText || "Connecting to AI Engine..."}
                    </Box>
                </Card>
            )}

            {/* Results - handling via redirection now */}
        </Box>
    );
};

export default DiagnosisForm;
