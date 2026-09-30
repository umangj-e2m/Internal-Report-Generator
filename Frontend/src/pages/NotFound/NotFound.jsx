import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import EmptyState from '@/components/common/EmptyState';
import { ROUTES } from '@/config/routes.config';

function NotFound() {
  return (
    <EmptyState
      icon={<TravelExploreIcon />}
      title="Page not found"
      description="The page you are looking for does not exist."
      action={
        <Button component={RouterLink} to={ROUTES.HOME} variant="contained">
          Back to home
        </Button>
      }
    />
  );
}

export default NotFound;
