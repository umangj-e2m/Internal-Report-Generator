import { isValidWebsiteUrl, normalizeWebsiteUrl, reportFormSchema } from '@/utils/validators';

describe('normalizeWebsiteUrl', () => {
  it('adds https:// to bare domains', () => {
    expect(normalizeWebsiteUrl('  example.com/about ')).toBe('https://example.com/about');
  });

  it('keeps an existing http or https protocol', () => {
    expect(normalizeWebsiteUrl('http://example.com')).toBe('http://example.com');
    expect(normalizeWebsiteUrl('HTTPS://example.com')).toBe('HTTPS://example.com');
  });
});

describe('isValidWebsiteUrl', () => {
  it.each(['example.com', 'https://docs.example.com/guide', 'http://www.example.co.in'])(
    'accepts %s',
    (value) => {
      expect(isValidWebsiteUrl(value)).toBe(true);
    },
  );

  it.each(['', 'not a url', 'localhost', 'ftp://example.com'])('rejects "%s"', (value) => {
    expect(isValidWebsiteUrl(value)).toBe(false);
  });
});

describe('reportFormSchema', () => {
  it('returns a friendly message for an empty URL', () => {
    const result = reportFormSchema.safeParse({ url: '   ' });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe('Enter a website URL');
  });
});
