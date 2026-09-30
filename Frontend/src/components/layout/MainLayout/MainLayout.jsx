import { Box, Container } from '@mui/material';
import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Loader from '@/components/common/Loader';
import { fadeInUp } from '@/styles/animations';

import Footer from '../Footer';
import Header from '../Header';

function MainLayout() {
  const { pathname } = useLocation();

  return (
    <>
      <Header />
      <Box component="main" sx={{ flex: 1, py: { xs: 3, md: 5 }, overflowX: 'clip' }}>
        <Container maxWidth="lg">
          <Suspense fallback={<Loader />}>
            <Box key={pathname} sx={fadeInUp()}>
              <Outlet />
            </Box>
          </Suspense>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

export default MainLayout;
