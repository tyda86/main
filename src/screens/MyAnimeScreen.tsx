import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '@contexts/ThemeContext';
import { commonStyles } from '@utils/theme';
import { StorageService } from '@services/storageService';
import { NotificationService } from '@services/notificationService';
import AnimeCard from '@components/AnimeCard';
import { UserAnime, RootStackParamList } from '@types/index';

type MyAnimeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const MyAnimeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<MyAnimeScreenNavigationProp>();
  const styles = getStyles(theme);
  const common = commonStyles(theme);

  const [userAnimeList, setUserAnimeList] = useState<UserAnime[]>([]);
  const [sortBy, setSortBy] = useState<'added' | 'title' | 'nextEpisode'>('added');
  const [showCompleted, setShowCompleted] = useState(true);

  const loadUserAnimeList = async () => {
    try {
      const userList = await StorageService.getUserAnimeList();
      setUserAnimeList(userList);
    } catch (error) {
      console.error('Error loading user anime list:', error);
    }
  };

  const handleAnimePress = (anime: UserAnime) => {
    navigation.navigate('AnimeDetails', { animeId: anime.animeId });
  };

  const handleRemoveAnime = async (userAnime: UserAnime) => {
    Alert.alert(
      'Remove Anime',
      `Are you sure you want to remove "${userAnime.anime.title.english || userAnime.anime.title.romaji}" from your list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.removeAnimeFromList(userAnime.animeId);
              NotificationService.cancelAnimeNotifications(userAnime.animeId);
              setUserAnimeList(prev => prev.filter(item => item.animeId !== userAnime.animeId));
            } catch (error) {
              console.error('Error removing anime:', error);
              Alert.alert('Error', 'Failed to remove anime from list.');
            }
          },
        },
      ]
    );
  };

  const handleToggleNotifications = async (userAnime: UserAnime) => {
    try {
      const newNotificationState = !userAnime.notificationsEnabled;
      await StorageService.updateAnimeNotificationSettings(
        userAnime.animeId,
        newNotificationState
      );

      setUserAnimeList(prev =>
        prev.map(item =>
          item.animeId === userAnime.animeId
            ? { ...item, notificationsEnabled: newNotificationState }
            : item
        )
      );

      if (newNotificationState && userAnime.anime.nextAiringEpisode) {
        // Schedule notification
        const episode = {
          number: userAnime.anime.nextAiringEpisode.episode,
          airingAt: userAnime.anime.nextAiringEpisode.airingAt,
          animeId: userAnime.anime.id,
        };
        await NotificationService.scheduleEpisodeNotification(userAnime.anime, episode);
      } else {
        // Cancel notifications
        NotificationService.cancelAnimeNotifications(userAnime.animeId);
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings.');
    }
  };

  const getSortedAnimeList = () => {
    let filteredList = [...userAnimeList];

    if (!showCompleted) {
      filteredList = filteredList.filter(anime => anime.anime.status !== 'FINISHED');
    }

    switch (sortBy) {
      case 'title':
        return filteredList.sort((a, b) =>
          (a.anime.title.english || a.anime.title.romaji).localeCompare(
            b.anime.title.english || b.anime.title.romaji
          )
        );
      case 'nextEpisode':
        return filteredList.sort((a, b) => {
          if (!a.anime.nextAiringEpisode && !b.anime.nextAiringEpisode) return 0;
          if (!a.anime.nextAiringEpisode) return 1;
          if (!b.anime.nextAiringEpisode) return -1;
          return a.anime.nextAiringEpisode.airingAt - b.anime.nextAiringEpisode.airingAt;
        });
      case 'added':
      default:
        return filteredList.sort(
          (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
    }
  };

  const renderAnimeItem = ({ item }: { item: UserAnime }) => (
    <View style={styles.animeItem}>
      <TouchableOpacity
        style={styles.animeInfo}
        onPress={() => handleAnimePress(item)}
      >
        <AnimeCard
          anime={item.anime}
          onPress={() => handleAnimePress(item)}
          showFavoriteButton={false}
        />
      </TouchableOpacity>

      <View style={styles.controls}>
        <View style={styles.notificationControl}>
          <Icon
            name={item.notificationsEnabled ? 'notifications' : 'notifications-off'}
            size={20}
            color={item.notificationsEnabled ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text style={[common.textSecondary, styles.controlLabel]}>
            Notifications
          </Text>
          <Switch
            value={item.notificationsEnabled}
            onValueChange={() => handleToggleNotifications(item)}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor={item.notificationsEnabled ? '#FFFFFF' : theme.colors.textSecondary}
          />
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveAnime(item)}
        >
          <Icon name="remove-circle-outline" size={20} color={theme.colors.error} />
          <Text style={[styles.removeButtonText, { color: theme.colors.error }]}>
            Remove
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[common.title, styles.statNumber]}>
            {userAnimeList.length}
          </Text>
          <Text style={common.textSecondary}>Total Anime</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[common.title, styles.statNumber]}>
            {userAnimeList.filter(anime => anime.notificationsEnabled).length}
          </Text>
          <Text style={common.textSecondary}>With Notifications</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[common.title, styles.statNumber]}>
            {userAnimeList.filter(anime => anime.anime.status === 'RELEASING').length}
          </Text>
          <Text style={common.textSecondary}>Currently Airing</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.filterContainer}>
          <Text style={[common.textSecondary, styles.filterLabel]}>Sort by:</Text>
          <View style={styles.sortButtons}>
            {[
              { key: 'added', label: 'Added' },
              { key: 'title', label: 'Title' },
              { key: 'nextEpisode', label: 'Next Episode' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortButton,
                  sortBy === option.key && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setSortBy(option.key as any)}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    sortBy === option.key && { color: '#FFFFFF' }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.toggleContainer}>
          <Text style={[common.textSecondary, styles.toggleLabel]}>
            Show Completed
          </Text>
          <Switch
            value={showCompleted}
            onValueChange={setShowCompleted}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor={showCompleted ? '#FFFFFF' : theme.colors.textSecondary}
          />
        </View>
      </View>
    </View>
  );

  useFocusEffect(
    useCallback(() => {
      loadUserAnimeList();
    }, [])
  );

  const sortedAnimeList = getSortedAnimeList();

  if (userAnimeList.length === 0) {
    return (
      <View style={[common.container, common.center]}>
        <Icon name="favorite-border" size={48} color={theme.colors.textSecondary} />
        <Text style={[common.textSecondary, styles.emptyText]}>
          No anime in your list yet
        </Text>
        <TouchableOpacity
          style={[common.button, styles.searchButton]}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={common.buttonText}>Search for Anime</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={common.container}>
      <FlatList
        data={sortedAnimeList}
        renderItem={renderAnimeItem}
        keyExtractor={(item) => item.animeId.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    header: {
      backgroundColor: theme.colors.card,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: theme.spacing.lg,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      color: theme.colors.primary,
    },
    controls: {
      marginTop: theme.spacing.md,
    },
    filterContainer: {
      marginBottom: theme.spacing.md,
    },
    filterLabel: {
      marginBottom: theme.spacing.sm,
      fontWeight: theme.fontWeight.medium,
    },
    sortButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    sortButton: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sortButtonText: {
      color: theme.colors.text,
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.medium,
    },
    toggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    toggleLabel: {
      fontWeight: theme.fontWeight.medium,
    },
    listContainer: {
      paddingBottom: theme.spacing.xl,
    },
    animeItem: {
      backgroundColor: theme.colors.card,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
    },
    animeInfo: {
      flex: 1,
    },
    notificationControl: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    controlLabel: {
      flex: 1,
      marginLeft: theme.spacing.sm,
      fontWeight: theme.fontWeight.medium,
    },
    removeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    removeButtonText: {
      marginLeft: theme.spacing.sm,
      fontWeight: theme.fontWeight.medium,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    searchButton: {
      marginTop: theme.spacing.md,
    },
  });

export default MyAnimeScreen;