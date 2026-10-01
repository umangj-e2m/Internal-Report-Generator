import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Button } from '@mui/material';
import { useEffect } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';

import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import Loader from '@/components/common/Loader';
import { APP_CONFIG } from '@/config/app.config';
import { ROUTES } from '@/config/routes.config';
import ReportViewer from '@/features/reports/components/ReportViewer';
import { useReport } from '@/features/reports/hooks/useReport';

function ReportView() {
  const { slug } = useParams();
  const { data: report, isPending, isError, error, refetch } = useReport(slug);

  useEffect(() => {
    if (!report) return undefined;
    const previousTitle = document.title;
    document.title = `${report.site_name} · ${APP_CONFIG.APP_NAME}`;
    return () => {
      document.title = previousTitle;
    };
  }, [report]);

  if (isPending) return <Loader label="Loading report…" />;

  if (isError && error.status === 404) {
    return (
      <EmptyState
        icon={<SearchOffIcon />}
        title="Report not found"
        description="This link may be incorrect, or the report has been deleted."
        action={
          <Button component={RouterLink} to={ROUTES.HOME} variant="contained" color="secondary">
            Generate a new report
          </Button>
        }
      />
    );
  }

  if (isError) {
    return <ErrorState title="Could not load report" message={error.message} onRetry={refetch} />;
  }

  return <ReportViewer slug={report.slug} title={report.site_name} />;
}

export default ReportView;
