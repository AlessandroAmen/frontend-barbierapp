import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { API_URL, BASE_URL, getApiPath, API_ENDPOINTS } from '../utils/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookAppointment = ({ route, navigation }) => {
  const { barber } = route.params;
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [shopBarbers, setShopBarbers] = useState([]);
  const [loadingBarbers, setLoadingBarbers] = useState(false);
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState('client'); // Default a cliente normale

  useEffect(() => {
    // Carica il token e i barbieri all'avvio
    const setupComponent = async () => {
      const userToken = await AsyncStorage.getItem('userToken');
      setToken(userToken);
      
      // Carica i dati dell'utente per determinare il ruolo
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserRole(userData.role || 'client');
      }
      
      loadShopBarbers(userToken);
    };
    
    setupComponent();
  }, []);

  // Verifica se l'utente è un gestore o admin
  const isManager = () => {
    return userRole === 'manager' || userRole === 'admin' || userRole === 'barber';
  };

  // Carica i barbieri dal server
  const loadShopBarbers = async (userToken) => {
    setLoadingBarbers(true);
    
    try {
      let allBarbers = [];
      
      // 1. Carica i barbieri dal modello Barber
      const response1 = await fetch(`${API_URL}/barbers-test`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response1.ok) {
        const barberModelData = await response1.json();
        allBarbers = [...barberModelData];
      }
      
      // 2. Carica gli utenti con ruolo barbiere (se c'è il token)
      if (userToken) {
        try {
          const response2 = await fetch(`${API_URL}/users/role/barber`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}`
            }
          });
          
          if (response2.ok) {
            const userModelData = await response2.json();
            // Aggiungi i barbieri dal modello User
            userModelData.forEach(userBarber => {
              // Evita duplicati, verifica che non esista già un barbiere con lo stesso ID
              if (!allBarbers.some(b => b.id === userBarber.id)) {
                allBarbers.push(userBarber);
              }
            });
          }
        } catch (err) {
          console.log('Errore nel caricamento degli utenti barbieri:', err);
        }
      }
      
      if (allBarbers.length === 0) {
        throw new Error('Nessun barbiere trovato');
      }
      
      // Filtra i barbieri per lo stesso barber_shop_id o mostra tutti
      const shopId = barber.id;
      
      // Filtra in base al modello (Barber o User)
      const filteredBarbers = allBarbers.filter(b => {
        if ('barber_shop_id' in b) {
          // È un User-Barber
          return b.barber_shop_id == shopId;
        } else {
          // È un Barber
          return b.id == shopId;
        }
      });
      
      // Se non ci sono barbieri associati al negozio o se sono troppo pochi, usa tutti
      let barbersToUse = filteredBarbers.length >= 2 ? filteredBarbers : allBarbers;
      
      // Limita a massimo 3 barbieri per non sovraccaricare l'interfaccia
      if (barbersToUse.length > 3) {
        barbersToUse = barbersToUse.slice(0, 3);
      }
      
      // Aggiungi informazioni di orari di lavoro per ogni barbiere
      const enhancedBarbers = barbersToUse.map((b, index) => {
        // Se è un User-Barber o un Barber
        const isUserBarber = 'barber_shop_id' in b;
        
        let startHour, endHour;
        if (isUserBarber) {
          // Per User-Barber usa valori predefiniti o da shop
          startHour = 9 + index;  // 9, 10, 11 a seconda dell'indice
          endHour = 17 + index;   // 17, 18, 19 a seconda dell'indice
        } else {
          // Per Barber, usa i suoi orari
          startHour = parseInt(b.opening_time?.split(':')[0] || 9);
          endHour = parseInt(b.closing_time?.split(':')[0] || 17);
        }
        
        return {
          ...b,
          workDays: [1, 2, 3, 4, 5, 6],  // Da lunedì a sabato
          startHour,
          endHour,
          // Assicurati che ci sia un nome
          name: b.name || 'Barbiere',
          shop_name: b.shop_name || barber.shop_name
        };
      });
      
      setShopBarbers(enhancedBarbers);
    } catch (error) {
      console.error('Errore nel caricamento dei barbieri:', error);
      
      // Fallback con dati predefiniti (2 barbieri)
      setShopBarbers([
        {
          id: 1,
          name: "Mario Rossi",
          shop_name: barber.shop_name,
          barber_shop_id: barber.id,
          workDays: [1, 2, 3, 4, 5],
          startHour: 9,
          endHour: 17
        },
        {
          id: 2,
          name: "Luca Bianchi",
          shop_name: barber.shop_name,
          barber_shop_id: barber.id,
          workDays: [1, 2, 3, 4, 5, 6],
          startHour: 10,
          endHour: 19
        }
      ]);
    } finally {
      setLoadingBarbers(false);
    }
  };

  // Carica gli slot orari disponibili dal server
  const fetchAvailableTimeSlots = async (date) => {
    if (!selectedBarber) return;
    
    setLoading(true);
    
    try {
      console.log(`Fetching available slots for barber_id: ${selectedBarber.id}, date: ${date}`);
      
      // Add cache-busting parameter to prevent caching issues
      const timestamp = new Date().getTime();
      
      // Usa una sola modalità di costruzione URL per tutte le piattaforme
      // Importante: api-route usa "path=" seguito dagli altri parametri con "&"
      const url = getApiPath('available-slots') + `&barber_id=${selectedBarber.id}&date=${date}&_=${timestamp}`;
      
      console.log('Requesting URL:', url);
      
      // Use the new direct API with no-cache headers
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      // Handle specific error status codes
      if (response.status === 400) {
        // Try to get more detailed error information
        const errorData = await response.json();
        console.error('API 400 Bad Request details:', errorData);
        
        throw new Error(errorData.message || 'Invalid request parameters. The barber may not be available.');
      }
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log('Raw API response:', responseText);
      
      // Parse the JSON response
      const responseData = JSON.parse(responseText);
      
      // Extract slots from response
      const availableSlots = responseData.slots || [];
      
      console.log(`Received ${availableSlots.length} available slots, checking booked status...`);
      
      // Debug log for booked slots
      const bookedSlots = availableSlots.filter(slot => slot.isBooked);
      console.log(`Found ${bookedSlots.length} booked slots:`, 
        bookedSlots.map(slot => `${slot.time}${slot.appointmentId ? ` (ID: ${slot.appointmentId})` : ''}`));
      
      // Convert slots to component-compatible format
      const formattedSlots = availableSlots.map(slot => ({
        id: `${date}-${slot.time}`,
        time: slot.time,
        isBooked: slot.isBooked,
        appointmentId: slot.appointmentId
      }));
      
      // Update the state
      setTimeSlots(formattedSlots);
    } catch (error) {
      console.error('Error loading available slots:', error);
      
      // Show specific error message
      Alert.alert(
        'Error',
        error.message || 'Unable to load available time slots from the server.'
      );
      
      // Fallback to local slot generation
      console.log('Falling back to local slot generation');
      generateTimeSlots(date);
    } finally {
      setLoading(false);
    }
  };

  // Fallback: Genera orari localmente se l'API non è disponibile
  const generateTimeSlots = (date) => {
    if (!selectedBarber) return;
    
    const slots = [];
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0 (domenica) a 6 (sabato)
    
    // Converti da 0-6 (domenica-sabato) a 1-7 (lunedì-domenica)
    const dayFormatted = dayOfWeek === 0 ? 7 : dayOfWeek;
    
    // Controlla se il barbiere lavora quel giorno
    const isWorkDay = selectedBarber.workDays.includes(dayFormatted);
    
    if (isWorkDay) {
      // Genera time slot dalle ore di inizio alle ore di fine del barbiere
      for (let hour = selectedBarber.startHour; hour < selectedBarber.endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          // Tutti gli slot sono disponibili
          const isBooked = false;
          
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          slots.push({
            id: `${date}-${timeString}`,
            time: timeString,
            isBooked: isBooked
          });
        }
      }
    }
    
    setTimeSlots(slots);
  };

  // Gestisce la selezione di una data
  const handleDateSelect = (day) => {
    if (!selectedBarber) {
      Alert.alert("Nessun barbiere selezionato", "Seleziona prima un barbiere.");
      return;
    }
    
    const selectedDateStr = day.dateString;
    
    // Aggiorna lo stato delle date selezionate
    const updatedMarkedDates = {
      [selectedDateStr]: {
        selected: true,
        selectedColor: '#007bff',
      }
    };
    
    setMarkedDates(updatedMarkedDates);
    setSelectedDate(selectedDateStr);
    setSelectedTimeSlot(null);
    
    // Carica gli slot orari per la data selezionata
    fetchAvailableTimeSlots(selectedDateStr);
  };

  // Gestisce la selezione di uno slot orario
  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot.id);
  };

  // Gestisce la selezione di un barbiere
  const handleBarberSelect = (barber) => {
    setSelectedBarber(barber);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setTimeSlots([]);
    setMarkedDates({});
  };

  // Gestisce la prenotazione dell'appuntamento
  const handleBooking = async () => {
    if (!selectedTimeSlot || !selectedBarber || !selectedDate) {
      Alert.alert(
        "Missing Information",
        "Please select a barber, date, and time slot to book an appointment.",
        [{ text: "OK" }]
      );
      return;
    }
    
    setLoading(true);
    
    try {
      // Extract time from selected slot - Fix the time extraction
      const selectedSlot = timeSlots.find(slot => slot.id === selectedTimeSlot);
      const time = selectedSlot ? selectedSlot.time : '00:00';
      
      // Determine service type (in a complete version, this would be user-selected)
      const serviceType = 'Haircut';
      
      console.log('Sending booking request to:', getApiPath('book-appointment'));
      console.log('Booking time slot:', time);
      
      // Use the new direct API
      const response = await fetch(getApiPath('book-appointment'), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          barber_id: selectedBarber.id,
          date: selectedDate,
          time: time,
          service_type: serviceType,
          notes: 'Booking made through app',
          client_name: 'Web Client',
          client_email: 'client@example.com',
          client_phone: '3334445566'
        })
      });
      
      // Try to parse response, handling case where it's not valid JSON
      let responseData;
      try {
        const responseText = await response.text();
        console.log('Raw server response:', responseText);
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        responseData = {};
      }
      
      // Handle specific status codes
      if (response.status === 409) {
        // Conflict - Slot already booked
        console.log("409 Conflict: Time slot already booked");
        
        // Get conflict details from response if available
        const conflictDetails = responseData.debug ? 
          ` (Conflict with appointment #${responseData.debug.appointment_id})` : '';
        
        // Refresh available slots to show updated availability
        Alert.alert(
          "Slot Unavailable",
          `This time slot is no longer available. It may have been booked by someone else${conflictDetails}. The available slots have been refreshed.`,
          [{ text: "OK" }]
        );
        
        // Reset selected time slot and refresh the slots
        setSelectedTimeSlot(null);
        await fetchAvailableTimeSlots(selectedDate);
        return;
      }
      
      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || `API Error: ${response.status}`;
        console.error('API response failed:', { status: response.status, data: responseData });
        throw new Error(errorMessage);
      }
      
      // On successful booking, immediately update UI to show slot as booked
      const appointmentId = responseData.appointment?.id;
      console.log(`Booking successful, appointment ID: ${appointmentId}`);
      
      // Update the timeSlots state to mark the current selection as booked
      setTimeSlots(prevSlots => {
        return prevSlots.map(slot => {
          if (slot.id === selectedTimeSlot) {
            return {
              ...slot,
              isBooked: true,
              appointmentId: appointmentId
            };
          }
          return slot;
        });
      });
      
      // Then also refresh from server to ensure consistency
      await fetchAvailableTimeSlots(selectedDate);
      
      // Reset selected time slot
      setSelectedTimeSlot(null);
      
      Alert.alert(
        "Booking Confirmed",
        `Your appointment with ${selectedBarber.name} has been booked for ${selectedDate} at ${time}. Appointment ID: ${appointmentId || 'N/A'}`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert(
        "Booking Error",
        error.message || "An error occurred during booking. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Gestisci l'eliminazione di un appuntamento
  const handleDeleteAppointment = async (appointmentId) => {
    if (!appointmentId) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.DELETE_APPOINTMENT}?id=${appointmentId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Errore nell'eliminazione: ${response.status}`);
      }
      
      // Aggiorna gli slot dopo l'eliminazione
      await fetchAvailableTimeSlots(selectedDate);
      
      Alert.alert(
        "Prenotazione Eliminata",
        "La prenotazione è stata eliminata con successo."
      );
    } catch (error) {
      console.error('Errore durante l\'eliminazione:', error);
      Alert.alert(
        "Errore",
        `Si è verificato un errore durante l'eliminazione: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Gestisci la prenotazione da parte del gestore
  const handleManagerBooking = (slot) => {
    // Nota: Alert.prompt è disponibile solo su iOS
    // Su altre piattaforme, dovresti usare un componente personalizzato per l'input
    if (Platform.OS === 'ios') {
      Alert.prompt(
        "Prenota per un Cliente",
        "Inserisci il nome del cliente:",
        [
          { text: "Annulla", style: "cancel" },
          {
            text: "Prenota",
            onPress: (clientName) => {
              if (clientName && clientName.trim()) {
                bookForClient(slot, clientName.trim());
              } else {
                Alert.alert("Errore", "Il nome del cliente è obbligatorio");
              }
            }
          }
        ],
        "plain-text"
      );
    } else {
      // Per piattaforme che non supportano Alert.prompt, usiamo un valore di default
      // In una vera app, dovresti usare un modal input personalizzato
      const clientName = "Cliente Walk-in";
      Alert.alert(
        "Prenota per un Cliente",
        `Proseguire con la prenotazione per '${clientName}'?`,
        [
          { text: "Annulla", style: "cancel" },
          {
            text: "Prenota",
            onPress: () => bookForClient(slot, clientName)
          }
        ]
      );
    }
  };
  
  // Esegue la prenotazione per un cliente
  const bookForClient = async (slot, clientName) => {
    if (!selectedBarber || !selectedDate || !clientName) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.MANAGER_BOOK_APPOINTMENT}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          barber_id: selectedBarber.id,
          date: selectedDate,
          time: slot.time,
          service_type: 'Taglio', // Default service type
          client_name: clientName,
          notes: 'Prenotazione effettuata dal gestore'
        })
      });
      
      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || `Errore API: ${response.status}`);
      }
      
      // Aggiorna gli slot dopo la prenotazione
      await fetchAvailableTimeSlots(selectedDate);
      
      Alert.alert(
        "Prenotazione Confermata",
        `Appuntamento prenotato per ${clientName} il ${selectedDate} alle ${slot.time}.`
      );
    } catch (error) {
      console.error('Errore durante la prenotazione:', error);
      Alert.alert(
        "Errore",
        `Si è verificato un errore durante la prenotazione: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Ottieni dettagli di un appuntamento
  const getAppointmentDetails = async (slot) => {
    if (!selectedBarber || !selectedDate) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.GET_APPOINTMENT_DETAILS}?barber_id=${selectedBarber.id}&date=${selectedDate}&time=${slot.time}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.found) {
        const appointment = data.appointment;
        
        // Usa la funzione isManager per verificare il ruolo
        if (isManager()) {
          Alert.alert(
            "Dettagli Prenotazione",
            `Cliente: ${appointment.client_name}\nEmail: ${appointment.client_email}\nTelefono: ${appointment.client_phone}\nServizio: ${appointment.service_type}\nDurata: ${appointment.duration} min`,
            [
              {
                text: "Chiudi",
                style: "cancel"
              },
              {
                text: "Elimina",
                style: "destructive",
                onPress: () => handleDeleteAppointment(appointment.id)
              }
            ]
          );
        } else {
          Alert.alert(
            "Slot Occupato",
            "Questo orario è già prenotato."
          );
        }
      } else {
        // Lo slot è disponibile, mostra opzioni per il gestore
        if (isManager()) {
          Alert.alert(
            "Slot Disponibile",
            "Vuoi prenotare questo slot per un cliente?",
            [
              {
                text: "No",
                style: "cancel"
              },
              {
                text: "Prenota",
                onPress: () => handleManagerBooking(slot)
              }
            ]
          );
        } else {
          // Se non è un gestore, seleziona lo slot normalmente
          handleTimeSlotSelect(slot);
        }
      }
    } catch (error) {
      console.error('Errore nel recupero dei dettagli:', error);
      Alert.alert(
        "Errore",
        `Si è verificato un errore nel recupero dei dettagli: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const renderTimeSlot = ({ item }) => {
    const isSelected = selectedTimeSlot === item.id;
    const isBooked = item.isBooked === true;
    
    // Modifica per gestori: quando si clicca su uno slot, mostra dettagli o permetti prenotazione
    const handlePress = () => {
      if (isManager()) {
        // I gestori vedono i dettagli della prenotazione o possono prenotare
        getAppointmentDetails(item);
      } else {
        // Gli utenti normali selezionano lo slot se è disponibile
        if (!isBooked) {
          handleTimeSlotSelect(item);
        }
      }
    };
    
    return (
      <TouchableOpacity
        style={[
          styles.timeSlot,
          isBooked && styles.bookedTimeSlot,
          isSelected && !isBooked && styles.selectedTimeSlot,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.timeSlotText,
            isBooked && styles.bookedTimeSlotText,
            isSelected && !isBooked && styles.selectedTimeSlotText,
          ]}
        >
          {item.time}
        </Text>
        {isBooked && (
          <Ionicons name="person" size={18} color="#cc0000" style={styles.bookedIcon} />
        )}
      </TouchableOpacity>
    );
  };

  // Ottieni la data di oggi formattata YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Imposta minDate per il calendario (oggi)
  const minDate = getTodayDate();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prenota Appuntamento</Text>
        <View style={styles.placeholder}></View>
      </View>

      <View style={styles.barberInfoContainer}>
        {barber.image_url ? (
          <Image
            source={{ uri: barber.image_url }}
            style={styles.barberImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="person" size={40} color="#ccc" />
          </View>
        )}
        <View style={styles.barberTextInfo}>
          <Text style={styles.shopName}>{barber.shop_name}</Text>
          <Text style={styles.barberName}>{barber.name}</Text>
        </View>
      </View>

      <ScrollView style={styles.contentContainer}>
        {/* Selezione del barbiere */}
        <Text style={styles.sectionTitle}>Seleziona un barbiere</Text>
        {loadingBarbers ? (
          <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
        ) : (
          <View style={styles.barberSelection}>
            {shopBarbers.map(b => (
              <TouchableOpacity
                key={b.id}
                style={[
                  styles.barberOption,
                  selectedBarber?.id === b.id && styles.selectedBarberOption
                ]}
                onPress={() => handleBarberSelect(b)}
              >
                <View style={styles.barberOptionContent}>
                  <Ionicons 
                    name="cut" 
                    size={24} 
                    color={selectedBarber?.id === b.id ? "#fff" : "#007bff"} 
                    style={styles.barberIcon}
                  />
                  <View style={styles.barberOptionText}>
                    <Text style={[
                      styles.barberOptionName,
                      selectedBarber?.id === b.id && styles.selectedBarberText
                    ]}>
                      {b.name}
                    </Text>
                    <Text style={[
                      styles.barberOptionHours,
                      selectedBarber?.id === b.id && styles.selectedBarberText
                    ]}>
                      Orario: {b.startHour}:00 - {b.endHour}:00
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedBarber && (
          <>
            <Text style={styles.sectionTitle}>Seleziona una data</Text>
            <View style={styles.calendarContainer}>
              <Calendar
                minDate={minDate}
                maxDate={minDate.slice(0, 8) + String(Number(minDate.slice(8)) + 30)} // +30 giorni da oggi
                markedDates={markedDates}
                onDayPress={handleDateSelect}
                theme={{
                  selectedDayBackgroundColor: '#007bff',
                  todayTextColor: '#007bff',
                  arrowColor: '#007bff',
                }}
              />
            </View>
          </>
        )}

        {selectedDate && (
          <>
            <Text style={styles.sectionTitle}>Seleziona un orario</Text>
            <View style={styles.timeSlotsContainer}>
              {loading ? (
                <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
              ) : timeSlots.length > 0 ? (
                <FlatList
                  data={timeSlots}
                  renderItem={renderTimeSlot}
                  keyExtractor={(item) => item.id}
                  numColumns={4}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.noSlotsText}>
                  Nessun orario disponibile per la data selezionata.
                </Text>
              )}
            </View>

            {!loading && timeSlots.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.bookButton,
                  !selectedTimeSlot && styles.disabledButton
                ]}
                onPress={handleBooking}
                disabled={!selectedTimeSlot}
              >
                <Text style={styles.bookButtonText}>
                  Conferma Prenotazione
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  barberInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 15,
  },
  barberImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  barberTextInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  barberName: {
    fontSize: 14,
    color: '#666',
  },
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  barberSelection: {
    marginBottom: 20,
  },
  barberOption: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedBarberOption: {
    backgroundColor: '#007bff',
  },
  barberOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barberIcon: {
    marginRight: 15,
  },
  barberOptionText: {
    flex: 1,
  },
  barberOptionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  barberOptionHours: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  selectedBarberText: {
    color: 'white',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  timeSlotsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeSlot: {
    flex: 1,
    margin: 5,
    padding: 12,
    borderRadius: 5,
    backgroundColor: '#e6f2ff',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  selectedTimeSlot: {
    backgroundColor: '#007bff',
  },
  bookedTimeSlot: {
    backgroundColor: '#ffcccc',
    borderColor: '#ff0000',
    borderWidth: 1,
    opacity: 0.8,
  },
  timeSlotText: {
    color: '#333',
    fontSize: 14,
  },
  selectedTimeSlotText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bookedTimeSlotText: {
    color: '#cc0000',
  },
  bookedIcon: {
    marginTop: 3,
  },
  loader: {
    marginVertical: 20,
  },
  bookButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noSlotsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    padding: 20,
  },
});

export default BookAppointment; 