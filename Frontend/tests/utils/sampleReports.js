export const sampleReport = {
  slug: 'acme-cloud-docs-demo01',
  site_name: 'Acme Cloud Docs',
  source_url: 'https://docs.acmecloud.example/',
  page_count: 5,
  created_at: '2026-09-30T06:00:00Z',
  share_url: 'http://localhost:3000/r/acme-cloud-docs-demo01',
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
  ],
  fonts: [
    { key: 'segoe', label: 'Segoe UI', css_stack: "'Segoe UI', Arial, sans-serif" },
    { key: 'georgia', label: 'Georgia', css_stack: 'Georgia, serif' },
    { key: 'calibri', label: 'Calibri', css_stack: 'Calibri, sans-serif' },
  ],
  sizes: [
    { key: 'small', label: 'Small' },
    { key: 'medium', label: 'Medium' },
    { key: 'large', label: 'Large' },
  ],
};
