import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AnimeService from '../services/AnimeService';
import { Anime } from '../types';
import { useAnime } from '../contexts/AnimeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userAnimeList } = useAnime();
  const [currentSeasonAnime, setCurrentSeasonAnime] = useState<Anime[]>([]);
  const [topAnime, setTopAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const animeService = AnimeService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [currentSeason, top] = await Promise.all([
        animeService.getCurrentSeasonAnime(),
        animeService.getTopAnime(),
      ]);
      
      setCurrentSeasonAnime(currentSeason.data.slice(0, 10));
      setTopAnime(top.data.slice(0, 10));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigateToAnimeDetail = (anime: Anime) => {
    navigation.navigate('AnimeDetail' as never, { anime } as never);
  };

  const renderAnimeCard = (anime: Anime) => (
    <TouchableOpacity
      key={anime.mal_id}
      style={styles.animeCard}
      onPress={() => navigateToAnimeDetail(anime)}
    >
      <Image
        source={{ uri: anime.images.jpg.image_url }}
        style={styles.animeImage}
        resizeMode="cover"
      />
      <View style={styles.animeInfo}>
        <Text style={styles.animeTitle} numberOfLines={2}>
          {anime.title}
        </Text>
        <View style={styles.scoreContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.score}>{anime.score || 'N/A'}</Text>
        </View>
        <Text style={styles.status}>{anime.status}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMyAnimeSection = () => {
    const recentlyAdded = userAnimeList.slice(0, 5);
    
    if (recentlyAdded.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Anime</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('My Anime' as never)}
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recentlyAdded.map((userAnime) => renderAnimeCard(userAnime.anime))}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="refresh" size={50} color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading anime data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back, Otaku! 🎌</Text>
        <Text style={styles.subtitle}>Discover new episodes and trending anime</Text>
      </View>

      {renderMyAnimeSection()}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Season</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {currentSeasonAnime.map(renderAnimeCard)}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Airing</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {topAnime.map(renderAnimeCard)}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  seeAll: {
    fontSize: 16,
    color: '#FF6B6B',
  },
  animeCard: {
    width: CARD_WIDTH,
    marginLeft: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  animeImage: {
    width: '100%',
    height: CARD_WIDTH * 1.4,
  },
  animeInfo: {
    padding: 12,
  },
  animeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 18,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 10,
  },
});

export default HomeScreen;