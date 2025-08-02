import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AnimeService from '../services/AnimeService';
import { Anime } from '../types';
import { useAnime } from '../contexts/AnimeContext';

const SearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addAnimeToList, isAnimeInList } = useAnime();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const animeService = AnimeService.getInstance();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setHasSearched(true);
      const results = await animeService.searchAnime(searchQuery);
      setSearchResults(results.data);
    } catch (error) {
      console.error('Error searching anime:', error);
      Alert.alert('Error', 'Failed to search anime. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnime = async (anime: Anime) => {
    try {
      await addAnimeToList(anime);
      Alert.alert(
        'Success!',
        `${anime.title} has been added to your list with notifications enabled.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add anime to your list.');
    }
  };

  const navigateToAnimeDetail = (anime: Anime) => {
    navigation.navigate('AnimeDetail' as never, { anime } as never);
  };

  const renderAnimeItem = ({ item }: { item: Anime }) => {
    const isInList = isAnimeInList(item.mal_id);

    return (
      <TouchableOpacity
        style={styles.animeItem}
        onPress={() => navigateToAnimeDetail(item)}
      >
        <Image
          source={{ uri: item.images.jpg.image_url }}
          style={styles.animeImage}
          resizeMode="cover"
        />
        <View style={styles.animeDetails}>
          <Text style={styles.animeTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.title_english && (
            <Text style={styles.animeEnglishTitle} numberOfLines={1}>
              {item.title_english}
            </Text>
          )}
          <View style={styles.animeInfo}>
            <View style={styles.scoreContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.score}>{item.score || 'N/A'}</Text>
            </View>
            <Text style={styles.status}>{item.status}</Text>
          </View>
          {item.synopsis && (
            <Text style={styles.synopsis} numberOfLines={3}>
              {item.synopsis}
            </Text>
          )}
          <View style={styles.genres}>
            {item.genres.slice(0, 3).map((genre) => (
              <View key={genre.mal_id} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre.name}</Text>
              </View>
            ))}
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            isInList && styles.addButtonDisabled,
          ]}
          onPress={() => handleAddAnime(item)}
          disabled={isInList}
        >
          <Ionicons
            name={isInList ? "checkmark" : "add"}
            size={24}
            color={isInList ? "#28A745" : "#FFFFFF"}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="refresh" size={50} color="#FF6B6B" />
          <Text style={styles.emptyText}>Searching...</Text>
        </View>
      );
    }

    if (hasSearched && searchResults.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={50} color="#8E8E93" />
          <Text style={styles.emptyText}>No anime found</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="search" size={50} color="#8E8E93" />
        <Text style={styles.emptyText}>Search for anime</Text>
        <Text style={styles.emptySubtext}>
          Find your favorite anime and add them to your watchlist
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search anime..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
                setHasSearched(false);
              }}
            >
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={!searchQuery.trim() || loading}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={searchResults}
        renderItem={renderAnimeItem}
        keyExtractor={(item) => item.mal_id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: '#FFFFFF',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  animeItem: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  animeImage: {
    width: 100,
    height: 140,
  },
  animeDetails: {
    flex: 1,
    padding: 15,
  },
  animeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  animeEnglishTitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  animeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  score: {
    fontSize: 14,
    color: '#FFD700',
    marginLeft: 4,
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
    color: '#8E8E93',
  },
  synopsis: {
    fontSize: 13,
    color: '#CCCCCC',
    lineHeight: 18,
    marginBottom: 8,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  genreText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#FF6B6B',
  },
  addButtonDisabled: {
    backgroundColor: '#2C2C2E',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default SearchScreen;