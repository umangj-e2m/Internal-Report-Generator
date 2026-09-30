import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { Box, Button, LinearProgress, Paper, Stack, Tab, Tabs } from '@mui/material';
import { useState } from 'react';

import { reportService } from '../services/reportService';

const VIEWS = {
  html: { label: 'HTML view', icon: <ArticleOutlinedIcon />, src: reportService.htmlUrl },
  pdf: { label: 'PDF view', icon: <PictureAsPdfOutlinedIcon />, src: reportService.pdfUrl },
};

function ReportViewer({ slug, title }) {
  const [view, setView] = useState('html');
  const [isLoading, setIsLoading] = useState(true);
  const src = VIEWS[view].src(slug);

  const handleChange = (_, nextView) => {
    setView(nextView);
    setIsLoading(true);
  };

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Stack
        direction="row"
        sx={{
          px: { xs: 1, md: 2 },
          borderBottom: 1,
          borderColor: 'divider',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Tabs value={view} onChange={handleChange} aria-label="Report view">
          {Object.entries(VIEWS).map(([value, item]) => (
            <Tab
              key={value}
              value={value}
              label={item.label}
              icon={item.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
        <Button
          size="small"
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<OpenInNewIcon fontSize="small" />}
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          Open in new tab
        </Button>
      </Stack>

      <Box sx={{ height: 4 }}>{isLoading ? <LinearProgress color="secondary" /> : undefined}</Box>

      <Box
        component="iframe"
        key={view}
        src={src}
        title={`${title} – ${VIEWS[view].label}`}
        onLoad={() => setIsLoading(false)}
        sx={{
          display: 'block',
          width: '100%',
          height: { xs: '75vh', md: 'calc(100vh - 240px)' },
          minHeight: 560,
          border: 0,
          bgcolor: '#ECEFF4',
        }}
      />
    </Paper>
  );
}

export default ReportViewer;
