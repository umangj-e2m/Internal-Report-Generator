import { Box, LinearProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

const STEPS = [
  'Reading the website…',
  'Following internal links…',
  'Extracting titles, descriptions and headings…',
  'Building your report…',
];
const STEP_INTERVAL_MS = 3500;

function GenerationProgress() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setStepIndex((index) => Math.min(index + 1, STEPS.length - 1)),
      STEP_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <Box role="status" aria-live="polite" sx={{ mt: 3 }}>
      <LinearProgress color="secondary" sx={{ borderRadius: 1, mb: 1.5 }} />
      <Typography variant="body2" color="text.secondary">
        {STEPS[stepIndex]} This can take up to a minute for slower websites.
      </Typography>
    </Box>
  );
}

export default GenerationProgress;
