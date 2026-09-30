import { Alert, AlertTitle, Button } from '@mui/material';

function ErrorState({ title = 'Could not load data', message, onRetry }) {
  return (
    <Alert
      severity="error"
      variant="outlined"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
}

export default ErrorState;
