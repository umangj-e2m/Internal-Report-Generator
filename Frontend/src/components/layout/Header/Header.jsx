import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink, NavLink } from 'react-router-dom';

import { APP_CONFIG } from '@/config/app.config';
import { ROUTES } from '@/config/routes.config';

const NAV_ITEMS = [
  { label: 'Generate', to: ROUTES.HOME, end: true },
  { label: 'Reports', to: ROUTES.REPORTS, end: false },
];

function Header() {
  return (
    <AppBar position="sticky" color="inherit" sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2, minHeight: 'var(--header-height)' }}>
          <Box
            component={RouterLink}
            to={ROUTES.HOME}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}
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

          <Box component="nav" sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.to}
                component={NavLink}
                to={item.to}
                end={item.end}
                color="inherit"
                sx={{
                  color: 'text.secondary',
                  '&.active': { color: 'primary.main', bgcolor: 'action.selected' },
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
