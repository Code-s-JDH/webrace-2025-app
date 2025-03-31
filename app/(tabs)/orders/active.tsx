import { StyleSheet, View } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_URL } from '../../constats';
import { fetchWithAuth } from '../../../middleware/authMiddleware';

interface UserOrder {
  id: string;
  status: string;
  createdAt: string;
  deliveryExpected: string;
}

export default function UserActiveOrdersScreen() {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}orders/active`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Moje aktivní objednávky</ThemedText>
      {/* Implement user orders list here */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});