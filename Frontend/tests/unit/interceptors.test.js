import { ApiError, normalizeApiError } from '@/services/api/interceptors';

describe('normalizeApiError', () => {
  it('uses the backend detail message when it is a string', () => {
    const error = normalizeApiError({
      response: { status: 422, data: { detail: 'Could not read https://x.test.' } },
    });

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(422);
    expect(error.message).toBe('Could not read https://x.test.');
  });

  it('joins FastAPI validation error messages', () => {
    const error = normalizeApiError({
      response: { status: 422, data: { detail: [{ msg: 'Invalid URL' }, { msg: 'Too long' }] } },
    });

    expect(error.message).toBe('Invalid URL, Too long');
  });

  it('explains when the server cannot be reached', () => {
    expect(normalizeApiError({ code: 'ERR_NETWORK' }).message).toMatch(/Cannot reach the server/);
    expect(normalizeApiError({ code: 'ECONNABORTED' }).message).toMatch(/took too long/);
  });

  it('uses a generic message for unexpected server errors', () => {
    const error = normalizeApiError({ response: { status: 500, data: 'Internal Server Error' } });

    expect(error.status).toBe(500);
    expect(error.message).toMatch(/server ran into a problem/);
  });
});
