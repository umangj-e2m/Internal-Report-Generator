import { ENV } from '@/config/env.config';

const reportBase = (slug) => `/reports/${encodeURIComponent(slug)}`;

export const ENDPOINTS = {
  REPORTS: '/reports',
  REPORT: reportBase,
  REPORT_HTML: (slug) => `${reportBase(slug)}/html`,
  REPORT_PDF: (slug) => `${reportBase(slug)}/pdf`,
  REPORT_DOCX: (slug) => `${reportBase(slug)}/docx`,
};

/** Absolute-from-root URL for links and iframes that bypass axios. */
export const buildApiUrl = (path) => `${ENV.API_BASE_URL.replace(/\/$/, '')}${path}`;
