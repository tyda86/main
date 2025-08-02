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
  useTheme,
  ActivityIndicator,
  Card,
  HelperText,
  Chip,
  Surface,
  IconButton,
  Menu,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppContext } from '../../context/AppContext';
import { HealthRecord, Pet } from '../../types';

// Custom SegmentedControl component
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

const AddHealthRecordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { state, saveHealthRecord } = useAppContext();

  // Get pet ID from route params
  const petId = (route.params as any)?.petId || state.pets[0]?.id;
  const pet = state.pets.find(p => p.id === petId);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'vaccination' as 'vaccination' | 'medication' | 'vet_visit' | 'symptom' | 'behavior' | 'other',
    date: new Date(),
    description: '',
    veterinarian: '',
    clinic: '',
    severity: 'low' as 'low' | 'medium' | 'high' | 'critical',
    status: 'completed' as 'scheduled' | 'completed' | 'cancelled',
    nextDueDate: null as Date | null,
    cost: '',
    notes: '',
    attachments: [] as string[],
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNextDueDatePicker, setShowNextDueDatePicker] = useState(false);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [severityMenuVisible, setSeverityMenuVisible] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-populate title based on type for better UX
    if (field === 'type' && !formData.title.trim()) {
      const titleSuggestions = {
        vaccination: 'Annual Vaccination',
        medication: 'Medication Treatment',
        vet_visit: 'Veterinary Visit',
        symptom: 'Health Symptom',
        behavior: 'Behavior Observation',
        other: 'Health Record',
      };
      setFormData(prev => ({ ...prev, title: titleSuggestions[value] || '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Length limits
    if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less';
    }

    if (formData.veterinarian && formData.veterinarian.length > 100) {
      newErrors.veterinarian = 'Veterinarian name must be 100 characters or less';
    }

    if (formData.clinic && formData.clinic.length > 100) {
      newErrors.clinic = 'Clinic name must be 100 characters or less';
    }

    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = 'Notes must be 1000 characters or less';
    }

    // Cost validation
    if (formData.cost && !/^\d+(\.\d{1,2})?$/.test(formData.cost)) {
      newErrors.cost = 'Cost must be a valid amount (e.g., 50.00)';
    }

    if (formData.cost && (parseFloat(formData.cost) < 0 || parseFloat(formData.cost) > 10000)) {
      newErrors.cost = 'Cost must be between $0 and $10,000';
    }

    // Date validation
    const today = new Date();
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 5); // Max 5 years in future

    if (formData.date > maxFutureDate) {
      newErrors.date = 'Date cannot be more than 5 years in the future';
    }

    // Next due date validation
    if (formData.nextDueDate) {
      if (formData.nextDueDate <= formData.date) {
        newErrors.nextDueDate = 'Next due date must be after the record date';
      }

      if (formData.nextDueDate > maxFutureDate) {
        newErrors.nextDueDate = 'Next due date cannot be more than 5 years in the future';
      }
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
      const newRecord: HealthRecord = {
        id: Date.now().toString(), // Simple ID generation
        petId: pet.id,
        title: formData.title.trim(),
        type: formData.type,
        date: formData.date,
        description: formData.description.trim(),
        veterinarian: formData.veterinarian.trim() || undefined,
        clinic: formData.clinic.trim() || undefined,
        severity: formData.severity,
        status: formData.status,
        nextDueDate: formData.nextDueDate || undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        notes: formData.notes.trim() || undefined,
        attachments: formData.attachments,
        createdAt: new Date(),
      };

      await saveHealthRecord(newRecord);

      Alert.alert(
        'Success',
        'Health record added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation?.goBack?.()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save health record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Check if user has entered any data
    const hasData = 
      formData.title.trim() ||
      formData.description.trim() ||
      formData.veterinarian.trim() ||
      formData.clinic.trim() ||
      formData.cost.trim() ||
      formData.notes.trim();

    if (hasData) {
      Alert.alert(
        'Discard Record',
        'You have unsaved changes. Are you sure you want to discard this health record?',
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vaccination':
        return 'medical';
      case 'medication':
        return 'pill';
      case 'vet_visit':
        return 'business';
      case 'symptom':
        return 'warning';
      case 'behavior':
        return 'happy';
      default:
        return 'document-text';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vaccination':
        return theme.colors.tertiary;
      case 'medication':
        return theme.colors.secondary;
      case 'vet_visit':
        return theme.colors.primary;
      case 'symptom':
        return theme.colors.error;
      case 'behavior':
        return '#FFA500';
      default:
        return theme.colors.outline;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return theme.colors.error;
      case 'high':
        return '#FF6B35';
      case 'medium':
        return '#FFA500';
      case 'low':
        return theme.colors.tertiary;
      default:
        return theme.colors.outline;
    }
  };

  if (!pet) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="medical-outline" size={80} color={theme.colors.outline} />
        <Text variant="headlineSmall" style={[styles.errorTitle, { color: theme.colors.onBackground }]}>
          Pet Not Found
        </Text>
        <Text variant="bodyLarge" style={[styles.errorSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Please select a pet to add a health record
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

  const recordTypes = [
    { label: 'Vaccination', value: 'vaccination' },
    { label: 'Medication', value: 'medication' },
    { label: 'Vet Visit', value: 'vet_visit' },
    { label: 'Symptom', value: 'symptom' },
    { label: 'Behavior', value: 'behavior' },
    { label: 'Other', value: 'other' },
  ];

  const severityLevels = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
  ];

  const statusOptions = [
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
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
            Add Health Record
          </Text>
          <View style={styles.headerActions}>
            <Chip 
              style={styles.petChip}
              textStyle={{ color: 'white' }}
              icon="paw"
            >
              {pet.name}
            </Chip>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Record Type Selection */}
        <Card style={[styles.typeCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              📋 Record Type
            </Text>
            
            <View style={styles.typeGrid}>
              {recordTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor: formData.type === type.value 
                        ? getTypeColor(type.value) + '20'
                        : theme.colors.surfaceVariant,
                      borderColor: formData.type === type.value 
                        ? getTypeColor(type.value)
                        : theme.colors.outline,
                      borderWidth: formData.type === type.value ? 2 : 1,
                    }
                  ]}
                  onPress={() => updateFormData('type', type.value)}
                >
                  <Ionicons 
                    name={getTypeIcon(type.value)} 
                    size={24} 
                    color={formData.type === type.value 
                      ? getTypeColor(type.value)
                      : theme.colors.onSurfaceVariant
                    } 
                  />
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: formData.type === type.value 
                        ? getTypeColor(type.value)
                        : theme.colors.onSurfaceVariant,
                      fontWeight: formData.type === type.value ? '600' : '400',
                      marginTop: 4,
                      textAlign: 'center',
                    }}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Basic Information */}
        <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              📝 Basic Information
            </Text>

            {/* Title */}
            <TextInput
              label="Title *"
              value={formData.title}
              onChangeText={(text) => updateFormData('title', text)}
              mode="outlined"
              style={styles.input}
              error={!!errors.title}
              maxLength={100}
              placeholder={`${recordTypes.find(t => t.value === formData.type)?.label} for ${pet.name}`}
              left={<TextInput.Icon icon={getTypeIcon(formData.type)} />}
            />
            <HelperText type="error" visible={!!errors.title}>
              {errors.title}
            </HelperText>

            {/* Date */}
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                label="Date *"
                value={formatDate(formData.date)}
                mode="outlined"
                style={styles.input}
                editable={false}
                error={!!errors.date}
                left={<TextInput.Icon icon="calendar" />}
                right={<TextInput.Icon icon="chevron-down" />}
              />
            </TouchableOpacity>
            <HelperText type="error" visible={!!errors.date}>
              {errors.date}
            </HelperText>

            {/* Description */}
            <TextInput
              label="Description *"
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              mode="outlined"
              style={styles.textArea}
              multiline
              numberOfLines={4}
              error={!!errors.description}
              maxLength={1000}
              placeholder="Describe the health record details..."
              left={<TextInput.Icon icon="text" />}
            />
            <HelperText type="info" visible={!errors.description}>
              {formData.description.length}/1000 characters
            </HelperText>
            <HelperText type="error" visible={!!errors.description}>
              {errors.description}
            </HelperText>

            {/* Status */}
            <Text variant="bodyMedium" style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
              Status
            </Text>
            <SegmentedControl
              options={statusOptions}
              selectedValue={formData.status}
              onValueChange={(value) => updateFormData('status', value)}
              style={styles.segmentedControlMargin}
            />
          </Card.Content>
        </Card>

        {/* Medical Details */}
        <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              🏥 Medical Details
            </Text>

            {/* Veterinarian */}
            <TextInput
              label="Veterinarian"
              value={formData.veterinarian}
              onChangeText={(text) => updateFormData('veterinarian', text)}
              mode="outlined"
              style={styles.input}
              error={!!errors.veterinarian}
              maxLength={100}
              placeholder="Dr. Smith"
              left={<TextInput.Icon icon="account-heart" />}
            />
            <HelperText type="error" visible={!!errors.veterinarian}>
              {errors.veterinarian}
            </HelperText>

            {/* Clinic */}
            <TextInput
              label="Clinic/Hospital"
              value={formData.clinic}
              onChangeText={(text) => updateFormData('clinic', text)}
              mode="outlined"
              style={styles.input}
              error={!!errors.clinic}
              maxLength={100}
              placeholder="Animal Medical Center"
              left={<TextInput.Icon icon="hospital-building" />}
            />
            <HelperText type="error" visible={!!errors.clinic}>
              {errors.clinic}
            </HelperText>

            {/* Severity */}
            <Text variant="bodyMedium" style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
              Severity Level
            </Text>
            <View style={styles.severityContainer}>
              {severityLevels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.severityOption,
                    {
                      backgroundColor: formData.severity === level.value 
                        ? getSeverityColor(level.value) + '20'
                        : theme.colors.surfaceVariant,
                      borderColor: formData.severity === level.value 
                        ? getSeverityColor(level.value)
                        : theme.colors.outline,
                      borderWidth: formData.severity === level.value ? 2 : 1,
                    }
                  ]}
                  onPress={() => updateFormData('severity', level.value)}
                >
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: formData.severity === level.value 
                        ? getSeverityColor(level.value)
                        : theme.colors.onSurfaceVariant,
                      fontWeight: formData.severity === level.value ? '600' : '400',
                    }}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Cost */}
            <TextInput
              label="Cost"
              value={formData.cost}
              onChangeText={(text) => updateFormData('cost', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="decimal-pad"
              error={!!errors.cost}
              placeholder="0.00"
              left={<TextInput.Icon icon="currency-usd" />}
            />
            <HelperText type="error" visible={!!errors.cost}>
              {errors.cost}
            </HelperText>
          </Card.Content>
        </Card>

        {/* Follow-up & Notes */}
        <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              📅 Follow-up & Notes
            </Text>

            {/* Next Due Date */}
            <TouchableOpacity onPress={() => setShowNextDueDatePicker(true)}>
              <TextInput
                label="Next Due Date (Optional)"
                value={formData.nextDueDate ? formatDate(formData.nextDueDate) : ''}
                mode="outlined"
                style={styles.input}
                editable={false}
                error={!!errors.nextDueDate}
                placeholder="Set reminder for next visit/treatment"
                left={<TextInput.Icon icon="calendar-clock" />}
                right={
                  <TextInput.Icon 
                    icon={formData.nextDueDate ? "close" : "chevron-down"}
                    onPress={() => {
                      if (formData.nextDueDate) {
                        updateFormData('nextDueDate', null);
                      } else {
                        setShowNextDueDatePicker(true);
                      }
                    }}
                  />
                }
              />
            </TouchableOpacity>
            <HelperText type="error" visible={!!errors.nextDueDate}>
              {errors.nextDueDate}
            </HelperText>

            {/* Notes */}
            <TextInput
              label="Additional Notes"
              value={formData.notes}
              onChangeText={(text) => updateFormData('notes', text)}
              mode="outlined"
              style={styles.textArea}
              multiline
              numberOfLines={4}
              error={!!errors.notes}
              maxLength={1000}
              placeholder="Any additional observations, instructions, or important details..."
              left={<TextInput.Icon icon="note-text" />}
            />
            <HelperText type="info" visible={!errors.notes}>
              {formData.notes.length}/1000 characters
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
          disabled={loading}
          icon="content-save"
        >
          {loading ? 'Saving...' : 'Save Record'}
        </Button>
      </Surface>

      {/* Date Picker Modals */}
      {showDatePicker && (
        <DatePickerModal
          visible={showDatePicker}
          date={formData.date}
          onConfirm={(date) => {
            updateFormData('date', date);
            setShowDatePicker(false);
          }}
          onDismiss={() => setShowDatePicker(false)}
          title="Select Record Date"
        />
      )}

      {showNextDueDatePicker && (
        <DatePickerModal
          visible={showNextDueDatePicker}
          date={formData.nextDueDate || new Date()}
          onConfirm={(date) => {
            updateFormData('nextDueDate', date);
            setShowNextDueDatePicker(false);
          }}
          onDismiss={() => setShowNextDueDatePicker(false)}
          title="Select Next Due Date"
        />
      )}
    </KeyboardAvoidingView>
  );
};

// Date picker modal component
const DatePickerModal = ({ 
  visible, 
  date, 
  onConfirm, 
  onDismiss,
  title 
}: {
  visible: boolean;
  date: Date;
  onConfirm: (date: Date) => void;
  onDismiss: () => void;
  title: string;
}) => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(date);

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <Surface style={[styles.datePickerModal, { backgroundColor: theme.colors.surface }]}>
        <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        
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
    width: 80,
    alignItems: 'flex-end',
  },
  petChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  typeCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    minWidth: '30%',
    aspectRatio: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  severityContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  severityOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
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

export default AddHealthRecordScreen;