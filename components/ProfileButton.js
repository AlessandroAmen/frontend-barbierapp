import React, { useState, useEffect } from 'react';
import { 
  TouchableOpacity, 
  View, 
  Text, 
  Modal, 
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ProfileButton = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  // Carica l'email dell'utente
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const userEmail = await AsyncStorage.getItem('userEmail');
        if (userEmail) {
          setEmail(userEmail);
        }
      } catch (error) {
        console.error('Errore nel recupero dell\'email:', error);
      }
    };

    getUserEmail();
  }, []);

  // Gestisce il logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userRole');
      
      // Chiude il modal e reindirizza alla schermata di login
      setModalVisible(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Errore durante il logout:', error);
      Alert.alert('Errore', 'Impossibile completare il logout. Riprova più tardi.');
    }
  };

  return (
    <View>
      {/* Bottone profilo */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="person-circle-outline" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal con email e bottone logout */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profilo</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.userInfoContainer}>
              <Ionicons name="person-circle" size={60} color="#333" />
              <Text style={styles.emailText}>{email}</Text>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  profileButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#007BFF',
    marginRight: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  emailText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default ProfileButton; 