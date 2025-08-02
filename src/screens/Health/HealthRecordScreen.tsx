import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Avatar,
  FAB,
  useTheme,
  ActivityIndicator,
  Chip,
  Surface,
  IconButton,
  Divider,
  Menu,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppContext } from '../../context/AppContext';
import { HealthRecord, Pet, Reminder } from '../../types';

const HealthRecordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { state, deleteHealthRecord, saveReminder } = useAppContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get record ID from route params
  const recordId = (route.params as any)?.recordId;
  const record = state.healthRecords.find(r => r.id === recordId);
  const pet = record ? state.pets.find(p => p.id === record.petId) : null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.tertiary;
      case 'scheduled':
        return theme.colors.primary;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'scheduled':
        return 'clock';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const handleEdit = () => {
    setMenuVisible(false);
    // Navigate to edit screen (would be implemented as EditHealthRecordScreen)
    Alert.alert(
      'Edit Record',
      'Edit functionality would open a form similar to AddHealthRecordScreen but pre-populated with existing data.',
      [{ text: 'OK' }]
    );
  };

  const handleDelete = () => {
    setMenuVisible(false);
    
    if (!record) return;

    Alert.alert(
      'Delete Health Record',
      `Are you sure you want to delete "${record.title}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteHealthRecord(record.id);
              Alert.alert(
                'Deleted',
                'Health record has been deleted successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation?.goBack?.()
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to delete health record. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    setMenuVisible(false);
    
    if (!record || !pet) return;

    const shareContent = `
🐾 ${pet.name}'s Health Record

📋 ${record.title}
📅 Date: ${formatDate(record.date)}
🏷️ Type: ${record.type.replace('_', ' ')}
🚨 Severity: ${record.severity}
📊 Status: ${record.status}

📄 Description:
${record.description}

${record.veterinarian ? `👨‍⚕️ Veterinarian: ${record.veterinarian}` : ''}
${record.clinic ? `🏥 Clinic: ${record.clinic}` : ''}
${record.cost ? `💰 Cost: $${record.cost}` : ''}
${record.nextDueDate ? `📅 Next Due: ${formatDate(record.nextDueDate)}` : ''}
${record.notes ? `📝 Notes: ${record.notes}` : ''}

Generated by Pet Wellness Tracker
    `.trim();

    try {
      await Share.share({
        message: shareContent,
        title: `${pet.name}'s Health Record - ${record.title}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share health record.');
    }
  };

  const handleSetReminder = async () => {
    setMenuVisible(false);

    if (!record || !pet || !record.nextDueDate) {
      Alert.alert(
        'No Due Date',
        'This record does not have a next due date set. Would you like to edit the record to add one?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Edit Record', onPress: handleEdit }
        ]
      );
      return;
    }

    try {
      const reminder: Reminder = {
        id: Date.now().toString(),
        petId: pet.id,
        title: `${record.title} - Follow-up`,
        description: `Follow-up for ${record.title} from ${formatDate(record.date)}`,
        type: record.type,
        scheduledDate: record.nextDueDate,
        isCompleted: false,
        createdAt: new Date(),
      };

      await saveReminder(reminder);

      Alert.alert(
        'Reminder Set',
        `A reminder has been set for ${formatDate(record.nextDueDate)} for "${record.title}".`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to set reminder. Please try again.');
    }
  };

  const handleCallClinic = () => {
    setMenuVisible(false);
    
    if (!record?.clinic) {
      Alert.alert('No Clinic', 'No clinic information available for this record.');
      return;
    }

    Alert.alert(
      'Call Clinic',
      `Would you like to call ${record.clinic}? (This would open the phone app in a real implementation)`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            // In a real app, you would use Linking.openURL(`tel:${phoneNumber}`)
            Alert.alert('Call Feature', 'Phone call functionality would be implemented here.');
          }
        }
      ]
    );
  };

  const getTimeSinceRecord = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getTimeUntilDue = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 7) return `Due in ${diffDays} days`;
    if (diffDays < 30) return `Due in ${Math.floor(diffDays / 7)} weeks`;
    if (diffDays < 365) return `Due in ${Math.floor(diffDays / 30)} months`;
    return `Due in ${Math.floor(diffDays / 365)} years`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
          Loading health record...
        </Text>
      </View>
    );
  }

  if (!record || !pet) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="document-text-outline" size={80} color={theme.colors.outline} />
        <Text variant="headlineSmall" style={[styles.errorTitle, { color: theme.colors.onBackground }]}>
          Record Not Found
        </Text>
        <Text variant="bodyLarge" style={[styles.errorSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          The health record you're looking for could not be found
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[getTypeColor(record.type), theme.colors.primary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="white"
            onPress={() => navigation?.goBack?.()}
          />
          <View style={styles.headerInfo}>
            <Text variant="headlineSmall" style={styles.headerTitle}>
              {record.title}
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              {pet.name} • {getTimeSinceRecord(record.date)}
            </Text>
          </View>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={24}
                iconColor="white"
                onPress={() => setMenuVisible(true)}
              />
            }
            contentStyle={{ backgroundColor: theme.colors.surface }}
          >
            <Menu.Item
              onPress={handleEdit}
              title="Edit Record"
              leadingIcon="pencil"
            />
            <Menu.Item
              onPress={handleShare}
              title="Share Record"
              leadingIcon="share"
            />
            <Menu.Item
              onPress={handleSetReminder}
              title="Set Reminder"
              leadingIcon="bell"
            />
            {record.clinic && (
              <Menu.Item
                onPress={handleCallClinic}
                title="Call Clinic"
                leadingIcon="phone"
              />
            )}
            <Divider />
            <Menu.Item
              onPress={handleDelete}
              title="Delete Record"
              leadingIcon="delete"
              titleStyle={{ color: theme.colors.error }}
            />
          </Menu>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Record Overview */}
        <Card style={[styles.overviewCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.overviewHeader}>
              <View style={styles.typeContainer}>
                <Ionicons
                  name={getTypeIcon(record.type)}
                  size={32}
                  color={getTypeColor(record.type)}
                />
                <Text variant="titleLarge" style={[styles.typeText, { color: getTypeColor(record.type) }]}>
                  {record.type.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              <View style={styles.statusContainer}>
                <Chip
                  icon={getStatusIcon(record.status)}
                  style={[styles.statusChip, { backgroundColor: getStatusColor(record.status) + '20' }]}
                  textStyle={{ color: getStatusColor(record.status), fontWeight: '600' }}
                >
                  {record.status.toUpperCase()}
                </Chip>
              </View>
            </View>

            <Text variant="headlineMedium" style={[styles.recordTitle, { color: theme.colors.onSurface }]}>
              {record.title}
            </Text>

            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar" size={16} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                  {formatDate(record.date)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time" size={16} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                  {getTimeSinceRecord(record.date)}
                </Text>
              </View>
              {record.cost && (
                <View style={styles.metaItem}>
                  <Ionicons name="cash" size={16} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodyMedium" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                    ${record.cost.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.severityContainer}>
              <Text variant="bodySmall" style={[styles.severityLabel, { color: theme.colors.onSurfaceVariant }]}>
                Severity Level
              </Text>
              <Chip
                style={[styles.severityChip, { backgroundColor: getSeverityColor(record.severity) + '20' }]}
                textStyle={{ color: getSeverityColor(record.severity), fontWeight: '600' }}
              >
                {record.severity.toUpperCase()}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Description */}
        <Card style={[styles.descriptionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              📄 Description
            </Text>
            <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurface }]}>
              {record.description}
            </Text>
          </Card.Content>
        </Card>

        {/* Medical Details */}
        {(record.veterinarian || record.clinic) && (
          <Card style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                🏥 Medical Details
              </Text>
              
              {record.veterinarian && (
                <View style={styles.detailItem}>
                  <Ionicons name="person" size={20} color={theme.colors.primary} />
                  <View style={styles.detailText}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Veterinarian
                    </Text>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                      {record.veterinarian}
                    </Text>
                  </View>
                </View>
              )}

              {record.clinic && (
                <View style={styles.detailItem}>
                  <Ionicons name="business" size={20} color={theme.colors.primary} />
                  <View style={styles.detailText}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Clinic/Hospital
                    </Text>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                      {record.clinic}
                    </Text>
                  </View>
                  {record.clinic && (
                    <IconButton
                      icon="phone"
                      size={20}
                      onPress={handleCallClinic}
                      style={styles.callButton}
                    />
                  )}
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Follow-up Information */}
        {record.nextDueDate && (
          <Card style={[styles.followupCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                📅 Follow-up Required
              </Text>
              
              <View style={styles.followupContent}>
                <View style={styles.followupInfo}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Next Due Date
                  </Text>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                    {formatDate(record.nextDueDate)}
                  </Text>
                  <Text 
                    variant="bodyMedium" 
                    style={{ 
                      color: record.nextDueDate < new Date() ? theme.colors.error : theme.colors.primary,
                      fontWeight: '500'
                    }}
                  >
                    {getTimeUntilDue(record.nextDueDate)}
                  </Text>
                </View>
                <Button
                  mode="contained"
                  onPress={handleSetReminder}
                  icon="bell"
                  style={styles.reminderButton}
                >
                  Set Reminder
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Additional Notes */}
        {record.notes && (
          <Card style={[styles.notesCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                📝 Additional Notes
              </Text>
              <Text variant="bodyLarge" style={[styles.notes, { color: theme.colors.onSurface }]}>
                {record.notes}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Record Metadata */}
        <Card style={[styles.metadataCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              ℹ️ Record Information
            </Text>
            
            <View style={styles.metadataGrid}>
              <View style={styles.metadataItem}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Record ID
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontFamily: 'monospace' }}>
                  {record.id}
                </Text>
              </View>
              
              <View style={styles.metadataItem}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Created On
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  {formatDateTime(record.createdAt)}
                </Text>
              </View>
              
              <View style={styles.metadataItem}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Pet
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  {pet.name}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={[styles.actionsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              ⚡ Quick Actions
            </Text>
            
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={[styles.actionItem, { backgroundColor: theme.colors.primaryContainer }]}
                onPress={handleEdit}
              >
                <Ionicons name="pencil" size={24} color={theme.colors.onPrimaryContainer} />
                <Text variant="bodyMedium" style={[styles.actionText, { color: theme.colors.onPrimaryContainer }]}>
                  Edit Record
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionItem, { backgroundColor: theme.colors.secondaryContainer }]}
                onPress={handleShare}
              >
                <Ionicons name="share" size={24} color={theme.colors.onSecondaryContainer} />
                <Text variant="bodyMedium" style={[styles.actionText, { color: theme.colors.onSecondaryContainer }]}>
                  Share Record
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionItem, { backgroundColor: theme.colors.tertiaryContainer }]}
                onPress={handleSetReminder}
              >
                <Ionicons name="bell" size={24} color={theme.colors.onTertiaryContainer} />
                <Text variant="bodyMedium" style={[styles.actionText, { color: theme.colors.onTertiaryContainer }]}>
                  Set Reminder
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionItem, { backgroundColor: theme.colors.errorContainer }]}
                onPress={handleDelete}
              >
                <Ionicons name="trash" size={24} color={theme.colors.onErrorContainer} />
                <Text variant="bodyMedium" style={[styles.actionText, { color: theme.colors.onErrorContainer }]}>
                  Delete Record
                </Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="pencil"
        label="Edit"
        style={[styles.fab, { backgroundColor: getTypeColor(record.type) }]}
        onPress={handleEdit}
      />
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
    paddingBottom: 20,
    paddingHorizontal: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  overviewCard: {
    marginHorizontal: 16,
    marginTop: -10,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 4,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    height: 32,
  },
  recordTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  severityLabel: {
    fontWeight: '500',
  },
  severityChip: {
    height: 28,
  },
  descriptionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  detailsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  followupCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  notesCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  metadataCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  description: {
    lineHeight: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailText: {
    flex: 1,
    marginLeft: 12,
  },
  callButton: {
    margin: 0,
  },
  followupContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  followupInfo: {
    flex: 1,
  },
  reminderButton: {
    marginLeft: 16,
  },
  notes: {
    lineHeight: 24,
  },
  metadataGrid: {
    gap: 16,
  },
  metadataItem: {
    marginBottom: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionItem: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
  },
  actionText: {
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  loadingText: {
    marginTop: 16,
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
    height: 100,
  },
});

export default HealthRecordScreen;