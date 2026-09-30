import { Box, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { reportPath } from '@/config/routes.config';
import GenerationProgress from '@/features/reports/components/GenerationProgress';
import RecentReports from '@/features/reports/components/RecentReports';
import ReportForm from '@/features/reports/components/ReportForm';
import { useCreateReport } from '@/features/reports/hooks/useCreateReport';
import { useNotification } from '@/hooks/useNotification';

import FeatureHighlights from './FeatureHighlights';

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
    <Stack spacing={5}>
      <Box sx={{ textAlign: 'center', maxWidth: 760, alignSelf: 'center' }}>
        <Typography
          variant="overline"
          color="secondary"
          sx={{ fontWeight: 700, letterSpacing: '0.14em' }}
        >
          Website Content Report
        </Typography>
        <Typography
          variant="h3"
          component="h1"
          color="primary"
          sx={{ fontSize: { xs: '2rem', md: '2.8rem' } }}
          gutterBottom
        >
          Turn any website into a polished report
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1.05rem' }}>
          Paste a URL and get the title, description, headings and a content summary for up to five
          pages, as a branded PDF, a Word document and a shareable web page.
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2.5, md: 4 }, maxWidth: 860, width: '100%', alignSelf: 'center' }}
      >
        <ReportForm
          onSubmit={handleSubmit}
          isSubmitting={createReport.isPending}
          error={createReport.error}
        />
        {createReport.isPending ? <GenerationProgress /> : undefined}
      </Paper>

      <FeatureHighlights />
      <RecentReports />
    </Stack>
  );
}

export default Home;
