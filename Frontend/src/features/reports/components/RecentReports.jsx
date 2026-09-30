import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Avatar,
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
import { fadeInUp, hoverLift, STAGGER_MS } from '@/styles/animations';
import { RECENT_REPORTS_LIMIT } from '@/utils/constants';
import { displayHost, formatDateTime, pluralize } from '@/utils/formatters';

import { useReports } from '../hooks/useReports';

function RecentReports() {
  const { data } = useReports({ page: 1, pageSize: RECENT_REPORTS_LIMIT, search: '' });
  const reports = data?.items ?? [];

  if (reports.length === 0) return null;

  return (
    <Box component="section" sx={fadeInUp(400)}>
      <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          Recent reports
        </Typography>
        <Button component={RouterLink} to={ROUTES.REPORTS} endIcon={<ArrowForwardIcon />}>
          View all
        </Button>
      </Stack>
      <Grid container spacing={2}>
        {reports.map((report, index) => (
          <Grid key={report.slug} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                ...fadeInUp(460 + index * STAGGER_MS),
                ...hoverLift,
                '& .open-arrow': {
                  opacity: 0,
                  transform: 'translateX(-6px)',
                  transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                },
                '&:hover .open-arrow': { opacity: 1, transform: 'translateX(0)' },
              }}
            >
              <CardActionArea
                component={RouterLink}
                to={reportPath(report.slug)}
                sx={{ height: '100%' }}
              >
                <CardContent>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar
                      variant="rounded"
                      sx={{ bgcolor: 'primary.main', fontWeight: 700, width: 40, height: 40 }}
                    >
                      {report.site_name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="subtitle1"
                        color="primary"
                        sx={{ fontWeight: 700 }}
                        noWrap
                      >
                        {report.site_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {displayHost(report.source_url)}
                      </Typography>
                    </Box>
                    <ArrowForwardIcon className="open-arrow" color="secondary" fontSize="small" />
                  </Stack>
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
