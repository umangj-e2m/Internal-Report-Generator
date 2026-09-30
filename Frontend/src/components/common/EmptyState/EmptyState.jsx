import { Box, Typography } from '@mui/material';

import { fadeInUp } from '@/styles/animations';

function EmptyState({ icon, title, description, action }) {
  return (
    <Box sx={{ py: 8, px: 2, textAlign: 'center', color: 'text.secondary', ...fadeInUp() }}>
      {icon ? (
        <Box
          sx={{
            mb: 2,
            mx: 'auto',
            width: 88,
            height: 88,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'rgba(242, 107, 33, 0.08)',
            color: 'secondary.main',
            animation: 'float 3.5s ease-in-out infinite',
            '& svg': { fontSize: 44 },
          }}
        >
          {icon}
        </Box>
      ) : undefined}
      <Typography variant="h6" color="text.primary" gutterBottom>
        {title}
      </Typography>
      {description ? <Typography sx={{ mb: action ? 3 : 0 }}>{description}</Typography> : undefined}
      {action}
    </Box>
  );
}

export default EmptyState;
