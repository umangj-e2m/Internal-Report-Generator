import { Box, Typography } from '@mui/material';

function EmptyState({ icon, title, description, action }) {
  return (
    <Box sx={{ py: 8, px: 2, textAlign: 'center', color: 'text.secondary' }}>
      {icon ? <Box sx={{ mb: 1.5, '& svg': { fontSize: 48 } }}>{icon}</Box> : undefined}
      <Typography variant="h6" color="text.primary" gutterBottom>
        {title}
      </Typography>
      {description ? <Typography sx={{ mb: action ? 3 : 0 }}>{description}</Typography> : undefined}
      {action}
    </Box>
  );
}

export default EmptyState;
