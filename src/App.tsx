import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { setupApp } from './utils/setupApp';

import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NotificationService } from './services/notificationService';
import { BackgroundSyncService } from './services/backgroundSyncService';

// Import screens
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import MyAnimeScreen from './screens/MyAnimeScreen';
import SettingsScreen from './screens/SettingsScreen';
import AnimeDetailsScreen from './screens/AnimeDetailsScreen';

import { RootStackParamList } from './types/index';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

const TabNavigator = () => {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search';
          } else if (route.name === 'MyAnime') {
            iconName = focused ? 'favorite' : 'favorite-border';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings';
          }

          return <Icon name={iconName || 'home'} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: theme.colors.card,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Trending' }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ title: 'Search' }}
      />
      <Tab.Screen 
        name="MyAnime" 
        component={MyAnimeScreen} 
        options={{ title: 'My Anime' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AnimeDetails" 
        component={AnimeDetailsScreen}
        options={{ title: 'Anime Details' }}
      />
    </Stack.Navigator>
  );
};

const AppContent = () => {
  const { theme, isDark } = useTheme();

  useEffect(() => {
    // Setup app
    setupApp();
    
    // Initialize notification service
    NotificationService.initialize();
    NotificationService.requestPermissions();
    
    // Initialize background sync service
    BackgroundSyncService.initialize();

    // Cleanup on unmount
    return () => {
      BackgroundSyncService.cleanup();
    };
  }, []);

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.card}
      />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;