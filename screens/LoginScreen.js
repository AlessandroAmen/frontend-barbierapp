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

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');

  // Test della connessione API all'avvio
  useEffect(() => {
    testApiConnection();
  }, []);

  // Funzione per testare la connessione API
  const testApiConnection = async () => {
    try {
      setConnectionStatus('Verifica connessione...');
      
      /* Commento la parte che genera l'errore 404
      // Prima prova la rotta API
      console.log('Test connessione API a:', `${API_URL}/android-test`);
      
      try {
        const response = await fetch(`${API_URL}/android-test`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Test connessione API status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Test connessione API risposta:', data);
          setConnectionStatus('Connessione API OK');
          return;
        } else {
          console.error('Test connessione API fallito:', response.status);
        }
      } catch (apiError) {
        console.error('Errore test API:', apiError);
      }
      */
      
      // Utilizza direttamente la rotta web che funziona
      const baseUrl = API_URL.replace('/api', '');
      console.log('Test connessione web a:', `${baseUrl}/test-connection`);
      
      const webResponse = await fetch(`${baseUrl}/test-connection`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Test connessione web status:', webResponse.status);
      
      if (webResponse.ok) {
        const webData = await webResponse.json();
        console.log('Test connessione web risposta:', webData);
        setConnectionStatus('Connessione OK');
      } else {
        console.error('Test connessione web fallito:', webResponse.status);
        setConnectionStatus(`Errore connessione: ${webResponse.status}`);
      }
    } catch (error) {
      console.error('Test connessione errore generale:', error);
      setConnectionStatus(`Errore connessione: ${error.message}`);
    }
  };

  const handleLogin = async () => {
    // Validazione base
    if (!email || !password) {
      Alert.alert('Errore', 'Per favore inserisci email e password');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Tentativo di login con:', { email });
      
      // Effettua la richiesta di login al backend Laravel
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
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

      // Reimposta i campi
      setEmail('');
      setPassword('');
      
      // Naviga alla schermata di selezione barbiere
      navigation.navigate('BarberSelector');
    } catch (error) {
      console.error('Errore login:', error);
      Alert.alert('Errore di Login', error.message || 'Si è verificato un errore durante il login');
    } finally {
      setLoading(false);
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