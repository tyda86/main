import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
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
  IconButton,
  ProgressBar,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppContext } from '../../context/AppContext';
import { Pet, HealthRecord, Reminder, AIAnalysis } from '../../types';

const { width } = Dimensions.get('window');

const PetProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { state, deletePet } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'health' | 'ai'>('overview');

  // Get pet ID from route params or use first pet
  const petId = (route.params as any)?.petId || state.pets[0]?.id;
  const pet = state.pets.find(p => p.id === petId);

  useEffect(() => {
    if (!pet && state.pets.length > 0) {
      // If pet not found but pets exist, navigate to first pet
      navigation?.setParams?.({ petId: state.pets[0].id });
    }
  }, [pet, state.pets, navigation]);

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

  const getAIAnalysesForPet = (petId: string) => {
    return state.aiAnalyses.filter(analysis => analysis.petId === petId);
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

  const getRecentHealthRecords = (petId: string) => {
    return state.healthRecords
      .filter(record => record.petId === petId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 3);
  };

  const getLatestAIAnalysis = (petId: string) => {
    return state.aiAnalyses
      .filter(analysis => analysis.petId === petId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let years = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      years--;
    }
    
    if (years < 1) {
      const months = monthDiff >= 0 ? monthDiff : 12 + monthDiff;
      return months === 1 ? '1 month' : `${months} months`;
    }
    
    return years === 1 ? '1 year' : `${years} years`;
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

  const getHealthScore = (petId: string) => {
    const latestAnalysis = getLatestAIAnalysis(petId);
    return latestAnalysis?.healthScore || 0;
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.tertiary;
    if (score >= 60) return '#FFA500';
    if (score >= 40) return '#FF6B35';
    return theme.colors.error;
  };

  const handleDeletePet = () => {
    if (!pet) return;

    Alert.alert(
      'Delete Pet',
      `Are you sure you want to delete ${pet.name}? This will permanently remove all health records, reminders, and AI analyses for this pet.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePet(pet.id);
            if (state.pets.length <= 1) {
              // If this was the last pet, navigate to add pet screen
              navigation?.navigate?.('AddPet');
            } else {
              // Navigate to another pet or back
              navigation?.goBack?.();
            }
          },
        },
      ]
    );
  };

  if (state.isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
          Loading pet profile...
        </Text>
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="paw-outline" size={80} color={theme.colors.outline} />
        <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
          Pet Not Found
        </Text>
        <Text variant="bodyLarge" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
          The requested pet profile could not be found
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

  const healthRecords = getHealthRecordsForPet(pet.id);
  const reminders = getRemindersForPet(pet.id);
  const aiAnalyses = getAIAnalysesForPet(pet.id);
  const upcomingReminders = getUpcomingReminders(pet.id);
  const recentRecords = getRecentHealthRecords(pet.id);
  const latestAnalysis = getLatestAIAnalysis(pet.id);
  const healthScore = getHealthScore(pet.id);

  const renderOverviewTab = () => (
    <>
      {/* Basic Information */}
      <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            📋 Basic Information
          </Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="paw" size={20} color={theme.colors.primary} />
              <View style={styles.infoText}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Species</Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, textTransform: 'capitalize' }}>
                  {pet.species}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="heart" size={20} color={theme.colors.primary} />
              <View style={styles.infoText}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Breed</Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                  {pet.breed || 'Mixed'}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={20} color={theme.colors.primary} />
              <View style={styles.infoText}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Age</Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                  {calculateAge(pet.dateOfBirth)}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="male-female" size={20} color={theme.colors.primary} />
              <View style={styles.infoText}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Gender</Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, textTransform: 'capitalize' }}>
                  {pet.gender}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="scale" size={20} color={theme.colors.primary} />
              <View style={styles.infoText}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Weight</Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                  {pet.weight ? `${pet.weight} lbs` : 'Not recorded'}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="color-palette" size={20} color={theme.colors.primary} />
              <View style={styles.infoText}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Color</Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                  {pet.color || 'Not specified'}
                </Text>
              </View>
            </View>
          </View>

          {pet.microchipNumber && (
            <View style={[styles.microchipContainer, { backgroundColor: theme.colors.primaryContainer }]}>
              <Ionicons name="qr-code" size={20} color={theme.colors.onPrimaryContainer} />
              <View style={styles.microchipText}>
                <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>
                  Microchip ID
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer, fontFamily: 'monospace' }}>
                  {pet.microchipNumber}
                </Text>
              </View>
            </View>
          )}

          {pet.notes && (
            <View style={styles.notesContainer}>
              <Text variant="bodySmall" style={[styles.notesLabel, { color: theme.colors.onSurfaceVariant }]}>
                Notes
              </Text>
              <Text variant="bodyMedium" style={[styles.notesText, { color: theme.colors.onSurface }]}>
                {pet.notes}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Health Summary */}
      <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            🏥 Health Summary
          </Text>
          
          <View style={styles.statsRow}>
            <View style={[styles.statItem, { backgroundColor: theme.colors.tertiaryContainer }]}>
              <Text variant="titleMedium" style={{ color: theme.colors.onTertiaryContainer }}>
                {healthRecords.length}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onTertiaryContainer }}>
                Health Records
              </Text>
            </View>
            
            <View style={[styles.statItem, { backgroundColor: theme.colors.primaryContainer }]}>
              <Text variant="titleMedium" style={{ color: theme.colors.onPrimaryContainer }}>
                {reminders.length}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>
                Reminders
              </Text>
            </View>
            
            <View style={[styles.statItem, { backgroundColor: theme.colors.secondaryContainer }]}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSecondaryContainer }}>
                {aiAnalyses.length}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSecondaryContainer }}>
                AI Scans
              </Text>
            </View>
          </View>

          {healthScore > 0 && (
            <View style={styles.healthScoreContainer}>
              <View style={styles.healthScoreHeader}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  Health Score
                </Text>
                <Text variant="titleLarge" style={{ color: getHealthScoreColor(healthScore) }}>
                  {healthScore}/100
                </Text>
              </View>
              <ProgressBar
                progress={healthScore / 100}
                color={getHealthScoreColor(healthScore)}
                style={styles.healthScoreBar}
              />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                Based on latest AI analysis
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={[styles.actionsCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            ⚡ Quick Actions
          </Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionItem, { backgroundColor: theme.colors.tertiaryContainer }]}
              onPress={() => navigation?.navigate?.('AddHealthRecord', { petId: pet.id })}
            >
              <Ionicons name="add-circle" size={28} color={theme.colors.onTertiaryContainer} />
              <Text variant="bodyMedium" style={[styles.quickActionText, { color: theme.colors.onTertiaryContainer }]}>
                Add Health Record
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionItem, { backgroundColor: theme.colors.primaryContainer }]}
              onPress={() => navigation?.navigate?.('AIAnalysis', { petId: pet.id })}
            >
              <Ionicons name="camera" size={28} color={theme.colors.onPrimaryContainer} />
              <Text variant="bodyMedium" style={[styles.quickActionText, { color: theme.colors.onPrimaryContainer }]}>
                AI Health Scan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionItem, { backgroundColor: theme.colors.secondaryContainer }]}
              onPress={() => {
                // Navigate to edit pet
                navigation?.navigate?.('EditPet', { petId: pet.id });
              }}
            >
              <Ionicons name="create" size={28} color={theme.colors.onSecondaryContainer} />
              <Text variant="bodyMedium" style={[styles.quickActionText, { color: theme.colors.onSecondaryContainer }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionItem, { backgroundColor: theme.colors.errorContainer }]}
              onPress={handleDeletePet}
            >
              <Ionicons name="trash" size={28} color={theme.colors.onErrorContainer} />
              <Text variant="bodyMedium" style={[styles.quickActionText, { color: theme.colors.onErrorContainer }]}>
                Delete Pet
              </Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </>
  );

  const renderHealthTab = () => (
    <>
      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              📅 Upcoming Reminders
            </Text>
            {upcomingReminders.map((reminder) => (
              <Surface
                key={reminder.id}
                style={[styles.reminderItem, { backgroundColor: theme.colors.surfaceVariant }]}
              >
                <View style={styles.reminderContent}>
                  <Ionicons
                    name={getRecordTypeIcon(reminder.type)}
                    size={24}
                    color={getRecordTypeColor(reminder.type)}
                  />
                  <View style={styles.reminderText}>
                    <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                      {reminder.title}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {formatDateTime(reminder.scheduledDate)}
                    </Text>
                  </View>
                  <Chip
                    style={[styles.reminderChip, { backgroundColor: getRecordTypeColor(reminder.type) + '20' }]}
                    textStyle={{ color: getRecordTypeColor(reminder.type) }}
                  >
                    {reminder.type.replace('_', ' ')}
                  </Chip>
                </View>
              </Surface>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Recent Health Records */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              📋 Recent Health Records
            </Text>
            <Button
              mode="text"
              onPress={() => {
                // Navigate to all health records
                console.log('View all health records');
              }}
            >
              View All
            </Button>
          </View>
          
          {recentRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={theme.colors.outline} />
              <Text variant="titleMedium" style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>
                No Health Records
              </Text>
              <Text variant="bodyMedium" style={[styles.emptyStateSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Start tracking {pet.name}'s health by adding their first record
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation?.navigate?.('AddHealthRecord', { petId: pet.id })}
                style={styles.emptyStateButton}
              >
                Add First Record
              </Button>
            </View>
          ) : (
            recentRecords.map((record) => (
              <Surface
                key={record.id}
                style={[styles.recordItem, { backgroundColor: theme.colors.surfaceVariant }]}
              >
                <TouchableOpacity
                  onPress={() => navigation?.navigate?.('HealthRecord', { recordId: record.id })}
                >
                  <View style={styles.recordContent}>
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
                      {record.description && (
                        <Text
                          variant="bodySmall"
                          style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
                          numberOfLines={1}
                        >
                          {record.description}
                        </Text>
                      )}
                    </View>
                    <Chip
                      style={[styles.recordChip, { backgroundColor: getRecordTypeColor(record.type) + '20' }]}
                      textStyle={{ color: getRecordTypeColor(record.type) }}
                    >
                      {record.type.replace('_', ' ')}
                    </Chip>
                  </View>
                </TouchableOpacity>
              </Surface>
            ))
          )}
        </Card.Content>
      </Card>
    </>
  );

  const renderAITab = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          🤖 AI Health Analysis
        </Text>
        
        {latestAnalysis ? (
          <View>
            <View style={styles.aiScoreContainer}>
              <Text variant="headlineSmall" style={{ color: getHealthScoreColor(latestAnalysis.healthScore) }}>
                {latestAnalysis.healthScore}/100
              </Text>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                Overall Health Score
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Analyzed on {formatDate(latestAnalysis.timestamp)}
              </Text>
            </View>

            {latestAnalysis.detectedIssues.length > 0 && (
              <View style={styles.issuesContainer}>
                <Text variant="titleMedium" style={[styles.issuesTitle, { color: theme.colors.onSurface }]}>
                  Detected Issues
                </Text>
                {latestAnalysis.detectedIssues.map((issue, index) => (
                  <Chip
                    key={index}
                    style={[styles.issueChip, { backgroundColor: theme.colors.errorContainer }]}
                    textStyle={{ color: theme.colors.onErrorContainer }}
                    icon="warning"
                  >
                    {issue}
                  </Chip>
                ))}
              </View>
            )}

            {latestAnalysis.recommendations.length > 0 && (
              <View style={styles.recommendationsContainer}>
                <Text variant="titleMedium" style={[styles.recommendationsTitle, { color: theme.colors.onSurface }]}>
                  Recommendations
                </Text>
                {latestAnalysis.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.tertiary} />
                    <Text variant="bodyMedium" style={[styles.recommendationText, { color: theme.colors.onSurface }]}>
                      {rec}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <Button
              mode="contained"
              onPress={() => navigation?.navigate?.('AIAnalysis', { petId: pet.id })}
              style={styles.newAnalysisButton}
              icon="camera"
            >
              New AI Scan
            </Button>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="camera-outline" size={48} color={theme.colors.outline} />
            <Text variant="titleMedium" style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>
              No AI Analysis Yet
            </Text>
            <Text variant="bodyMedium" style={[styles.emptyStateSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Take a photo of {pet.name} to get AI-powered health insights
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation?.navigate?.('AIAnalysis', { petId: pet.id })}
              style={styles.emptyStateButton}
              icon="camera"
            >
              Start AI Analysis
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with Pet Info */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.petHeader}>
              <Avatar.Icon
                size={80}
                icon="paw"
                style={[styles.petAvatar, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
              />
              <View style={styles.petInfo}>
                <Text variant="headlineMedium" style={styles.petName}>
                  {pet.name}
                </Text>
                <Text variant="titleMedium" style={styles.petDetails}>
                  {calculateAge(pet.dateOfBirth)} • {pet.species}
                </Text>
                <Text variant="bodyLarge" style={styles.petBreed}>
                  {pet.breed || 'Mixed Breed'}
                </Text>
              </View>
              <IconButton
                icon="create"
                size={24}
                iconColor="white"
                style={styles.editButton}
                onPress={() => navigation?.navigate?.('EditPet', { petId: pet.id })}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Tab Navigation */}
        <View style={[styles.tabContainer, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'overview' && { backgroundColor: theme.colors.primaryContainer }
            ]}
            onPress={() => setSelectedTab('overview')}
          >
            <Text
              variant="titleSmall"
              style={{
                color: selectedTab === 'overview' 
                  ? theme.colors.onPrimaryContainer 
                  : theme.colors.onSurfaceVariant
              }}
            >
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'health' && { backgroundColor: theme.colors.primaryContainer }
            ]}
            onPress={() => setSelectedTab('health')}
          >
            <Text
              variant="titleSmall"
              style={{
                color: selectedTab === 'health' 
                  ? theme.colors.onPrimaryContainer 
                  : theme.colors.onSurfaceVariant
              }}
            >
              Health
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'ai' && { backgroundColor: theme.colors.primaryContainer }
            ]}
            onPress={() => setSelectedTab('ai')}
          >
            <Text
              variant="titleSmall"
              style={{
                color: selectedTab === 'ai' 
                  ? theme.colors.onPrimaryContainer 
                  : theme.colors.onSurfaceVariant
              }}
            >
              AI Analysis
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {selectedTab === 'overview' && renderOverviewTab()}
          {selectedTab === 'health' && renderHealthTab()}
          {selectedTab === 'ai' && renderAITab()}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        label="Add Record"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation?.navigate?.('AddHealthRecord', { petId: pet.id })}
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  petAvatar: {
    marginRight: 16,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  petDetails: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  petBreed: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: -10,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabContent: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  infoCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  summaryCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  actionsCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  microchipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  microchipText: {
    marginLeft: 12,
  },
  notesContainer: {
    marginTop: 16,
  },
  notesLabel: {
    marginBottom: 4,
  },
  notesText: {
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  healthScoreContainer: {
    marginTop: 8,
  },
  healthScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthScoreBar: {
    height: 8,
    borderRadius: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionItem: {
    width: (width - 56) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
  },
  quickActionText: {
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  reminderItem: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  reminderText: {
    flex: 1,
    marginLeft: 12,
  },
  reminderChip: {
    height: 28,
  },
  recordItem: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  recordContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  recordText: {
    flex: 1,
    marginLeft: 12,
  },
  recordChip: {
    height: 28,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyStateButton: {
    borderRadius: 8,
  },
  aiScoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  issuesContainer: {
    marginBottom: 24,
  },
  issuesTitle: {
    marginBottom: 12,
  },
  issueChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  recommendationsContainer: {
    marginBottom: 24,
  },
  recommendationsTitle: {
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    marginLeft: 8,
    lineHeight: 20,
  },
  newAnalysisButton: {
    borderRadius: 8,
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
  backButton: {
    marginTop: 10,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default PetProfileScreen;