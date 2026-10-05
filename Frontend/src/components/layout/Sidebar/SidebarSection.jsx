import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import { createContext, useContext } from 'react';
import { NavLink } from 'react-router-dom';

export const SidebarContext = createContext({
  collapsed: false,
  tooltipPlacement: 'right',
  onExpand: undefined,
});

export function SidebarSection({ title, children }) {
  const { collapsed } = useContext(SidebarContext);

  return (
    <Box component="section" aria-label={title} sx={{ px: 1.5, pt: collapsed ? 1.5 : 2 }}>
      {collapsed ? undefined : (
        <Typography
          component="h2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            minHeight: 24,
            px: 1.5,
            mb: 0.5,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'text.secondary',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Typography>
      )}
      <List disablePadding>{children}</List>
    </Box>
  );
}

export function SidebarItem({ icon, label, to, end, href, external, onClick }) {
  const { collapsed, tooltipPlacement } = useContext(SidebarContext);
  const linkProps = to
    ? { component: NavLink, to, end }
    : href
      ? {
          component: 'a',
          href,
          ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
        }
      : { onClick };

  return (
    <Tooltip title={collapsed ? label : ''} placement={tooltipPlacement}>
      <ListItemButton
        {...linkProps}
        aria-label={collapsed ? label : undefined}
        sx={{
          position: 'relative',
          mb: 0.25,
          px: 1.5,
          py: collapsed ? 1 : 0.75,
          borderRadius: 2,
          justifyContent: collapsed ? 'center' : 'flex-start',
          color: 'text.primary',
          '& .MuiListItemIcon-root': {
            minWidth: collapsed ? 0 : 32,
            color: 'text.secondary',
          },
          '&:hover': { bgcolor: 'rgba(27, 35, 64, 0.05)' },
          '&.active': {
            bgcolor: 'rgba(27, 35, 64, 0.08)',
            color: 'primary.main',
            fontWeight: 600,
            '& .MuiListItemIcon-root': { color: 'primary.main' },
          },
          '&.active::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 8,
            bottom: 8,
            width: 3,
            borderRadius: 2,
            bgcolor: 'primary.main',
          },
        }}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        {collapsed ? undefined : (
          <ListItemText
            primary={label}
            slotProps={{
              primary: { sx: { fontSize: 14, fontWeight: 'inherit', whiteSpace: 'nowrap' } },
            }}
          />
        )}
      </ListItemButton>
    </Tooltip>
  );
}
