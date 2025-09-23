// src/components/common/EmptyState.tsx
import React, { ReactNode } from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface EmptyStateProps {
  title?: string;
  message?: string; // Alternative to description
  description?: string;
  icon?: ReactNode;
  actionText?: string;
  onAction?: () => void;
  type?: 'noResults' | 'noData' | 'custom';
  height?: string | number;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  description,
  icon,
  actionText,
  onAction,
  type = 'noResults',
  height = 300,
}) => {
  const theme = useTheme();
  
  const displayDescription = message || description;
  
  let defaultTitle = '';
  let defaultDescription = '';
  let defaultIcon: ReactNode = null;
  let defaultActionText = '';
  
  switch (type) {
    case 'noResults':
      defaultTitle = 'No results found';
      defaultDescription = 'Try adjusting your filters or search terms.';
      defaultIcon = <SearchOffIcon sx={{ fontSize: 64, color: 'text.secondary' }} />;
      defaultActionText = 'Clear filters';
      break;
    case 'noData':
      defaultTitle = 'No data available';
      defaultDescription = 'There are no items to display yet.';
      defaultIcon = <AddCircleOutlineIcon sx={{ fontSize: 64, color: 'text.secondary' }} />;
      defaultActionText = 'Add item';
      break;
    default:
      defaultTitle = title || '';
      defaultDescription = displayDescription || '';
      defaultIcon = icon || null;
      defaultActionText = actionText || '';
  }
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: height,
        p: 3,
        textAlign: 'center',
      }}
    >
      {icon || defaultIcon}
      
      {(title || defaultTitle) && (
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          {title || defaultTitle}
        </Typography>
      )}
      
      {(displayDescription || defaultDescription) && (
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          {displayDescription || defaultDescription}
        </Typography>
      )}
      
      {onAction && (actionText || defaultActionText) && (
        <Button variant="outlined" onClick={onAction} sx={{ mt: 2 }}>
          {actionText || defaultActionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;