import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/apiConfig';

const ManagerDashboard = ({ route, navigation }) => {
  const { barberShop, barbers = [] } = route.params || {};
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
    loadAppointments();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserData(userData);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei dati utente:', error);
    }
  };

  // Carica appuntamenti (simulati)
  const loadAppointments = () => {
    setLoading(true);
    
    // Simula una chiamata API
    setTimeout(() => {
      // Genera appuntamenti di esempio
      const today = new Date();
      const sampleAppointments = Array(10).fill().map((_, index) => {
        const appointmentDate = new Date(today);
        appointmentDate.setDate(today.getDate() + Math.floor(index / 2));
        appointmentDate.setHours(9 + (index % 8));
        appointmentDate.setMinutes((index % 4) * 15);
        
        return {
          id: `app-${index + 1}`,
          customer: `Cliente ${index + 1}`,
          date: appointmentDate.toISOString(),
          barber: barbers[index % barbers.length]?.name || `Barbiere ${(index % 2) + 1}`,
          service: index % 3 === 0 ? 'Taglio + Barba' : index % 3 === 1 ? 'Taglio' : 'Barba',
          status: index % 5 === 0 ? 'pending' : 'confirmed'
        };
      });
      
      setAppointments(sampleAppointments);
      setLoading(false);
    }, 1000);
  };

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // Esegui logout sul server
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Pulisci lo storage locale
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      // Naviga alla schermata di login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Errore durante il logout:', error);
      Alert.alert('Errore', 'Si è verificato un errore durante il logout');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderAppointmentItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.appointmentItem}
      onPress={() => Alert.alert('Dettagli appuntamento', `Cliente: ${item.customer}\nData: ${formatDate(item.date)}\nOra: ${formatTime(item.date)}\nBarbiere: ${item.barber}\nServizio: ${item.service}`)}
    >
      <View style={styles.appointmentLeftCol}>
        <Text style={styles.appointmentDate}>{formatDate(item.date)}</Text>
        <Text style={styles.appointmentTime}>{formatTime(item.date)}</Text>
      </View>
      <View style={styles.appointmentMidCol}>
        <Text style={styles.appointmentCustomer}>{item.customer}</Text>
        <Text style={styles.appointmentBarber}>Barbiere: {item.barber}</Text>
        <Text style={styles.appointmentService}>{item.service}</Text>
      </View>
      <View style={styles.appointmentRightCol}>
        <Text style={[
          styles.appointmentStatus,
          item.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending
        ]}>
          {item.status === 'confirmed' ? 'Confermato' : 'In attesa'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const navigateToBarberManagement = () => {
    // Naviga alla gestione barbieri
    Alert.alert('Funzionalità in arrivo', 'La gestione barbieri sarà disponibile a breve');
  };

  const navigateToSettings = () => {
    // Naviga alle impostazioni
    Alert.alert('Funzionalità in arrivo', 'Le impostazioni saranno disponibili a breve');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Benvenuto,</Text>
            <Text style={styles.shopName}>{barberShop?.shop_name || 'La tua barberia'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{appointments.length}</Text>
            <Text style={styles.statLabel}>Appuntamenti</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{barbers.length || 2}</Text>
            <Text style={styles.statLabel}>Barbieri</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{appointments.filter(a => a.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>In attesa</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Prossimi appuntamenti</Text>
          <TouchableOpacity onPress={loadAppointments}>
            <Ionicons name="refresh" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
        ) : (
          <View style={styles.appointmentList}>
            {appointments.length > 0 ? (
              <FlatList
                data={appointments}
                renderItem={renderAppointmentItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.noAppointmentsText}>Nessun appuntamento previsto</Text>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => {}}>
          <Ionicons name="calendar" size={24} color="#007bff" />
          <Text style={styles.navButtonText}>Agenda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={navigateToBarberManagement}>
          <Ionicons name="people" size={24} color="#007bff" />
          <Text style={styles.navButtonText}>Barbieri</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={navigateToSettings}>
          <Ionicons name="settings" size={24} color="#007bff" />
          <Text style={styles.navButtonText}>Impostazioni</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  shopName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  appointmentList: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  appointmentLeftCol: {
    width: 70,
  },
  appointmentMidCol: {
    flex: 1,
    paddingHorizontal: 10,
  },
  appointmentRightCol: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentDate: {
    fontSize: 12,
    color: '#666',
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  appointmentCustomer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  appointmentBarber: {
    fontSize: 14,
    color: '#666',
  },
  appointmentService: {
    fontSize: 14,
    color: '#666',
  },
  appointmentStatus: {
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  statusConfirmed: {
    backgroundColor: '#e6f7ee',
    color: '#2ecc71',
  },
  statusPending: {
    backgroundColor: '#fff5e6',
    color: '#f39c12',
  },
  noAppointmentsText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
  loader: {
    marginVertical: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  navButtonText: {
    fontSize: 12,
    marginTop: 5,
    color: '#007bff',
  },
});

export default ManagerDashboard; 