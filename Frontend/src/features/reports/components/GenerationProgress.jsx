import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {
  Box,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { fadeInUp } from '@/styles/animations';
import { displayHost } from '@/utils/formatters';

const STEPS = [
  'Reading the website',
  'Following internal links',
  'Extracting titles, descriptions and headings',
  'Building your report',
];
const STEP_INTERVAL_MS = 3500;
const TICK_MS = 250;
const MAX_ESTIMATE = 95;
const ESTIMATE_TIME_CONSTANT_S = 12;

function OrbitingDoc({ delay }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        mt: '-10px',
        ml: '-10px',
        color: 'secondary.main',
        animation: 'orbit 4s linear infinite',
        animationDelay: delay,
        '& svg': { fontSize: 20, display: 'block' },
      }}
    >
      <DescriptionOutlinedIcon />
    </Box>
  );
}

function ScanningGlobe() {
  return (
    <Box aria-hidden sx={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
      {[0, 1].map((ring) => (
        <Box
          key={ring}
          sx={{
            position: 'absolute',
            inset: 24,
            borderRadius: '50%',
            border: 2,
            borderColor: 'secondary.main',
            animation: 'pulse-ring 2.4s ease-out infinite',
            animationDelay: `${ring * 1.2}s`,
          }}
        />
      ))}
      <Box
        sx={{
          position: 'absolute',
          inset: 30,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          color: 'common.white',
          background: 'linear-gradient(135deg, #1B2340, #34406B)',
          boxShadow: '0 10px 24px rgba(27, 35, 64, 0.3)',
          '& svg': { fontSize: 34 },
        }}
      >
        <LanguageIcon />
      </Box>
      <OrbitingDoc delay="0s" />
      <OrbitingDoc delay="-2s" />
    </Box>
  );
}

function StepIcon({ state }) {
  if (state === 'done') {
    return (
      <CheckCircleIcon
        fontSize="small"
        sx={{ color: 'success.main', animation: 'pop-in 0.45s ease both' }}
      />
    );
  }
  if (state === 'active') return <CircularProgress size={18} thickness={5} color="secondary" />;
  return <RadioButtonUncheckedIcon fontSize="small" sx={{ color: 'text.disabled' }} />;
}

function GenerationProgress({ url }) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => setElapsedMs(Date.now() - startedAt), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const elapsedSeconds = elapsedMs / 1000;
  const stepIndex = Math.min(Math.floor(elapsedMs / STEP_INTERVAL_MS), STEPS.length - 1);
  const estimate = MAX_ESTIMATE * (1 - Math.exp(-elapsedSeconds / ESTIMATE_TIME_CONSTANT_S));

  const stepState = (index) => {
    if (index < stepIndex) return 'done';
    if (index === stepIndex) return 'active';
    return 'pending';
  };

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        mt: 3,
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        bgcolor: '#F9FAFC',
        border: 1,
        borderColor: 'divider',
        ...fadeInUp(),
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 2, sm: 3 }}
        sx={{ alignItems: 'center' }}
      >
        <ScanningGlobe />

        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}
          >
            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700 }} noWrap>
              Generating report{url ? ` for ${displayHost(url)}` : ''}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}
            >
              {Math.floor(elapsedSeconds)}s
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={estimate}
            color="secondary"
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(242, 107, 33, 0.12)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: 'linear-gradient(90deg, #F26B21, #FF9A5A, #F26B21)',
                backgroundSize: '200% auto',
                animation: 'gradient-shift 1.6s linear infinite',
              },
            }}
          />

          <List dense disablePadding sx={{ mt: 1.5 }}>
            {STEPS.map((step, index) => {
              const state = stepState(index);
              return (
                <ListItem key={step} disableGutters sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <StepIcon state={state} />
                  </ListItemIcon>
                  <ListItemText
                    primary={step}
                    slotProps={{
                      primary: {
                        variant: 'body2',
                        sx: {
                          color: state === 'pending' ? 'text.disabled' : 'text.primary',
                          fontWeight: state === 'active' ? 600 : 400,
                          transition: 'color 0.3s ease',
                        },
                      },
                    }}
                  />
                </ListItem>
              );
            })}
          </List>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            This can take up to a minute for slower websites.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default GenerationProgress;
