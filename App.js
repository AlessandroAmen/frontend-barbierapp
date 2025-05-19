import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ExpoConstants from 'expo-constants';

// Importa gli schermi
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import BarberSelector from './screens/BarberSelector';
import BarberHome from './screens/BarberHome';
import BookAppointment from './screens/BookAppointment';
import ModifyAppointment from './screens/ModifyAppointment';
import Products from './screens/Products';
import Contacts from './screens/Contacts';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    // Verifica se l'utente è già autenticato
    const bootstrapAsync = async () => {
      let token = null;
      
      try {
        token = await AsyncStorage.getItem('userToken');
      } catch (e) {
        console.error('Errore nel recupero del token:', e);
      }
      
      setUserToken(token);
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={userToken ? 'BarberSelector' : 'Login'}
          screenOptions={{
            headerStyle: {
              backgroundColor: '#007bff',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ title: 'Accedi' }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ title: 'Registrati' }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ 
              title: 'Home',
              headerBackVisible: false,
            }}
          />
          <Stack.Screen 
            name="BarberSelector" 
            component={BarberSelector}
            options={{ 
              title: 'Scegli il Barbiere',
              headerBackVisible: userToken ? false : true,
            }}
          />
          <Stack.Screen 
            name="BarberHome" 
            component={BarberHome}
            options={({ route }) => ({ 
              title: route.params?.barber?.shop_name || 'Dettagli Barbiere',
              headerBackTitle: 'Indietro',
            })}
          />
          <Stack.Screen 
            name="BookAppointment" 
            component={BookAppointment} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ModifyAppointment" 
            component={ModifyAppointment} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Products" 
            component={Products} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Contacts" 
            component={Contacts} 
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App; 