import { Box, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { reportPath } from '@/config/routes.config';
import GenerationProgress from '@/features/reports/components/GenerationProgress';
import RecentReports from '@/features/reports/components/RecentReports';
import ReportForm from '@/features/reports/components/ReportForm';
import { useCreateReport } from '@/features/reports/hooks/useCreateReport';
import { useNotification } from '@/hooks/useNotification';
import { fadeInUp } from '@/styles/animations';

import FeatureHighlights from './FeatureHighlights';

const BLOBS = [
  { color: 'rgba(242, 107, 33, 0.18)', size: 280, top: -60, left: '8%', delay: '0s' },
  { color: 'rgba(27, 35, 64, 0.10)', size: 320, top: -20, right: '6%', delay: '-6s' },
  { color: 'rgba(242, 107, 33, 0.10)', size: 200, bottom: -40, left: '42%', delay: '-12s' },
];

function Home() {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const createReport = useCreateReport();

  const handleSubmit = (url) => {
    createReport.mutate(url, {
      onSuccess: (report) => {
        notify(`Report ready for ${report.site_name}`, 'success');
        navigate(reportPath(report.slug));
      },
    });
  };

  return (
    <Stack spacing={{ xs: 4, md: 6 }}>
      <Box sx={{ position: 'relative', py: { xs: 1, md: 3 } }}>
        <Box aria-hidden sx={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          {BLOBS.map(({ color, size, delay, ...position }) => (
            <Box
              key={delay}
              sx={{
                position: 'absolute',
                ...position,
                width: { xs: size * 0.6, md: size },
                height: { xs: size * 0.6, md: size },
                borderRadius: '50%',
                bgcolor: color,
                filter: 'blur(60px)',
                animation: 'blob-drift 18s ease-in-out infinite',
                animationDelay: delay,
              }}
            />
          ))}
        </Box>

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            maxWidth: 780,
            mx: 'auto',
          }}
        >
          <Typography
            variant="overline"
            color="secondary"
            sx={{ fontWeight: 700, letterSpacing: '0.14em', display: 'block', ...fadeInUp(0) }}
          >
            Website Content Report
          </Typography>
          <Typography
            variant="h3"
            component="h1"
            color="primary"
            sx={{
              fontSize: { xs: '1.9rem', sm: '2.4rem', md: '3rem' },
              lineHeight: 1.15,
              mb: 2,
              ...fadeInUp(80),
            }}
          >
            Turn any website into a{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(90deg, #F26B21, #FF9A5A, #F26B21)',
                backgroundSize: '200% auto',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                animation: 'gradient-shift 6s ease-in-out infinite',
              }}
            >
              polished report
            </Box>
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, ...fadeInUp(160) }}
          >
            Paste a URL and get the title, description, headings and a content summary for up to
            five pages, as a branded PDF, a Word document, a slide deck and a shareable web page.
          </Typography>
        </Box>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          p: { xs: 2.5, md: 4 },
          maxWidth: 860,
          width: '100%',
          alignSelf: 'center',
          boxShadow: '0 20px 50px rgba(27, 35, 64, 0.08)',
          transition: 'box-shadow 0.3s ease',
          '&:focus-within': { boxShadow: '0 24px 60px rgba(242, 107, 33, 0.14)' },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #F26B21, #1B2340, #F26B21)',
            backgroundSize: '200% auto',
            animation: createReport.isPending ? 'gradient-shift 2s linear infinite' : 'none',
          },
          ...fadeInUp(240),
        }}
      >
        <ReportForm
          onSubmit={handleSubmit}
          isSubmitting={createReport.isPending}
          error={createReport.error}
        />
        {createReport.isPending ? <GenerationProgress url={createReport.variables} /> : undefined}
      </Paper>

      <FeatureHighlights />
      <RecentReports />
    </Stack>
  );
}

export default Home;
