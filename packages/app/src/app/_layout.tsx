import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { ToastProvider } from 'expo-toast';
import React from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider } from '@/contexts/auth-context';

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider
            value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
            <AuthProvider>
                <ToastProvider>
                    <AnimatedSplashOverlay />
                    <Stack screenOptions={{ headerShown: false }} />
                </ToastProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
