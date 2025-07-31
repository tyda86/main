import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import NotificationService from './src/services/NotificationService';

const theme = {
  colors: {
    primary: '#6366F1',
    primaryContainer: '#E0E7FF',
    secondary: '#EC4899',
    secondaryContainer: '#FCE7F3',
    tertiary: '#10B981',
    tertiaryContainer: '#D1FAE5',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    background: '#FAFAFA',
    error: '#EF4444',
    errorContainer: '#FEE2E2',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#1E1B4B',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#831843',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#064E3B',
    onSurface: '#111827',
    onSurfaceVariant: '#6B7280',
    onBackground: '#111827',
    onError: '#FFFFFF',
    onErrorContainer: '#7F1D1D',
    outline: '#D1D5DB',
    outlineVariant: '#E5E7EB',
    inverseSurface: '#1F2937',
    inverseOnSurface: '#F9FAFB',
    inversePrimary: '#A5B4FC',
    shadow: '#000000',
    scrim: '#000000',
    surfaceDisabled: '#F3F4F6',
    onSurfaceDisabled: '#9CA3AF',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

export default function App() {
  useEffect(() => {
    // Initialize notification permissions
    NotificationService.requestPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AppProvider>
          <StatusBar style="light" backgroundColor={theme.colors.primary} />
          <AppNavigator />
        </AppProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}