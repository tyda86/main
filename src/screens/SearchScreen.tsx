import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '@contexts/ThemeContext';
import { commonStyles } from '@utils/theme';
import { AniListApi } from '@services/anilistApi';
import { StorageService } from '@services/storageService';
import { NotificationService } from '@services/notificationService';
import AnimeCard from '@components/AnimeCard';
import { Anime, UserAnime, SearchFilters, RootStackParamList } from '@types/index';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const SearchScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const styles = getStyles(theme);
  const common = commonStyles(theme);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [userAnimeList, setUserAnimeList] = useState<UserAnime[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { label: 'All', value: undefined },
    { label: 'Releasing', value: 'RELEASING' },
    { label: 'Finished', value: 'FINISHED' },
    { label: 'Not Yet Released', value: 'NOT_YET_RELEASED' },
    { label: 'Cancelled', value: 'CANCELLED' },
    { label: 'Hiatus', value: 'HIATUS' },
  ];

  const genreOptions = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy',
    'Horror', 'Mahou Shoujo', 'Mecha', 'Music', 'Mystery', 'Psychological',
    'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
  ];

  const loadUserAnimeList = async () => {
    try {
      const userList = await StorageService.getUserAnimeList();
      setUserAnimeList(userList);
    } catch (error) {
      console.error('Error loading user anime list:', error);
    }
  };

  const searchAnime = async (query: string, searchFilters: SearchFilters = {}) => {
    if (!query.trim() && !searchFilters.status && !searchFilters.genre) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await AniListApi.searchAnime(query, 1, 20, searchFilters);
      setSearchResults(data.media);
    } catch (error) {
      console.error('Error searching anime:', error);
      Alert.alert('Error', 'Failed to search anime. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(() => {
    searchAnime(searchQuery, filters);
  }, [searchQuery, filters]);

  const handleAnimePress = (anime: Anime) => {
    navigation.navigate('AnimeDetails', { animeId: anime.id });
  };

  const handleToggleFavorite = async (anime: Anime) => {
    try {
      const existingAnime = userAnimeList.find(item => item.animeId === anime.id);

      if (existingAnime) {
        await StorageService.removeAnimeFromList(anime.id);
        NotificationService.cancelAnimeNotifications(anime.id);
        setUserAnimeList(prev => prev.filter(item => item.animeId !== anime.id));
      } else {
        const userAnime: UserAnime = {
          animeId: anime.id,
          anime: anime,
          addedAt: new Date().toISOString(),
          notificationsEnabled: true,
        };

        await StorageService.addAnimeToList(userAnime);
        setUserAnimeList(prev => [...prev, userAnime]);

        // Schedule notification if there's a next episode
        if (anime.nextAiringEpisode) {
          const episode = {
            number: anime.nextAiringEpisode.episode,
            airingAt: anime.nextAiringEpisode.airingAt,
            animeId: anime.id,
          };
          await NotificationService.scheduleEpisodeNotification(anime, episode);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update anime list.');
    }
  };

  const isAnimeFavorite = (animeId: number) => {
    return userAnimeList.some(item => item.animeId === animeId);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchResults([]);
  };

  const renderAnimeCard = ({ item }: { item: Anime }) => (
    <AnimeCard
      anime={item}
      onPress={handleAnimePress}
      onToggleFavorite={handleToggleFavorite}
      isFavorite={isAnimeFavorite(item.id)}
    />
  );

  const renderFilterChip = (label: string, isSelected: boolean, onPress: () => void) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        isSelected && { backgroundColor: theme.colors.primary }
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterChipText,
          isSelected && { color: '#FFFFFF' }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  useFocusEffect(
    useCallback(() => {
      loadUserAnimeList();
    }, [])
  );

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, filters]);

  return (
    <View style={common.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[common.input, styles.searchInput]}
            placeholder="Search anime..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Icon
              name="filter-list"
              size={20}
              color={showFilters ? theme.colors.primary : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterSection}>
              <Text style={[common.textSecondary, styles.filterLabel]}>Status:</Text>
              <FlatList
                data={statusOptions}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) =>
                  renderFilterChip(
                    item.label,
                    filters.status === item.value,
                    () => setFilters(prev => ({ ...prev, status: item.value }))
                  )
                }
                keyExtractor={(item) => item.label}
                contentContainerStyle={styles.filterChips}
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={[common.textSecondary, styles.filterLabel]}>Genre:</Text>
              <FlatList
                data={genreOptions}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) =>
                  renderFilterChip(
                    item,
                    filters.genre === item,
                    () => setFilters(prev => ({ 
                      ...prev, 
                      genre: filters.genre === item ? undefined : item 
                    }))
                  )
                }
                keyExtractor={(item) => item}
                contentContainerStyle={styles.filterChips}
              />
            </View>

            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
              <Text style={[common.textSecondary, styles.clearFiltersText]}>
                Clear Filters
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[common.textSecondary, styles.loadingText]}>Searching...</Text>
        </View>
      )}

      {!loading && searchResults.length === 0 && (searchQuery || filters.status || filters.genre) && (
        <View style={[common.center, styles.emptyContainer]}>
          <Icon name="search" size={48} color={theme.colors.textSecondary} />
          <Text style={[common.textSecondary, styles.emptyText]}>
            No anime found matching your search
          </Text>
        </View>
      )}

      {!loading && !searchQuery && !filters.status && !filters.genre && (
        <View style={[common.center, styles.emptyContainer]}>
          <Icon name="explore" size={48} color={theme.colors.textSecondary} />
          <Text style={[common.textSecondary, styles.emptyText]}>
            Search for anime or use filters to discover new shows
          </Text>
        </View>
      )}

      <FlatList
        data={searchResults}
        renderItem={renderAnimeCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    searchContainer: {
      backgroundColor: theme.colors.card,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      marginLeft: theme.spacing.sm,
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 0,
    },
    filterButton: {
      padding: theme.spacing.xs,
    },
    filtersContainer: {
      marginTop: theme.spacing.md,
    },
    filterSection: {
      marginBottom: theme.spacing.md,
    },
    filterLabel: {
      marginBottom: theme.spacing.sm,
      fontWeight: theme.fontWeight.medium,
    },
    filterChips: {
      paddingRight: theme.spacing.md,
    },
    filterChip: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterChipText: {
      color: theme.colors.text,
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.medium,
    },
    clearFiltersButton: {
      alignSelf: 'flex-start',
      padding: theme.spacing.sm,
    },
    clearFiltersText: {
      color: theme.colors.primary,
      fontWeight: theme.fontWeight.medium,
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    loadingText: {
      marginTop: theme.spacing.sm,
    },
    emptyContainer: {
      flex: 1,
      padding: theme.spacing.xl,
    },
    emptyText: {
      marginTop: theme.spacing.md,
      textAlign: 'center',
      lineHeight: 20,
    },
    resultsList: {
      padding: theme.spacing.md,
    },
  });

export default SearchScreen;