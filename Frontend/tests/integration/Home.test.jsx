import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { reportService } from '@/features/reports/services/reportService';
import Home from '@/pages/Home';
import { ApiError } from '@/services/api/interceptors';

import { renderWithProviders } from '../utils/renderWithProviders';
import { sampleReportDetail } from '../utils/sampleReports';

vi.mock('@/features/reports/services/reportService', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    reportService: {
      ...actual.reportService,
      create: vi.fn(),
      list: vi.fn(),
    },
  };
});

describe('Home page – generate report', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reportService.list.mockResolvedValue({ items: [], total: 0, page: 1, page_size: 3 });
  });

  it('shows a validation message and does not call the API for an invalid URL', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Home />);

    await user.type(screen.getByLabelText(/website url/i), 'not a url');
    await user.click(screen.getByRole('button', { name: /generate report/i }));

    expect(await screen.findByText(/enter a valid website url/i)).toBeInTheDocument();
    expect(reportService.create).not.toHaveBeenCalled();
  });

  it('adds https:// to a bare domain and opens the new report', async () => {
    reportService.create.mockResolvedValue(sampleReportDetail);
    const user = userEvent.setup();
    renderWithProviders(<Home />);

    await user.type(screen.getByLabelText(/website url/i), 'docs.acmecloud.example');
    await user.click(screen.getByRole('button', { name: /generate report/i }));

    await waitFor(() =>
      expect(reportService.create).toHaveBeenCalledWith(
        'https://docs.acmecloud.example',
        expect.anything(),
      ),
    );
    expect(await screen.findByText('Report page for test')).toBeInTheDocument();
  });

  it('shows the backend error when the website cannot be read', async () => {
    reportService.create.mockRejectedValue(
      new ApiError('Could not read https://down.example.', 422),
    );
    const user = userEvent.setup();
    renderWithProviders(<Home />);

    await user.type(screen.getByLabelText(/website url/i), 'https://down.example');
    await user.click(screen.getByRole('button', { name: /generate report/i }));

    expect(await screen.findByText('Could not read https://down.example.')).toBeInTheDocument();
  });
});
