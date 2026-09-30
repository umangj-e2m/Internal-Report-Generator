import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import MainLayout from '@/components/layout/MainLayout';
import { ROUTES } from '@/config/routes.config';

const Home = lazy(() => import('@/pages/Home'));
const Reports = lazy(() => import('@/pages/Reports'));
const ReportView = lazy(() => import('@/pages/ReportView'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.REPORTS} element={<Reports />} />
        <Route path={ROUTES.REPORT_VIEW} element={<ReportView />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
