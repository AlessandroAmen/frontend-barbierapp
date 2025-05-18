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
      
      <TouchableOpacity
        style={styles.appointmentButton}
        onPress={() => Alert.alert('Funzionalità', 'Prenotazione appuntamento da implementare')}
      >
        <Text style={styles.appointmentButtonText}>Prenota un appuntamento</Text>
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
  appointmentButton: {
    backgroundColor: '#007bff',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  appointmentButtonText: {
    color: 'white',
    fontSize: 18,
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

export default BarberHome; 