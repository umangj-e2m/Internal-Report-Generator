import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LinkIcon from '@mui/icons-material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined';

import { SidebarItem, SidebarSection } from '@/components/layout/Sidebar';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

import { useReport } from '../hooks/useReport';
import { reportService } from '../services/reportService';

import ReportAppearanceSection from './ReportAppearanceSection';

function ReportSidebarSection({ slug }) {
  const { data: report } = useReport(slug);
  const copy = useCopyToClipboard();

  if (!report) return null;

  return (
    <>
      <ReportAppearanceSection report={report} />
      <SidebarSection title="Download">
        <SidebarItem
          icon={<PictureAsPdfOutlinedIcon fontSize="small" />}
          label="Download PDF"
          href={reportService.pdfUrl(report.slug, { download: true })}
        />
        <SidebarItem
          icon={<DescriptionOutlinedIcon fontSize="small" />}
          label="Download DOCX"
          href={reportService.docxUrl(report.slug)}
        />
        <SidebarItem
          icon={<SlideshowOutlinedIcon fontSize="small" />}
          label="Download PPT"
          href={reportService.pptxUrl(report.slug)}
        />
      </SidebarSection>
      <SidebarSection title="Share">
        <SidebarItem
          icon={<LinkIcon fontSize="small" />}
          label="Copy link"
          onClick={() => copy(report.share_url)}
        />
        <SidebarItem
          icon={<OpenInNewIcon fontSize="small" />}
          label="Open HTML"
          href={reportService.htmlUrl(report.slug)}
          external
        />
      </SidebarSection>
    </>
  );
}

export default ReportSidebarSection;
