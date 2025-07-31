import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const HealthScreen = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.centered}>
        <Ionicons name="medical-outline" size={80} color={theme.colors.outline} />
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          Health Tracker
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Track vaccinations, medications, and vet visits
        </Text>
        <Text variant="bodyMedium" style={[styles.comingSoon, { color: theme.colors.primary }]}>
          Coming Soon!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  comingSoon: {
    fontWeight: 'bold',
  },
});

export default HealthScreen;