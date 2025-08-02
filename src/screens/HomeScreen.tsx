import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useTheme } from '../contexts/ThemeContext';
import { commonStyles } from '../utils/theme';
import { AniListApi } from '../services/anilistApi';
import { StorageService } from '../services/storageService';
import { NotificationService } from '../services/notificationService';
import AnimeCard from '../components/AnimeCard';
import { Anime, UserAnime, RootStackParamList } from '../types/index';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const styles = getStyles(theme);
  const common = commonStyles(theme);

  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [currentSeasonAnime, setCurrentSeasonAnime] = useState<Anime[]>([]);
  const [userAnimeList, setUserAnimeList] = useState<UserAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [trendingData, seasonData, userList] = await Promise.all([
        AniListApi.getTrendingAnime(1, 10),
        AniListApi.getCurrentSeasonAnime(1, 10),
        StorageService.getUserAnimeList(),
      ]);

      setTrendingAnime(trendingData.media);
      setCurrentSeasonAnime(seasonData.media);
      setUserAnimeList(userList);
    } catch (error) {
      console.error('Error loading home data:', error);
      Alert.alert('Error', 'Failed to load anime data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

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

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const renderAnimeCard = ({ item }: { item: Anime }) => (
    <AnimeCard
      anime={item}
      onPress={handleAnimePress}
      onToggleFavorite={handleToggleFavorite}
      isFavorite={isAnimeFavorite(item.id)}
    />
  );

  const renderSection = (title: string, data: Anime[], showViewAll: boolean = true) => (
    <View style={styles.section}>
      <View style={[common.rowBetween, styles.sectionHeader]}>
        <Text style={[common.subtitle, styles.sectionTitle]}>{title}</Text>
        {showViewAll && (
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={[common.textSecondary, styles.viewAllText]}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={data}
        renderItem={renderAnimeCard}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={[common.container, common.center]}>
        <Text style={common.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={common.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      <View style={styles.content}>
        <Text style={[common.title, styles.welcomeText]}>
          Welcome to Anime Episode Alert
        </Text>
        <Text style={[common.textSecondary, styles.subtitle]}>
          Stay updated with your favorite anime episodes
        </Text>

        {renderSection('Trending Now', trendingAnime)}
        {renderSection('This Season', currentSeasonAnime)}

        {userAnimeList.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[common.button, styles.myAnimeButton]}
              onPress={() => navigation.navigate('MyAnime')}
            >
              <Text style={common.buttonText}>
                View My Anime ({userAnimeList.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    content: {
      padding: theme.spacing.md,
    },
    welcomeText: {
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionHeader: {
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      flex: 1,
    },
    viewAllText: {
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.primary,
    },
    horizontalList: {
      paddingLeft: theme.spacing.md,
    },
    myAnimeButton: {
      marginTop: theme.spacing.md,
    },
  });

export default HomeScreen;