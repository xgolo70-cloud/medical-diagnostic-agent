import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';

import { store } from './store';
import { queryClient } from './store/queryClient';
import { theme } from './components/layout';
import { ThemeProvider } from './components/ui/ThemeProvider';
import App from './App';
import './index.css';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from './config/oauth';

// ... other imports

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <ThemeProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </ThemeProvider>
          </MuiThemeProvider>
        </QueryClientProvider>
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
);

