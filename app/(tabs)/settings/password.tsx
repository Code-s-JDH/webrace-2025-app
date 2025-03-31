import { StyleSheet, View, TextInput, Pressable } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_URL, BLUE_COLOR } from '../../constats';
import { fetchWithAuth } from '../../../middleware/authMiddleware';

export default function PasswordChangeScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Hesla se neshodují');
      return;
    }

    try {
      const response = await fetchWithAuth(`${API_URL}settings/password`, {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Heslo bylo úspěšně změněno');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Nepodařilo se změnit heslo');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Změna hesla</ThemedText>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Současné heslo"
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Nové heslo"
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Potvrzení nového hesla"
          secureTextEntry
        />
        <Pressable style={styles.saveButton} onPress={handleChangePassword}>
          <ThemedText style={styles.saveButtonText}>Změnit heslo</ThemedText>
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
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});