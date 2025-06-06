import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const BarberHome = ({ route, navigation }) => {
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getBarberData = async () => {
      try {
        // Prima controlla se abbiamo i dati del barbiere dalla navigazione
        if (route.params?.barber) {
          setBarber(route.params.barber);
          setLoading(false);
          return;
        }
        
        // Altrimenti, carica i dati dal localStorage
        const storedBarber = await AsyncStorage.getItem('selectedBarber');
        if (storedBarber) {
          setBarber(JSON.parse(storedBarber));
        } else {
          // Se non ci sono dati, torna alla schermata di selezione
          Alert.alert(
            'Nessun barbiere selezionato',
            'Per favore seleziona un barbiere',
            [{ text: 'OK', onPress: () => navigation.navigate('BarberSelector') }]
          );
        }
      } catch (error) {
        console.error('Errore nel recupero dei dati del barbiere:', error);
      } finally {
        setLoading(false);
      }
    };

    getBarberData();
  }, [route.params, navigation]);

  const handleCall = () => {
    if (barber?.phone) {
      Linking.openURL(`tel:${barber.phone}`);
    }
  };

  const navigateToAppointment = () => {
    navigation.navigate('BookAppointment', { barber });
  };

  const navigateToModifyAppointment = () => {
    navigation.navigate('ModifyAppointment', { barber });
  };

  const navigateToProducts = () => {
    navigation.navigate('Products', { barber });
  };

  const navigateToContacts = () => {
    navigation.navigate('Contacts', { barber });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Caricamento...</Text>
      </View>
    );
  }

  if (!barber) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Nessun barbiere selezionato</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('BarberSelector')}
        >
          <Text style={styles.buttonText}>Seleziona un barbiere</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {barber.image_url ? (
          <Image
            source={{ uri: barber.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="person" size={80} color="#ccc" />
          </View>
        )}
        
        <View style={styles.barberInfo}>
          <Text style={styles.shopName}>{barber.shop_name}</Text>
          <Text style={styles.name}>Barbiere: {barber.name}</Text>
        </View>
      </View>
      
      {/* Menu circolare con 4 opzioni */}
      <View style={styles.menuContainer}>
        <View style={styles.menuRow}>
          <TouchableOpacity style={styles.menuItem} onPress={navigateToAppointment}>
            <View style={styles.menuCircle}>
              <Ionicons name="calendar" size={32} color="white" />
            </View>
            <Text style={styles.menuText}>Prenota</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={navigateToModifyAppointment}>
            <View style={styles.menuCircle}>
              <Ionicons name="create" size={32} color="white" />
            </View>
            <Text style={styles.menuText}>Modifica</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.menuRow}>
          <TouchableOpacity style={styles.menuItem} onPress={navigateToProducts}>
            <View style={styles.menuCircle}>
              <Ionicons name="cart" size={32} color="white" />
            </View>
            <Text style={styles.menuText}>Prodotti</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={navigateToContacts}>
            <View style={styles.menuCircle}>
              <Ionicons name="call" size={32} color="white" />
            </View>
            <Text style={styles.menuText}>Contatti</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Ionicons name="location" size={24} color="#007bff" style={styles.icon} />
          <Text style={styles.detailText}>{barber.address}</Text>
        </View>
        
        <TouchableOpacity style={styles.detailItem} onPress={handleCall}>
          <Ionicons name="call" size={24} color="#007bff" style={styles.icon} />
          <Text style={styles.detailText}>{barber.phone}</Text>
        </TouchableOpacity>
        
        {barber.email && (
          <View style={styles.detailItem}>
            <Ionicons name="mail" size={24} color="#007bff" style={styles.icon} />
            <Text style={styles.detailText}>{barber.email}</Text>
          </View>
        )}
        
        {barber.opening_time && barber.closing_time && (
          <View style={styles.detailItem}>
            <Ionicons name="time" size={24} color="#007bff" style={styles.icon} />
            <Text style={styles.detailText}>
              Orari: {barber.opening_time} - {barber.closing_time}
            </Text>
          </View>
        )}
      </View>
      
      {barber.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Descrizione</Text>
          <Text style={styles.descriptionText}>{barber.description}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 15,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  barberInfo: {
    alignItems: 'center',
  },
  shopName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  name: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  // Stili per il menu circolare
  menuContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  menuItem: {
    alignItems: 'center',
    width: '40%',
  },
  menuCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  menuText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  descriptionContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  descriptionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BarberHome; 