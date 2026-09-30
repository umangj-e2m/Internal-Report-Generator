import AddIcon from '@mui/icons-material/Add';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import Loader from '@/components/common/Loader';
import { ROUTES } from '@/config/routes.config';
import ReportsTable from '@/features/reports/components/ReportsTable';
import { useDeleteReport } from '@/features/reports/hooks/useDeleteReport';
import { useReports } from '@/features/reports/hooks/useReports';
import { useDebounce } from '@/hooks/useDebounce';
import { useNotification } from '@/hooks/useNotification';
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from '@/utils/constants';

function Reports() {
  const { notify } = useNotification();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [reportToDelete, setReportToDelete] = useState(null);
  const debouncedSearch = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS);

  const { data, isPending, isError, error, isFetching, refetch } = useReports({
    page: page + 1,
    pageSize,
    search: debouncedSearch,
  });
  const deleteReport = useDeleteReport();

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(0);
  };

  const handleConfirmDelete = () => {
    deleteReport.mutate(reportToDelete.slug, {
      onSuccess: () => {
        notify(`Deleted report for ${reportToDelete.site_name}`, 'success');
        setReportToDelete(null);
        if (data?.items.length === 1 && page > 0) setPage(page - 1);
      },
      onError: (deleteError) => notify(deleteError.message, 'error'),
    });
  };

  const renderContent = () => {
    if (isPending) return <Loader label="Loading reports…" />;
    if (isError) {
      return (
        <Box sx={{ p: 2 }}>
          <ErrorState message={error.message} onRetry={refetch} />
        </Box>
      );
    }
    if (data.items.length === 0) {
      return debouncedSearch ? (
        <EmptyState
          icon={<SearchIcon />}
          title="No matching reports"
          description={`No reports match "${debouncedSearch}".`}
        />
      ) : (
        <EmptyState
          icon={<FolderOpenOutlinedIcon />}
          title="No reports yet"
          description="Generate your first website report to see it here."
          action={
            <Button component={RouterLink} to={ROUTES.HOME} variant="contained" color="secondary">
              Generate a report
            </Button>
          }
        />
      );
    }
    return (
      <ReportsTable
        reports={data.items}
        total={data.total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onDelete={setReportToDelete}
      />
    );
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}
      >
        <Box>
          <Typography variant="h4" component="h1" color="primary">
            Reports
          </Typography>
          <Typography color="text.secondary">
            View, download or share every website report you have generated.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to={ROUTES.HOME}
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
        >
          New report
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by website name or URL"
            size="small"
            fullWidth
            sx={{ maxWidth: 420 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
              htmlInput: { 'aria-label': 'Search reports' },
            }}
          />
        </Box>
        <Box sx={{ height: 4 }}>{isFetching && !isPending ? <LinearProgress /> : undefined}</Box>
        {renderContent()}
      </Paper>

      <ConfirmDialog
        open={Boolean(reportToDelete)}
        title="Delete report?"
        message={
          reportToDelete
            ? `The report for ${reportToDelete.site_name} and its shareable link will be permanently removed.`
            : ''
        }
        confirmLabel="Delete"
        loading={deleteReport.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setReportToDelete(null)}
      />
    </Stack>
  );
}

export default Reports;
