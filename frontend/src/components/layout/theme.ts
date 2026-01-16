import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#171717', // var(--color-primary)
            light: '#404040',
            dark: '#000000',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#666666', // var(--text-secondary)
            light: '#a3a3a3',
            dark: '#171717',
            contrastText: '#ffffff',
        },
        background: {
            default: '#ffffff', // var(--bg-primary)
            paper: '#ffffff',
        },
        text: {
            primary: '#171717',
            secondary: '#666666',
        },
        divider: '#eaeaea', // var(--border-color)
        success: {
            main: '#0070f3', // Using Vercel Blue for success/brand actions often, or keep strict success green if needed. Let's start with standard green for semantic success but styled cleanly.
            light: '#dcfce7',
            contrastText: '#166534',
        },
        info: {
            main: '#0070f3', // var(--color-info)
        },
        warning: {
            main: '#f5a623',
        },
        error: {
            main: '#ee0000',
        },
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
        h1: {
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: '#171717',
        },
        h2: {
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: '#171717',
        },
        h3: {
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: '#171717',
        },
        h4: {
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: '#171717',
        },
        h5: {
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#171717',
        },
        h6: {
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#171717',
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
            letterSpacing: '-0.01em',
        },
    },
    shape: {
        borderRadius: 6,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#ffffff',
                    color: '#171717',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 6,
                    padding: '8px 16px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                containedPrimary: {
                    backgroundColor: '#171717',
                    color: '#ffffff',
                    '&:hover': {
                        backgroundColor: '#333333',
                    },
                },
                outlinedPrimary: {
                    borderColor: '#eaeaea',
                    color: '#171717',
                    borderWidth: '1px',
                    '&:hover': {
                        backgroundColor: '#fafafa',
                        borderColor: '#000000',
                        borderWidth: '1px',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: 'none',
                    border: '1px solid #eaeaea',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02), 0 1px 0 rgba(0,0,0,0.06)',
                },
            },
        },
    },
});

export default theme;
