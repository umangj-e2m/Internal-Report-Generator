import {
  Avatar,
  Box,
  Chip,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

import { reportPath } from '@/config/routes.config';
import { fadeInUp } from '@/styles/animations';
import { PAGE_SIZE_OPTIONS } from '@/utils/constants';
import { displayHost, formatDateTime, pluralize } from '@/utils/formatters';

import ReportActions from './ReportActions';

const ROW_STAGGER_MS = 40;

function SiteAvatar({ name }) {
  return (
    <Avatar
      className="site-avatar"
      variant="rounded"
      sx={{
        bgcolor: 'primary.main',
        fontWeight: 700,
        width: 36,
        height: 36,
        fontSize: '0.95rem',
        transition: 'transform 0.25s ease, background-color 0.25s ease',
      }}
    >
      {name.charAt(0).toUpperCase()}
    </Avatar>
  );
}

function ReportCards({ reports, onDelete }) {
  return (
    <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
      {reports.map((report, index) => (
        <Box key={report.slug} sx={{ p: 2, ...fadeInUp(index * ROW_STAGGER_MS) }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
            <SiteAvatar name={report.site_name} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Link
                component={RouterLink}
                to={reportPath(report.slug)}
                underline="hover"
                sx={{ fontWeight: 600, display: 'block' }}
                noWrap
              >
                {report.site_name}
              </Link>
              <Typography variant="body2" color="text.secondary" noWrap>
                {displayHost(report.source_url)}
              </Typography>
            </Box>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ mt: 1.5, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Chip size="small" label={pluralize(report.page_count, 'page')} />
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(report.created_at)}
            </Typography>
          </Stack>
          <Box sx={{ mt: 1, ml: -1 }}>
            <ReportActions report={report} align="flex-start" onDelete={onDelete} />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

function ReportRows({ reports, onDelete }) {
  return (
    <TableContainer>
      <Table aria-label="Generated reports" sx={{ minWidth: 640 }}>
        <TableHead>
          <TableRow>
            <TableCell>Website</TableCell>
            <TableCell align="center">Pages</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reports.map((report, index) => (
            <TableRow
              key={report.slug}
              hover
              sx={{
                ...fadeInUp(index * ROW_STAGGER_MS),
                '&:hover .site-avatar': { transform: 'scale(1.08)', bgcolor: 'secondary.main' },
              }}
            >
              <TableCell sx={{ maxWidth: 380 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                  <SiteAvatar name={report.site_name} />
                  <Box sx={{ minWidth: 0 }}>
                    <Link
                      component={RouterLink}
                      to={reportPath(report.slug)}
                      underline="hover"
                      sx={{ fontWeight: 600 }}
                    >
                      {report.site_name}
                    </Link>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      title={report.source_url}
                    >
                      {report.source_url}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell align="center">{report.page_count}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {formatDateTime(report.created_at)}
              </TableCell>
              <TableCell align="right">
                <ReportActions report={report} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ReportsTable({
  reports,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onDelete,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      {isMobile ? (
        <ReportCards reports={reports} onDelete={onDelete} />
      ) : (
        <ReportRows reports={reports} onDelete={onDelete} />
      )}
      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={pageSize}
        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
        labelRowsPerPage={isMobile ? 'Rows' : 'Rows per page'}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        onRowsPerPageChange={(event) => onPageSizeChange(Number(event.target.value))}
        sx={{ borderTop: 1, borderColor: 'divider' }}
      />
    </>
  );
}

export default ReportsTable;
