import apiClient from '@/services/api/axios.config';
import { buildApiUrl, ENDPOINTS } from '@/services/api/endpoints';

export const reportService = {
  create: async (url) => (await apiClient.post(ENDPOINTS.REPORTS, { url })).data,

  list: async ({ page, pageSize, search }) =>
    (
      await apiClient.get(ENDPOINTS.REPORTS, {
        params: { page, page_size: pageSize, search: search || undefined },
      })
    ).data,

  get: async (slug) => (await apiClient.get(ENDPOINTS.REPORT(slug))).data,

  remove: async (slug) => {
    await apiClient.delete(ENDPOINTS.REPORT(slug));
  },

  getStyleOptions: async () => (await apiClient.get(ENDPOINTS.STYLE_OPTIONS)).data,

  updateStyle: async (slug, style) =>
    (await apiClient.put(ENDPOINTS.REPORT_STYLE(slug), style)).data,

  htmlUrl: (slug) => buildApiUrl(ENDPOINTS.REPORT_HTML(slug)),
  pdfUrl: (slug, { download = false } = {}) =>
    `${buildApiUrl(ENDPOINTS.REPORT_PDF(slug))}${download ? '?download=true' : ''}`,

  docxUrl: (slug) => buildApiUrl(ENDPOINTS.REPORT_DOCX(slug)),

  slidesUrl: (slug) => buildApiUrl(ENDPOINTS.REPORT_SLIDES(slug)),

  pptxUrl: (slug) => buildApiUrl(ENDPOINTS.REPORT_PPTX(slug)),
};
