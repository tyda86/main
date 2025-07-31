import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Avatar,
  useTheme,
  SegmentedButtons,
  Menu,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

import { useAppContext } from '../../context/AppContext';
import { RootStackParamList, Pet } from '../../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const AddPetScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const { savePet } = useAppContext();

  const [formData, setFormData] = useState({
    name: '',
    species: 'dog' as 'dog' | 'cat' | 'bird' | 'rabbit' | 'other',
    breed: '',
    dateOfBirth: new Date(),
    gender: 'male' as 'male' | 'female',
    weight: '',
    color: '',
    microchipNumber: '',
    notes: '',
    profileImage: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [breedMenuVisible, setBreedMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const dogBreeds = [
    'Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Poodle',
    'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund', 'Siberian Husky',
    'Mixed Breed', 'Other'
  ];

  const catBreeds = [
    'Persian', 'Maine Coon', 'Siamese', 'Ragdoll', 'British Shorthair',
    'Abyssinian', 'Russian Blue', 'Scottish Fold', 'Bengal', 'Sphynx',
    'Mixed Breed', 'Other'
  ];

  const getBreedOptions = () => {
    switch (formData.species) {
      case 'dog':
        return dogBreeds;
      case 'cat':
        return catBreeds;
      default:
        return ['Mixed Breed', 'Other'];
    }
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({
          ...prev,
          profileImage: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCameraCapture = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({
          ...prev,
          profileImage: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo for your pet',
      [
        { text: 'Camera', onPress: handleCameraCapture },
        { text: 'Photo Library', onPress: handleImagePicker },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Pet name is required');
      return false;
    }
    if (!formData.breed.trim()) {
      Alert.alert('Validation Error', 'Breed is required');
      return false;
    }
    if (!formData.weight.trim() || isNaN(Number(formData.weight))) {
      Alert.alert('Validation Error', 'Valid weight is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newPet: Pet = {
        id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        weight: Number(formData.weight),
        color: formData.color.trim(),
        microchipNumber: formData.microchipNumber.trim() || undefined,
        profileImage: formData.profileImage || undefined,
        notes: formData.notes.trim() || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await savePet(newPet);
      
      Alert.alert(
        'Success!',
        `${newPet.name} has been added to your pets!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving pet:', error);
      Alert.alert('Error', 'Failed to save pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, dateOfBirth: selectedDate }));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Image Section */}
        <Card style={[styles.imageCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.imageCardContent}>
            <TouchableOpacity onPress={showImageOptions} style={styles.imageContainer}>
              {formData.profileImage ? (
                <Image source={{ uri: formData.profileImage }} style={styles.profileImage} />
              ) : (
                <Avatar.Icon
                  size={120}
                  icon="camera-plus"
                  style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}
                />
              )}
              <View style={[styles.cameraOverlay, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </TouchableOpacity>
            <Text variant="bodyMedium" style={[styles.imageHint, { color: theme.colors.onSurfaceVariant }]}>
              Tap to add a photo of your pet
            </Text>
          </Card.Content>
        </Card>

        {/* Basic Information */}
        <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Basic Information
            </Text>
            
            <TextInput
              label="Pet Name *"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              style={styles.input}
              mode="outlined"
            />

            <Text variant="bodyMedium" style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
              Species *
            </Text>
            <SegmentedButtons
              value={formData.species}
              onValueChange={(value) => {
                setFormData(prev => ({ 
                  ...prev, 
                  species: value as typeof formData.species,
                  breed: '' // Reset breed when species changes
                }));
              }}
              buttons={[
                { value: 'dog', label: 'Dog', icon: 'dog' },
                { value: 'cat', label: 'Cat', icon: 'cat' },
                { value: 'bird', label: 'Bird', icon: 'bird' },
                { value: 'rabbit', label: 'Rabbit', icon: 'rabbit' },
                { value: 'other', label: 'Other', icon: 'help' },
              ]}
              style={styles.segmentedButtons}
            />

            <Menu
              visible={breedMenuVisible}
              onDismiss={() => setBreedMenuVisible(false)}
              anchor={
                <TextInput
                  label="Breed *"
                  value={formData.breed}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, breed: text }))}
                  style={styles.input}
                  mode="outlined"
                  right={
                    <TextInput.Icon
                      icon="chevron-down"
                      onPress={() => setBreedMenuVisible(true)}
                    />
                  }
                  onFocus={() => setBreedMenuVisible(true)}
                />
              }
            >
              {getBreedOptions().map((breed) => (
                <Menu.Item
                  key={breed}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, breed }));
                    setBreedMenuVisible(false);
                  }}
                  title={breed}
                />
              ))}
            </Menu>

            <Text variant="bodyMedium" style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
              Gender *
            </Text>
            <SegmentedButtons
              value={formData.gender}
              onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as typeof formData.gender }))}
              buttons={[
                { value: 'male', label: 'Male', icon: 'gender-male' },
                { value: 'female', label: 'Female', icon: 'gender-female' },
              ]}
              style={styles.segmentedButtons}
            />
          </Card.Content>
        </Card>

        {/* Physical Details */}
        <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Physical Details
            </Text>

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                label="Date of Birth *"
                value={formData.dateOfBirth.toLocaleDateString()}
                style={styles.input}
                mode="outlined"
                editable={false}
                right={<TextInput.Icon icon="calendar" />}
              />
            </TouchableOpacity>

            <TextInput
              label="Weight (lbs) *"
              value={formData.weight}
              onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
            />

            <TextInput
              label="Color/Markings"
              value={formData.color}
              onChangeText={(text) => setFormData(prev => ({ ...prev, color: text }))}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., Golden, Black and White, Tabby"
            />
          </Card.Content>
        </Card>

        {/* Additional Information */}
        <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Additional Information
            </Text>

            <TextInput
              label="Microchip Number"
              value={formData.microchipNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, microchipNumber: text }))}
              style={styles.input}
              mode="outlined"
              placeholder="15-digit microchip ID"
            />

            <TextInput
              label="Notes"
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Any special notes about your pet..."
            />
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
          >
            Add Pet
          </Button>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dateOfBirth}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  imageCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  imageCardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  imageHint: {
    textAlign: 'center',
    marginTop: 8,
  },
  formCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  fieldLabel: {
    marginBottom: 8,
    marginTop: 8,
    fontWeight: '500',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  buttonContainer: {
    margin: 16,
    marginTop: 24,
  },
  saveButton: {
    borderRadius: 8,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default AddPetScreen;