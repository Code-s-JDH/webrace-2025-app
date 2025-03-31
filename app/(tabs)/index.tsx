import { Image, StyleSheet, View, FlatList, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { API_URL, BACKGROUND_COLOR, BLUE_COLOR, MAGENTA_COLOR, TEXT_COLOR } from '../constats';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithAuth } from '../../middleware/authMiddleware';
import { router } from 'expo-router';

interface Order {
  _id: string;
  title: string;
  status: string;
  estimatedTime: string;
  desc: string;
}

// Sample hardcoded delivery/package data
const sampleOrders: Order[] = [
  {
    _id: '1',
    title: 'Balík #4385 - Praha',
    status: 'Připraveno k vyzvednutí',
    estimatedTime: '14:30 - 15:00',
    desc: 'Elektronika, 3.2kg, Prioritní doručení'
  },
  {
    _id: '2',
    title: 'Balík #2971 - Brno',
    status: 'Na cestě',
    estimatedTime: '10:15 - 11:00',
    desc: 'Oblečení, 1.5kg, Standardní doručení'
  },
  {
    _id: '3',
    title: 'Zásilka #8562 - Ostrava',
    status: 'Doručeno',
    estimatedTime: 'Doručeno 9:45',
    desc: 'Dokumenty, 0.5kg, Expresní doručení'
  },
  {
    _id: '4',
    title: 'Balík #6723 - Plzeň',
    status: 'Zpracovává se',
    estimatedTime: 'Zítra 8:00 - 12:00',
    desc: 'Knihy, 4.8kg, Standardní doručení'
  },
  {
    _id: '5',
    title: 'Zásilka #3159 - Liberec',
    status: 'Čeká na vyzvednutí',
    estimatedTime: 'Do 18:00',
    desc: 'Dárkový balíček, 1.2kg, Večerní doručení'
  }
];

interface ApiResponse {
  data: Order[];
}

const CardItem: React.FC<Order> = ({ title, status, estimatedTime, desc, _id }) => {
  return (
    <Card style={styles.card}>
      <Link href={{ pathname: '/oder/[id]', params: { id: _id } }}>
        <Card.Content style={styles.cardContent}>
          <View>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.statusRow}>
              <Text style={styles.status}>{status}</Text>
              <Text style={styles.estimatedTime}>{estimatedTime}</Text>
            </View>
            <Text style={styles.description}>{desc}</Text>
          </View>
        </Card.Content>
      </Link>
    </Card>
  );
};

const HomeScreen: React.FC = () => {
  // Initialize with sample data
  const [data, setData] = useState<Order[]>(sampleOrders);
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchWithAuth(`${API_URL}orders`);
        const result = await response.json() as ApiResponse;
        if (result.data) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Error fetching orders data:', error);
        // Fallback to sample data on error
        setData(sampleOrders);
      } finally {
        setIsLoading(false);
      }
    };
    setTimeout(() => setIsLoading(false), 500); // Simulate brief loading
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* <View style={styles.header}>
        const { user } = useAuth();
        {user?.role === 'courier' && (
          <Text style={{ color: MAGENTA_COLOR, fontFamily: 'Outfit', fontSize: 16 }}>
            přihlášen jako kurýr
          </Text>
        )}
      </View> */}
      <View style={styles.header}>
          <Text style={{ color: MAGENTA_COLOR, fontFamily: 'Outfit', fontSize: 24 }}>
            přihlášen jako kurýr
          </Text>
      </View>
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.center}>
            <Text style={styles.loadingText}>Načítání...</Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => <CardItem {...item} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BACKGROUND_COLOR,
    paddingVertical: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    marginVertical: 4,
    borderRadius: 16,
    backgroundColor: BACKGROUND_COLOR,
    borderWidth: 2,
    borderColor: MAGENTA_COLOR,
  },
  cardContent: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    fontFamily: 'Outfit',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 4,
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: BLUE_COLOR,
    fontFamily: 'Outfit',
  },
  estimatedTime: {
    fontSize: 14,
    color: MAGENTA_COLOR,
    fontFamily: 'Outfit',
  },
  description: {
    fontSize: 14,
    color: TEXT_COLOR,
    fontFamily: 'Outfit',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontFamily: 'Outfit',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: MAGENTA_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontFamily: 'Outfit',
    fontSize: 14,
  },
  scannerIcon: {
    marginRight: 16,
  },
});

export default HomeScreen;
