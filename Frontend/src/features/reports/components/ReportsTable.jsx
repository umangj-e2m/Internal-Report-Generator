import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { reportPath } from '@/config/routes.config';
import { PAGE_SIZE_OPTIONS } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatters';

import ReportActions from './ReportActions';

function ReportsTable({
  reports,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onDelete,
}) {
  return (
    <>
      <TableContainer>
        <Table aria-label="Generated reports" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell>Website</TableCell>
              <TableCell align="center">Pages</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.slug} hover>
                <TableCell sx={{ maxWidth: 380 }}>
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
                </TableCell>
                <TableCell align="center">{report.page_count}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {formatDateTime(report.created_at)}
                </TableCell>
                <TableCell align="right">
                  <ReportActions report={report} variant="compact" onDelete={onDelete} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={pageSize}
        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        onRowsPerPageChange={(event) => onPageSizeChange(Number(event.target.value))}
      />
    </>
  );
}

export default ReportsTable;
