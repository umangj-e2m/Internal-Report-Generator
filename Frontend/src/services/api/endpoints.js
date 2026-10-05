import { ENV } from '@/config/env.config';

const reportBase = (slug) => `/reports/${encodeURIComponent(slug)}`;

export const ENDPOINTS = {
  REPORTS: '/reports',
  STYLE_OPTIONS: '/reports/style-options',
  REPORT: reportBase,
  REPORT_STYLE: (slug) => `${reportBase(slug)}/style`,
  REPORT_HTML: (slug) => `${reportBase(slug)}/html`,
  REPORT_PDF: (slug) => `${reportBase(slug)}/pdf`,
  REPORT_DOCX: (slug) => `${reportBase(slug)}/docx`,
  REPORT_SLIDES: (slug) => `${reportBase(slug)}/slides`,
  REPORT_PPTX: (slug) => `${reportBase(slug)}/pptx`,
};

/** Absolute-from-root URL for links and iframes that bypass axios. */
export const buildApiUrl = (path) => `${ENV.API_BASE_URL.replace(/\/$/, '')}${path}`;
