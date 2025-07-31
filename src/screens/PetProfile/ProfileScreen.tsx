import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAppContext } from '../../context/AppContext';
import { RootStackParamList, Pet } from '../../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const { state } = useAppContext();

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

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'dog':
        return 'dog';
      case 'cat':
        return 'cat';
      case 'bird':
        return 'bird';
      case 'rabbit':
        return 'rabbit';
      default:
        return 'paw';
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
          No Pets Yet
        </Text>
        <Text variant="bodyLarge" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Add your first pet to start tracking their health and wellness
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('AddPet')}
          style={styles.addButton}
          contentStyle={styles.addButtonContent}
        >
          Add Your First Pet
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          My Pets ({state.pets.length})
        </Text>

        {state.pets.map((pet) => (
          <Card
            key={pet.id}
            style={[styles.petCard, { backgroundColor: theme.colors.surface }]}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('PetProfile', { petId: pet.id })}
              style={styles.petCardTouchable}
            >
              <Card.Content style={styles.petCardContent}>
                <View style={styles.petInfo}>
                  <Avatar.Icon
                    size={70}
                    icon="paw"
                    style={styles.petAvatar}
                  />
                  <View style={styles.petDetails}>
                    <View style={styles.petNameRow}>
                      <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                        {pet.name}
                      </Text>
                      <Chip
                        icon={getSpeciesIcon(pet.species)}
                        style={[styles.speciesChip, { backgroundColor: theme.colors.primaryContainer }]}
                        textStyle={{ color: theme.colors.onPrimaryContainer }}
                        compact
                      >
                        {pet.species}
                      </Chip>
                    </View>
                    <Text variant="bodyLarge" style={[styles.breedText, { color: theme.colors.onSurfaceVariant }]}>
                      {pet.breed}
                    </Text>
                    <View style={styles.petStats}>
                      <View style={styles.statItem}>
                        <Ionicons name="calendar-outline" size={16} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodyMedium" style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                          {calculateAge(pet.dateOfBirth)} years old
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="scale-outline" size={16} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodyMedium" style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                          {pet.weight} lbs
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons 
                          name={pet.gender === 'male' ? 'male' : 'female'} 
                          size={16} 
                          color={theme.colors.onSurfaceVariant} 
                        />
                        <Text variant="bodyMedium" style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                          {pet.gender}
                        </Text>
                      </View>
                    </View>
                    {pet.color && (
                      <Text variant="bodySmall" style={[styles.colorText, { color: theme.colors.onSurfaceVariant }]}>
                        Color: {pet.color}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={theme.colors.onSurfaceVariant}
                />
              </Card.Content>
            </TouchableOpacity>

            <Card.Actions style={styles.cardActions}>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('EditPet', { petId: pet.id })}
                style={styles.actionButton}
                compact
              >
                Edit
              </Button>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('AIAnalysis', { petId: pet.id })}
                style={styles.actionButton}
                compact
              >
                AI Scan
              </Button>
            </Card.Actions>
          </Card>
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        label="Add Pet"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddPet')}
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
  sectionTitle: {
    marginHorizontal: 16,
    marginVertical: 16,
    fontWeight: 'bold',
  },
  petCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  petCardTouchable: {
    borderRadius: 12,
  },
  petCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
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
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  speciesChip: {
    height: 28,
  },
  breedText: {
    marginBottom: 8,
  },
  petStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
  },
  colorText: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingTop: 8,
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 8,
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

export default ProfileScreen;