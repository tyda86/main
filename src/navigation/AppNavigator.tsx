import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import { RootStackParamList, MainTabParamList } from '../types';

// Import screens
import HomeScreen from '../screens/Home/HomeScreen';
import HealthScreen from '../screens/Health/HealthScreen';
import CommunityScreen from '../screens/Community/CommunityScreen';
import ProfileScreen from '../screens/PetProfile/ProfileScreen';
import PetProfileScreen from '../screens/PetProfile/PetProfileScreen';
import AddPetScreen from '../screens/PetProfile/AddPetScreen';
import EditPetScreen from '../screens/PetProfile/EditPetScreen';
import HealthRecordScreen from '../screens/Health/HealthRecordScreen';
import AddHealthRecordScreen from '../screens/Health/AddHealthRecordScreen';
import AIAnalysisScreen from '../screens/Health/AIAnalysisScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Health') {
            iconName = focused ? 'medical' : 'medical-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'paw' : 'paw-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Pet Wellness' }}
      />
      <Tab.Screen 
        name="Health" 
        component={HealthScreen} 
        options={{ title: 'Health Tracker' }}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityScreen} 
        options={{ title: 'Pet Community' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'My Pets' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const theme = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.onPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PetProfile" 
          component={PetProfileScreen} 
          options={{ title: 'Pet Profile' }}
        />
        <Stack.Screen 
          name="AddPet" 
          component={AddPetScreen} 
          options={{ title: 'Add New Pet' }}
        />
        <Stack.Screen 
          name="EditPet" 
          component={EditPetScreen} 
          options={{ title: 'Edit Pet' }}
        />
        <Stack.Screen 
          name="HealthRecord" 
          component={HealthRecordScreen} 
          options={{ title: 'Health Record' }}
        />
        <Stack.Screen 
          name="AddHealthRecord" 
          component={AddHealthRecordScreen} 
          options={{ title: 'Add Health Record' }}
        />
        <Stack.Screen 
          name="AIAnalysis" 
          component={AIAnalysisScreen} 
          options={{ title: 'AI Health Analysis' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;