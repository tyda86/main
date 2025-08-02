import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@contexts/ThemeContext';
import { commonStyles } from '@utils/theme';
import { Anime } from '@types/index';

interface AnimeCardProps {
  anime: Anime;
  onPress: (anime: Anime) => void;
  onToggleFavorite?: (anime: Anime) => void;
  isFavorite?: boolean;
  showFavoriteButton?: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 cards per row with margins

const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  onPress,
  onToggleFavorite,
  isFavorite = false,
  showFavoriteButton = true,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme, cardWidth);
  const common = commonStyles(theme);

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
    if (!anime.nextAiringEpisode) return null;

    const airingDate = new Date(anime.nextAiringEpisode.airingAt * 1000);
    const now = new Date();
    const timeDiff = airingDate.getTime() - now.getTime();

    if (timeDiff <= 0) {
      return `Episode ${anime.nextAiringEpisode.episode} aired`;
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `Ep ${anime.nextAiringEpisode.episode} in ${days}d ${hours}h`;
    } else {
      return `Ep ${anime.nextAiringEpisode.episode} in ${hours}h`;
    }
  };

  return (
    <TouchableOpacity
      style={[common.card, styles.container]}
      onPress={() => onPress(anime)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: anime.coverImage.large }}
          style={styles.image}
          resizeMode="cover"
        />
        {showFavoriteButton && onToggleFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onToggleFavorite(anime)}
          >
            <Icon
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={20}
              color={isFavorite ? theme.colors.error : theme.colors.text}
            />
          </TouchableOpacity>
        )}
        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, { color: getStatusColor(anime.status) }]}>
            {anime.status.replace('_', ' ')}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[common.text, styles.title]} numberOfLines={2}>
          {anime.title.english || anime.title.romaji}
        </Text>

        {anime.averageScore && (
          <View style={styles.scoreContainer}>
            <Icon name="star" size={14} color={theme.colors.warning} />
            <Text style={[common.textSecondary, styles.score]}>
              {anime.averageScore}%
            </Text>
          </View>
        )}

        {anime.nextAiringEpisode && (
          <Text style={[common.textSecondary, styles.nextEpisode]}>
            {formatNextEpisode()}
          </Text>
        )}

        {anime.genres && anime.genres.length > 0 && (
          <View style={styles.genresContainer}>
            <Text style={[common.textSecondary, styles.genre]} numberOfLines={1}>
              {anime.genres.slice(0, 2).join(', ')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (theme: any, cardWidth: number) =>
  StyleSheet.create({
    container: {
      width: cardWidth,
      marginHorizontal: theme.spacing.xs,
      marginVertical: theme.spacing.sm,
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: cardWidth * 1.4, // Aspect ratio for anime posters
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      marginBottom: theme.spacing.sm,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    favoriteButton: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      padding: theme.spacing.xs,
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    statusBadge: {
      position: 'absolute',
      bottom: theme.spacing.sm,
      left: theme.spacing.sm,
      backgroundColor: theme.colors.card,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      opacity: 0.9,
    },
    statusText: {
      fontSize: theme.fontSize.xs,
      fontWeight: theme.fontWeight.medium,
      textTransform: 'capitalize',
    },
    content: {
      flex: 1,
    },
    title: {
      fontWeight: theme.fontWeight.semibold,
      marginBottom: theme.spacing.xs,
      lineHeight: 18,
    },
    scoreContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    score: {
      marginLeft: theme.spacing.xs,
      fontWeight: theme.fontWeight.medium,
    },
    nextEpisode: {
      marginBottom: theme.spacing.xs,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.primary,
    },
    genresContainer: {
      marginTop: 'auto',
    },
    genre: {
      fontSize: theme.fontSize.xs,
    },
  });

export default AnimeCard;