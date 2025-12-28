import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';

// Mock credentials for demo
const VALID_CREDENTIALS = [
    { username: 'admin', password: 'password', role: 'gp' as const },
    { username: 'dr.smith', password: 'specialist123', role: 'specialist' as const },
    { username: 'auditor', password: 'audit2024', role: 'auditor' as const },
];

interface FormErrors {
    username?: string;
    password?: string;
}

export const LoginForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.auth);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        if (!username.trim()) {
            errors.username = 'Username is required';
        }

        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        dispatch(loginStart());

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const matchedUser = VALID_CREDENTIALS.find(
            (cred) => cred.username === username && cred.password === password
        );

        if (matchedUser) {
            dispatch(loginSuccess({ username: matchedUser.username, role: matchedUser.role }));
        } else {
            dispatch(loginFailure('Invalid username or password'));
        }
    };

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: 2,
            }}
        >
            <Card
                sx={{
                    width: '100%',
                    maxWidth: 420,
                    borderRadius: 3,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    {/* Logo & Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 64,
                                height: 64,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #1976d2 0%, #00897b 100%)',
                                mb: 2,
                            }}
                        >
                            <HospitalIcon sx={{ fontSize: 36, color: 'white' }} />
                        </Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            ClinicalDX
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Medical Diagnostic Dashboard
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Login Form */}
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            fullWidth
                            id="username"
                            label="Username"
                            variant="outlined"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (formErrors.username) {
                                    setFormErrors({ ...formErrors, username: undefined });
                                }
                            }}
                            error={!!formErrors.username}
                            helperText={formErrors.username}
                            disabled={isLoading}
                            sx={{ mb: 2 }}
                            autoComplete="username"
                            autoFocus
                        />

                        <TextField
                            fullWidth
                            id="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (formErrors.password) {
                                    setFormErrors({ ...formErrors, password: undefined });
                                }
                            }}
                            error={!!formErrors.password}
                            helperText={formErrors.password}
                            disabled={isLoading}
                            sx={{ mb: 3 }}
                            autoComplete="current-password"
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleTogglePassword}
                                                edge="end"
                                                disabled={isLoading}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={isLoading}
                            sx={{
                                py: 1.5,
                                background: 'linear-gradient(135deg, #1976d2 0%, #00897b 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #1565c0 0%, #00796b 100%)',
                                },
                            }}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </Box>

                    {/* Demo Credentials */}
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Demo Credentials:
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="div">
                            GP: <strong>admin / password</strong><br />
                            Specialist: <strong>dr.smith / specialist123</strong><br />
                            Auditor: <strong>auditor / audit2024</strong>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default LoginForm;
