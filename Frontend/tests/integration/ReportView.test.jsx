import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MainLayout from '@/components/layout/MainLayout';
import { ROUTES } from '@/config/routes.config';
import { reportService } from '@/features/reports/services/reportService';
import ReportView from '@/pages/ReportView';
import { ApiError } from '@/services/api/interceptors';

import { renderWithProviders } from '../utils/renderWithProviders';
import { sampleReportDetail, sampleStyleOptions } from '../utils/sampleReports';

vi.mock('@/features/reports/services/reportService', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    reportService: {
      ...actual.reportService,
      get: vi.fn(),
      getStyleOptions: vi.fn(),
      updateStyle: vi.fn(),
    },
  };
});

vi.mock('@/features/reports/components/PdfPreview', () => ({
  default: ({ file, title }) => <div role="document" aria-label={title} data-file={file} />,
}));

const DEFAULT_VERSION = 'v=e2m-mono-segoe-medium';

const renderView = (slug = 'acme-cloud-docs-demo01') =>
  renderWithProviders(<ReportView />, {
    route: `/r/${slug}`,
    path: ROUTES.REPORT_VIEW,
    layout: <MainLayout />,
  });

describe('Report view page (shareable link)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reportService.get.mockResolvedValue(sampleReportDetail);
    reportService.getStyleOptions.mockResolvedValue(sampleStyleOptions);
  });

  it('shows the download links and the HTML view by default', async () => {
    renderView();

    expect(await screen.findByRole('link', { name: /download pdf/i })).toHaveAttribute(
      'href',
      '/api/reports/acme-cloud-docs-demo01/pdf?download=true',
    );
    expect(screen.getByRole('link', { name: /download docx/i })).toHaveAttribute(
      'href',
      '/api/reports/acme-cloud-docs-demo01/docx',
    );
    expect(screen.getByRole('link', { name: /download ppt/i })).toHaveAttribute(
      'href',
      '/api/reports/acme-cloud-docs-demo01/pptx',
    );
    expect(screen.getByRole('link', { name: 'Generate' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute('href', '/reports');
    expect(screen.getByTitle('Acme Cloud Docs – HTML view')).toHaveAttribute(
      'src',
      `/api/reports/acme-cloud-docs-demo01/html?${DEFAULT_VERSION}`,
    );
  });

  it('copies the full HTML view link', async () => {
    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('button', { name: /copy link/i }));

    expect(await navigator.clipboard.readText()).toBe(sampleReportDetail.share_url);
    expect(await screen.findByText('HTML view link copied to clipboard')).toBeInTheDocument();
  });

  it('switches the viewer to the inline PDF', async () => {
    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('tab', { name: /pdf view/i }));

    expect(
      await screen.findByRole('document', { name: 'Acme Cloud Docs – PDF view' }),
    ).toHaveAttribute('data-file', `/api/reports/acme-cloud-docs-demo01/pdf?${DEFAULT_VERSION}`);
  });

  it('switches the viewer to the slides', async () => {
    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('tab', { name: /slides/i }));

    expect(screen.getByTitle('Acme Cloud Docs – Slides')).toHaveAttribute(
      'src',
      `/api/reports/acme-cloud-docs-demo01/slides?${DEFAULT_VERSION}`,
    );
  });

  it('lists the three companies with their logos and selects the report brand', async () => {
    renderView();

    const e2m = await screen.findByRole('button', { name: 'E2M Solutions branding' });
    expect(e2m).toHaveAttribute('aria-pressed', 'true');
    expect(e2m.querySelector('img')).toHaveAttribute('src', '/E2M_Logo-Black.png');
    const explore = within(screen.getByRole('button', { name: 'Explore Media branding' }));
    expect(explore.getByText('Emerald')).toBeInTheDocument();
    expect(explore.getByText('Trebuchet MS')).toBeInTheDocument();
    expect(explore.getByText('Medium')).toBeInTheDocument();
    expect(explore.getByTitle('#2EBD54')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explore Media branding' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Tridhya Tech branding' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.queryByRole('button', { name: /palette/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Font style' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Text size' })).not.toBeInTheDocument();
  });

  it('applies a company logo, palette, font and size in one click', async () => {
    const explore = sampleStyleOptions.brands[0].style;
    reportService.updateStyle.mockResolvedValue({ ...sampleReportDetail, style: explore });
    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('button', { name: 'Explore Media branding' }));

    expect(reportService.updateStyle).toHaveBeenCalledWith('acme-cloud-docs-demo01', explore);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Explore Media branding' })).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    );
    expect(screen.getByTitle('Acme Cloud Docs – HTML view')).toHaveAttribute(
      'src',
      '/api/reports/acme-cloud-docs-demo01/html?v=explore-emerald-trebuchet-medium',
    );
  });

  it('does not save again when the selected company is already applied', async () => {
    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('button', { name: 'E2M Solutions branding' }));

    expect(reportService.updateStyle).not.toHaveBeenCalled();
  });

  it('re-applies the company style to a report saved with other colours', async () => {
    const tridhya = sampleStyleOptions.brands[2].style;
    const oldStyle = { ...tridhya, palette: 'royal', font_family: 'times', font_size: 'large' };
    reportService.get.mockResolvedValue({ ...sampleReportDetail, style: oldStyle });
    reportService.updateStyle.mockResolvedValue({ ...sampleReportDetail, style: tridhya });
    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('button', { name: 'Tridhya Tech branding' }));

    expect(reportService.updateStyle).toHaveBeenCalledWith('acme-cloud-docs-demo01', tridhya);
  });

  it('shows a not-found message for an unknown slug', async () => {
    reportService.get.mockRejectedValue(new ApiError("Report 'nope' was not found.", 404));
    renderView('nope');

    expect(await screen.findByText('Report not found')).toBeInTheDocument();
  });
});
