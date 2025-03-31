import React, { useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { API_URL, BACKGROUND_COLOR, TEXT_COLOR } from '../constats';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router'; // Add this import

function QRScannerScreen() {
    const [scanned, setScanned] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [permission, requestPermission] = useCameraPermissions();

    if (!permission) {
        return <ThemedView />;
    }

    if (!permission.granted) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText style={{ textAlign: 'center' }}>
                    Pro použití skeneru potřebujeme přístup ke kameře
                </ThemedText>
                <Button onPress={requestPermission} title='Povolit přístup' />
            </ThemedView>
        );
    }
    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (data) {
            setScanned(true);
            setResult(data);
            try {
                const token = await AsyncStorage.getItem('authToken');
                await fetch(API_URL + "auth?sessionId=" + data, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                });
                // Redirect to index page after successful scan
                router.replace('/(tabs)');
            } catch (error) {
                console.error('Error during QR scan:', error);
            }
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.camerabox}>
                <CameraView
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                    }}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                />
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR,
    },
    camerabox: {
        flex: 1,
        justifyContent: 'center',
    },
    textbox: {
        padding: 20,
        alignItems: 'center',
    },
    resulttext: {
        fontSize: 18,
        fontWeight: 'bold',
        color: TEXT_COLOR,
    },
});

export default QRScannerScreen;