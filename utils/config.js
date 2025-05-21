// Application Configuration
// This file centralizes all configuration values to avoid inconsistencies

// Port configuration
export const SERVER_PORT = 8000;

// API configuration based on platform
import { Platform } from 'react-native';

export const getServerUrl = () => {
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine
    return `http://10.0.2.2:${SERVER_PORT}`;
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
export const DIRECT_API_URL = `${BASE_URL}/api.php`;

// Helper function to construct API paths for the direct API
export const getApiPath = (path) => {
  return `${DIRECT_API_URL}?path=${path}`;
};

// Endpoint APIs per le prenotazioni
export const API_ENDPOINTS = {
  AVAILABLE_SLOTS: 'available-slots',
  BOOK_APPOINTMENT: 'book-appointment',
  GET_APPOINTMENT_DETAILS: '/get-appointment-details.php',
  DELETE_APPOINTMENT: '/delete-appointment.php',
  MANAGER_BOOK_APPOINTMENT: '/manager-book-appointment.php'
};

// Log configuration for debugging
console.log('Platform:', Platform.OS);
console.log('Server URL:', BASE_URL);
console.log('API URL:', API_URL);
console.log('Direct API URL:', DIRECT_API_URL); 