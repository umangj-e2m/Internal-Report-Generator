import { Box, CircularProgress, Typography } from '@mui/material';

function Loader({ label = 'Loading…', minHeight = 240 }) {
  return (
    <Box
      role="status"
      sx={{
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography color="text.secondary">{label}</Typography>
    </Box>
  );
}

export default Loader;
