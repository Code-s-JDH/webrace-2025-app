import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Alert, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { API_URL, BACKGROUND_COLOR, BLUE_COLOR, MAGENTA_COLOR, TEXT_COLOR } from '../constats';
import { fetchWithAuth } from '@/middleware/authMiddleware';
import { ThemedText } from '@/components/ThemedText';

// Define Order interface
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

export default function ManageOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all'); // 'all', 'active', 'completed'

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}courier/orders`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setOrders(result.data);
      } else {
        Alert.alert('Error', 'Nepodařilo se načíst zásilky');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Nepodařilo se načíst zásilky');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}courier/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update the local order list
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus } 
              : order
          )
        );
        Alert.alert('Úspěch', `Stav zásilky byl změněn na: ${newStatus}`);
      } else {
        Alert.alert('Error', result.message || 'Nepodařilo se aktualizovat stav zásilky');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Nepodařilo se aktualizovat stav zásilky');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    if (filter === 'active') return orders.filter(order => order.status !== 'Doručeno');
    if (filter === 'completed') return orders.filter(order => order.status === 'Doručeno');
    return orders;
  };

  const renderOrderActions = (order: Order) => {
    switch (order.status) {
      case 'Zpracovává se':
        return (
          <Pressable 
            style={[styles.actionButton, { backgroundColor: BLUE_COLOR }]}
            onPress={() => updateOrderStatus(order._id, 'Na cestě')}
          >
            <Text style={styles.actionButtonText}>Zahájit doručení</Text>
          </Pressable>
        );
      case 'Na cestě':
        return (
          <Pressable 
            style={[styles.actionButton, { backgroundColor: MAGENTA_COLOR }]}
            onPress={() => updateOrderStatus(order._id, 'Doručeno')}
          >
            <Text style={styles.actionButtonText}>Označit jako doručeno</Text>
          </Pressable>
        );
      case 'Doručeno':
        return (
          <View style={styles.completedBadge}>
            <MaterialIcons name="check-circle" size={18} color="#4CAF50" />
            <Text style={styles.completedText}>Dokončeno</Text>
          </View>
        );
      default:
        return (
          <Pressable 
            style={[styles.actionButton, { backgroundColor: '#888' }]}
            onPress={() => Alert.alert('Info', 'Tato zásilka nemůže být v tuto chvíli aktualizována')}
          >
            <Text style={styles.actionButtonText}>Stav nelze změnit</Text>
          </Pressable>
        );
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Správa zásilek',
          headerShown: true,
        }} 
      />
      <View style={styles.container}>
        {/* Filter buttons */}
        <View style={styles.filterContainer}>
          <Pressable 
            style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
            onPress={() => setFilter('all')}
          >
            <Text style={styles.filterText}>Všechny</Text>
          </Pressable>
          <Pressable 
            style={[styles.filterButton, filter === 'active' && styles.activeFilter]}
            onPress={() => setFilter('active')}
          >
            <Text style={styles.filterText}>Aktivní</Text>
          </Pressable>
          <Pressable 
            style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
            onPress={() => setFilter('completed')}
          >
            <Text style={styles.filterText}>Dokončené</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={TEXT_COLOR} />
          </View>
        ) : (
          <ScrollView>
            {getFilteredOrders().length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="inbox" size={48} color={BLUE_COLOR} />
                <Text style={styles.emptyText}>Žádné zásilky k zobrazení</Text>
              </View>
            ) : (
              getFilteredOrders().map(order => (
                <View key={order._id} style={styles.orderCard}>
                  <Pressable 
                    onPress={() => router.push({ pathname: '/order/[id]', params: { id: order._id } })}
                    style={styles.orderHeader}
                  >
                    <View>
                      <Text style={styles.orderTitle}>{order.title}</Text>
                      <Text style={styles.orderAddress}>{order.address}, {order.postal}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{order.status}</Text>
                    </View>
                  </Pressable>
                  
                  <View style={styles.orderDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Hmotnost:</Text>
                      <Text style={styles.detailValue}>{order.weight} kg</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Rozměry:</Text>
                      <Text style={styles.detailValue}>{order.size.x}×{order.size.y}×{order.size.z} cm</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Doručení:</Text>
                      <Text style={styles.detailValue}>{order.estimatedTime}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.orderActions}>
                    {renderOrderActions(order)}
                    
                    <Pressable 
                      style={[styles.mapButton]}
                      onPress={() => {
                        // Navigate to map view
                        if (order.gps) {
                          Alert.alert("Navigace", `Navigovat na adresu: ${order.address}`);
                        } else {
                          Alert.alert("Info", "Pro tuto zásilku nejsou dostupné GPS souřadnice");
                        }
                      }}
                    >
                      <MaterialIcons name="map" size={20} color={BLUE_COLOR} />
                      <Text style={styles.mapButtonText}>Navigovat</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeFilter: {
    borderBottomColor: MAGENTA_COLOR,
  },
  filterText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: TEXT_COLOR,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: 'Outfit',
    fontSize: 16,
    color: TEXT_COLOR,
    marginTop: 16,
  },
  orderCard: {
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  orderHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  orderTitle: {
    fontFamily: 'Outfit',
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },
  orderAddress: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: BLUE_COLOR,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: 'center',
  },
  statusText: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: '#FFFFFF',
  },
  orderDetails: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: '#666',
    width: 90,
  },
  detailValue: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: TEXT_COLOR,
  },
  orderActions: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: MAGENTA_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.65,
  },
  actionButtonText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BLUE_COLOR,
    flex: 0.3,
  },
  mapButtonText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: BLUE_COLOR,
    marginLeft: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.65,
  },
  completedText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 4,
  },
});