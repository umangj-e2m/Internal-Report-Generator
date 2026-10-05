import { screen, waitFor } from '@testing-library/react';
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

const DEFAULT_VERSION = 'v=classic-segoe-medium';

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

  it('shows every palette, font and size with the current style selected', async () => {
    renderView();

    expect(await screen.findByRole('button', { name: 'Classic palette' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    for (const palette of sampleStyleOptions.palettes.slice(1)) {
      expect(screen.getByRole('button', { name: `${palette.label} palette` })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    }
    expect(screen.getByRole('combobox', { name: 'Font style' })).toHaveTextContent('Segoe UI');
    expect(screen.getByRole('button', { name: 'Medium' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('saves a new style and reloads the preview with it', async () => {
    const nextStyle = { palette: 'ocean', font_family: 'segoe', font_size: 'medium' };
    reportService.updateStyle.mockResolvedValue({ ...sampleReportDetail, style: nextStyle });
    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('button', { name: 'Ocean palette' }));

    expect(reportService.updateStyle).toHaveBeenCalledWith('acme-cloud-docs-demo01', nextStyle);
    expect(await screen.findByTitle('Acme Cloud Docs – HTML view')).toHaveAttribute(
      'src',
      '/api/reports/acme-cloud-docs-demo01/html?v=ocean-segoe-medium',
    );
    expect(screen.getByRole('button', { name: 'Ocean palette' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('lists every font in the dropdown and saves the chosen one', async () => {
    const nextStyle = { palette: 'classic', font_family: 'times', font_size: 'medium' };
    reportService.updateStyle.mockResolvedValue({ ...sampleReportDetail, style: nextStyle });
    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('combobox', { name: 'Font style' }));
    const options = screen.getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(
      sampleStyleOptions.fonts.map((font) => `Aa${font.label}`),
    );
    await user.click(screen.getByRole('option', { name: /times new roman/i }));

    expect(reportService.updateStyle).toHaveBeenCalledWith('acme-cloud-docs-demo01', nextStyle);
    expect(await screen.findByRole('combobox', { name: 'Font style' })).toHaveTextContent(
      'Times New Roman',
    );
  });

  it('disables reset while the report already uses the default style', async () => {
    renderView();

    expect(await screen.findByRole('button', { name: /reset to default/i })).toBeDisabled();
  });

  it('resets a custom style to the default', async () => {
    const customStyle = { palette: 'royal', font_family: 'times', font_size: 'large' };
    reportService.get.mockResolvedValue({ ...sampleReportDetail, style: customStyle });
    reportService.updateStyle.mockResolvedValue(sampleReportDetail);
    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('button', { name: /reset to default/i }));

    expect(reportService.updateStyle).toHaveBeenCalledWith(
      'acme-cloud-docs-demo01',
      sampleStyleOptions.defaults,
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /reset to default/i })).toBeDisabled(),
    );
  });

  it('changes the text size', async () => {
    const nextStyle = { palette: 'classic', font_family: 'segoe', font_size: 'large' };
    reportService.updateStyle.mockResolvedValue({ ...sampleReportDetail, style: nextStyle });
    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('button', { name: 'Large' }));

    expect(reportService.updateStyle).toHaveBeenCalledWith('acme-cloud-docs-demo01', nextStyle);
  });

  it('shows a not-found message for an unknown slug', async () => {
    reportService.get.mockRejectedValue(new ApiError("Report 'nope' was not found.", 404));
    renderView('nope');

    expect(await screen.findByText('Report not found')).toBeInTheDocument();
  });
});
