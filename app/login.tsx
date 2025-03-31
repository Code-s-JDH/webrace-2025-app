import { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { BACKGROUND_COLOR, TEXT_COLOR, API_URL } from './constats';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    // Input validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Vyplňte uživatelské jméno a heslo');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Ensure data is stringified before storage
        await login(data.data.token);
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Error', 
          data.message || 'Neplatné přihlašovací údaje'
        );
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Error', 
        'Nemáte připojení k internetu nebo server je nedostupný'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Přihlášení</Text>
      <TextInput
        style={styles.input}
        placeholder="email"
        placeholderTextColor={TEXT_COLOR}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="heslo"
        placeholderTextColor={TEXT_COLOR}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />
      {isLoading ? (
        <ActivityIndicator size="large" color={TEXT_COLOR} />
      ) : (
        <Button title="přihlásit se"  onPress={handleLogin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: BACKGROUND_COLOR,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: TEXT_COLOR,
    marginBottom: 12,
    padding: 8,
    borderRadius: 4,
    color: TEXT_COLOR,
    fontFamily: 'Outfit',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 24,
    fontFamily: 'Outfit',
    textAlign: 'center',
  },
});