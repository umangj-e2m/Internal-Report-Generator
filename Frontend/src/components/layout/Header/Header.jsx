import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  useScrollTrigger,
} from '@mui/material';
import { Link as RouterLink, NavLink } from 'react-router-dom';

import { APP_CONFIG } from '@/config/app.config';
import { ROUTES } from '@/config/routes.config';

const NAV_ITEMS = [
  { label: 'Generate', to: ROUTES.HOME, end: true },
  { label: 'Reports', to: ROUTES.REPORTS, end: false },
];

function Header() {
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 8 });

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
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2, minHeight: 'var(--header-height)' }}>
          <Box
            component={RouterLink}
            to={ROUTES.HOME}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              '& img': { transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)' },
              '&:hover img': { transform: 'rotate(-8deg) scale(1.08)' },
            }}
          >
            <Box
              component="img"
              src={APP_CONFIG.LOGO_SRC}
              alt={`${APP_CONFIG.BRAND_NAME} logo`}
              sx={{ width: 36, height: 36 }}
            />
            <Typography
              variant="subtitle1"
              color="primary"
              sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}
            >
              {APP_CONFIG.APP_NAME}
            </Typography>
          </Box>

          <Box component="nav" sx={{ ml: 'auto', display: 'flex', gap: { xs: 0, sm: 0.5 } }}>
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.to}
                component={NavLink}
                to={item.to}
                end={item.end}
                color="inherit"
                sx={{
                  position: 'relative',
                  color: 'text.secondary',
                  px: { xs: 1.5, sm: 2 },
                  '&:hover': { transform: 'none', color: 'primary.main', bgcolor: 'transparent' },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 12,
                    right: 12,
                    bottom: 4,
                    height: 2,
                    borderRadius: 1,
                    bgcolor: 'secondary.main',
                    transform: 'scaleX(0)',
                    transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                  },
                  '&:hover::after, &.active::after': { transform: 'scaleX(1)' },
                  '&.active': { color: 'primary.main' },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
