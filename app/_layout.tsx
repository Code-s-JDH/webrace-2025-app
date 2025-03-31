import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BACKGROUND_COLOR, TEXT_COLOR } from './constats';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Outfit: require('../assets/fonts/Outfit.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: BACKGROUND_COLOR,
            },
            headerTintColor: TEXT_COLOR,
            headerTitleStyle: {
              fontFamily: 'Outfit',
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen 
            name="order/[id]" 
            options={{ 
              headerShown: true,
              headerTitle: "Detail zásilky",
              headerBackButtonDisplayMode: "minimal",
            }} 
          />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="scanner" options={{ headerShown: true, headerTitle: "Skenování kódu" }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}