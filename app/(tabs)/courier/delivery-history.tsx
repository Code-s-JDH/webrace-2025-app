import { StyleSheet, View } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_URL } from '../../constats';
import { fetchWithAuth } from '../../../middleware/authMiddleware';

interface DeliveryRecord {
  id: string;
  orderId: string;
  customer: string;
  deliveredAt: string;
  status: string;
}

export default function DeliveryHistoryScreen() {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryHistory();
  }, []);

  const fetchDeliveryHistory = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}courier/deliveries/history`);
      const data = await response.json();
      if (data.success) {
        setDeliveries(data.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Historie doručení</ThemedText>
      {/* Implement delivery history list here */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});