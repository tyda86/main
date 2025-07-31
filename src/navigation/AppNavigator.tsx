import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AddPetScreen from '../screens/PetProfile/AddPetScreen';

// Define your navigation param list
export type RootStackParamList = {
  AddPet: undefined;
  // Add other screens here
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AddPet">
        <Stack.Screen 
          name="AddPet" 
          component={AddPetScreen}
          options={{ title: 'Add Pet' }}
        />
        {/* Add other screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;