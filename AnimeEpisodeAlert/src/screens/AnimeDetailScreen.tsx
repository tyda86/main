import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Anime, Episode } from '../types';
import { useAnime } from '../contexts/AnimeContext';
import AnimeService from '../services/AnimeService';

const { width } = Dimensions.get('window');

interface RouteParams {
  anime: Anime;
}

const AnimeDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { anime } = route.params as RouteParams;
  const { addAnimeToList, removeAnimeFromList, isAnimeInList } = useAnime();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);

  const animeService = AnimeService.getInstance();
  const isInList = isAnimeInList(anime.mal_id);

  useEffect(() => {
    navigation.setOptions({
      title: anime.title.length > 20 ? anime.title.substring(0, 20) + '...' : anime.title,
    });
    loadEpisodes();
  }, [anime, navigation]);

  const loadEpisodes = async () => {
    try {
      setLoading(true);
      const episodeData = await animeService.getAnimeEpisodes(anime.mal_id);
      setEpisodes(episodeData.data.slice(0, 10)); // Show first 10 episodes
    } catch (error) {
      console.error('Error loading episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAnime = async () => {
    try {
      if (isInList) {
        await removeAnimeFromList(anime.mal_id);
        Alert.alert(
          'Removed',
          `${anime.title} has been removed from your list.`
        );
      } else {
        await addAnimeToList(anime);
        Alert.alert(
          'Added!',
          `${anime.title} has been added to your list with notifications enabled.`
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update your anime list.');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Image
        source={{ uri: anime.images.jpg.large_image_url }}
        style={styles.posterImage}
        resizeMode="cover"
      />
      <View style={styles.headerContent}>
        <Text style={styles.title}>{anime.title}</Text>
        {anime.title_english && anime.title_english !== anime.title && (
          <Text style={styles.englishTitle}>{anime.title_english}</Text>
        )}
        {anime.title_japanese && (
          <Text style={styles.japaneseTitle}>{anime.title_japanese}</Text>
        )}
        
        <View style={styles.metadata}>
          <View style={styles.metadataItem}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.metadataText}>{anime.score || 'N/A'}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="calendar" size={16} color="#8E8E93" />
            <Text style={styles.metadataText}>{anime.year || 'Unknown'}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="play" size={16} color="#8E8E93" />
            <Text style={styles.metadataText}>{anime.episodes || '?'} eps</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            isInList ? styles.removeButton : styles.addButton,
          ]}
          onPress={handleToggleAnime}
        >
          <Ionicons
            name={isInList ? "checkmark" : "add"}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>
            {isInList ? 'In My List' : 'Add to List'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGenres = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Genres</Text>
      <View style={styles.genresContainer}>
        {anime.genres.map((genre) => (
          <View key={genre.mal_id} style={styles.genreTag}>
            <Text style={styles.genreText}>{genre.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSynopsis = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Synopsis</Text>
      <Text style={styles.synopsis}>
        {anime.synopsis || 'No synopsis available.'}
      </Text>
    </View>
  );

  const renderInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Information</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={styles.infoValue}>{anime.status}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Episodes</Text>
          <Text style={styles.infoValue}>{anime.episodes || 'Unknown'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Score</Text>
          <Text style={styles.infoValue}>{anime.score || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Year</Text>
          <Text style={styles.infoValue}>{anime.year || 'Unknown'}</Text>
        </View>
        {anime.season && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Season</Text>
            <Text style={styles.infoValue}>{anime.season}</Text>
          </View>
        )}
        {anime.studios.length > 0 && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Studio</Text>
            <Text style={styles.infoValue}>{anime.studios[0].name}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEpisodes = () => {
    if (loading) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Episodes</Text>
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh" size={24} color="#FF6B6B" />
            <Text style={styles.loadingText}>Loading episodes...</Text>
          </View>
        </View>
      );
    }

    if (episodes.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Episodes</Text>
          <Text style={styles.noEpisodesText}>No episode information available</Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Episodes</Text>
        {episodes.map((episode, index) => (
          <View key={index} style={styles.episodeItem}>
            <View style={styles.episodeNumber}>
              <Text style={styles.episodeNumberText}>{episode.episode}</Text>
            </View>
            <View style={styles.episodeContent}>
              <Text style={styles.episodeTitle} numberOfLines={2}>
                {episode.title}
              </Text>
              {episode.aired && (
                <Text style={styles.episodeDate}>
                  Aired: {new Date(episode.aired).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderHeader()}
      {renderSynopsis()}
      {renderGenres()}
      {renderInfo()}
      {renderEpisodes()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#1C1C1E',
  },
  posterImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  englishTitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 3,
  },
  japaneseTitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 10,
  },
  metadata: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metadataText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 'auto',
  },
  addButton: {
    backgroundColor: '#FF6B6B',
  },
  removeButton: {
    backgroundColor: '#28A745',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  synopsis: {
    fontSize: 15,
    color: '#CCCCCC',
    lineHeight: 22,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginLeft: 10,
  },
  noEpisodesText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 20,
  },
  episodeItem: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  episodeNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  episodeNumberText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  episodeContent: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  episodeDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default AnimeDetailScreen;