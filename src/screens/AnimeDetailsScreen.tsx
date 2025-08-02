import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';
import { commonStyles } from '../utils/theme';
import { AniListApi } from '../services/anilistApi';
import { StorageService } from '../services/storageService';
import { NotificationService } from '../services/notificationService';
import { Anime, UserAnime, RootStackParamList } from '../types/index';

type AnimeDetailsRouteProp = RouteProp<RootStackParamList, 'AnimeDetails'>;

const { width } = Dimensions.get('window');

const AnimeDetailsScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<AnimeDetailsRouteProp>();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const common = commonStyles(theme);

  const { animeId } = route.params;

  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInList, setIsInList] = useState(false);
  const [userAnime, setUserAnime] = useState<UserAnime | null>(null);

  useEffect(() => {
    loadAnimeDetails();
    checkIfInList();
  }, [animeId]);

  const loadAnimeDetails = async () => {
    try {
      const animeData = await AniListApi.getAnimeById(animeId);
      setAnime(animeData);
    } catch (error) {
      console.error('Error loading anime details:', error);
      Alert.alert('Error', 'Failed to load anime details.');
    } finally {
      setLoading(false);
    }
  };

  const checkIfInList = async () => {
    try {
      const userAnimeList = await StorageService.getUserAnimeList();
      const existingAnime = userAnimeList.find(item => item.animeId === animeId);
      setIsInList(!!existingAnime);
      setUserAnime(existingAnime || null);
    } catch (error) {
      console.error('Error checking anime list:', error);
    }
  };

  const handleToggleList = async () => {
    if (!anime) return;

    try {
      if (isInList) {
        await StorageService.removeAnimeFromList(animeId);
        NotificationService.cancelAnimeNotifications(animeId);
        setIsInList(false);
        setUserAnime(null);
        Alert.alert('Removed', `${anime.title.english || anime.title.romaji} has been removed from your list.`);
      } else {
        const newUserAnime: UserAnime = {
          animeId: anime.id,
          anime: anime,
          addedAt: new Date().toISOString(),
          notificationsEnabled: true,
        };

        await StorageService.addAnimeToList(newUserAnime);
        setIsInList(true);
        setUserAnime(newUserAnime);

        // Schedule notification if there's a next episode
        if (anime.nextAiringEpisode) {
          const episode = {
            number: anime.nextAiringEpisode.episode,
            airingAt: anime.nextAiringEpisode.airingAt,
            animeId: anime.id,
          };
          await NotificationService.scheduleEpisodeNotification(anime, episode);
        }

        Alert.alert('Added', `${anime.title.english || anime.title.romaji} has been added to your list!`);
      }
    } catch (error) {
      console.error('Error toggling anime list:', error);
      Alert.alert('Error', 'Failed to update anime list.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RELEASING':
        return theme.colors.success;
      case 'FINISHED':
        return theme.colors.textSecondary;
      case 'NOT_YET_RELEASED':
        return theme.colors.warning;
      case 'CANCELLED':
        return theme.colors.error;
      case 'HIATUS':
        return theme.colors.info;
      default:
        return theme.colors.textSecondary;
    }
  };

  const formatNextEpisode = () => {
    if (!anime?.nextAiringEpisode) return null;

    const airingDate = new Date(anime.nextAiringEpisode.airingAt * 1000);
    const now = new Date();
    const timeDiff = airingDate.getTime() - now.getTime();

    if (timeDiff <= 0) {
      return `Episode ${anime.nextAiringEpisode.episode} has aired`;
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `Episode ${anime.nextAiringEpisode.episode} airs in ${days} day${days > 1 ? 's' : ''} and ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `Episode ${anime.nextAiringEpisode.episode} airs in ${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `Episode ${anime.nextAiringEpisode.episode} airs in ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  const cleanDescription = (description: string) => {
    return description
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]*;/g, '') // Remove HTML entities
      .trim();
  };

  if (loading) {
    return (
      <View style={[common.container, common.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[common.textSecondary, { marginTop: theme.spacing.md }]}>
          Loading anime details...
        </Text>
      </View>
    );
  }

  if (!anime) {
    return (
      <View style={[common.container, common.center]}>
        <Icon name="error" size={48} color={theme.colors.error} />
        <Text style={[common.textSecondary, { marginTop: theme.spacing.md }]}>
          Failed to load anime details
        </Text>
        <TouchableOpacity
          style={[common.button, { marginTop: theme.spacing.lg }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={common.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={common.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Image
          source={{ uri: anime.coverImage.large }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        <View style={styles.headerContent}>
          <Text style={[common.title, styles.title]} numberOfLines={2}>
            {anime.title.english || anime.title.romaji}
          </Text>
          {anime.title.native && (
            <Text style={[common.textSecondary, styles.nativeTitle]}>
              {anime.title.native}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.actionButton}>
          <TouchableOpacity
            style={[
              common.button,
              isInList && { backgroundColor: theme.colors.error }
            ]}
            onPress={handleToggleList}
          >
            <Icon
              name={isInList ? 'remove' : 'add'}
              size={20}
              color="#FFFFFF"
              style={{ marginRight: theme.spacing.sm }}
            />
            <Text style={common.buttonText}>
              {isInList ? 'Remove from List' : 'Add to List'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={common.textSecondary}>Status</Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(anime.status) }
                  ]}
                />
                <Text style={[common.text, { color: getStatusColor(anime.status) }]}>
                  {anime.status.replace('_', ' ')}
                </Text>
              </View>
            </View>

            {anime.episodes && (
              <View style={styles.infoItem}>
                <Text style={common.textSecondary}>Episodes</Text>
                <Text style={common.text}>{anime.episodes}</Text>
              </View>
            )}

            {anime.averageScore && (
              <View style={styles.infoItem}>
                <Text style={common.textSecondary}>Score</Text>
                <View style={styles.scoreContainer}>
                  <Icon name="star" size={16} color={theme.colors.warning} />
                  <Text style={[common.text, { marginLeft: theme.spacing.xs }]}>
                    {anime.averageScore}%
                  </Text>
                </View>
              </View>
            )}
          </View>

          {anime.season && anime.seasonYear && (
            <View style={styles.seasonInfo}>
              <Text style={common.textSecondary}>Season</Text>
              <Text style={common.text}>
                {anime.season} {anime.seasonYear}
              </Text>
            </View>
          )}

          {anime.nextAiringEpisode && (
            <View style={styles.nextEpisodeCard}>
              <Icon name="schedule" size={20} color={theme.colors.primary} />
              <Text style={[common.text, styles.nextEpisodeText]}>
                {formatNextEpisode()}
              </Text>
            </View>
          )}
        </View>

        {anime.genres && anime.genres.length > 0 && (
          <View style={styles.genresCard}>
            <Text style={[common.subtitle, styles.sectionTitle]}>Genres</Text>
            <View style={styles.genresContainer}>
              {anime.genres.map((genre, index) => (
                <View key={index} style={styles.genreChip}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {anime.description && (
          <View style={styles.descriptionCard}>
            <Text style={[common.subtitle, styles.sectionTitle]}>Description</Text>
            <Text style={[common.text, styles.description]}>
              {cleanDescription(anime.description)}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    header: {
      height: 300,
      position: 'relative',
    },
    coverImage: {
      width: '100%',
      height: '100%',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    headerContent: {
      position: 'absolute',
      bottom: theme.spacing.lg,
      left: theme.spacing.md,
      right: theme.spacing.md,
    },
    title: {
      color: '#FFFFFF',
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.bold,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    nativeTitle: {
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: theme.spacing.xs,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    content: {
      padding: theme.spacing.md,
    },
    actionButton: {
      marginBottom: theme.spacing.lg,
    },
    infoCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      ...theme.shadow,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    infoItem: {
      alignItems: 'center',
      flex: 1,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: theme.spacing.xs,
    },
    scoreContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
    },
    seasonInfo: {
      alignItems: 'center',
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    nextEpisodeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    nextEpisodeText: {
      marginLeft: theme.spacing.sm,
      flex: 1,
      color: theme.colors.primary,
      fontWeight: theme.fontWeight.medium,
    },
    genresCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      ...theme.shadow,
    },
    sectionTitle: {
      marginBottom: theme.spacing.md,
    },
    genresContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    genreChip: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    genreText: {
      color: '#FFFFFF',
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.medium,
    },
    descriptionCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      ...theme.shadow,
    },
    description: {
      lineHeight: 22,
    },
  });

export default AnimeDetailsScreen;