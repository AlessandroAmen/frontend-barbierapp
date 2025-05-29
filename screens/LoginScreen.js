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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  // Rimosso l'useEffect che chiamava testApiConnection all'avvio

  // Rimosso testApiConnection perché non è più usato nell'interfaccia utente
  // e la logica di login ha già un suo timeout e gestione errori.

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

      // Reset del conteggio tentativi per nuova sessione di login
      setRetryCount(0);

      // Effettua la richiesta di login al backend Laravel
      timeoutId = setTimeout(() => {
        controller.abort();
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

      if (response.status === 500) {
        throw new Error('Errore del server. Controlla la connessione al backend.');
      }

      const data = await response.json();

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

          {/* Rimosso il Text per connectionStatus */}

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

          {/* Rimosso il bottone "Test Connessione" */}
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
  // Rimosse le regole di stile per errorText e successText se non usate altrove
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