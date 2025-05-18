import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Products = ({ route, navigation }) => {
  const { barber } = route.params;

  // Prodotti di esempio
  const dummyProducts = [
    {
      id: '1',
      name: 'Shampoo Professionale',
      description: 'Shampoo per capelli normali con estratti naturali',
      price: '18.50',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '2',
      name: 'Balsamo Nutriente',
      description: 'Balsamo idratante per capelli secchi e danneggiati',
      price: '15.90',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '3',
      name: 'Gel Modellante',
      description: 'Gel a tenuta forte per acconciature di lunga durata',
      price: '12.50',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '4',
      name: 'Olio da Barba',
      description: 'Olio nutriente per barba morbida e lucente',
      price: '22.00',
      image: 'https://via.placeholder.com/150',
    },
  ];

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <Image
        source={{ uri: item.image }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>€{item.price}</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prodotti</Text>
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
          Il catalogo prodotti sarà disponibile a breve.
          Questa funzionalità è attualmente in fase di sviluppo.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Anteprima Prodotti</Text>

      <FlatList
        data={dummyProducts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.productsList}
      />

      <TouchableOpacity
        style={styles.returnButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.returnButtonText}>Torna indietro</Text>
      </TouchableOpacity>
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
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginLeft: 15,
    marginBottom: 10,
  },
  productsList: {
    padding: 15,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  productInfo: {
    padding: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  addButton: {
    backgroundColor: '#007bff',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  returnButton: {
    backgroundColor: '#007bff',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  returnButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Products; 