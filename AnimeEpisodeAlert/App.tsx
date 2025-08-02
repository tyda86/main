import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import MyAnimeScreen from './src/screens/MyAnimeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AnimeDetailScreen from './src/screens/AnimeDetailScreen';

// Contexts
import { AnimeProvider } from './src/contexts/AnimeContext';
import { NotificationProvider } from './src/contexts/NotificationContext';

// Services
import EpisodeCheckService from './src/services/EpisodeCheckService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'My Anime') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#1A1A2E',
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#16213E',
          borderTopColor: '#0F3460',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="My Anime" component={MyAnimeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const episodeCheckService = EpisodeCheckService.getInstance();

  useEffect(() => {
    // Set up app state change listener for foreground checks
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        episodeCheckService.checkOnAppForeground();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Initial check when app loads
    episodeCheckService.checkOnAppForeground();

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <AnimeProvider>
      <NotificationProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1A1A2E',
              },
              headerTintColor: '#fff',
            }}
          >
            <Stack.Screen 
              name="Main" 
              component={TabNavigator} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AnimeDetail" 
              component={AnimeDetailScreen}
              options={{ title: 'Anime Details' }}
            />
          </Stack.Navigator>
          <StatusBar style="light" />
        </NavigationContainer>
      </NotificationProvider>
    </AnimeProvider>
  );
}