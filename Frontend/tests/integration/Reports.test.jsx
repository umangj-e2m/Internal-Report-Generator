import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { reportService } from '@/features/reports/services/reportService';
import Reports from '@/pages/Reports';

import { renderWithProviders } from '../utils/renderWithProviders';
import { sampleReport } from '../utils/sampleReports';

vi.mock('@/features/reports/services/reportService', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    reportService: {
      ...actual.reportService,
      list: vi.fn(),
      remove: vi.fn(),
    },
  };
});

describe('Reports page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists reports with download links pointing at the API', async () => {
    reportService.list.mockResolvedValue({
      items: [sampleReport],
      total: 1,
      page: 1,
      page_size: 10,
    });
    renderWithProviders(<Reports />);

    const row = (await screen.findByText('Acme Cloud Docs')).closest('tr');
    expect(within(row).getByText('5')).toBeInTheDocument();
    expect(within(row).getByLabelText('Download PDF')).toHaveAttribute(
      'href',
      '/api/reports/acme-cloud-docs-demo01/pdf?download=true',
    );
    expect(within(row).getByLabelText('Download DOCX')).toHaveAttribute(
      'href',
      '/api/reports/acme-cloud-docs-demo01/docx',
    );
  });

  it('shows an empty state when there are no reports', async () => {
    reportService.list.mockResolvedValue({ items: [], total: 0, page: 1, page_size: 10 });
    renderWithProviders(<Reports />);

    expect(await screen.findByText('No reports yet')).toBeInTheDocument();
  });

  it('deletes a report after confirmation', async () => {
    reportService.list.mockResolvedValue({
      items: [sampleReport],
      total: 1,
      page: 1,
      page_size: 10,
    });
    reportService.remove.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithProviders(<Reports />);

    await user.click(await screen.findByLabelText('Delete report'));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    expect(reportService.remove).toHaveBeenCalledWith('acme-cloud-docs-demo01', expect.anything());
    expect(await screen.findByText('Deleted report for Acme Cloud Docs')).toBeInTheDocument();
  });
});
