import { createTheme } from '@mui/material/styles';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const theme = createTheme({
  palette: {
    primary: { main: '#1B2340' },
    secondary: { main: '#F26B21', contrastText: '#FFFFFF' },
    background: { default: '#F5F6FA', paper: '#FFFFFF' },
    text: { primary: '#1F2937', secondary: '#5B6275' },
    divider: '#E5E7EB',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          transition: `transform 0.2s ${EASE}, box-shadow 0.2s ${EASE}, background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease`,
          '&:hover': { transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' },
          '& .MuiButton-endIcon, & .MuiButton-startIcon': {
            transition: `transform 0.25s ${EASE}`,
          },
          '&:hover .MuiButton-endIcon': { transform: 'translateX(3px)' },
        },
        containedSecondary: {
          '&:hover': { boxShadow: '0 8px 20px rgba(242, 107, 33, 0.35)' },
        },
        containedPrimary: {
          '&:hover': { boxShadow: '0 8px 20px rgba(27, 35, 64, 0.25)' },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: `transform 0.2s ${EASE}, background-color 0.2s ease, color 0.2s ease`,
          '&:hover': { transform: 'scale(1.12)' },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        outlined: { borderColor: '#E5E7EB' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.25s ease',
          '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(242, 107, 33, 0.12)' },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { transition: 'background-color 0.2s ease' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: '#5B6275', backgroundColor: '#F7F8FB' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { transition: 'color 0.2s ease', minHeight: 56 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { transition: 'background-color 0.2s ease, transform 0.2s ease' },
      },
    },
  },
});

export default theme;
