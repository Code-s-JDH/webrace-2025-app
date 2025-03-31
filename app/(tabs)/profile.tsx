import { StyleSheet, View, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Collapsible } from '@/components/Collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { API_URL, BACKGROUND_COLOR, BLUE_COLOR } from '../constats';
import { fetchWithAuth } from '../../middleware/authMiddleware';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
  name: string;
  email: string;
  role: 'user' | 'courier';
  company: string;
  joinedDate: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}profile`);
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMenuItem = (title: string, route: string, icon: string) => (
    <Pressable 
      style={styles.menuItem} 
      onPress={() => router.push(route)}
    >
      <IconSymbol name={icon} size={24} color={BLUE_COLOR} />
      <ThemedText style={styles.menuItemText}>{title}</ThemedText>
    </Pressable>
  );

  const renderCourierTools = () => {
    if (profile?.role !== 'courier') return null;

    return (
      <Collapsible title="Kurýrské nástroje">
        <View style={styles.menuContainer}>
          {renderMenuItem('Aktivní objednávky', '/courier/active-orders', 'bicycle')}
          {renderMenuItem('Historie doručení', '/courier/delivery-history', 'history')}
          {renderMenuItem('Moje statistiky', '/courier/statistics', 'chart')}
          {renderMenuItem('Plánování tras', '/courier/route-planning', 'map')}
        </View>
      </Collapsible>
    );
  };

  const renderUserTools = () => {
    if (profile?.role !== 'user') return null;

    return (
      <Collapsible title="Moje objednávky">
        <View style={styles.menuContainer}>
          {renderMenuItem('Aktuální objednávky', '/orders/active', 'shopping-cart')}
          {renderMenuItem('Historie objednávek', '/orders/history', 'history')}
          {renderMenuItem('Nová objednávka', '/orders/new', 'plus')}
        </View>
      </Collapsible>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BLUE_COLOR} />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.titleContainer}>
          <ThemedText type="title">{profile?.name}</ThemedText>
          <ThemedText style={styles.roleTag}>
            {profile?.role === 'courier' ? 'Kurýr' : 'Uživatel'}
          </ThemedText>
        </View>

        <Collapsible title="Osobní informace">
          <ThemedText>Email: {profile?.email}</ThemedText>
          <ThemedText>Společnost: {profile?.company}</ThemedText>
          <ThemedText>Připojil se: {profile?.joinedDate}</ThemedText>
        </Collapsible>

        {renderCourierTools()}
        {renderUserTools()}

        <Collapsible title="Nastavení">
          <View style={styles.menuContainer}>
            {renderMenuItem('Upravit profil', '/settings/profile', 'user')}
            {renderMenuItem('Změnit heslo', '/settings/password', 'lock')}
            {renderMenuItem('Notifikace', '/settings/notifications', 'bell')}
          </View>
        </Collapsible>

        <Pressable style={styles.logoutButton} onPress={logout}>
          <ThemedText style={styles.logoutText}>Odhlásit se</ThemedText>
        </Pressable>
      </View>
    </ScrollView>
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
  headerImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileContainer: {
    gap: 20,
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  menuContainer: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
  },
  roleTag: {
    backgroundColor: BLUE_COLOR,
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  }
});