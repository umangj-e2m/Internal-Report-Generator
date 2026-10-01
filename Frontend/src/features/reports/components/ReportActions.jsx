import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LinkIcon from '@mui/icons-material/Link';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { IconButton, Stack, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { reportPath } from '@/config/routes.config';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

import { reportService } from '../services/reportService';

const hoverTint = (color, background) => ({
  '&:hover': { color, bgcolor: background },
});

function ReportActions({ report, align = 'flex-end', onDelete }) {
  const copy = useCopyToClipboard();

  return (
    <Stack direction="row" spacing={0.5} sx={{ justifyContent: align }}>
      <Tooltip title="View report">
        <IconButton
          component={RouterLink}
          to={reportPath(report.slug)}
          aria-label="View report"
          sx={hoverTint('primary.main', 'rgba(27, 35, 64, 0.08)')}
        >
          <VisibilityOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Download PDF">
        <IconButton
          component="a"
          href={reportService.pdfUrl(report.slug, { download: true })}
          aria-label="Download PDF"
          sx={hoverTint('#D93025', 'rgba(217, 48, 37, 0.08)')}
        >
          <PictureAsPdfOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Download DOCX">
        <IconButton
          component="a"
          href={reportService.docxUrl(report.slug)}
          aria-label="Download DOCX"
          sx={hoverTint('#1A5DC8', 'rgba(26, 93, 200, 0.08)')}
        >
          <DescriptionOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Download PPT">
        <IconButton
          component="a"
          href={reportService.pptxUrl(report.slug)}
          aria-label="Download PPT"
          sx={hoverTint('#C43E1C', 'rgba(196, 62, 28, 0.08)')}
        >
          <SlideshowOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Copy shareable link">
        <IconButton
          onClick={() => copy(report.share_url)}
          aria-label="Copy shareable link"
          sx={hoverTint('secondary.main', 'rgba(242, 107, 33, 0.10)')}
        >
          <LinkIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {onDelete ? (
        <Tooltip title="Delete report">
          <IconButton onClick={() => onDelete(report)} aria-label="Delete report" color="error">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : undefined}
    </Stack>
  );
}

export default ReportActions;
