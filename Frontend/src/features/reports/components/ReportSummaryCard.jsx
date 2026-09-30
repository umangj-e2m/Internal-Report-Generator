import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import { Box, Chip, Link, Paper, Stack, Typography } from '@mui/material';

import { formatDateTime, pluralize } from '@/utils/formatters';

import ReportActions from './ReportActions';

function ReportSummaryCard({ report }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3.5 } }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="overline"
            color="secondary"
            sx={{ fontWeight: 700, letterSpacing: '0.12em' }}
          >
            Website Content Report
          </Typography>
          <Typography variant="h4" component="h1" color="primary" sx={{ wordBreak: 'break-word' }}>
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
            />
            <Chip
              icon={<CalendarTodayOutlinedIcon />}
              label={formatDateTime(report.created_at)}
              size="small"
            />
          </Stack>
        </Box>
        <ReportActions report={report} />
      </Stack>
    </Paper>
  );
}

export default ReportSummaryCard;
