import dayjs from 'dayjs';

export const formatDateTime = (value) =>
  value ? dayjs(value).format('DD MMM YYYY, hh:mm A') : '—';

export const displayHost = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;
