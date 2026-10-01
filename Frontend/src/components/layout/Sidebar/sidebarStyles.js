export const paperSx = (border) => ({
  width: 'var(--sidebar-width)',
  boxSizing: 'border-box',
  [border]: 1,
  borderColor: 'divider',
  bgcolor: 'background.paper',
});

export const widthTransition = (theme) =>
  theme.transitions.create('width', {
    duration: theme.transitions.duration.standard,
    easing: theme.transitions.easing.easeInOut,
  });

export const drawerSx = (width, border) => ({
  display: { xs: 'none', md: 'block' },
  width,
  flexShrink: 0,
  transition: widthTransition,
  '& .MuiDrawer-paper': {
    ...paperSx(border),
    width,
    overflowX: 'hidden',
    transition: widthTransition,
  },
});
