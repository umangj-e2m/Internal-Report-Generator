import { Box, Container, Typography } from '@mui/material';

import { APP_CONFIG } from '@/config/app.config';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{ py: 3, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} {APP_CONFIG.BRAND_NAME} · {APP_CONFIG.APP_NAME}
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
