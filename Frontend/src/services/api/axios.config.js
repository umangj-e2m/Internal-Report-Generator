import axios from 'axios';

import { ENV } from '@/config/env.config';

import { attachInterceptors } from './interceptors';

// Generating a report reads up to 5 web pages, so allow a generous timeout.
const REQUEST_TIMEOUT_MS = 120_000;

const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

attachInterceptors(apiClient);

export default apiClient;
