// src/components/common/ErrorDisplay.tsx
import React from 'react';
import { Box, Typography, Button, Paper, useTheme, alpha } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

export interface ErrorDisplayProps {
  error?: Error | string | null;
  title?: string;
  message?: string;
  details?: string;
  retry?: boolean;
  onRetry?: () => void;
  compact?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title = 'Error',
  message = 'An error occurred',
  details,
  retry = true,
  onRetry,
  compact = false,
}) => {
  const theme = useTheme();
  
  // Extract error message from error object if provided
  const errorMessage = error instanceof Error ? error.message : error || message;
  const errorDetails = error instanceof Error && error.stack ? error.stack : details;
  
  if (compact) {
    return (
      <Typography color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ErrorOutlineIcon fontSize="small" />
        {errorMessage}
      </Typography>
    );
  }
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 2,
        bgcolor: alpha(theme.palette.error.main, 0.05),
        border: `1px solid ${theme.palette.error.light}`,
      }}
    >
      <ErrorOutlineIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
      
      <Typography variant="h6" color="error" gutterBottom>
        {title}
      </Typography>
      
      <Typography variant="body1" color="text.secondary">
        {errorMessage}
      </Typography>
      
      {errorDetails && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1,
            p: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
            maxWidth: '100%',
            overflow: 'auto',
            fontFamily: 'monospace',
          }}
        >
          {errorDetails}
        </Typography>
      )}
      
      {retry && onRetry && (
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      )}
    </Paper>
  );
};

export default ErrorDisplay;