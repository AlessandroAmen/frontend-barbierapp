import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ModifyAppointment = ({ route, navigation }) => {
  const { barber } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifica Appuntamento</Text>
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

      <View style={styles.comingSoonContainer}>
        <Ionicons name="construct" size={80} color="#007bff" />
        <Text style={styles.comingSoonTitle}>Funzionalità in arrivo</Text>
        <Text style={styles.comingSoonText}>
          La modifica degli appuntamenti sarà disponibile a breve.
          Questa funzionalità è attualmente in fase di sviluppo.
        </Text>
        <TouchableOpacity
          style={styles.returnButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.returnButtonText}>Torna indietro</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.featuresList}>
        <Text style={styles.featuresTitle}>Funzionalità previste:</Text>
        
        <View style={styles.featureItem}>
          <Ionicons name="list" size={24} color="#007bff" style={styles.featureIcon} />
          <Text style={styles.featureText}>Visualizzazione appuntamenti prenotati</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Ionicons name="calendar" size={24} color="#007bff" style={styles.featureIcon} />
          <Text style={styles.featureText}>Modifica data e ora dell'appuntamento</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Ionicons name="cut" size={24} color="#007bff" style={styles.featureIcon} />
          <Text style={styles.featureText}>Modifica dei servizi richiesti</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Ionicons name="close-circle" size={24} color="#007bff" style={styles.featureIcon} />
          <Text style={styles.featureText}>Cancellazione appuntamento</Text>
        </View>
      </View>
    </ScrollView>
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
  comingSoonContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  returnButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  returnButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuresList: {
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
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  featureIcon: {
    marginRight: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#555',
  },
});

export default ModifyAppointment; 