import React, { useState } from 'react';
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

// L'URL del tuo backend Laravel
const API_URL = 'http://localhost:8000/api';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validazione base
    if (!name || !email || !password) {
      Alert.alert('Errore', 'Per favore compila tutti i campi');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Errore', 'Le password non corrispondono');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Errore', 'La password deve essere di almeno 8 caratteri');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Tentativo di registrazione con:', { name, email });
      
      // Effettua la richiesta di registrazione al backend Laravel
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      console.log('Status risposta:', response.status);
      
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
        } else {
          throw new Error(data.message || 'Errore durante la registrazione');
        }
      }

      // Salva il token di autenticazione
      await AsyncStorage.setItem('userToken', data.access_token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));

      // Reimposta i campi
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Naviga alla schermata principale
      navigation.navigate('Home');
    } catch (error) {
      console.error('Errore registrazione:', error);
      Alert.alert('Errore di Registrazione', error.message || 'Si è verificato un errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Registrati</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={name}
            onChangeText={setName}
          />
          
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
          
          <TextInput
            style={styles.input}
            placeholder="Conferma Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Registrati</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.loginLink}
            onPress={navigateToLogin}
          >
            <Text style={styles.loginText}>
              Hai già un account? Accedi
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
  loginLink: {
    marginTop: 20,
  },
  loginText: {
    color: '#007bff',
    fontSize: 14,
  },
});

export default RegisterScreen;