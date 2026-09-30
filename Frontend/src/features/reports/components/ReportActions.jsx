import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LinkIcon from '@mui/icons-material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Button, IconButton, Stack, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { reportPath } from '@/config/routes.config';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

import { reportService } from '../services/reportService';

function ReportActions({ report, variant = 'full', onDelete }) {
  const copy = useCopyToClipboard();
  const pdfDownloadUrl = reportService.pdfUrl(report.slug, { download: true });
  const docxUrl = reportService.docxUrl(report.slug);
  const handleCopy = () => copy(report.share_url);

  if (variant === 'compact') {
    return (
      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
        <Tooltip title="View report">
          <IconButton component={RouterLink} to={reportPath(report.slug)} aria-label="View report">
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download PDF">
          <IconButton component="a" href={pdfDownloadUrl} aria-label="Download PDF">
            <PictureAsPdfOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download DOCX">
          <IconButton component="a" href={docxUrl} aria-label="Download DOCX">
            <DescriptionOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Copy shareable link">
          <IconButton onClick={handleCopy} aria-label="Copy shareable link">
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

  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={{ flexWrap: 'wrap', flexShrink: 0, alignItems: 'center' }}
    >
      <Button
        variant="contained"
        color="secondary"
        href={pdfDownloadUrl}
        startIcon={<PictureAsPdfOutlinedIcon />}
      >
        Download PDF
      </Button>
      <Button variant="outlined" href={docxUrl} startIcon={<DescriptionOutlinedIcon />}>
        Download DOCX
      </Button>
      <Button variant="outlined" onClick={handleCopy} startIcon={<LinkIcon />}>
        Copy link
      </Button>
      <Button
        href={reportService.htmlUrl(report.slug)}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<OpenInNewIcon />}
      >
        Open HTML
      </Button>
    </Stack>
  );
}

export default ReportActions;
