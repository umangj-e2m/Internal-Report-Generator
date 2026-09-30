import { Box, Container } from '@mui/material';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import Loader from '@/components/common/Loader';

import Footer from '../Footer';
import Header from '../Header';

function MainLayout() {
  return (
    <>
      <Header />
      <Box component="main" sx={{ flex: 1, py: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

export default MainLayout;
