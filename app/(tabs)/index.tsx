import { Image, StyleSheet, View, FlatList, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { API_URL, BACKGROUND_COLOR, BLUE_COLOR, MAGENTA_COLOR } from '../constats';
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
  const [data, setData] = useState<Order[]>([]);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <MaterialIcons
            name="qr-code-scanner"
            size={24}
            color="white"
            style={styles.scannerIcon}
            onPress={() => router.push('/scanner')}
          />
          <Pressable
            style={styles.logoutButton}
            onPress={logout}
          >
            <Text style={styles.logoutButtonText}>Odhlásit se</Text>
          </Pressable>
        </View>
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
    color: 'white',
    fontFamily: 'Outfit',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
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
    color: 'white',
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
