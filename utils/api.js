import { API_URL, BASE_URL } from './apiConfig';

const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

export const api = {
  get: async (endpoint, customHeaders = {}) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          ...defaultHeaders,
          ...customHeaders,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  post: async (endpoint, data, customHeaders = {}) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          ...defaultHeaders,
          ...customHeaders,
        },
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw {
      status: response.status,
      data: data,
      message: data.message || 'Si è verificato un errore'
    };
  }

  return data;
};

const handleError = (error) => {
  console.error('API Error:', error);
  throw error;
};
