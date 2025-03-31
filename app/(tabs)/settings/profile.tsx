import { StyleSheet, View, TextInput, Pressable, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_URL, BLUE_COLOR } from '../../constats';
import { fetchWithAuth } from '../../../middleware/authMiddleware';

export default function ProfileSettingsScreen() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}profile`);
      const data = await response.json();
      if (data.success) {
        setName(data.data.name);
        setCompany(data.data.company);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`${API_URL}settings/profile`, {
        method: 'PUT',
        body: JSON.stringify({ name, company }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Úspěch', 'Profil byl úspěšně aktualizován');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Chyba', 'Nepodařilo se aktualizovat profil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Upravit profil</ThemedText>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Jméno"
        />
        <TextInput
          style={styles.input}
          value={company}
          onChangeText={setCompany}
          placeholder="Společnost"
        />
        <Pressable 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <ThemedText style={styles.saveButtonText}>
            {isLoading ? 'Ukládání...' : 'Uložit změny'}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  form: {
    gap: 16,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  saveButton: {
    backgroundColor: BLUE_COLOR,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});