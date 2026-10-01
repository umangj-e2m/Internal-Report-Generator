import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useScrollTrigger,
} from '@mui/material';

import { APP_CONFIG } from '@/config/app.config';

function Header({ sidebarOpen, onMenuClick, actionsOpen, onActionsToggle }) {
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 8 });
  const toggleLabel = sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar';
  const actionsLabel = actionsOpen ? 'Collapse report tools' : 'Expand report tools';

  return (
    <AppBar
      position="sticky"
      color="inherit"
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'saturate(180%) blur(12px)',
        boxShadow: scrolled ? '0 6px 24px rgba(27, 35, 64, 0.08)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <Toolbar
        sx={{
          position: 'relative',
          '&.MuiToolbar-root': { minHeight: 'calc(var(--header-height) - 1px)' },
        }}
      >
        <Tooltip title={toggleLabel}>
          <IconButton
            edge="start"
            onClick={onMenuClick}
            aria-label={toggleLabel}
            aria-expanded={sidebarOpen}
            sx={{ color: 'text.secondary' }}
          >
            {sidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        </Tooltip>
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          <Typography
            component="p"
            color="primary"
            sx={{ fontSize: { xs: 17, sm: 21 }, fontWeight: 700, lineHeight: 1.3 }}
          >
            {APP_CONFIG.APP_NAME}
          </Typography>
          <Typography
            component="p"
            sx={{
              mt: 0.25,
              fontSize: { xs: 11, sm: 12 },
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {APP_CONFIG.BRAND_NAME}
          </Typography>
        </Box>
        {onActionsToggle ? (
          <Tooltip title={actionsLabel}>
            <IconButton
              edge="end"
              onClick={onActionsToggle}
              aria-label={actionsLabel}
              aria-expanded={actionsOpen}
              sx={{
                ml: 'auto',
                color: 'text.secondary',
                display: { xs: 'none', md: 'inline-flex' },
              }}
            >
              {actionsOpen ? <MenuOpenIcon sx={{ transform: 'scaleX(-1)' }} /> : <MenuIcon />}
            </IconButton>
          </Tooltip>
        ) : undefined}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
