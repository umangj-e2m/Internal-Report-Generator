import { z } from 'zod';

const PROTOCOL_RE = /^https?:\/\//i;

/** Adds https:// when the user types a bare domain such as "example.com". */
export const normalizeWebsiteUrl = (value) => {
  const trimmed = value.trim();
  return PROTOCOL_RE.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const isValidWebsiteUrl = (value) => {
  try {
    const url = new URL(normalizeWebsiteUrl(value));
    return ['http:', 'https:'].includes(url.protocol) && url.hostname.includes('.');
  } catch {
    return false;
  }
};

export const reportFormSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'Enter a website URL')
    .refine(isValidWebsiteUrl, 'Enter a valid website URL, e.g. https://example.com'),
});
