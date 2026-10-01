import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import { Box, Drawer } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { APP_CONFIG } from '@/config/app.config';
import { ROUTES } from '@/config/routes.config';

import { drawerSx, paperSx } from './sidebarStyles';
import { SidebarContext, SidebarItem, SidebarSection } from './SidebarSection';

function SidebarContent({ collapsed = false, children }) {
  return (
    <SidebarContext.Provider value={{ collapsed, tooltipPlacement: 'right' }}>
      <Box component="nav" aria-label="Main navigation" sx={{ pb: 3 }}>
        <Box
          component={RouterLink}
          to={ROUTES.HOME}
          aria-label={`${APP_CONFIG.APP_NAME} home`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'var(--header-height)',
            borderBottom: 1,
            borderColor: 'divider',
            '& img': { transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)' },
            '&:hover img': { transform: 'scale(1.08)' },
          }}
        >
          <Box
            component="img"
            src={APP_CONFIG.LOGO_SRC}
            alt={`${APP_CONFIG.BRAND_NAME} logo`}
            sx={{
              width: collapsed ? 40 : 52,
              height: collapsed ? 40 : 52,
              transition: 'width 0.3s ease, height 0.3s ease',
            }}
          />
        </Box>

        <SidebarSection title="Reports">
          <SidebarItem
            icon={<AddCircleOutlineIcon fontSize="small" />}
            label="Generate"
            to={ROUTES.HOME}
            end
          />
          <SidebarItem
            icon={<HistoryOutlinedIcon fontSize="small" />}
            label="History"
            to={ROUTES.REPORTS}
          />
        </SidebarSection>

        {children}
      </Box>
    </SidebarContext.Provider>
  );
}

function Sidebar({ desktopOpen, mobileOpen, onClose, mobileExtras }) {
  const desktopWidth = desktopOpen ? 'var(--sidebar-width)' : 'var(--sidebar-mini-width)';

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': paperSx('borderRight'),
        }}
      >
        <SidebarContent>{mobileExtras}</SidebarContent>
      </Drawer>
      <Drawer variant="permanent" open sx={drawerSx(desktopWidth, 'borderRight')}>
        <SidebarContent collapsed={!desktopOpen} />
      </Drawer>
    </>
  );
}

export default Sidebar;
