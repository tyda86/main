import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAnime } from '../contexts/AnimeContext';
import { UserAnime } from '../types';

const MyAnimeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userAnimeList, removeAnimeFromList, toggleNotifications, loading } = useAnime();

  const handleRemoveAnime = (animeId: number, animeTitle: string) => {
    Alert.alert(
      'Remove Anime',
      `Are you sure you want to remove "${animeTitle}" from your list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeAnimeFromList(animeId),
        },
      ]
    );
  };

  const handleToggleNotifications = (animeId: number) => {
    toggleNotifications(animeId);
  };

  const navigateToAnimeDetail = (anime: any) => {
    navigation.navigate('AnimeDetail' as never, { anime } as never);
  };

  const renderAnimeItem = ({ item }: { item: UserAnime }) => {
    const { anime, notifications } = item;

    return (
      <TouchableOpacity
        style={styles.animeItem}
        onPress={() => navigateToAnimeDetail(anime)}
      >
        <Image
          source={{ uri: anime.images.jpg.image_url }}
          style={styles.animeImage}
          resizeMode="cover"
        />
        <View style={styles.animeDetails}>
          <Text style={styles.animeTitle} numberOfLines={2}>
            {anime.title}
          </Text>
          {anime.title_english && (
            <Text style={styles.animeEnglishTitle} numberOfLines={1}>
              {anime.title_english}
            </Text>
          )}
          <View style={styles.animeInfo}>
            <View style={styles.scoreContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.score}>{anime.score || 'N/A'}</Text>
            </View>
            <Text style={styles.status}>{anime.status}</Text>
          </View>
          <View style={styles.notificationContainer}>
            <Ionicons
              name={notifications ? "notifications" : "notifications-off"}
              size={16}
              color={notifications ? "#FF6B6B" : "#8E8E93"}
            />
            <Text style={styles.notificationText}>
              Notifications {notifications ? 'ON' : 'OFF'}
            </Text>
            <Switch
              value={notifications}
              onValueChange={() => handleToggleNotifications(anime.mal_id)}
              trackColor={{ false: '#2C2C2E', true: '#FF6B6B' }}
              thumbColor={notifications ? '#FFFFFF' : '#8E8E93'}
              style={styles.switch}
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveAnime(anime.mal_id, anime.title)}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={80} color="#8E8E93" />
      <Text style={styles.emptyText}>No anime in your list</Text>
      <Text style={styles.emptySubtext}>
        Search for anime and add them to get notified about new episodes
      </Text>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => navigation.navigate('Search' as never)}
      >
        <Ionicons name="search" size={20} color="#FFFFFF" />
        <Text style={styles.searchButtonText}>Start Searching</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My Anime List</Text>
      <Text style={styles.headerSubtitle}>
        {userAnimeList.length} anime • {userAnimeList.filter(item => item.notifications).length} with notifications
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="refresh" size={50} color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading your anime list...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={userAnimeList}
        renderItem={renderAnimeItem}
        keyExtractor={(item) => item.anime.mal_id.toString()}
        ListHeaderComponent={userAnimeList.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContainer,
          userAnimeList.length === 0 && styles.emptyContainer,
        ]}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
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
    marginBottom: 12,
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
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 8,
    flex: 1,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#1C1C1E',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 10,
  },
});

export default MyAnimeScreen;