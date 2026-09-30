import { Box, Button, Typography } from '@mui/material';
import { Component } from 'react';

// Error boundaries still require a class component in React.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  handleReload = () => {
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box sx={{ py: 12, px: 2, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Something went wrong
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          An unexpected error occurred while displaying this page.
        </Typography>
        <Button variant="contained" onClick={this.handleReload}>
          Back to home
        </Button>
      </Box>
    );
  }
}

export default ErrorBoundary;
