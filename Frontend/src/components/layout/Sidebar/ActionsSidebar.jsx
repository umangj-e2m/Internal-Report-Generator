import { Box, Drawer, Typography } from '@mui/material';

import { drawerSx } from './sidebarStyles';
import { SidebarContext } from './SidebarSection';

function ActionsSidebar({ open, title, icon, children }) {
  const width = open ? 'var(--sidebar-width)' : 'var(--sidebar-mini-width)';

  return (
    <Drawer variant="permanent" anchor="right" open sx={drawerSx(width, 'borderLeft')}>
      <SidebarContext.Provider value={{ collapsed: !open, tooltipPlacement: 'left' }}>
        <Box component="aside" aria-label={title} sx={{ pb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              height: 'var(--header-height)',
              borderBottom: 1,
              borderColor: 'divider',
              color: 'primary.main',
              whiteSpace: 'nowrap',
              '& .MuiSvgIcon-root': { color: 'secondary.main' },
            }}
          >
            {icon}
            {open ? (
              <Typography component="h2" sx={{ fontSize: 16, fontWeight: 700 }}>
                {title}
              </Typography>
            ) : undefined}
          </Box>
          {children}
        </Box>
      </SidebarContext.Provider>
    </Drawer>
  );
}

export default ActionsSidebar;
