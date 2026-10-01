import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MainLayout from '@/components/layout/MainLayout';
import { ROUTES } from '@/config/routes.config';
import { reportService } from '@/features/reports/services/reportService';
import ReportView from '@/pages/ReportView';
import { ApiError } from '@/services/api/interceptors';

import { renderWithProviders } from '../utils/renderWithProviders';
import { sampleReportDetail } from '../utils/sampleReports';

vi.mock('@/features/reports/services/reportService', async (importOriginal) => {
  const actual = await importOriginal();
  return { reportService: { ...actual.reportService, get: vi.fn() } };
});

const renderView = (slug = 'acme-cloud-docs-demo01') =>
  renderWithProviders(<ReportView />, {
    route: `/r/${slug}`,
    path: ROUTES.REPORT_VIEW,
    layout: <MainLayout />,
  });

describe('Report view page (shareable link)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the download links and the HTML view by default', async () => {
    reportService.get.mockResolvedValue(sampleReportDetail);
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
      '/api/reports/acme-cloud-docs-demo01/html',
    );
  });

  it('switches the viewer to the inline PDF', async () => {
    reportService.get.mockResolvedValue(sampleReportDetail);
    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('tab', { name: /pdf view/i }));

    expect(screen.getByTitle('Acme Cloud Docs – PDF view')).toHaveAttribute(
      'src',
      '/api/reports/acme-cloud-docs-demo01/pdf',
    );
  });

  it('switches the viewer to the slides', async () => {
    reportService.get.mockResolvedValue(sampleReportDetail);
    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('tab', { name: /slides/i }));

    expect(screen.getByTitle('Acme Cloud Docs – Slides')).toHaveAttribute(
      'src',
      '/api/reports/acme-cloud-docs-demo01/slides',
    );
  });

  it('shows a not-found message for an unknown slug', async () => {
    reportService.get.mockRejectedValue(new ApiError("Report 'nope' was not found.", 404));
    renderView('nope');

    expect(await screen.findByText('Report not found')).toBeInTheDocument();
  });
});
