import { ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import NotificationProvider from '@/components/common/Notifications';
import theme from '@/styles/theme';

export function renderWithProviders(ui, { route = '/', path = '*', layout } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const page = <Route path={path} element={ui} />;

  return render(
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              {layout ? <Route element={layout}>{page}</Route> : page}
              {path === '/r/:slug' ? undefined : (
                <Route path="/r/:slug" element={<div>Report page for test</div>} />
              )}
            </Routes>
          </MemoryRouter>
        </NotificationProvider>
      </QueryClientProvider>
    </ThemeProvider>,
  );
}
