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

const Contacts = ({ route, navigation }) => {
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

  const handleEmail = () => {
    if (barber?.email) {
      Linking.openURL(`mailto:${barber.email}`);
    }
  };

  const handleDirections = () => {
    if (barber?.address) {
      const address = encodeURIComponent(barber.address);
      Linking.openURL(`https://maps.google.com/?q=${address}`);
    }
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
      
      <View style={styles.contactsContainer}>
        <Text style={styles.sectionTitle}>Informazioni di contatto</Text>
        
        <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
          <View style={styles.contactIconContainer}>
            <Ionicons name="call" size={24} color="white" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Telefono</Text>
            <Text style={styles.contactValue}>{barber.phone}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
        
        {barber.email && (
          <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail" size={24} color="white" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{barber.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.contactItem} onPress={handleDirections}>
          <View style={styles.contactIconContainer}>
            <Ionicons name="location" size={24} color="white" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Indirizzo</Text>
            <Text style={styles.contactValue}>{barber.address}</Text>
            <Text style={styles.contactSubValue}>
              {barber.comune}, {barber.provincia}, {barber.regione}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
        
        {barber.opening_time && barber.closing_time && (
          <View style={styles.contactItem}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="time" size={24} color="white" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Orari di apertura</Text>
              <Text style={styles.contactValue}>
                {barber.opening_time} - {barber.closing_time}
              </Text>
            </View>
          </View>
        )}
      </View>
      
      {barber.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Chi siamo</Text>
          <Text style={styles.descriptionText}>{barber.description}</Text>
        </View>
      )}
      
      <View style={styles.mapContainer}>
        <Text style={styles.sectionTitle}>Dove siamo</Text>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={50} color="#ccc" />
          <Text style={styles.mapPlaceholderText}>Mappa non disponibile</Text>
          <Text style={styles.mapAddress}>{barber.address}</Text>
          <TouchableOpacity style={styles.directionsButton} onPress={handleDirections}>
            <Text style={styles.directionsButtonText}>Ottieni indicazioni</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Torna indietro</Text>
      </TouchableOpacity>
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
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  barberInfo: {
    alignItems: 'center',
  },
  shopName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  name: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  contactsContainer: {
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#999',
  },
  contactValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  contactSubValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
  },
  descriptionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  mapContainer: {
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
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    marginBottom: 10,
  },
  mapAddress: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  directionsButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  directionsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#007bff',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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

export default Contacts; 