import { screen } from '@testing-library/react';
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

  it('switches the viewer to the inline PDF', async () => {
    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('tab', { name: /pdf view/i }));

    expect(screen.getByTitle('Acme Cloud Docs – PDF view')).toHaveAttribute(
      'src',
      `/api/reports/acme-cloud-docs-demo01/pdf?${DEFAULT_VERSION}`,
    );
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

  it('shows the current style with three palettes, fonts and sizes', async () => {
    renderView();

    expect(await screen.findByRole('button', { name: 'Classic palette' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Ocean palette' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Berry palette' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /segoe ui/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /georgia/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calibri/i })).toBeInTheDocument();
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
