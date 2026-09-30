import { zodResolver } from '@hookform/resolvers/zod';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LanguageIcon from '@mui/icons-material/Language';
import { Alert, Box, Button, InputAdornment, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';

import { APP_CONFIG } from '@/config/app.config';
import { fadeInUp } from '@/styles/animations';
import { normalizeWebsiteUrl, reportFormSchema } from '@/utils/validators';

const HELPER_TEXT = `We read this page plus up to ${APP_CONFIG.MAX_PAGES_PER_REPORT - 1} linked pages on the same website.`;

function ReportForm({ onSubmit, isSubmitting = false, error }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(reportFormSchema), defaultValues: { url: '' } });

  const { ref: urlRef, ...urlField } = register('url');

  const submit = ({ url }) => onSubmit(normalizeWebsiteUrl(url));

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(submit)}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: 'flex-start' }}
      >
        <TextField
          {...urlField}
          inputRef={urlRef}
          fullWidth
          label="Website URL"
          placeholder="https://example.com"
          autoComplete="url"
          disabled={isSubmitting}
          error={Boolean(errors.url)}
          helperText={errors.url?.message ?? HELPER_TEXT}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LanguageIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          size="large"
          loading={isSubmitting}
          endIcon={<ArrowForwardIcon />}
          sx={{ minWidth: 190, height: 56, flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
        >
          Generate report
        </Button>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mt: 2, ...fadeInUp() }}>
          {error.message}
        </Alert>
      ) : undefined}
    </Box>
  );
}

export default ReportForm;
