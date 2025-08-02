import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
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
  Divider,
  ProgressBar,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppContext } from '../../context/AppContext';
import { HealthRecord, Pet, Reminder } from '../../types';

const HealthScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { state } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  useEffect(() => {
    // Set the first pet as selected by default
    if (state.pets.length > 0 && !selectedPet) {
      setSelectedPet(state.pets[0]);
    }
  }, [state.pets, selectedPet]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getHealthRecordsForPet = (petId: string) => {
    return state.healthRecords.filter(record => record.petId === petId);
  };

  const getRemindersForPet = (petId: string) => {
    return state.reminders.filter(reminder => reminder.petId === petId);
  };

  const getUpcomingReminders = (petId: string) => {
    const now = new Date();
    return state.reminders
      .filter(reminder => 
        reminder.petId === petId && 
        reminder.scheduledDate > now && 
        !reminder.isCompleted
      )
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
      .slice(0, 3);
  };

  const getOverdueItems = (petId: string) => {
    const now = new Date();
    return state.healthRecords
      .filter(record => 
        record.petId === petId &&
        record.nextDueDate && 
        record.nextDueDate < now && 
        record.status !== 'completed'
      )
      .slice(0, 3);
  };

  const getRecentRecords = (petId: string) => {
    return state.healthRecords
      .filter(record => record.petId === petId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRecordTypeIcon = (type: string) => {
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

  const getRecordTypeColor = (type: string) => {
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

  const getSeverityColor = (severity?: string) => {
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

  const getHealthStats = (petId: string) => {
    const records = getHealthRecordsForPet(petId);
    const vaccinations = records.filter(r => r.type === 'vaccination').length;
    const medications = records.filter(r => r.type === 'medication').length;
    const vetVisits = records.filter(r => r.type === 'vet_visit').length;
    const totalRecords = records.length;

    return { vaccinations, medications, vetVisits, totalRecords };
  };

  if (state.isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
          Loading health records...
        </Text>
      </View>
    );
  }

  if (state.pets.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="medical-outline" size={80} color={theme.colors.outline} />
        <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
          No Pets Added Yet
        </Text>
        <Text variant="bodyLarge" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Add your first pet to start tracking their health records
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation?.navigate?.('AddPet')}
          style={styles.addButton}
          contentStyle={styles.addButtonContent}
        >
          Add Your First Pet
        </Button>
      </View>
    );
  }

  if (!selectedPet) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const healthStats = getHealthStats(selectedPet.id);
  const upcomingReminders = getUpcomingReminders(selectedPet.id);
  const overdueItems = getOverdueItems(selectedPet.id);
  const recentRecords = getRecentRecords(selectedPet.id);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with Pet Selector */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.headerGradient}
        >
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Health Tracker 🏥
          </Text>
          
          {/* Pet Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.petSelector}
          >
            {state.pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                onPress={() => setSelectedPet(pet)}
                style={[
                  styles.petSelectorItem,
                  {
                    backgroundColor: selectedPet?.id === pet.id 
                      ? 'rgba(255, 255, 255, 0.3)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    borderColor: selectedPet?.id === pet.id 
                      ? 'white' 
                      : 'transparent',
                  }
                ]}
              >
                <Avatar.Icon
                  size={40}
                  icon="paw"
                  style={styles.petSelectorAvatar}
                />
                <Text variant="bodyMedium" style={styles.petSelectorName}>
                  {pet.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>

        {/* Health Stats */}
        <View style={styles.statsContainer}>
          <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="medical" size={24} color={theme.colors.tertiary} />
            <Text variant="titleLarge" style={{ color: theme.colors.tertiary }}>
              {healthStats.vaccinations}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Vaccinations
            </Text>
          </Surface>
          
          <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="pill" size={24} color={theme.colors.secondary} />
            <Text variant="titleLarge" style={{ color: theme.colors.secondary }}>
              {healthStats.medications}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Medications
            </Text>
          </Surface>
          
          <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="business" size={24} color={theme.colors.primary} />
            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
              {healthStats.vetVisits}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Vet Visits
            </Text>
          </Surface>
          
          <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="document-text" size={24} color={theme.colors.outline} />
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
              {healthStats.totalRecords}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Total Records
            </Text>
          </Surface>
        </View>

        {/* Overdue Items Alert */}
        {overdueItems.length > 0 && (
          <>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.error }]}>
              ⚠️ Overdue Items
            </Text>
            {overdueItems.map((record) => (
              <Card
                key={record.id}
                style={[styles.overdueCard, { backgroundColor: theme.colors.errorContainer }]}
              >
                <Card.Content style={styles.overdueContent}>
                  <View style={styles.overdueInfo}>
                    <Ionicons
                      name="warning"
                      size={24}
                      color={theme.colors.error}
                    />
                    <View style={styles.overdueText}>
                      <Text variant="titleSmall" style={{ color: theme.colors.onErrorContainer }}>
                        {record.title}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onErrorContainer }}>
                        Due: {record.nextDueDate ? formatDate(record.nextDueDate) : 'N/A'}
                      </Text>
                    </View>
                  </View>
                  <Button
                    mode="contained"
                    onPress={() => navigation?.navigate?.('HealthRecord', { recordId: record.id })}
                    style={{ backgroundColor: theme.colors.error }}
                  >
                    Update
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </>
        )}

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              📅 Upcoming Reminders
            </Text>
            {upcomingReminders.map((reminder) => (
              <Card
                key={reminder.id}
                style={[styles.reminderCard, { backgroundColor: theme.colors.surface }]}
              >
                <Card.Content style={styles.reminderContent}>
                  <View style={styles.reminderInfo}>
                    <Ionicons
                      name="time"
                      size={24}
                      color={theme.colors.primary}
                    />
                    <View style={styles.reminderText}>
                      <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                        {reminder.title}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {formatDateTime(reminder.scheduledDate)}
                      </Text>
                      {reminder.description && (
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {reminder.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Chip
                    icon={getRecordTypeIcon(reminder.type)}
                    style={[styles.typeChip, { backgroundColor: getRecordTypeColor(reminder.type) + '20' }]}
                    textStyle={{ color: getRecordTypeColor(reminder.type) }}
                  >
                    {reminder.type.replace('_', ' ')}
                  </Chip>
                </Card.Content>
              </Card>
            ))}
          </>
        )}

        {/* Recent Health Records */}
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            📋 Recent Records
          </Text>
          <Button
            mode="text"
            onPress={() => {
              // Navigate to full health records list
              console.log('View all records');
            }}
          >
            View All
          </Button>
        </View>

        {recentRecords.length === 0 ? (
          <Card style={[styles.emptyRecordsCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.emptyRecordsContent}>
              <Ionicons name="document-text-outline" size={48} color={theme.colors.outline} />
              <Text variant="titleMedium" style={[styles.emptyRecordsTitle, { color: theme.colors.onSurface }]}>
                No Health Records Yet
              </Text>
              <Text variant="bodyMedium" style={[styles.emptyRecordsSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Start tracking {selectedPet.name}'s health by adding their first record
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation?.navigate?.('AddHealthRecord', { petId: selectedPet.id })}
                style={styles.addRecordButton}
              >
                Add First Record
              </Button>
            </Card.Content>
          </Card>
        ) : (
          recentRecords.map((record) => (
            <Card
              key={record.id}
              style={[styles.recordCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation?.navigate?.('HealthRecord', { recordId: record.id })}
            >
              <Card.Content style={styles.recordContent}>
                <View style={styles.recordHeader}>
                  <View style={styles.recordInfo}>
                    <Ionicons
                      name={getRecordTypeIcon(record.type)}
                      size={24}
                      color={getRecordTypeColor(record.type)}
                    />
                    <View style={styles.recordText}>
                      <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                        {record.title}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {formatDate(record.date)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.recordBadges}>
                    <Chip
                      style={[styles.typeChip, { backgroundColor: getRecordTypeColor(record.type) + '20' }]}
                      textStyle={{ color: getRecordTypeColor(record.type) }}
                    >
                      {record.type.replace('_', ' ')}
                    </Chip>
                    {record.severity && (
                      <Chip
                        style={[styles.severityChip, { backgroundColor: getSeverityColor(record.severity) + '20' }]}
                        textStyle={{ color: getSeverityColor(record.severity) }}
                      >
                        {record.severity}
                      </Chip>
                    )}
                  </View>
                </View>
                
                {record.description && (
                  <Text
                    variant="bodyMedium"
                    style={[styles.recordDescription, { color: theme.colors.onSurfaceVariant }]}
                    numberOfLines={2}
                  >
                    {record.description}
                  </Text>
                )}
                
                {record.nextDueDate && (
                  <View style={styles.nextDueContainer}>
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodySmall" style={[styles.nextDueText, { color: theme.colors.onSurfaceVariant }]}>
                      Next due: {formatDate(record.nextDueDate)}
                    </Text>
                  </View>
                )}
                
                {record.veterinarian && (
                  <View style={styles.vetContainer}>
                    <Ionicons name="person-outline" size={16} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodySmall" style={[styles.vetText, { color: theme.colors.onSurfaceVariant }]}>
                      {record.veterinarian}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
        )}

        {/* Quick Actions */}
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          ⚡ Quick Actions
        </Text>
        
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: theme.colors.tertiaryContainer }]}
            onPress={() => navigation?.navigate?.('AddHealthRecord', { petId: selectedPet.id })}
          >
            <Ionicons name="add-circle" size={32} color={theme.colors.onTertiaryContainer} />
            <Text variant="titleSmall" style={[styles.quickActionText, { color: theme.colors.onTertiaryContainer }]}>
              Add Record
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: theme.colors.primaryContainer }]}
            onPress={() => navigation?.navigate?.('AIAnalysis', { petId: selectedPet.id })}
          >
            <Ionicons name="camera" size={32} color={theme.colors.onPrimaryContainer} />
            <Text variant="titleSmall" style={[styles.quickActionText, { color: theme.colors.onPrimaryContainer }]}>
              AI Health Scan
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: theme.colors.secondaryContainer }]}
            onPress={() => {
              // Navigate to reminders
              console.log('Set reminder');
            }}
          >
            <Ionicons name="alarm" size={32} color={theme.colors.onSecondaryContainer} />
            <Text variant="titleSmall" style={[styles.quickActionText, { color: theme.colors.onSecondaryContainer }]}>
              Set Reminder
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        label="Add Record"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation?.navigate?.('AddHealthRecord', { petId: selectedPet.id })}
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
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  petSelector: {
    marginTop: 8,
  },
  petSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  petSelectorAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 8,
  },
  petSelectorName: {
    color: 'white',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -20,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 2,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  overdueCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  overdueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overdueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  overdueText: {
    marginLeft: 12,
    flex: 1,
  },
  reminderCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderText: {
    marginLeft: 12,
    flex: 1,
  },
  emptyRecordsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
  },
  emptyRecordsContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyRecordsTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyRecordsSubtitle: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  addRecordButton: {
    borderRadius: 8,
  },
  recordCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  recordContent: {
    paddingVertical: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordText: {
    marginLeft: 12,
    flex: 1,
  },
  recordBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    height: 28,
  },
  severityChip: {
    height: 28,
  },
  recordDescription: {
    marginTop: 8,
    lineHeight: 20,
  },
  nextDueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  nextDueText: {
    marginLeft: 4,
  },
  vetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  vetText: {
    marginLeft: 4,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  quickActionCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
  },
  quickActionText: {
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
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
  emptyTitle: {
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  addButton: {
    marginTop: 10,
  },
  addButtonContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default HealthScreen;