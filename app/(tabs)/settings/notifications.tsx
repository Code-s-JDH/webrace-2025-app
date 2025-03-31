import { StyleSheet, View, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_URL, BLUE_COLOR } from '../../constats';
import { fetchWithAuth } from '../../../middleware/authMiddleware';

interface NotificationSettings {
  orderUpdates: boolean;
  promotionalEmails: boolean;
  statusChanges: boolean;
}

export default function NotificationsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    orderUpdates: true,
    promotionalEmails: false,
    statusChanges: true,
  });

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}settings/notifications`);
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    try {
      const response = await fetchWithAuth(`${API_URL}settings/notifications`, {
        method: 'PUT',
        body: JSON.stringify({ [key]: value }),
      });
      const data = await response.json();
      if (data.success) {
        setSettings(prev => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Nastavení notifikací</ThemedText>
      <View style={styles.settingsContainer}>
        <View style={styles.settingItem}>
          <ThemedText>Aktualizace objednávek</ThemedText>
          <Switch
            value={settings.orderUpdates}
            onValueChange={(value) => updateSetting('orderUpdates', value)}
            trackColor={{ false: '#767577', true: BLUE_COLOR }}
          />
        </View>
        <View style={styles.settingItem}>
          <ThemedText>Propagační emaily</ThemedText>
          <Switch
            value={settings.promotionalEmails}
            onValueChange={(value) => updateSetting('promotionalEmails', value)}
            trackColor={{ false: '#767577', true: BLUE_COLOR }}
          />
        </View>
        <View style={styles.settingItem}>
          <ThemedText>Změny stavu</ThemedText>
          <Switch
            value={settings.statusChanges}
            onValueChange={(value) => updateSetting('statusChanges', value)}
            trackColor={{ false: '#767577', true: BLUE_COLOR }}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  settingsContainer: {
    marginTop: 20,
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
});