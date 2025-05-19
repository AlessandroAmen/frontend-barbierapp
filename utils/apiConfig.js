import { Platform } from 'react-native';

// Funzione per ottenere l'URL dell'API in base alla piattaforma
export const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8001/api';
  } else if (Platform.OS === 'ios') {
    // Per iOS simulator
    return 'http://127.0.0.1:8001/api';
  } else if (Platform.OS === 'android') {
    // Per Android emulator, prova con l'IP diretto della macchina sulla rete locale
    // Questo è il metodo più affidabile per i dispositivi fisici e alcuni emulatori
    return 'http://192.168.1.45:8001/api';
    
    // Alternative per Android emulator:
    // return 'http://10.0.2.2:8001/api'; // Indirizzo standard per emulatore Android
    // return 'http://localhost:8001/api'; // Alcuni emulatori potrebbero usare localhost
  } else {
    // Fallback
    return 'http://127.0.0.1:8001/api';
  }
};

// Esporta l'URL dell'API come costante per un uso più semplice
export const API_URL = getApiUrl();

// Log dell'URL API per debug
console.log('Platform OS:', Platform.OS);
console.log('API URL configurato:', API_URL); 