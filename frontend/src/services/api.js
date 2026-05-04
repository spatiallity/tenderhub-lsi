import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace('localhost', '127.0.0.1'),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry logic: retry once on 429 or server errors (keep it fast for HF Spaces)
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1000; // 1 second before retry

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

api.interceptors.response.use(
  response => response,
  async (error) => {
    const config = error.config;

    // Initialize retry count
    if (!config._retryCount) config._retryCount = 0;

    const isRateLimit = error.response?.status === 429;
    const isServerError = error.response?.status >= 500;
    const isNetworkError = !error.response;

    const shouldRetry = (isRateLimit || isServerError || isNetworkError) && config._retryCount < MAX_RETRIES;

    if (shouldRetry) {
      config._retryCount += 1;
      // Exponential backoff: 2s, 4s, 8s
      const delay = RETRY_DELAY_MS * Math.pow(2, config._retryCount - 1);
      console.warn(`API ${error.response?.status || 'network error'} — retrying (${config._retryCount}/${MAX_RETRIES}) in ${delay}ms...`);
      await sleep(delay);
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
