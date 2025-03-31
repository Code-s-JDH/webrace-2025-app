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

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'courier';
}

interface OrderSize {
  x: number;
  y: number;
  z: number;
}

interface HistoryEvent {
  date: string;
  status: string;
  location: string;
}

interface Order {
  _id: string;
  title: string;
  desc: string;
  status: string;
  userId: string;
  estimatedTime: string;
  courierId?: string;
  address: string;
  postal: string;
  gps?: string;
  weight: number;
  size: OrderSize;
  history: HistoryEvent[];
}

// Sample hardcoded delivery/package data
const sampleOrders = [
  {
    _id: '1',
    title: 'Balík #4385 - Praha',
    status: 'Připraveno k vyzvednutí',
    estimatedTime: '14:30 - 15:00',
    desc: 'Elektronika, 3.2kg, Prioritní doručení',
    address: 'Václavské náměstí 1',
    postal: '110 00 Praha 1',
    weight: 3.2,
    size: { x: 30, y: 40, z: 20 },
    userId: 'user123',
    history: [
      { date: '2025-03-30T08:00:00Z', status: 'Přijato', location: 'Depo Praha' },
      { date: '2025-03-31T09:30:00Z', status: 'Připraveno k vyzvednutí', location: 'Výdejní místo Praha 1' }
    ]
  },
  {
    _id: '2',
    title: 'Balík #2971 - Brno',
    status: 'Na cestě',
    estimatedTime: '10:15 - 11:00',
    desc: 'Oblečení, 1.5kg, Standardní doručení',
    address: 'Lidická 42',
    postal: '602 00 Brno',
    weight: 1.5,
    size: { x: 25, y: 20, z: 15 },
    userId: 'user456',
    history: [
      { date: '2025-03-30T10:00:00Z', status: 'Přijato', location: 'Depo Brno' },
      { date: '2025-03-31T08:15:00Z', status: 'Na cestě', location: 'Kurýrní vozidlo' }
    ]
  },
  {
    _id: '3',
    title: 'Zásilka #8562 - Ostrava',
    status: 'Doručeno',
    estimatedTime: 'Doručeno 9:45',
    desc: 'Dokumenty, 0.5kg, Expresní doručení',
    address: 'Nádražní 35',
    postal: '702 00 Ostrava',
    weight: 0.5,
    size: { x: 30, y: 21, z: 3 },
    userId: 'user789',
    history: [
      { date: '2025-03-29T14:00:00Z', status: 'Přijato', location: 'Depo Ostrava' },
      { date: '2025-03-30T08:30:00Z', status: 'Na cestě', location: 'Kurýrní vozidlo' },
      { date: '2025-03-31T09:45:00Z', status: 'Doručeno', location: 'Adresa příjemce' }
    ]
  },
  {
    _id: '4',
    title: 'Balík #6723 - Plzeň',
    status: 'Zpracovává se',
    estimatedTime: 'Zítra 8:00 - 12:00',
    desc: 'Knihy, 4.8kg, Standardní doručení',
    address: 'Americká 8',
    postal: '301 00 Plzeň',
    weight: 4.8,
    size: { x: 40, y: 30, z: 20 },
    userId: 'user321',
    history: [
      { date: '2025-03-31T07:00:00Z', status: 'Přijato', location: 'Depo Plzeň' },
      { date: '2025-03-31T07:30:00Z', status: 'Zpracovává se', location: 'Depo Plzeň' }
    ]
  },
  {
    _id: '5',
    title: 'Zásilka #3159 - Liberec',
    status: 'Čeká na vyzvednutí',
    estimatedTime: 'Do 18:00',
    desc: 'Dárkový balíček, 1.2kg, Večerní doručení',
    address: 'Pražská 15',
    postal: '460 01 Liberec',
    weight: 1.2,
    size: { x: 20, y: 20, z: 15 },
    userId: 'user654',
    history: [
      { date: '2025-03-30T15:00:00Z', status: 'Přijato', location: 'Depo Liberec' },
      { date: '2025-03-31T10:00:00Z', status: 'Čeká na vyzvednutí', location: 'Výdejní místo Liberec' }
    ]
  }
];

interface ApiResponse {
  data: Order[];
}

const CardItem: React.FC<Order> = ({ title, status, estimatedTime, desc, _id, address, postal, weight }) => {
  return (
    <Card style={styles.card}>
      <Link href={{ pathname: '/order/[id]', params: { id: _id } }}>
        <Card.Content style={styles.cardContent}>
          <View>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.statusRow}>
              <Text style={styles.status}>{status}</Text>
              <Text style={styles.estimatedTime}>{estimatedTime}</Text>
            </View>
            <Text style={styles.description}>{desc}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{address}, {postal}</Text>
              <Text style={styles.metaText}>{weight} kg</Text>
            </View>
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
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: BACKGROUND_COLOR,
    borderWidth: 1,
    borderColor: MAGENTA_COLOR,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 16,
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
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: TEXT_COLOR,
    fontFamily: 'Outfit',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: TEXT_COLOR,
    fontFamily: 'Outfit',
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    fontFamily: 'Outfit',
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: TEXT_COLOR,
    fontFamily: 'Outfit',
    marginTop: 12,
  },
});

export default HomeScreen;
