// src/components/layout/Header.tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useThemeMode } from '@/contexts/ThemeContext';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { isDarkMode, toggleTheme } = useThemeMode();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleLogout = () => {
    sessionStorage.clear();
    auth.removeUser();
    auth.signoutRedirect();
  };

  const navItems = [
    { label: 'Rules', path: '/rules' },
    { label: 'MITRE ATT&CK', path: '/mitre' },
    { label: 'CVEs', path: '/cves' },
  ];

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: 'primary.main',
            mr: 6,
          }}
        >
          PANORAMA
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  px: 2,
                  color: isActive ? 'primary.main' : 'text.secondary',
                  borderBottom: isActive ? 2 : 0,
                  borderColor: 'primary.main',
                  borderRadius: 0,
                  fontWeight: isActive ? 600 : 400,
                  '&:hover': {
                    bgcolor: 'action.hover',
                    color: 'text.primary',
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            ml: 2,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <AccountCircleIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { width: 200, mt: 1 }
          }}
        >
          <MenuItem disabled sx={{ opacity: 1 }}>
            <ListItemText 
              primary={auth.user?.profile?.email || 'User'}
              primaryTypographyProps={{ fontSize: '0.875rem' }}
            />
          </MenuItem>
          <Divider />
          <MenuItem onClick={toggleTheme}>
            <ListItemIcon>
              {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText primary={isDarkMode ? 'Light Mode' : 'Dark Mode'} />
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}