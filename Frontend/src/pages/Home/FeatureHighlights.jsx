import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LinkIcon from '@mui/icons-material/Link';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined';
import { Box, Grid, Paper, Typography } from '@mui/material';

import { fadeInUp, hoverLift, STAGGER_MS } from '@/styles/animations';

const FEATURES = [
  {
    icon: <PictureAsPdfOutlinedIcon />,
    title: 'Print-ready PDF',
    text: 'A4 layout with your logo in a fixed header and page numbers in the footer.',
  },
  {
    icon: <DescriptionOutlinedIcon />,
    title: 'Editable DOCX',
    text: 'The same layout as a Word document, ready for edits and comments.',
  },
  {
    icon: <SlideshowOutlinedIcon />,
    title: 'PPT slides',
    text: 'A 16:9 slide deck with charts, to present in the app or download.',
  },
  {
    icon: <ArticleOutlinedIcon />,
    title: 'HTML view',
    text: 'Read the full report right in the browser on any device.',
  },
  {
    icon: <LinkIcon />,
    title: 'Shareable link',
    text: 'Every report gets its own URL you can send to anyone.',
  },
];

function FeatureHighlights() {
  return (
    <Grid container spacing={2} component="section" aria-label="Report formats">
      {FEATURES.map((feature, index) => (
        <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              height: '100%',
              ...fadeInUp(320 + index * STAGGER_MS),
              ...hoverLift,
              '&:hover .feature-icon': {
                bgcolor: 'secondary.main',
                color: 'common.white',
                transform: 'rotate(-6deg) scale(1.08)',
              },
            }}
          >
            <Box
              className="feature-icon"
              sx={{
                width: 44,
                height: 44,
                mb: 1.5,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                color: 'secondary.main',
                bgcolor: 'rgba(242, 107, 33, 0.10)',
                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {feature.icon}
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
              {feature.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {feature.text}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default FeatureHighlights;
