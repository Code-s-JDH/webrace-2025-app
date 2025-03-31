import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { BACKGROUND_COLOR, BLUE_COLOR, MAGENTA_COLOR, TEXT_COLOR } from '../constats';
import { MaterialIcons } from '@expo/vector-icons';

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

// Sample hardcoded delivery/package data (same as in index.tsx)
const sampleOrders: Order[] = [
  {
    _id: '1',
    title: 'Balík #4385 - Praha',
    status: 'Připraveno k vyzvednutí',
    estimatedTime: '14:30 - 15:00',
    desc: 'Elektronika, Prioritní doručení',
    userId: 'user123',
    courierId: 'courier456',
    address: 'Dlouhá 123, Praha 1',
    postal: '110 00',
    gps: '50.0880400,14.4207600',
    weight: 3.2,
    size: { x: 40, y: 30, z: 20 },
    recipient: 'Jan Novák',
    phoneNumber: '+420 777 888 999',
    trackingCode: 'CZ2023438512',
    history: [
      { date: '26.3.2025 08:32', status: 'Zásilka přijata do systému', location: 'Depo Brno' },
      { date: '27.3.2025 14:15', status: 'Zásilka opustila třídící centrum', location: 'Brno' },
      { date: '28.3.2025 06:45', status: 'Zásilka dorazila do cílového depa', location: 'Praha' },
      { date: '30.3.2025 09:20', status: 'Připraveno k vyzvednutí', location: 'Výdejní místo Praha 1' }
    ]
  },
  {
    _id: '2',
    title: 'Balík #2971 - Brno',
    status: 'Na cestě',
    estimatedTime: '10:15 - 11:00',
    desc: 'Oblečení, 1.5kg, Standardní doručení',
    userId: 'user456',
    address: 'Masarykova 45, Brno',
    postal: '602 00',
    weight: 1.5,
    size: { x: 30, y: 20, z: 10 },
    history: [
      { date: '25.3.2025 14:22', status: 'Zásilka přijata do systému', location: 'Depo Praha' },
      { date: '27.3.2025 08:35', status: 'Zásilka opustila třídící centrum', location: 'Praha' },
      { date: '29.3.2025 05:15', status: 'Zásilka na cestě', location: 'Směr Brno' }
    ]
  },
  {
    _id: '3',
    title: 'Zásilka #8562 - Ostrava',
    status: 'Doručeno',
    estimatedTime: 'Doručeno 9:45',
    desc: 'Dokumenty, Expresní doručení',
    userId: 'user789',
    address: 'Stodolní 15, Ostrava',
    postal: '702 00',
    weight: 0.5,
    size: { x: 25, y: 15, z: 5 },
    history: [
      { date: '24.3.2025 10:10', status: 'Zásilka přijata do systému', location: 'Depo Praha' },
      { date: '25.3.2025 06:20', status: 'Zásilka opustila třídící centrum', location: 'Praha' },
      { date: '26.3.2025 14:40', status: 'Zásilka dorazila do cílového depa', location: 'Ostrava' },
      { date: '27.3.2025 09:45', status: 'Zásilka doručena', location: 'Ostrava' }
    ]
  },
  {
    _id: '4',
    title: 'Balík #6723 - Plzeň',
    status: 'Zpracovává se',
    estimatedTime: 'Zítra 8:00 - 12:00',
    desc: 'Knihy, Standardní doručení',
    userId: 'user101',
    address: 'Americká 38, Plzeň',
    postal: '301 00',
    weight: 4.8,
    size: { x: 35, y: 25, z: 15 },
    history: [
      { date: '29.3.2025 16:45', status: 'Zásilka přijata do systému', location: 'Depo Praha' },
      { date: '30.3.2025 05:30', status: 'Zásilka se zpracovává', location: 'Praha' }
    ]
  },
  {
    _id: '5',
    title: 'Zásilka #3159 - Liberec',
    status: 'Čeká na vyzvednutí',
    estimatedTime: 'Do 18:00',
    desc: 'Dárkový balíček, Večerní doručení',
    userId: 'user202',
    address: 'Pražská 16, Liberec',
    postal: '460 01',
    weight: 1.2,
    size: { x: 20, y: 15, z: 10 },
    history: [
      { date: '27.3.2025 09:15', status: 'Zásilka přijata do systému', location: 'Depo Praha' },
      { date: '28.3.2025 11:40', status: 'Zásilka opustila třídící centrum', location: 'Praha' },
      { date: '29.3.2025 14:20', status: 'Zásilka dorazila do cílového depa', location: 'Liberec' },
      { date: '30.3.2025 10:35', status: 'Připraveno k vyzvednutí', location: 'Výdejní místo Liberec' }
    ]
  }
];

export default function OrderDetail() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the order with the matching ID
    const foundOrder = sampleOrders.find(o => o._id === id);
    
    // Simulate loading
    setTimeout(() => {
      setOrder(foundOrder || null);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Načítání...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Zásilka nebyla nalezena</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Zpět na přehled</Text>
        </Pressable>
      </View>
    );
  }

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
            {order.history.map((event, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyDot} />
                <View style={styles.historyContent}>
                  <Text style={styles.historyDate}>{event.date}</Text>
                  <Text style={styles.historyStatus}>{event.status}</Text>
                  <Text style={styles.historyLocation}>{event.location}</Text>
                </View>
                {index < order.history.length - 1 && <View style={styles.historyLine} />}
              </View>
            ))}
          </View>

          {/* Action buttons - show different buttons based on user role and order status */}
          <View style={styles.actionSection}>
            <Pressable style={styles.actionButton} onPress={() => {
              // Navigate to map view with GPS coordinates
              if (order.gps) {
                // Implementation could open maps app or navigate to map screen
                Alert.alert("Navigace", `Navigovat na adresu: ${order.address}`);
              }
            }}>
              <MaterialIcons name="map" size={24} color="white" />
              <Text style={styles.actionButtonText}>Zobrazit na mapě</Text>
            </Pressable>
            
            <Pressable style={styles.actionButton} onPress={() => {
              // Implementation to contact support
              Alert.alert("Podpora", "Kontaktní informace podpory");
            }}>
              <MaterialIcons name="support-agent" size={24} color="white" />
              <Text style={styles.actionButtonText}>Kontaktovat podporu</Text>
            </Pressable>
          </View>
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
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontFamily: 'Outfit',
    marginLeft: 8,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Outfit',
    textAlign: 'center',
  },
});