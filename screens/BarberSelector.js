// BarberSelector.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Image, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// L'URL del tuo backend Laravel
const API_URL = 'http://localhost:8000/api';

// Array di regioni e province italiane
const regioniProvince = [
  {
    "regione": "Abruzzo",
    "province": ["L'Aquila", "Teramo", "Pescara", "Chieti"]
  },
  {
    "regione": "Basilicata",
    "province": ["Potenza", "Matera"]
  },
  {
    "regione": "Calabria",
    "province": ["Cosenza", "Catanzaro", "Reggio Calabria", "Crotone", "Vibo Valentia"]
  },
  {
    "regione": "Campania",
    "province": ["Napoli", "Salerno", "Caserta", "Avellino", "Benevento"]
  },
  {
    "regione": "Emilia-Romagna",
    "province": ["Bologna", "Modena", "Parma", "Reggio Emilia", "Ferrara", "Ravenna", "Forlì-Cesena", "Rimini", "Piacenza"]
  },
  {
    "regione": "Friuli-Venezia Giulia",
    "province": ["Udine", "Trieste", "Pordenone", "Gorizia"]
  },
  {
    "regione": "Lazio",
    "province": ["Roma", "Latina", "Frosinone", "Viterbo", "Rieti"]
  },
  {
    "regione": "Liguria",
    "province": ["Genova", "Savona", "La Spezia", "Imperia"]
  },
  {
    "regione": "Lombardia",
    "province": ["Milano", "Brescia", "Bergamo", "Como", "Pavia", "Varese", "Monza e della Brianza", "Mantova", "Cremona", "Lecco", "Lodi", "Sondrio"]
  },
  {
    "regione": "Marche",
    "province": ["Ancona", "Pesaro e Urbino", "Macerata", "Ascoli Piceno", "Fermo"]
  },
  {
    "regione": "Molise",
    "province": ["Campobasso", "Isernia"]
  },
  {
    "regione": "Piemonte",
    "province": ["Torino", "Alessandria", "Asti", "Cuneo", "Novara", "Vercelli", "Biella", "Verbano-Cusio-Ossola"]
  },
  {
    "regione": "Puglia",
    "province": ["Bari", "Lecce", "Foggia", "Taranto", "Brindisi", "Barletta-Andria-Trani"]
  },
  {
    "regione": "Sardegna",
    "province": ["Sassari", "Cagliari", "Nuoro", "Oristano", "Sud Sardegna"]
  },
  {
    "regione": "Sicilia",
    "province": ["Palermo", "Catania", "Messina", "Siracusa", "Ragusa", "Trapani", "Caltanissetta", "Agrigento", "Enna"]
  },
  {
    "regione": "Toscana",
    "province": ["Firenze", "Siena", "Pisa", "Arezzo", "Livorno", "Prato", "Lucca", "Grosseto", "Pistoia", "Massa-Carrara"]
  },
  {
    "regione": "Trentino-Alto Adige",
    "province": ["Trento", "Bolzano"]
  },
  {
    "regione": "Umbria",
    "province": ["Perugia", "Terni"]
  },
  {
    "regione": "Valle d'Aosta",
    "province": ["Aosta"]
  },
  {
    "regione": "Veneto",
    "province": ["Venezia", "Verona", "Vicenza", "Padova", "Treviso", "Belluno", "Rovigo"]
  }
];

const BarberSelector = ({ navigation }) => {
  const [barbers, setBarbers] = useState([]);
  const [allBarbers, setAllBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [regioni, setRegioni] = useState([]);
  const [province, setProvince] = useState([]);
  const [selectedRegione, setSelectedRegione] = useState('');
  const [selectedProvincia, setSelectedProvincia] = useState('');
  const [showRegioniModal, setShowRegioniModal] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);

  useEffect(() => {
    fetchBarbers();
    // Estrai le regioni dall'array predefinito
    setRegioni(regioniProvince.map(item => item.regione));
  }, []);

  useEffect(() => {
    if (selectedRegione) {
      // Trova le province per la regione selezionata
      const regioneSelezionata = regioniProvince.find(item => item.regione === selectedRegione);
      if (regioneSelezionata) {
        setProvince(regioneSelezionata.province);
      } else {
        setProvince([]);
      }
    }
  }, [selectedRegione]);

  useEffect(() => {
    filterBarbers();
  }, [selectedRegione, selectedProvincia, allBarbers]);

  const fetchBarbers = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Tentativo di connessione a:', `${API_URL}/barbers-test`);
      
      const response = await fetch(`${API_URL}/barbers-test`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Status risposta:', response.status);
      
      if (!response.ok) {
        throw new Error(`Errore nel caricamento dei barbieri: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dati ricevuti:', data);
      
      // Verifica se i dati sono in formato array o se sono dentro un oggetto con una proprietà 'barbers'
      let barbersData = [];
      if (data.barbers) {
        barbersData = data.barbers;
      } else if (Array.isArray(data)) {
        barbersData = data;
      } else {
        console.warn('Formato dati inaspettato:', data);
      }
      
      setAllBarbers(barbersData);
      setBarbers(barbersData);
    } catch (err) {
      console.error('Errore dettagliato:', err);
      
      // Verifica se è un errore di rete
      if (err.message.includes('Network request failed')) {
        setError('Impossibile connettersi al server. Verifica la tua connessione e assicurati che il backend sia in esecuzione.');
      } else {
        setError(`Impossibile caricare la lista dei barbieri: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const filterBarbers = () => {
    let filtered = allBarbers;
    
    if (selectedRegione) {
      filtered = filtered.filter(barber => barber.regione === selectedRegione);
    }
    
    if (selectedProvincia) {
      filtered = filtered.filter(barber => barber.provincia === selectedProvincia);
    }
    
    setBarbers(filtered);
  };

  const handleBarberSelect = async (barber) => {
    setSelectedBarber(barber);
    
    try {
      // Salva i dati del barbiere selezionato
      await AsyncStorage.setItem('selectedBarber', JSON.stringify(barber));
      
      // Naviga alla home principale
      navigation.navigate('BarberHome', { barber });
    } catch (error) {
      console.error('Errore nel salvare la selezione:', error);
    }
  };

  const handleRegioneSelect = (regione) => {
    setSelectedRegione(regione);
    setSelectedProvincia('');
    setShowRegioniModal(false);
  };

  const handleProvinciaSelect = (provincia) => {
    setSelectedProvincia(provincia);
    setShowProvinceModal(false);
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Caricamento barbieri...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchBarbers}>
          <Text style={styles.retryButtonText}>Riprova</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Seleziona il tuo Barbiere</Text>

      {/* Dropdown per la regione */}
      <TouchableOpacity 
        style={styles.dropdown}
        onPress={() => setShowRegioniModal(true)}
      >
        <Text style={styles.dropdownText}>
          {selectedRegione || 'Seleziona una regione'}
        </Text>
      </TouchableOpacity>
      
      {/* Dropdown per la provincia (visibile solo se è selezionata una regione) */}
      {selectedRegione && (
        <TouchableOpacity 
          style={styles.dropdown}
          onPress={() => setShowProvinceModal(true)}
        >
          <Text style={styles.dropdownText}>
            {selectedProvincia || 'Seleziona una provincia'}
          </Text>
        </TouchableOpacity>
      )}
      
      {/* Modal per selezionare la regione */}
      <Modal
        visible={showRegioniModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRegioniModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleziona una regione</Text>
            <ScrollView>
              {regioni.map((regione, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItem}
                  onPress={() => handleRegioneSelect(regione)}
                >
                  <Text style={styles.modalItemText}>{regione}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRegioniModal(false)}
            >
              <Text style={styles.closeButtonText}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Modal per selezionare la provincia */}
      <Modal
        visible={showProvinceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProvinceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleziona una provincia</Text>
            <ScrollView>
              {province.map((provincia, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItem}
                  onPress={() => handleProvinciaSelect(provincia)}
                >
                  <Text style={styles.modalItemText}>{provincia}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowProvinceModal(false)}
            >
              <Text style={styles.closeButtonText}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {barbers.length === 0 ? (
        <Text style={styles.noBarberText}>Nessun barbiere disponibile con i filtri selezionati.</Text>
      ) : (
        <View style={styles.barbersList}>
          {barbers.map(barber => (
            <TouchableOpacity
              key={barber.id}
              style={[
                styles.barberCard,
                selectedBarber?.id === barber.id && styles.selectedBarberCard
              ]}
              onPress={() => handleBarberSelect(barber)}
            >
              {barber.image_url && (
                <Image
                  source={{ uri: barber.image_url }}
                  style={styles.barberImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.barberInfo}>
                <Text style={styles.barberName}>{barber.name}</Text>
                <Text style={styles.shopName}>{barber.shop_name}</Text>
                <Text style={styles.barberAddress}>{barber.address}</Text>
                <Text style={styles.barberLocation}>{barber.comune}, {barber.provincia}</Text>
                <Text style={styles.barberPhone}>{barber.phone}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  noBarberText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 30,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  barbersList: {
    marginTop: 10,
  },
  barberCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedBarberCard: {
    borderWidth: 2,
    borderColor: '#007bff',
  },
  barberImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  barberInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  barberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
    marginBottom: 4,
  },
  barberAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  barberLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  barberPhone: {
    fontSize: 14,
    color: '#666',
  },
});

export default BarberSelector;