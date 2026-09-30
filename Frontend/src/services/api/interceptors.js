export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

export function normalizeApiError(error) {
  if (!error.response) {
    const message =
      error.code === 'ECONNABORTED'
        ? 'The request took too long. The website may be slow; please try again.'
        : 'Cannot reach the server. Make sure the backend is running.';
    return new ApiError(message, 0);
  }

  const { status, data } = error.response;
  const detail = data?.detail;

  if (typeof detail === 'string') return new ApiError(detail, status);
  if (Array.isArray(detail) && detail.length > 0) {
    return new ApiError(detail.map((item) => item.msg).join(', '), status);
  }
  if (status >= 500) {
    return new ApiError('The server ran into a problem. Please try again shortly.', status);
  }
  return new ApiError(DEFAULT_MESSAGE, status);
}

export function attachInterceptors(client) {
  client.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(normalizeApiError(error)),
  );
}
