import HomeRepairServiceOutlinedIcon from '@mui/icons-material/HomeRepairServiceOutlined';
import { Box, Container, useMediaQuery } from '@mui/material';
import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation, useMatch } from 'react-router-dom';

import Loader from '@/components/common/Loader';
import { ROUTES } from '@/config/routes.config';
import ReportSidebarSection from '@/features/reports/components/ReportSidebarSection';
import { fadeInUp } from '@/styles/animations';

import Header from '../Header';
import Sidebar, { ActionsSidebar } from '../Sidebar';

function MainLayout() {
  const { pathname } = useLocation();
  const reportMatch = useMatch(ROUTES.REPORT_VIEW);
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'), { noSsr: true });
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(true);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleMenuClick = () => {
    if (isDesktop) setDesktopOpen((open) => !open);
    else setMobileOpen(true);
  };

  const reportActions = reportMatch ? (
    <ReportSidebarSection slug={reportMatch.params.slug} />
  ) : undefined;

  return (
    <Box sx={{ display: 'flex', flex: 1 }}>
      <Sidebar
        desktopOpen={desktopOpen}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        mobileExtras={reportActions}
      />
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Header
          sidebarOpen={isDesktop ? desktopOpen : mobileOpen}
          onMenuClick={handleMenuClick}
          actionsOpen={actionsOpen}
          onActionsToggle={reportActions ? () => setActionsOpen((open) => !open) : undefined}
        />
        <Box component="main" sx={{ flex: 1, py: { xs: 3, md: 4 }, overflowX: 'clip' }}>
          <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, lg: 4 } }}>
            <Suspense fallback={<Loader />}>
              <Box key={pathname} sx={fadeInUp()}>
                <Outlet />
              </Box>
            </Suspense>
          </Container>
        </Box>
      </Box>
      {reportActions ? (
        <ActionsSidebar
          open={actionsOpen}
          title="Report Tools"
          icon={<HomeRepairServiceOutlinedIcon fontSize="small" />}
        >
          {reportActions}
        </ActionsSidebar>
      ) : undefined}
    </Box>
  );
}

export default MainLayout;
