import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_URL, BACKGROUND_COLOR, TEXT_COLOR, BLUE_COLOR, MAGENTA_COLOR } from '../constats';
import { fetchWithAuth } from '@/middleware/authMiddleware';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'courier';
  phone?: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}auth/user/id`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setProfile(result.data);
        console.log('Profile data:', result.data);
      } else {
        Alert.alert('Error', 'Nepodařilo se načíst profil');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Nepodařilo se načíst profil');
    } finally {
      setLoading(false);
    }
  };

  const navigateToSection = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={TEXT_COLOR} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.profileHeader}>
        <MaterialIcons name="account-circle" size={80} color={BLUE_COLOR} />
        <ThemedText style={styles.name}>{profile?.name || 'Uživatel'}</ThemedText>
        <ThemedText style={styles.email}>{profile?.email}</ThemedText>
        <View style={styles.roleBadge}>
          <ThemedText style={styles.roleText}>
            {profile?.role === 'courier' ? 'Doručovatel' : 'Zákazník'}
          </ThemedText>
        </View>
      </View>

      <View style={styles.menuSection}>
        <ThemedText style={styles.sectionTitle}>Nastavení</ThemedText>
        
        <Pressable style={styles.menuItem} onPress={() => navigateToSection('/settings/profile')}>
          <MaterialIcons name="person" size={24} color={TEXT_COLOR} />
          <ThemedText style={styles.menuItemText}>Upravit profil</ThemedText>
        </Pressable>
        
        <Pressable style={styles.menuItem} onPress={() => navigateToSection('/settings/password')}>
          <MaterialIcons name="lock" size={24} color={TEXT_COLOR} />
          <ThemedText style={styles.menuItemText}>Změnit heslo</ThemedText>
        </Pressable>
        
        <Pressable style={styles.menuItem} onPress={() => navigateToSection('/settings/notifications')}>
          <MaterialIcons name="notifications" size={24} color={TEXT_COLOR} />
          <ThemedText style={styles.menuItemText}>Notifikace</ThemedText>
        </Pressable>
      </View>

      {profile?.role === 'courier' && (
        <View style={styles.menuSection}>
          <ThemedText style={styles.sectionTitle}>Doručovatel</ThemedText>
          
          <Pressable 
            style={styles.menuItem} 
            onPress={() => navigateToSection('/courier/manage-orders')}
          >
            <MaterialIcons name="delivery-dining" size={24} color={TEXT_COLOR} />
            <ThemedText style={styles.menuItemText}>Správa zásilek</ThemedText>
          </Pressable>
          
          <Pressable 
            style={styles.menuItem} 
            onPress={() => navigateToSection('/courier/delivery-history')}
          >
            <MaterialIcons name="history" size={24} color={TEXT_COLOR} />
            <ThemedText style={styles.menuItemText}>Historie doručení</ThemedText>
          </Pressable>
        </View>
      )}

      {profile?.role === 'user' && (
        <View style={styles.menuSection}>
          <ThemedText style={styles.sectionTitle}>Objednávky</ThemedText>
          
          <Pressable 
            style={styles.menuItem} 
            onPress={() => navigateToSection('/orders/active')}
          >
            <MaterialIcons name="receipt-long" size={24} color={TEXT_COLOR} />
            <ThemedText style={styles.menuItemText}>Moje objednávky</ThemedText>
          </Pressable>
        </View>
      )}

      <Pressable style={styles.logoutButton} onPress={logout}>
        <ThemedText style={styles.logoutText}>Odhlásit se</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    fontFamily: 'Outfit',
  },
  email: {
    fontSize: 16,
    color: TEXT_COLOR,
    marginTop: 5,
    fontFamily: 'Outfit',
  },
  roleBadge: {
    backgroundColor: BLUE_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },
  roleText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontFamily: 'Outfit',
  },
  menuSection: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Outfit',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    fontFamily: 'Outfit',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: MAGENTA_COLOR,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Outfit',
  },
});