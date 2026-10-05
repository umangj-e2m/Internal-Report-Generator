export const sampleReport = {
  slug: 'acme-cloud-docs-demo01',
  site_name: 'Acme Cloud Docs',
  source_url: 'https://docs.acmecloud.example/',
  page_count: 5,
  created_at: '2026-09-30T06:00:00Z',
  share_url: 'http://localhost:3000/api/reports/acme-cloud-docs-demo01/html',
};

export const sampleReportDetail = {
  ...sampleReport,
  style: { palette: 'classic', font_family: 'segoe', font_size: 'medium' },
  pages: [],
};

export const sampleStyleOptions = {
  palettes: [
    { key: 'classic', label: 'Classic', primary: '1B2340', accent: 'F26B21' },
    { key: 'ocean', label: 'Ocean', primary: '0C3B5E', accent: '0E9F9A' },
    { key: 'berry', label: 'Berry', primary: '3D1E4F', accent: 'D9467A' },
    { key: 'forest', label: 'Forest', primary: '1F4D3A', accent: 'D99A1E' },
    { key: 'royal', label: 'Royal', primary: '1E3A8A', accent: 'F59E0B' },
    { key: 'charcoal', label: 'Charcoal', primary: '2D3142', accent: 'E63946' },
  ],
  fonts: [
    { key: 'segoe', label: 'Segoe UI', css_stack: "'Segoe UI', Arial, sans-serif" },
    { key: 'georgia', label: 'Georgia', css_stack: 'Georgia, serif' },
    { key: 'calibri', label: 'Calibri', css_stack: 'Calibri, sans-serif' },
    { key: 'arial', label: 'Arial', css_stack: 'Arial, sans-serif' },
    { key: 'cambria', label: 'Cambria', css_stack: 'Cambria, serif' },
    { key: 'trebuchet', label: 'Trebuchet MS', css_stack: "'Trebuchet MS', sans-serif" },
    { key: 'times', label: 'Times New Roman', css_stack: "'Times New Roman', serif" },
  ],
  sizes: [
    { key: 'small', label: 'Small' },
    { key: 'medium', label: 'Medium' },
    { key: 'large', label: 'Large' },
  ],
  defaults: { palette: 'classic', font_family: 'segoe', font_size: 'medium' },
};
