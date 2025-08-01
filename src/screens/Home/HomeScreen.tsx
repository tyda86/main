import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Avatar,
  Chip,
  FAB,
  Surface,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppContext } from '../../context/AppContext';
import { RootStackParamList, Pet, HealthRecord, Reminder } from '../../types';
import AIService from '../../services/AIService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { state } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [careRecommendations, setCareRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (state.pets.length > 0) {
      generateRecommendations();
    }
  }, [state.pets, state.aiAnalyses]);

  const generateRecommendations = () => {
    const allRecommendations: string[] = [];
    
    state.pets.forEach(pet => {
      const petAnalyses = state.aiAnalyses.filter(analysis => analysis.petId === pet.id);
      const recommendations = AIService.generateCareRecommendations(pet, petAnalyses);
      allRecommendations.push(...recommendations);
    });

    // Remove duplicates and limit to 4 recommendations
    const uniqueRecommendations = [...new Set(allRecommendations)].slice(0, 4);
    setCareRecommendations(uniqueRecommendations);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      generateRecommendations();
      setRefreshing(false);
    }, 1000);
  }, []);

  const getUpcomingReminders = () => {
    const now = new Date();
    const upcoming = state.reminders
      .filter(reminder => reminder.scheduledDate > now && !reminder.isCompleted)
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
      .slice(0, 3);
    return upcoming;
  };

  const getOverdueHealthRecords = () => {
    const now = new Date();
    return state.healthRecords
      .filter(record => 
        record.nextDueDate && 
        record.nextDueDate < now && 
        record.status !== 'completed'
      )
      .slice(0, 3);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getHealthStatus = (pet: Pet) => {
    const recentAnalyses = state.aiAnalyses
      .filter(analysis => analysis.petId === pet.id)
      .sort((a, b) => b.analysisDate.getTime() - a.analysisDate.getTime());
    
    if (recentAnalyses.length === 0) {
      return { status: 'unknown', color: theme.colors.outline, score: null };
    }

    const latestScore = recentAnalyses[0].overallHealthScore;
    
    if (latestScore >= 85) {
      return { status: 'excellent', color: theme.colors.tertiary, score: latestScore };
    } else if (latestScore >= 70) {
      return { status: 'good', color: '#FFA500', score: latestScore };
    } else {
      return { status: 'needs attention', color: theme.colors.error, score: latestScore };
    }
  };

  if (state.isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
          Loading your pets...
        </Text>
      </View>
    );
  }

  if (state.pets.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="paw-outline" size={80} color={theme.colors.outline} />
        <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
          Welcome to Pet Wellness!
        </Text>
        <Text variant="bodyLarge" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Add your first pet to start tracking their health and wellness
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

  const upcomingReminders = getUpcomingReminders();
  const overdueRecords = getOverdueHealthRecords();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.headerGradient}
        >
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Good morning! 🌅
          </Text>
          <Text variant="bodyLarge" style={styles.headerSubtitle}>
            You have {state.pets.length} pet{state.pets.length !== 1 ? 's' : ''} to care for today
          </Text>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
              {state.pets.length}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Pets
            </Text>
          </Surface>
          <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text variant="titleLarge" style={{ color: theme.colors.secondary }}>
              {upcomingReminders.length}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Reminders
            </Text>
          </Surface>
          <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text variant="titleLarge" style={{ color: theme.colors.tertiary }}>
              {state.aiAnalyses.length}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              AI Scans
            </Text>
          </Surface>
        </View>

        {/* Pet Cards */}
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Your Pets
        </Text>
        {state.pets.map((pet) => {
          const healthStatus = getHealthStatus(pet);
          return (
            <Card
              key={pet.id}
              style={[styles.petCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('PetProfile', { petId: pet.id })}
            >
              <Card.Content style={styles.petCardContent}>
                <View style={styles.petInfo}>
                  <Avatar.Icon
                    size={60}
                    icon="paw"
                    style={styles.petAvatar}
                  />
                  <View style={styles.petDetails}>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                      {pet.name}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {pet.breed} • {calculateAge(pet.dateOfBirth)} years old
                    </Text>
                    <Chip
                      icon="heart"
                      style={[styles.healthChip, { backgroundColor: healthStatus.color + '20' }]}
                      textStyle={{ color: healthStatus.color }}
                    >
                      {healthStatus.status}
                      {healthStatus.score && ` (${healthStatus.score}%)`}
                    </Chip>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={theme.colors.onSurfaceVariant}
                />
              </Card.Content>
            </Card>
          );
        })}

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Upcoming Reminders
            </Text>
            {upcomingReminders.map((reminder) => {
              const pet = state.pets.find(p => p.id === reminder.petId);
              return (
                <Card
                  key={reminder.id}
                  style={[styles.reminderCard, { backgroundColor: theme.colors.surface }]}
                >
                  <Card.Content style={styles.reminderContent}>
                    <View style={styles.reminderInfo}>
                      <Ionicons
                        name="time-outline"
                        size={24}
                        color={theme.colors.primary}
                      />
                      <View style={styles.reminderText}>
                        <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                          {reminder.title}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {pet?.name} • {formatDate(reminder.scheduledDate)}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
          </>
        )}

        {/* Overdue Health Records */}
        {overdueRecords.length > 0 && (
          <>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.error }]}>
              Overdue Items
            </Text>
            {overdueRecords.map((record) => {
              const pet = state.pets.find(p => p.id === record.petId);
              return (
                <Card
                  key={record.id}
                  style={[styles.overdueCard, { backgroundColor: theme.colors.errorContainer }]}
                >
                  <Card.Content style={styles.reminderContent}>
                    <View style={styles.reminderInfo}>
                      <Ionicons
                        name="warning-outline"
                        size={24}
                        color={theme.colors.error}
                      />
                      <View style={styles.reminderText}>
                        <Text variant="titleSmall" style={{ color: theme.colors.onErrorContainer }}>
                          {record.title}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onErrorContainer }}>
                          {pet?.name} • Due: {record.nextDueDate ? formatDate(record.nextDueDate) : 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
          </>
        )}

        {/* Care Recommendations */}
        {careRecommendations.length > 0 && (
          <>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Care Recommendations
            </Text>
            <Card style={[styles.recommendationsCard, { backgroundColor: theme.colors.tertiaryContainer }]}>
              <Card.Content>
                {careRecommendations.map((recommendation, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Ionicons
                      name="bulb-outline"
                      size={20}
                      color={theme.colors.onTertiaryContainer}
                    />
                    <Text
                      variant="bodyMedium"
                      style={[styles.recommendationText, { color: theme.colors.onTertiaryContainer }]}
                    >
                      {recommendation}
                    </Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="camera"
        label="AI Scan"
        style={[styles.fab, { backgroundColor: theme.colors.secondary }]}
        onPress={() => {
          if (state.pets.length > 0) {
            navigation.navigate('AIAnalysis', { petId: state.pets[0].id });
          }
        }}
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
    paddingBottom: 30,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -20,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
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
  petCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  petCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  petAvatar: {
    marginRight: 16,
  },
  petDetails: {
    flex: 1,
  },
  healthChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  reminderCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
  },
  overdueCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
  },
  reminderContent: {
    paddingVertical: 12,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderText: {
    marginLeft: 12,
    flex: 1,
  },
  recommendationsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
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

export default HomeScreen;