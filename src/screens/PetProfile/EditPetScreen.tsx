import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Avatar,
  useTheme,
  ActivityIndicator,
  Card,
  HelperText,
  Chip,
  Surface,
  IconButton,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

import { useAppContext } from '../../context/AppContext';
import { Pet } from '../../types';

// Custom SegmentedControl component for gender selection
const SegmentedControl = ({ 
  options, 
  selectedValue, 
  onValueChange, 
  style 
}: {
  options: { label: string; value: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  style?: any;
}) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.segmentedControl, style]}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.segmentedOption,
            {
              backgroundColor: selectedValue === option.value 
                ? theme.colors.primary 
                : theme.colors.surface,
              borderColor: theme.colors.outline,
            }
          ]}
          onPress={() => onValueChange(option.value)}
        >
          <Text
            variant="bodyMedium"
            style={{
              color: selectedValue === option.value 
                ? theme.colors.onPrimary 
                : theme.colors.onSurface,
              fontWeight: selectedValue === option.value ? '600' : '400'
            }}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const EditPetScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { state, savePet } = useAppContext();

  // Get pet ID from route params
  const petId = (route.params as any)?.petId;
  const pet = state.pets.find(p => p.id === petId);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog' as 'dog' | 'cat' | 'other',
    breed: '',
    dateOfBirth: new Date(),
    gender: 'male' as 'male' | 'female' | 'other',
    weight: '',
    color: '',
    microchipNumber: '',
    notes: '',
    profileImage: null as string | null,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name,
        species: pet.species,
        breed: pet.breed || '',
        dateOfBirth: pet.dateOfBirth,
        gender: pet.gender,
        weight: pet.weight?.toString() || '',
        color: pet.color || '',
        microchipNumber: pet.microchipNumber || '',
        notes: pet.notes || '',
        profileImage: pet.profileImage || null,
      });
    }
  }, [pet]);

  // Watch for changes
  useEffect(() => {
    if (pet) {
      const hasChanged = 
        formData.name !== pet.name ||
        formData.species !== pet.species ||
        formData.breed !== (pet.breed || '') ||
        formData.dateOfBirth.getTime() !== pet.dateOfBirth.getTime() ||
        formData.gender !== pet.gender ||
        formData.weight !== (pet.weight?.toString() || '') ||
        formData.color !== (pet.color || '') ||
        formData.microchipNumber !== (pet.microchipNumber || '') ||
        formData.notes !== (pet.notes || '') ||
        formData.profileImage !== (pet.profileImage || null);
      
      setHasChanges(hasChanged);
    }
  }, [formData, pet]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Pet name is required';
    }

    // Name length
    if (formData.name.trim().length > 50) {
      newErrors.name = 'Pet name must be 50 characters or less';
    }

    // Weight validation
    if (formData.weight && !/^\d+(\.\d{1,2})?$/.test(formData.weight)) {
      newErrors.weight = 'Weight must be a valid number';
    }

    if (formData.weight && (parseFloat(formData.weight) < 0 || parseFloat(formData.weight) > 1000)) {
      newErrors.weight = 'Weight must be between 0 and 1000 lbs';
    }

    // Microchip number validation
    if (formData.microchipNumber && formData.microchipNumber.length > 20) {
      newErrors.microchipNumber = 'Microchip number must be 20 characters or less';
    }

    // Notes length
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes must be 500 characters or less';
    }

    // Date validation
    const today = new Date();
    const maxAge = new Date();
    maxAge.setFullYear(maxAge.getFullYear() - 50); // Max 50 years old

    if (formData.dateOfBirth > today) {
      newErrors.dateOfBirth = 'Date of birth cannot be in the future';
    }

    if (formData.dateOfBirth < maxAge) {
      newErrors.dateOfBirth = 'Date of birth seems too far in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!pet) {
      Alert.alert('Error', 'Pet not found');
      return;
    }

    setLoading(true);

    try {
      const updatedPet: Pet = {
        ...pet,
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed.trim() || undefined,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        color: formData.color.trim() || undefined,
        microchipNumber: formData.microchipNumber.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        profileImage: formData.profileImage || undefined,
      };

      await savePet(updatedPet);

      Alert.alert(
        'Success',
        'Pet profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation?.goBack?.()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update pet profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          {
            text: 'Keep Editing',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation?.goBack?.()
          },
        ]
      );
    } else {
      navigation?.goBack?.();
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
        updateFormData('profileImage', result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
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
        updateFormData('profileImage', result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Update Photo',
      'Choose how you want to update the pet photo',
      [
        {
          text: 'Camera',
          onPress: handleTakePhoto,
        },
        {
          text: 'Photo Library',
          onPress: handleImagePicker,
        },
        {
          text: 'Remove Photo',
          style: 'destructive',
          onPress: () => updateFormData('profileImage', null),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  if (!pet) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="paw-outline" size={80} color={theme.colors.outline} />
        <Text variant="headlineSmall" style={[styles.errorTitle, { color: theme.colors.onBackground }]}>
          Pet Not Found
        </Text>
        <Text variant="bodyLarge" style={[styles.errorSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          The pet you're trying to edit could not be found
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation?.goBack?.()}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  const speciesOptions = [
    { label: 'Dog', value: 'dog' },
    { label: 'Cat', value: 'cat' },
    { label: 'Other', value: 'other' },
  ];

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="white"
            onPress={handleCancel}
          />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Edit {pet.name}
          </Text>
          <View style={styles.headerActions}>
            {hasChanges && (
              <Chip 
                style={styles.changesChip}
                textStyle={{ color: 'white' }}
              >
                Unsaved
              </Chip>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Photo Section */}
        <Card style={[styles.photoCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.photoSection}>
            <View style={styles.photoContainer}>
              {formData.profileImage ? (
                <Avatar.Image
                  size={120}
                  source={{ uri: formData.profileImage }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Icon
                  size={120}
                  icon="paw"
                  style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}
                />
              )}
              <TouchableOpacity
                style={[styles.photoButton, { backgroundColor: theme.colors.primary }]}
                onPress={showImagePicker}
              >
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <Text variant="bodyMedium" style={[styles.photoLabel, { color: theme.colors.onSurfaceVariant }]}>
              Tap to change photo
            </Text>
          </Card.Content>
        </Card>

        {/* Basic Information */}
        <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              📋 Basic Information
            </Text>

            {/* Name */}
            <TextInput
              label="Pet Name *"
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
              maxLength={50}
              left={<TextInput.Icon icon="paw" />}
            />
            <HelperText type="error" visible={!!errors.name}>
              {errors.name}
            </HelperText>

            {/* Species */}
            <Text variant="bodyMedium" style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
              Species *
            </Text>
            <SegmentedControl
              options={speciesOptions}
              selectedValue={formData.species}
              onValueChange={(value) => updateFormData('species', value)}
              style={styles.segmentedControlMargin}
            />

            {/* Breed */}
            <TextInput
              label="Breed"
              value={formData.breed}
              onChangeText={(text) => updateFormData('breed', text)}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Golden Retriever, Siamese, etc."
              left={<TextInput.Icon icon="heart" />}
            />

            {/* Date of Birth */}
            <TouchableOpacity onPress={showDatePickerModal}>
              <TextInput
                label="Date of Birth *"
                value={formatDate(formData.dateOfBirth)}
                mode="outlined"
                style={styles.input}
                editable={false}
                error={!!errors.dateOfBirth}
                left={<TextInput.Icon icon="calendar" />}
                right={<TextInput.Icon icon="chevron-down" />}
              />
            </TouchableOpacity>
            <HelperText type="error" visible={!!errors.dateOfBirth}>
              {errors.dateOfBirth}
            </HelperText>

            {/* Gender */}
            <Text variant="bodyMedium" style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
              Gender
            </Text>
            <SegmentedControl
              options={genderOptions}
              selectedValue={formData.gender}
              onValueChange={(value) => updateFormData('gender', value)}
              style={styles.segmentedControlMargin}
            />
          </Card.Content>
        </Card>

        {/* Physical Characteristics */}
        <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              📏 Physical Characteristics
            </Text>

            {/* Weight */}
            <TextInput
              label="Weight (lbs)"
              value={formData.weight}
              onChangeText={(text) => updateFormData('weight', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="e.g., 25.5"
              error={!!errors.weight}
              left={<TextInput.Icon icon="scale" />}
            />
            <HelperText type="error" visible={!!errors.weight}>
              {errors.weight}
            </HelperText>

            {/* Color */}
            <TextInput
              label="Color"
              value={formData.color}
              onChangeText={(text) => updateFormData('color', text)}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Brown, Black and White, Tabby"
              left={<TextInput.Icon icon="color-palette" />}
            />
          </Card.Content>
        </Card>

        {/* Additional Information */}
        <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              🏷️ Additional Information
            </Text>

            {/* Microchip Number */}
            <TextInput
              label="Microchip Number"
              value={formData.microchipNumber}
              onChangeText={(text) => updateFormData('microchipNumber', text)}
              mode="outlined"
              style={styles.input}
              placeholder="15-digit microchip ID"
              maxLength={20}
              error={!!errors.microchipNumber}
              left={<TextInput.Icon icon="qr-code" />}
            />
            <HelperText type="error" visible={!!errors.microchipNumber}>
              {errors.microchipNumber}
            </HelperText>

            {/* Notes */}
            <TextInput
              label="Notes"
              value={formData.notes}
              onChangeText={(text) => updateFormData('notes', text)}
              mode="outlined"
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholder="Special notes about your pet (personality, habits, medical info, etc.)"
              maxLength={500}
              error={!!errors.notes}
              left={<TextInput.Icon icon="note-text" />}
            />
            <HelperText type="info" visible={!errors.notes}>
              {formData.notes.length}/500 characters
            </HelperText>
            <HelperText type="error" visible={!!errors.notes}>
              {errors.notes}
            </HelperText>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons */}
      <Surface style={[styles.actionBar, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="outlined"
          onPress={handleCancel}
          style={styles.cancelButton}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          loading={loading}
          disabled={loading || !hasChanges}
          icon="content-save"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Surface>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DatePickerModal
          visible={showDatePicker}
          date={formData.dateOfBirth}
          onConfirm={(date) => {
            updateFormData('dateOfBirth', date);
            setShowDatePicker(false);
          }}
          onDismiss={() => setShowDatePicker(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
};

// Simple date picker modal component
const DatePickerModal = ({ 
  visible, 
  date, 
  onConfirm, 
  onDismiss 
}: {
  visible: boolean;
  date: Date;
  onConfirm: (date: Date) => void;
  onDismiss: () => void;
}) => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(date);

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <Surface style={[styles.datePickerModal, { backgroundColor: theme.colors.surface }]}>
        <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
          Select Date of Birth
        </Text>
        
        {/* Simple date input - in a real app, you'd use @react-native-community/datetimepicker */}
        <TextInput
          label="Date"
          value={selectedDate.toISOString().split('T')[0]}
          onChangeText={(text) => {
            const newDate = new Date(text);
            if (!isNaN(newDate.getTime())) {
              setSelectedDate(newDate);
            }
          }}
          mode="outlined"
          style={styles.dateInput}
          placeholder="YYYY-MM-DD"
        />
        
        <View style={styles.modalActions}>
          <Button mode="text" onPress={onDismiss}>
            Cancel
          </Button>
          <Button mode="contained" onPress={() => onConfirm(selectedDate)}>
            Confirm
          </Button>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 48, // Balance the back button
  },
  headerActions: {
    width: 48,
    alignItems: 'flex-end',
  },
  changesChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  photoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    marginBottom: 8,
  },
  photoButton: {
    position: 'absolute',
    bottom: 8,
    right: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  photoLabel: {
    textAlign: 'center',
  },
  formCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 8,
  },
  textArea: {
    marginBottom: 8,
    minHeight: 100,
  },
  fieldLabel: {
    marginBottom: 8,
    marginTop: 16,
    fontWeight: '500',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  segmentedControlMargin: {
    marginBottom: 16,
  },
  segmentedOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRightWidth: 1,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
    elevation: 8,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  datePickerModal: {
    marginHorizontal: 32,
    padding: 24,
    borderRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  dateInput: {
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  errorTitle: {
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 10,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default EditPetScreen;