
// Application Configuration
// This file centralizes all configuration values to avoid inconsistencies

// Port configuration
export const SERVER_PORT = 8000;

// API configuration based on platform
import { Platform } from 'react-native';

export const getServerUrl = () => {
  if (Platform.OS === 'android') {
    // Check if we're running on a physical device or emulator
    const isEmulator = Platform.constants?.Brand === 'google' || 
                       Platform.constants?.isEmulator ||
                       Platform.constants?.manufacturer?.includes('Google');
                       
    if (isEmulator) {
      // Android emulator uses 10.0.2.2 to access host machine
      return `http://10.0.2.2:${SERVER_PORT}`;
    } else {
      // Physical Android device on same WiFi network
      return `http://192.168.1.70:${SERVER_PORT}`;
    }
  } else if (Platform.OS === 'ios') {
    // iOS can use localhost
    return `http://localhost:${SERVER_PORT}`;
  } else {
    // Web or other platforms
    return `http://localhost:${SERVER_PORT}`;
  }
};

// Export commonly used URLs
export const BASE_URL = getServerUrl();
export const API_URL = `${BASE_URL}/api`;

// Api endpoints supportano la route nuova
export const DIRECT_API_URL = `${BASE_URL}/api.php`;
export const ALTERNATIVE_API_URL = `${BASE_URL}/api-route`;

// Helper function to construct API paths for the direct API
export const getApiPath = (path) => {
  // Usa sempre api-route per tutte le piattaforme per uniformità
  return `${ALTERNATIVE_API_URL}?path=${path}`;
};

// Log configuration for debugging
console.log('Platform:', Platform.OS);
console.log('Server URL:', BASE_URL);
console.log('API URL:', API_URL);
console.log('Direct API URL:', DIRECT_API_URL); 