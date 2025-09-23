// src/App.tsx (updated to use CustomThemeProvider)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, Box, Typography, Button, CircularProgress } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { useAuth } from 'react-oidc-context';

import { CustomThemeProvider } from './contexts/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import RulesExplorer from './pages/RulesExplorer';
import AttackMatrix from './pages/AttackMatrix';
import CveExplorer from './pages/CveExplorer';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

function AuthenticatedApp() {
  const auth = useAuth();

  React.useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      const idToken = auth.user.id_token;
      const accessToken = auth.user.access_token;
      
      if (idToken) sessionStorage.setItem('id_token', idToken);
      if (accessToken) sessionStorage.setItem('access_token', accessToken);
    }
  }, [auth.isAuthenticated, auth.user]);

  if (auth.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: 'background.default',
      }}>
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
          PANORAMA
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          Security Rule Management Platform
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => auth.signinRedirect()}
          sx={{ px: 4 }}
        >
          Sign In
        </Button>
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/rules" replace />} />
          <Route path="rules" element={<RulesExplorer />} />
          <Route path="mitre" element={<AttackMatrix />} />
          <Route path="cves" element={<CveExplorer />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <CssBaseline />
        <AuthenticatedApp />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '4px',
              fontSize: '14px',
            },
          }}
        />
      </CustomThemeProvider>
    </QueryClientProvider>
  );
}