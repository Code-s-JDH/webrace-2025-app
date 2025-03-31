import { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { BACKGROUND_COLOR, TEXT_COLOR, API_URL, BLUE_COLOR } from './constats';

// Test token for development purposes
const TEST_TOKEN = "test_development_token_12345";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    // Input validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Vyplňte email a heslo');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}auth/login`, {
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

  const handleTestLogin = async () => {
    setIsLoading(true);
    try {
      // Use the test token directly
      await login(TEST_TOKEN);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Test login error:', error);
      Alert.alert('Error', 'Nepodařilo se přihlásit s testovacím tokenem');
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
        <>
          <Button title="přihlásit se" onPress={handleLogin} />
          <TouchableOpacity 
            style={styles.testLoginButton} 
            onPress={handleTestLogin}
            disabled={isLoading}
          >
            <Text style={styles.testLoginText}>Přihlásit se s testovacím tokenem</Text>
          </TouchableOpacity>
        </>
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
  testLoginButton: {
    marginTop: 20,
    backgroundColor: BLUE_COLOR,
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  testLoginText: {
    color: 'white',
    fontFamily: 'Outfit',
    fontWeight: '500',
  },
});