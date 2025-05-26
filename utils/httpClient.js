import { API_URL } from './apiConfig';
import { APIError } from './errorHandling';

const DEFAULT_TIMEOUT = 20000; // 20 secondi per tener conto della latenza dell'emulatore
const LONG_TIMEOUT = 40000;    // 40 secondi per operazioni lunghe
const CONNECTION_TEST_TIMEOUT = 10000; // 10 secondi per il test di connessione

const retryFetch = async (url, options, controller, maxRetries = 2, delay = 2000) => {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} for ${url}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      return await fetch(url, options);
    } catch (error) {
      lastError = error;
      if (error.name === 'AbortError') {
        throw error; // Don't retry if the request was deliberately aborted
      }
      if (attempt === maxRetries) {
        console.log(`All retry attempts failed for ${url}`, error);
        throw error;
      }
    }
  }
}

export const fetchWithTimeout = async (endpoint, options = {}, timeout = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.log(`[Network] Request timeout after ${timeout}ms for ${endpoint}`);
  }, timeout);

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    console.log(`[Network] Starting request to ${url}`);
    const startTime = Date.now();
    
    const response = await retryFetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    }, controller);

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new APIError(
        data.message || `HTTP error! status: ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const api = {
  get: (endpoint, options = {}) => 
    fetchWithTimeout(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, data, options = {}) =>
    fetchWithTimeout(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    }, LONG_TIMEOUT),

  put: (endpoint, data, options = {}) =>
    fetchWithTimeout(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: (endpoint, options = {}) =>
    fetchWithTimeout(endpoint, { ...options, method: 'DELETE' }),

  // Metodo specifico per il test di connessione con timeout più breve
  testConnection: (endpoint = '/test-connection') =>
    fetchWithTimeout(endpoint, { method: 'GET' }, CONNECTION_TEST_TIMEOUT)
};
