import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/apiConfig';
import { handleAPIError } from '../utils/errorHandling';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const maxRetries = 2;
  const timeoutDuration = Platform.OS === 'android' ? 20000 : 10000; // 20s for Android, 10s for others

  // Test della connessione API all'avvio
  useEffect(() => {
    const timer = setTimeout(() => {
      testApiConnection();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Funzione per testare la connessione API
  const testApiConnection = async () => {
    let controller;
    try {
      setConnectionStatus('Verifica connessione...');
      
      const url = `${API_URL}/test-connection`;
      console.log('Test connessione a:', url);
      
      // Impostiamo un timeout più lungo per l'emulatore Android e aggiungiamo debug
      controller = new AbortController();
      console.log('Inizializing connection test with timeout:', Platform.OS === 'android' ? 60000 : 8000, 'ms');
      const timeoutId = setTimeout(() => {
        console.log('Connection timeout reached, aborting...');
        controller.abort();
      }, Platform.OS === 'android' ? 60000 : 8000);
      
      const startTime = Date.now();
      console.log('Attempting fetch with timeout:', Platform.OS === 'android' ? 60000 : 8000, 'ms');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Connection': 'keep-alive'
        },
        signal: controller.signal,
        mode: 'cors'
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log('Test connessione status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Test connessione risposta:', data);
        setConnectionStatus(`Connessione OK (${responseTime}ms)`);
      } else {
        if (retryCount < maxRetries) {
          console.log(`Ritentativo connessione ${retryCount + 1}/${maxRetries}`);
          setRetryCount(prev => prev + 1);
          await new Promise(resolve => setTimeout(resolve, 2000));
          throw new Error('Riprovo connessione...');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Test connessione errore:', error);
      console.log('Network error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        platform: Platform.OS
      });
      const errorMessage = error.name === 'AbortError' 
        ? 'Timeout della connessione dopo 30s. Assicurati che il server Laravel sia in esecuzione su http://10.0.2.2:8000'
        : `Errore connessione: ${error.message}`;
      setConnectionStatus(`Errore: ${errorMessage}`);
    } finally {
      if (controller) {
        controller.abort(); // Puliamo il controller in caso di errore
      }
    }
  };

  const handleLogin = async () => {
    // Validazione base
    if (!email || !password) {
      Alert.alert('Errore', 'Per favore inserisci email e password');
      return;
    }

    const controller = new AbortController();
    let timeoutId;

    try {
      setLoading(true);
      console.log('Tentativo di login con:', { email });
      
      // Reset del conteggio tentativi per nuova sessione di login
      setRetryCount(0);
      
      // Effettua la richiesta di login al backend Laravel
      timeoutId = setTimeout(() => {
        controller.abort();
        console.log('Login request aborted due to timeout');
      }, Platform.OS === 'android' ? 60000 : 15000); // 60s per Android, 15s per altri

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log('Status risposta:', response.status);
      
      if (response.status === 500) {
        throw new Error('Errore del server. Controlla la connessione al backend.');
      }

      const data = await response.json();
      console.log('Risposta ricevuta:', data);

      if (!response.ok) {
        if (response.status === 422) {
          // Errore di validazione
          let errorMessage = 'Errori di validazione:';
          if (data.errors) {
            Object.keys(data.errors).forEach(key => {
              errorMessage += `\n- ${data.errors[key].join(', ')}`;
            });
          } else if (data.message) {
            errorMessage = data.message;
          }
          throw new Error(errorMessage);
        } else if (response.status === 401) {
          throw new Error('Credenziali non valide. Controlla email e password.');
        } else {
          throw new Error(data.message || 'Errore durante il login');
        }
      }

      // Salva il token di autenticazione
      await AsyncStorage.setItem('userToken', data.access_token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      // Salva l'email dell'utente per il ProfileButton
      await AsyncStorage.setItem('userEmail', email);
      
      // Salva anche il ruolo utente per uso futuro
      await AsyncStorage.setItem('userRole', data.user.role || 'customer');

      // Reimposta i campi
      setEmail('');
      setPassword('');
      
      // Naviga alla schermata appropriata in base al ruolo dell'utente
      navigateBasedOnRole(data.user);
    } catch (error) {
      console.error('Errore login:', error);
      
      if (error.name === 'AbortError') {
        Alert.alert(
          'Errore di Connessione',
          'La richiesta sta impiegando troppo tempo. Verifica la tua connessione e riprova.',
          [
            {
              text: 'Riprova',
              onPress: () => {
                if (retryCount < maxRetries) {
                  setRetryCount(prev => prev + 1);
                  handleLogin();
                } else {
                  Alert.alert('Errore', 'Numero massimo di tentativi raggiunto. Riprova più tardi.');
                }
              }
            },
            { text: 'Annulla', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Errore di Login', handleAPIError(error) || 'Si è verificato un errore durante il login');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  // Funzione per navigare in base al ruolo dell'utente
  const navigateBasedOnRole = (user) => {
    switch (user.role) {
      case 'admin':
        // Amministratore: va alla dashboard di amministrazione
        navigation.navigate('AdminDashboard');
        break;
      case 'manager':
        // Gestore: va direttamente alla sua barberia
        if (user.barber_shop) {
          navigation.navigate('ManagerDashboard', { barberShop: user.barber_shop, barbers: user.barbers });
        } else {
          Alert.alert('Errore', 'Nessuna barberia associata al tuo account');
          navigation.navigate('BarberSelector'); // Fallback
        }
        break;
      case 'barber':
        // Barbiere: va direttamente alla sua agenda
        if (user.barber_shop) {
          navigation.navigate('BarberDashboard', { barberShop: user.barber_shop });
        } else {
          Alert.alert('Errore', 'Nessuna barberia associata al tuo account');
          navigation.navigate('BarberSelector'); // Fallback
        }
        break;
      case 'customer':
      default:
        // Cliente normale: va alla selezione barbiere come al solito
        navigation.navigate('BarberSelector');
        break;
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Accedi</Text>
          
          {connectionStatus ? (
            <Text style={connectionStatus.includes('Errore') ? styles.errorText : styles.successText}>
              {connectionStatus}
            </Text>
          ) : null}
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Accedi</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.registerLink}
            onPress={navigateToRegister}
          >
            <Text style={styles.registerText}>
              Non hai un account? Registrati
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={testApiConnection}
          >
            <Text style={styles.testButtonText}>
              Test Connessione
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 20,
  },
  registerText: {
    color: '#007bff',
    fontSize: 14,
  },
  testButton: {
    marginTop: 20,
    padding: 10,
  },
  testButtonText: {
    color: '#666',
    fontSize: 12,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  successText: {
    color: 'green',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default LoginScreen;