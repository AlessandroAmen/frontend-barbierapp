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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, getApiPath } from '../utils/apiConfig';

const AdminDashboard = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
    loadUsers();
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

  const loadUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Errore nel caricamento degli utenti');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Errore:', error);
      Alert.alert('Errore', 'Impossibile caricare la lista degli utenti');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Errore durante il logout:', error);
      Alert.alert('Errore', 'Si è verificato un errore durante il logout');
    }
  };

  const makeUserBarber = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('Token non trovato');
      }

      const url = `${API_URL}/users/${userId}/make-barber`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Errore sconosciuto' }));
        throw new Error(errorData.message || 'Errore nella modifica del ruolo');
      }

      const responseData = await response.json();
      Alert.alert('Successo', 'Utente trasformato in barbiere con successo');
      loadUsers(); // Ricarica la lista utenti
    } catch (error) {
      Alert.alert('Errore', error.message || 'Impossibile modificare il ruolo dell\'utente');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>Ruolo: {item.role}</Text>
      </View>
      {item.role === 'customer' && (
        <TouchableOpacity 
          style={[styles.makeBarberButton, { opacity: 0.8 }]}
          activeOpacity={0.6}
          onPress={() => makeUserBarber(item.id)}
        >
          <Text style={styles.makeBarberButtonText}>Rendi Barbiere</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Benvenuto,</Text>
            <Text style={styles.adminName}>{userData?.name || 'Admin'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cerca utenti..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Gestione Utenti</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
        ) : (
          <View style={styles.userList}>
            {filteredUsers.length > 0 ? (
              <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={item => item.id.toString()}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.noUsersText}>Nessun utente trovato</Text>
            )}
          </View>
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
  adminName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  userList: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userRole: {
    fontSize: 14,
    color: '#007bff',
    marginTop: 2,
  },
  makeBarberButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  makeBarberButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
  noUsersText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});

export default AdminDashboard; 