import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined';
import { Box, Button, CircularProgress, Paper, Stack, Tab, Tabs } from '@mui/material';
import { useState } from 'react';

import { fadeInUp } from '@/styles/animations';

import { reportService } from '../services/reportService';

const VIEWS = {
  html: { label: 'HTML view', icon: <ArticleOutlinedIcon />, src: reportService.htmlUrl },
  pdf: { label: 'PDF view', icon: <PictureAsPdfOutlinedIcon />, src: reportService.pdfUrl },
  slides: { label: 'Slides', icon: <SlideshowOutlinedIcon />, src: reportService.slidesUrl },
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
    <Paper variant="outlined" sx={{ overflow: 'hidden', ...fadeInUp(120) }}>
      <Stack
        direction="row"
        sx={{
          px: { xs: 0.5, md: 2 },
          borderBottom: 1,
          borderColor: 'divider',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Tabs
          value={view}
          onChange={handleChange}
          aria-label="Report view"
          textColor="secondary"
          indicatorColor="secondary"
          variant="scrollable"
          scrollButtons={false}
        >
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

      <Box
        sx={{
          position: 'relative',
          height: { xs: '70vh', md: 'calc(100vh - var(--header-height) - 120px)' },
          minHeight: { xs: 480, md: 560 },
          bgcolor: '#ECEFF4',
        }}
      >
        {isLoading ? (
          <Box
            role="status"
            aria-label="Loading preview"
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              ...fadeInUp(),
            }}
          >
            <CircularProgress color="secondary" />
          </Box>
        ) : undefined}
        <Box
          component="iframe"
          key={view}
          src={src}
          title={`${title} – ${VIEWS[view].label}`}
          onLoad={() => setIsLoading(false)}
          sx={{
            display: 'block',
            width: '100%',
            height: '100%',
            border: 0,
            opacity: isLoading ? 0 : 1,
            transform: isLoading ? 'translateY(8px)' : 'none',
            transition: 'opacity 0.45s ease, transform 0.45s ease',
          }}
        />
      </Box>
    </Paper>
  );
}

export default ReportViewer;
