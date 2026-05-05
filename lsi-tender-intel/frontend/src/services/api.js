import axios from 'axios';
import supabase from './supabase';

const isProduction =
  typeof window !== 'undefined' &&
  !window.location.hostname.includes('localhost') &&
  !window.location.hostname.includes('127.0.0.1');

const PROD_API = 'https://spatiallity-tenderhub-api.hf.space/api/v1';
const DEV_API = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: isProduction
    ? PROD_API
    : (import.meta.env.VITE_API_BASE_URL || DEV_API).replace('localhost', '127.0.0.1'),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch {
    // Proceed without token (unauthenticated read-only endpoints will still work)
  }
  return config;
});

// Retry logic: retry once on 429 or server errors
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config._retryCount) config._retryCount = 0;

    const isRateLimit = error.response?.status === 429;
    const isServerError = error.response?.status >= 500;
    const isNetworkError = !error.response;

    const shouldRetry =
      (isRateLimit || isServerError || isNetworkError) &&
      config._retryCount < MAX_RETRIES;

    if (shouldRetry) {
      config._retryCount += 1;
      const delay = RETRY_DELAY_MS * Math.pow(2, config._retryCount - 1);
      await sleep(delay);
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
