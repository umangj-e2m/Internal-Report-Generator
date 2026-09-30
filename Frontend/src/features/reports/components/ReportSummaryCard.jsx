import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import { Box, Chip, Link, Paper, Stack, Typography } from '@mui/material';

import { fadeInUp } from '@/styles/animations';
import { formatDateTime, pluralize } from '@/utils/formatters';

import ReportActions from './ReportActions';

function ReportSummaryCard({ report }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 2.5, md: 3.5 },
        ...fadeInUp(),
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 4,
          background: 'linear-gradient(180deg, #F26B21, #1B2340)',
        },
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' } }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="overline"
            color="secondary"
            sx={{ fontWeight: 700, letterSpacing: '0.12em' }}
          >
            Website Content Report
          </Typography>
          <Typography
            variant="h4"
            component="h1"
            color="primary"
            sx={{ wordBreak: 'break-word', fontSize: { xs: '1.6rem', md: '2.125rem' } }}
          >
            {report.site_name}
          </Typography>
          <Link
            href={report.source_url}
            target="_blank"
            rel="noopener noreferrer"
            color="text.secondary"
            underline="hover"
            sx={{ wordBreak: 'break-all' }}
          >
            {report.source_url}
          </Link>
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }} useFlexGap>
            <Chip
              icon={<LayersOutlinedIcon />}
              label={`${pluralize(report.page_count, 'page')} analysed`}
              size="small"
              sx={fadeInUp(120)}
            />
            <Chip
              icon={<CalendarTodayOutlinedIcon />}
              label={formatDateTime(report.created_at)}
              size="small"
              sx={fadeInUp(180)}
            />
          </Stack>
        </Box>
        <Box sx={fadeInUp(150)}>
          <ReportActions report={report} />
        </Box>
      </Stack>
    </Paper>
  );
}

export default ReportSummaryCard;
