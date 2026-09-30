import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { reportPath, ROUTES } from '@/config/routes.config';
import { RECENT_REPORTS_LIMIT } from '@/utils/constants';
import { displayHost, formatDateTime, pluralize } from '@/utils/formatters';

import { useReports } from '../hooks/useReports';

function RecentReports() {
  const { data } = useReports({ page: 1, pageSize: RECENT_REPORTS_LIMIT, search: '' });
  const reports = data?.items ?? [];

  if (reports.length === 0) return null;

  return (
    <Box component="section">
      <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          Recent reports
        </Typography>
        <Button component={RouterLink} to={ROUTES.REPORTS} endIcon={<ArrowForwardIcon />}>
          View all
        </Button>
      </Stack>
      <Grid container spacing={2}>
        {reports.map((report) => (
          <Grid key={report.slug} size={{ xs: 12, md: 4 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardActionArea
                component={RouterLink}
                to={reportPath(report.slug)}
                sx={{ height: '100%' }}
              >
                <CardContent>
                  <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700 }} noWrap>
                    {report.site_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {displayHost(report.source_url)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1.5 }}
                  >
                    {pluralize(report.page_count, 'page')} · {formatDateTime(report.created_at)}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default RecentReports;
