import { router } from 'expo-router';
import { API_URL } from '../app/constats';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        // Check if response is 401 Unauthorized
        if (response.status === 401) {
            // Redirect to login page
            router.replace('/login');
            alert('relace vypršela, přihlašte se prosím znovu');
        }

        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};