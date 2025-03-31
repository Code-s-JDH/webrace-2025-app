import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { BACKGROUND_COLOR, BLUE_COLOR, MAGENTA_COLOR, TEXT_COLOR, API_URL } from '../constats';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/middleware/authMiddleware';

// Define types for your data
type HistoryEvent = {
  date: string;
  status: string;
  location: string;
};

// Update types to match our model
type Order = {
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
  size: {
    x: number;
    y: number;
    z: number;
  };
  history: HistoryEvent[];
  recipient?: string; // Assuming recipient info comes from user table
  phoneNumber?: string; // Assuming phone number comes from user table
  trackingCode?: string; // If this exists in your model
};

export default function OrderDetail() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  
  const isCourier = user?.role === 'courier';

  useEffect(() => {
    fetchOrderData();
  }, [id]);

  const fetchOrderData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${API_URL}orders/${id}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setOrder(result.data);
      } else {
        setError(result.message || 'Nepodařilo se načíst data zásilky');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Nepodařilo se načíst data zásilky');
    } finally {
      setLoading(false);
    }
  };

  const addHistoryEntry = async () => {
    if (!newStatus.trim() || !newLocation.trim()) {
      Alert.alert('Chyba', 'Vyplňte prosím stav i lokaci');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetchWithAuth(`${API_URL}orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          historyEvent: {
            status: newStatus.trim(),
            location: newLocation.trim(),
            date: new Date().toLocaleString('cs-CZ')
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state with the new history entry
        if (order) {
          const updatedOrder = { 
            ...order,
            history: [
              ...order.history,
              {
                date: new Date().toLocaleString('cs-CZ'),
                status: newStatus.trim(),
                location: newLocation.trim()
              }
            ]
          };
          setOrder(updatedOrder);
        }
        
        // Clear the form
        setNewStatus('');
        setNewLocation('');
        
        Alert.alert('Úspěch', 'Historie zásilky byla aktualizována');
      } else {
        Alert.alert('Chyba', result.message || 'Nepodařilo se aktualizovat historii zásilky');
      }
    } catch (error) {
      console.error('Error updating order history:', error);
      Alert.alert('Chyba', 'Nepodařilo se aktualizovat historii zásilky');
    } finally {
      setSubmitting(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    setSubmitting(true);
    try {
      const response = await fetchWithAuth(`${API_URL}orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update the local order with new status
        if (order) {
          const updatedOrder = { 
            ...order,
            status: newStatus,
            history: [
              ...order.history,
              {
                date: new Date().toLocaleString('cs-CZ'),
                status: `Stav změněn na: ${newStatus}`,
                location: 'Aktualizováno kurýrem'
              }
            ]
          };
          setOrder(updatedOrder);
        }
        
        Alert.alert('Úspěch', `Stav zásilky byl změněn na: ${newStatus}`);
      } else {
        Alert.alert('Chyba', result.message || 'Nepodařilo se aktualizovat stav zásilky');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Chyba', 'Nepodařilo se aktualizovat stav zásilky');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={TEXT_COLOR} />
        <Text style={styles.loadingText}>Načítání zásilky...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color={MAGENTA_COLOR} />
        <Text style={styles.errorText}>{error || 'Zásilka nebyla nalezena'}</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Zpět na přehled</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.retryButton]} onPress={fetchOrderData}>
          <Text style={styles.buttonText}>Zkusit znovu</Text>
        </Pressable>
      </View>
    );
  }

  const renderStatusActions = () => {
    if (!isCourier) return null;
    
    switch (order.status) {
      case 'Zpracovává se':
        return (
          <Pressable 
            style={[styles.statusButton, { backgroundColor: BLUE_COLOR }]}
            onPress={() => updateOrderStatus('Na cestě')}
            disabled={submitting}
          >
            <MaterialIcons name="local-shipping" size={20} color="#FFFFFF" />
            <Text style={styles.statusButtonText}>Zahájit doručení</Text>
          </Pressable>
        );
      case 'Na cestě':
        return (
          <Pressable 
            style={[styles.statusButton, { backgroundColor: MAGENTA_COLOR }]}
            onPress={() => updateOrderStatus('Doručeno')}
            disabled={submitting}
          >
            <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
            <Text style={styles.statusButtonText}>Označit jako doručeno</Text>
          </Pressable>
        );
      case 'Doručeno':
        return (
          <View style={styles.completedStatus}>
            <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
            <Text style={styles.completedStatusText}>Zásilka byla doručena</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Detail zásilky',
          headerShown: true,
          headerStyle: {
            backgroundColor: BACKGROUND_COLOR,
          },
          headerTintColor: TEXT_COLOR,
          headerTitleStyle: {
            fontFamily: 'Outfit',
          },
        }} 
      />
      <View style={styles.container}>
        <ScrollView>
          {/* Order title and status */}
          <View style={styles.section}>
            <Text style={styles.title}>{order.title}</Text>
            <View style={styles.statusContainer}>
              <Text style={styles.status}>{order.status}</Text>
              <Text style={styles.estimatedTime}>{order.estimatedTime}</Text>
            </View>
            <Text style={styles.description}>{order.desc}</Text>
            
            {renderStatusActions()}
          </View>

          {/* Package details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informace o zásilce</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hmotnost:</Text>
              <Text style={styles.infoValue}>{order.weight} kg</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rozměry:</Text>
              <Text style={styles.infoValue}>{order.size.x} x {order.size.y} x {order.size.z} cm</Text>
            </View>
            {order.trackingCode && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sledovací kód:</Text>
                <Text style={styles.infoValue}>{order.trackingCode}</Text>
              </View>
            )}
          </View>

          {/* Recipient info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informace o příjemci</Text>
            {order.recipient && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Příjemce:</Text>
                <Text style={styles.infoValue}>{order.recipient}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Adresa:</Text>
              <Text style={styles.infoValue}>{order.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>PSČ:</Text>
              <Text style={styles.infoValue}>{order.postal}</Text>
            </View>
            {order.phoneNumber && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Telefon:</Text>
                <Text style={styles.infoValue}>{order.phoneNumber}</Text>
              </View>
            )}
            {order.gps && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>GPS:</Text>
                <Text style={styles.infoValue}>{order.gps}</Text>
              </View>
            )}
          </View>

          {/* Delivery history */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historie zásilky</Text>
            {order.history && order.history.length > 0 ? (
              order.history.map((event, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyDate}>{event.date}</Text>
                    <Text style={styles.historyStatus}>{event.status}</Text>
                    <Text style={styles.historyLocation}>{event.location}</Text>
                  </View>
                  {index < order.history.length - 1 && <View style={styles.historyLine} />}
                </View>
              ))
            ) : (
              <Text style={styles.noHistoryText}>Žádná historie není k dispozici</Text>
            )}
          </View>

          {/* Action buttons - show different buttons based on user role and order status */}
          <View style={styles.actionSection}>
            <Pressable 
              style={[styles.actionButton, !order.gps && styles.disabledButton]} 
              onPress={() => {
                if (order.gps) {
                  Alert.alert("Navigace", `Navigovat na adresu: ${order.address}`);
                } else {
                  Alert.alert("Info", "Pro tuto zásilku nejsou dostupné GPS souřadnice");
                }
              }}
              disabled={!order.gps}
            >
              <MaterialIcons name="map" size={24} color="white" />
              <Text style={styles.actionButtonText}>Zobrazit na mapě</Text>
            </Pressable>
            
            <Pressable style={styles.actionButton} onPress={() => {
              Alert.alert("Podpora", "Kontaktní informace podpory");
            }}>
              <MaterialIcons name="support-agent" size={24} color="white" />
              <Text style={styles.actionButtonText}>Kontaktovat podporu</Text>
            </Pressable>
          </View>
          
          {/* Add history entry form for couriers */}
          {isCourier && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Přidat záznam do historie</Text>
              
              <Text style={styles.formLabel}>Stav zásilky:</Text>
              <TextInput 
                style={styles.input}
                value={newStatus}
                onChangeText={setNewStatus}
                placeholder="Např. Zásilka doručena"
                placeholderTextColor="#9BA1A6"
                editable={!submitting}
              />
              
              <Text style={styles.formLabel}>Lokace:</Text>
              <TextInput 
                style={styles.input}
                value={newLocation}
                onChangeText={setNewLocation}
                placeholder="Např. Výdejní místo Praha 1"
                placeholderTextColor="#9BA1A6"
                editable={!submitting}
              />
              
              <Pressable 
                style={[styles.submitButton, submitting && styles.disabledButton]}
                onPress={addHistoryEntry}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="add-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Přidat záznam</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
  },
  loadingText: {
    color: TEXT_COLOR,
    fontSize: 18,
    fontFamily: 'Outfit',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
    padding: 20,
  },
  errorText: {
    color: TEXT_COLOR,
    fontSize: 18,
    fontFamily: 'Outfit',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    fontFamily: 'Outfit',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    color: BLUE_COLOR,
    fontFamily: 'Outfit',
  },
  estimatedTime: {
    fontSize: 16,
    color: MAGENTA_COLOR,
    fontFamily: 'Outfit',
  },
  description: {
    fontSize: 16,
    color: TEXT_COLOR,
    fontFamily: 'Outfit',
    marginTop: 8,
    marginBottom: 12,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Outfit',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  completedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
  },
  completedStatusText: {
    color: '#4CAF50',
    fontFamily: 'Outfit',
    fontSize: 16,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    fontFamily: 'Outfit',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: BLUE_COLOR,
    fontFamily: 'Outfit',
    width: '30%',
  },
  infoValue: {
    fontSize: 16,
    color: TEXT_COLOR,
    fontFamily: 'Outfit',
    width: '70%',
  },
  historyItem: {
    flexDirection: 'row',
    marginBottom: 8,
    position: 'relative',
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: MAGENTA_COLOR,
    marginTop: 6,
    marginRight: 12,
  },
  historyLine: {
    position: 'absolute',
    left: 5.5,
    top: 18,
    bottom: -8,
    width: 1,
    backgroundColor: MAGENTA_COLOR,
  },
  historyContent: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    color: MAGENTA_COLOR,
    fontFamily: 'Outfit',
  },
  historyStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    fontFamily: 'Outfit',
  },
  historyLocation: {
    fontSize: 14,
    color: BLUE_COLOR,
    fontFamily: 'Outfit',
  },
  noHistoryText: {
    color: TEXT_COLOR,
    fontFamily: 'Outfit',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  actionSection: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MAGENTA_COLOR,
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  actionButtonText: {
    color: 'white',
    fontFamily: 'Outfit',
    marginLeft: 8,
    fontSize: 14,
  },
  button: {
    backgroundColor: MAGENTA_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: BLUE_COLOR,
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Outfit',
    textAlign: 'center',
  },
  formLabel: {
    fontSize: 16,
    color: TEXT_COLOR,
    fontFamily: 'Outfit',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Outfit',
    color: TEXT_COLOR,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  submitButton: {
    backgroundColor: MAGENTA_COLOR,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Outfit',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});