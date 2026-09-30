export const ROUTES = {
  HOME: '/',
  REPORTS: '/reports',
  REPORT_VIEW: '/r/:slug',
};

export const reportPath = (slug) => `/r/${encodeURIComponent(slug)}`;
