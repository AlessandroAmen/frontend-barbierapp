import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/apiConfig';

const BarberDashboard = ({ route, navigation }) => {
  const { barberShop } = route.params || {};
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadUserData();
    loadAppointments();
  }, [selectedDate]);

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
      // Genera appuntamenti di esempio per il barbiere corrente
      const sampleAppointments = Array(5).fill().map((_, index) => {
        const appointmentDate = new Date(selectedDate);
        appointmentDate.setHours(9 + index * 2);
        appointmentDate.setMinutes((index % 4) * 15);
        
        return {
          id: `app-${index + 1}`,
          customer: `Cliente ${index + 1}`,
          date: appointmentDate.toISOString(),
          service: index % 3 === 0 ? 'Taglio + Barba' : index % 3 === 1 ? 'Taglio' : 'Barba',
          status: index % 5 === 0 ? 'pending' : 'confirmed',
          duration: index % 3 === 0 ? 45 : 30, // minuti
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
      await fetch(`${API_URL}/logout`, {
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

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    // In a real app, this would send an API request to update availability
    Alert.alert(
      'Stato aggiornato',
      `Sei ora ${!isAvailable ? 'disponibile' : 'non disponibile'} per nuovi appuntamenti`
    );
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
      onPress={() => Alert.alert(
        'Dettagli appuntamento',
        `Cliente: ${item.customer}\nData: ${formatDate(item.date)}\nOra: ${formatTime(item.date)}\nServizio: ${item.service}\nDurata: ${item.duration} min`
      )}
    >
      <View style={styles.appointmentTime}>
        <Text style={styles.timeText}>{formatTime(item.date)}</Text>
        <Text style={styles.durationText}>{item.duration} min</Text>
      </View>
      <View style={styles.appointmentDetails}>
        <Text style={styles.customerName}>{item.customer}</Text>
        <Text style={styles.serviceText}>{item.service}</Text>
      </View>
      <View style={styles.appointmentStatus}>
        <Text style={[
          styles.statusText,
          item.status === 'confirmed' ? styles.confirmedStatus : styles.pendingStatus
        ]}>
          {item.status === 'confirmed' ? 'Confermato' : 'In attesa'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Genera giorni per selettore date
  const generateDays = () => {
    const days = [];
    for (let i = -3; i < 10; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const isDateSelected = (date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const getDayName = (date) => {
    const days = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];
    return days[date.getDay()];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Benvenuto,</Text>
            <Text style={styles.barberName}>{userData?.name || 'Barbiere'}</Text>
            <Text style={styles.shopName}>{barberShop?.shop_name || 'Barberia'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.availabilityContainer}>
          <Text style={styles.availabilityText}>
            {isAvailable ? 'Disponibile' : 'Non disponibile'}
          </Text>
          <Switch
            value={isAvailable}
            onValueChange={toggleAvailability}
            trackColor={{ false: '#ccc', true: '#b3d9ff' }}
            thumbColor={isAvailable ? '#007bff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.dateSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {generateDays().map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateItem,
                isDateSelected(date) && styles.selectedDateItem,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[
                styles.dayName,
                isDateSelected(date) && styles.selectedDateText,
              ]}>
                {getDayName(date)}
              </Text>
              <Text style={[
                styles.dayNumber,
                isDateSelected(date) && styles.selectedDateText,
                isToday(date) && styles.todayText,
              ]}>
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        <View style={styles.appointmentsHeader}>
          <Text style={styles.appointmentsTitle}>Appuntamenti</Text>
          <Text style={styles.appointmentsDate}>{formatDate(selectedDate)}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
        ) : (
          <View style={styles.appointmentsList}>
            {appointments.length > 0 ? (
              <FlatList
                data={appointments}
                renderItem={renderAppointmentItem}
                keyExtractor={item => item.id}
              />
            ) : (
              <View style={styles.noAppointments}>
                <Ionicons name="calendar-outline" size={50} color="#ccc" />
                <Text style={styles.noAppointmentsText}>Nessun appuntamento per oggi</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navButton, styles.activeNavButton]}>
          <Ionicons name="calendar" size={24} color="#007bff" />
          <Text style={styles.navButtonText}>Agenda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => Alert.alert('Profilo', 'Funzionalità in arrivo')}>
          <Ionicons name="person" size={24} color="#666" />
          <Text style={styles.navButtonText}>Profilo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => Alert.alert('Statistiche', 'Funzionalità in arrivo')}>
          <Ionicons name="stats-chart" size={24} color="#666" />
          <Text style={styles.navButtonText}>Statistiche</Text>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  barberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  shopName: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    padding: 10,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  availabilityText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  dateSelector: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 70,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedDateItem: {
    backgroundColor: '#007bff',
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedDateText: {
    color: 'white',
  },
  todayText: {
    color: '#007bff',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  appointmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  appointmentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  appointmentsDate: {
    fontSize: 16,
    color: '#666',
  },
  appointmentsList: {
    flex: 1,
  },
  appointmentItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentTime: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    paddingRight: 10,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  durationText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  appointmentDetails: {
    flex: 1,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  appointmentStatus: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  confirmedStatus: {
    backgroundColor: '#e6f7ee',
    color: '#2ecc71',
  },
  pendingStatus: {
    backgroundColor: '#fff5e6',
    color: '#f39c12',
  },
  noAppointments: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  noAppointmentsText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loader: {
    marginTop: 50,
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
  activeNavButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  navButtonText: {
    fontSize: 12,
    marginTop: 5,
    color: '#666',
  },
});

export default BarberDashboard; 