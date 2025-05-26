// Application Configuration
// This file centralizes all configuration values to avoid inconsistencies

// Port configuration
export const SERVER_PORT = 8080;  // Porta alternativa per compatibilità con emulatore Android

// Server IP per dispositivi sulla stessa rete WiFi
export const LOCAL_SERVER_IP = '192.168.1.45';  // IP locale del server

// API configuration based on platform
import { Platform } from 'react-native';

export const getServerUrl = () => {
  if (Platform.OS === 'android') {
    // Per dispositivi Android sulla stessa rete WiFi
    return `http://${LOCAL_SERVER_IP}:${SERVER_PORT}`;
  } else if (Platform.OS === 'ios') {
    if (__DEV__ && !Platform.isTVOS) {
      // Per il simulatore iOS, usa localhost
      return `http://localhost:${SERVER_PORT}`;
    } 
    // Per dispositivi iOS fisici sulla stessa rete WiFi
    return `http://${LOCAL_SERVER_IP}:${SERVER_PORT}`;
  } else {
    // Web o altre piattaforme
    return `http://localhost:${SERVER_PORT}`;
  }
};

// Export commonly used URLs
export const BASE_URL = getServerUrl();
export const API_URL = `${BASE_URL}/api`;
export const DIRECT_API_URL = `${BASE_URL}/api.php`;

// Test connection URL
export const TEST_CONNECTION_URL = `${API_URL}/test-connection`;

// Helper function to construct API paths for the direct API
export const getApiPath = (path) => {
  return `${DIRECT_API_URL}?path=${path}`;
};

// Endpoint APIs per le prenotazioni
export const API_ENDPOINTS = {
  AVAILABLE_SLOTS: 'available-slots',
  BOOK_APPOINTMENT: '/book-appointment',
  GET_APPOINTMENT_DETAILS: '/get-appointment-details',
  DELETE_APPOINTMENT: '/delete-appointment.php',
  MANAGER_BOOK_APPOINTMENT: '/manager-book-appointment.php'
};

// Helper per chiamare le nuove API RESTful Laravel
export const getLaravelApiPath = (path) => `${API_URL}${path}`;

// Log configuration for debugging
console.log('Platform:', Platform.OS);
console.log('Server URL:', BASE_URL);
console.log('API URL:', API_URL);
console.log('Direct API URL:', DIRECT_API_URL); 