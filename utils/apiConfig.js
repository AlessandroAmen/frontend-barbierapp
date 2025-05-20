// ⚠️ DEPRECATED: Use config.js instead 
// This file is kept for backward compatibility only

import { API_URL as API_URL_FROM_CONFIG, 
         DIRECT_API_URL, 
         getApiPath as getApiPathFromConfig } from './config';

// Re-export with backward compatible names
export const API_URL = API_URL_FROM_CONFIG;
export const NEW_API_URL = DIRECT_API_URL;
export const getApiPath = getApiPathFromConfig;

// Log deprecation warning
console.warn('⚠️ apiConfig.js is deprecated. Import directly from config.js instead.'); 