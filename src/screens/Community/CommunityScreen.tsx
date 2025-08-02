import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  FlatList,
  Image,
  Dimensions,
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
  Surface,
  IconButton,
  Divider,
  Searchbar,
  Badge,
  ProgressBar,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppContext } from '../../context/AppContext';
import { CommunityPost, PlaydateRequest, Comment, Pet } from '../../types';

interface CommunityUser {
  id: string;
  name: string;
  avatar?: string;
  location: string;
  pets: Pet[];
  joinedDate: Date;
  isOnline: boolean;
  lastSeen: Date;
  bio?: string;
  rating: number;
  totalPlaydates: number;
}

interface ExtendedCommunityPost extends CommunityPost {
  user: CommunityUser;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  timeAgo: string;
  location?: string;
  tags: string[];
}

interface ExtendedPlaydateRequest extends PlaydateRequest {
  host: CommunityUser;
  attendees: CommunityUser[];
  maxAttendees: number;
  distance?: number;
  timeAgo: string;
}

const CommunityScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { state } = useAppContext();
  
  const [selectedTab, setSelectedTab] = useState<'feed' | 'playdates' | 'nearby'>('feed');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data for demonstration
  const [communityPosts, setCommunityPosts] = useState<ExtendedCommunityPost[]>([]);
  const [playdateRequests, setPlaydateRequests] = useState<ExtendedPlaydateRequest[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<CommunityUser[]>([]);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    setLoading(true);
    try {
      // Simulate loading community data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock community posts
      const mockPosts: ExtendedCommunityPost[] = [
        {
          id: '1',
          userId: 'user1',
          content: 'Just had an amazing day at the dog park with Max! He made so many new friends 🐕 #DogPark #SocialPup',
          images: ['https://via.placeholder.com/400x300/4285F4/FFFFFF?text=Dog+Park'],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          user: {
            id: 'user1',
            name: 'Sarah Johnson',
            location: 'Downtown, Seattle',
            pets: [{ id: 'pet1', name: 'Max', species: 'dog', breed: 'Golden Retriever' } as Pet],
            joinedDate: new Date('2023-01-15'),
            isOnline: true,
            lastSeen: new Date(),
            rating: 4.8,
            totalPlaydates: 23,
            bio: 'Dog lover and adventure seeker! Max and I love exploring new trails.',
          },
          likesCount: 15,
          commentsCount: 8,
          isLiked: false,
          timeAgo: '2 hours ago',
          location: 'Green Lake Dog Park',
          tags: ['dogpark', 'socialpup', 'goldenretriever'],
        },
        {
          id: '2',
          userId: 'user2',
          content: 'Luna learned a new trick today! She can now shake hands 🐾 Training patience really pays off. Any tips for teaching "roll over"?',
          images: ['https://via.placeholder.com/400x300/34A853/FFFFFF?text=Training+Session'],
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          user: {
            id: 'user2',
            name: 'Mike Chen',
            location: 'Capitol Hill, Seattle',
            pets: [{ id: 'pet2', name: 'Luna', species: 'dog', breed: 'Border Collie' } as Pet],
            joinedDate: new Date('2023-03-20'),
            isOnline: false,
            lastSeen: new Date(Date.now() - 30 * 60 * 1000),
            rating: 4.9,
            totalPlaydates: 31,
            bio: 'Professional dog trainer and Luna\'s proud parent!',
          },
          likesCount: 22,
          commentsCount: 12,
          isLiked: true,
          timeAgo: '5 hours ago',
          tags: ['training', 'tricks', 'bordercollie'],
        },
        {
          id: '3',
          userId: 'user3',
          content: 'Beautiful sunset walk with Whiskers today 🌅 Cats can be great walking companions too! #CatWalk #FelineAdventure',
          images: ['https://via.placeholder.com/400x300/EA4335/FFFFFF?text=Sunset+Walk'],
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          user: {
            id: 'user3',
            name: 'Emma Rodriguez',
            location: 'Fremont, Seattle',
            pets: [{ id: 'pet3', name: 'Whiskers', species: 'cat', breed: 'Maine Coon' } as Pet],
            joinedDate: new Date('2022-11-10'),
            isOnline: true,
            lastSeen: new Date(),
            rating: 4.7,
            totalPlaydates: 8,
            bio: 'Cat enthusiast and adventure photographer.',
          },
          likesCount: 18,
          commentsCount: 6,
          isLiked: false,
          timeAgo: '1 day ago',
          location: 'Fremont Waterfront',
          tags: ['catwalk', 'felineadventure', 'sunset'],
        },
      ];

      // Mock playdate requests
      const mockPlaydates: ExtendedPlaydateRequest[] = [
        {
          id: '1',
          hostId: 'user4',
          title: 'Small Dog Playdate at Volunteer Park',
          description: 'Looking for small dog owners for a fun playdate session! Friendly dogs only please 🐕',
          location: 'Volunteer Park, Capitol Hill',
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          status: 'active',
          petId: 'pet4',
          host: {
            id: 'user4',
            name: 'Jessica Liu',
            location: 'Capitol Hill, Seattle',
            pets: [{ id: 'pet4', name: 'Buddy', species: 'dog', breed: 'Corgi' } as Pet],
            joinedDate: new Date('2023-02-08'),
            isOnline: true,
            lastSeen: new Date(),
            rating: 4.9,
            totalPlaydates: 27,
          },
          attendees: [
            {
              id: 'user5',
              name: 'David Park',
              location: 'Capitol Hill, Seattle',
              pets: [{ id: 'pet5', name: 'Mochi', species: 'dog', breed: 'Shiba Inu' } as Pet],
              joinedDate: new Date('2023-04-12'),
              isOnline: false,
              lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
              rating: 4.6,
              totalPlaydates: 12,
            },
          ],
          maxAttendees: 6,
          distance: 0.8,
          timeAgo: '3 hours ago',
        },
        {
          id: '2',
          hostId: 'user6',
          title: 'Weekend Hiking with Dogs',
          description: 'Planning a dog-friendly hike at Rattlesnake Ledge. Experienced hikers with well-trained dogs welcome!',
          location: 'Rattlesnake Ledge Trail',
          scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          status: 'active',
          petId: 'pet6',
          host: {
            id: 'user6',
            name: 'Alex Thompson',
            location: 'Bellevue, WA',
            pets: [{ id: 'pet6', name: 'Thor', species: 'dog', breed: 'German Shepherd' } as Pet],
            joinedDate: new Date('2022-09-22'),
            isOnline: false,
            lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000),
            rating: 4.8,
            totalPlaydates: 45,
          },
          attendees: [],
          maxAttendees: 4,
          distance: 12.3,
          timeAgo: '6 hours ago',
        },
      ];

      // Mock nearby users
      const mockNearbyUsers: CommunityUser[] = [
        {
          id: 'user7',
          name: 'Rachel Green',
          location: '0.3 miles away',
          pets: [
            { id: 'pet7', name: 'Cooper', species: 'dog', breed: 'Labrador' } as Pet,
            { id: 'pet8', name: 'Bella', species: 'cat', breed: 'Persian' } as Pet,
          ],
          joinedDate: new Date('2023-01-30'),
          isOnline: true,
          lastSeen: new Date(),
          rating: 4.7,
          totalPlaydates: 19,
          bio: 'Multi-pet household! Love connecting with other pet parents.',
        },
        {
          id: 'user8',
          name: 'Kevin Wu',
          location: '0.7 miles away',
          pets: [{ id: 'pet9', name: 'Ziggy', species: 'dog', breed: 'French Bulldog' } as Pet],
          joinedDate: new Date('2023-05-15'),
          isOnline: false,
          lastSeen: new Date(Date.now() - 20 * 60 * 1000),
          rating: 4.8,
          totalPlaydates: 14,
          bio: 'New to the area and looking for dog friends for Ziggy!',
        },
      ];

      setCommunityPosts(mockPosts);
      setPlaydateRequests(mockPlaydates);
      setNearbyUsers(mockNearbyUsers);
    } catch (error) {
      Alert.alert('Error', 'Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCommunityData();
    setRefreshing(false);
  };

  const handleLikePost = (postId: string) => {
    setCommunityPosts(posts =>
      posts.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
            }
          : post
      )
    );
  };

  const handleJoinPlaydate = (playdateId: string) => {
    Alert.alert(
      'Join Playdate',
      'Would you like to join this playdate? The host will be notified of your interest.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: () => {
            Alert.alert('Success', 'Your request to join has been sent to the host!');
          },
        },
      ]
    );
  };

  const handleCreatePost = () => {
    Alert.alert(
      'Create Post',
      'This would open a post creation interface where you can share photos, stories, and updates about your pets.',
      [{ text: 'OK' }]
    );
  };

  const handleCreatePlaydate = () => {
    Alert.alert(
      'Create Playdate',
      'This would open a playdate creation form where you can schedule meetups with other pet owners.',
      [{ text: 'OK' }]
    );
  };

  const handleMessageUser = (userId: string) => {
    Alert.alert(
      'Message User',
      'This would open a direct messaging interface to chat with this pet parent.',
      [{ text: 'OK' }]
    );
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatScheduledDate = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString();
  };

  const renderPost = ({ item: post }: { item: ExtendedCommunityPost }) => (
    <Card style={[styles.postCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        {/* User Header */}
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <Avatar.Icon size={40} icon="account" style={styles.userAvatar} />
            <View style={styles.userDetails}>
              <Text variant="titleMedium" style={[styles.userName, { color: theme.colors.onSurface }]}>
                {post.user.name}
              </Text>
              <View style={styles.postMeta}>
                <Text variant="bodySmall" style={[styles.postTime, { color: theme.colors.onSurfaceVariant }]}>
                  {post.timeAgo}
                </Text>
                {post.location && (
                  <>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      •
                    </Text>
                    <Text variant="bodySmall" style={[styles.postLocation, { color: theme.colors.onSurfaceVariant }]}>
                      📍 {post.location}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => Alert.alert('Post Options', 'Report, Hide, or Block options would be here')}
          />
        </View>

        {/* Post Content */}
        <Text variant="bodyLarge" style={[styles.postContent, { color: theme.colors.onSurface }]}>
          {post.content}
        </Text>

        {/* Post Image */}
        {post.images && post.images.length > 0 && (
          <Image source={{ uri: post.images[0] }} style={styles.postImage} />
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.slice(0, 3).map((tag, index) => (
              <Chip key={index} style={styles.tag} textStyle={styles.tagText}>
                #{tag}
              </Chip>
            ))}
          </View>
        )}

        {/* Post Actions */}
        <View style={styles.postActions}>
          <View style={styles.actionLeft}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLikePost(post.id)}
            >
              <Ionicons
                name={post.isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={post.isLiked ? theme.colors.error : theme.colors.onSurfaceVariant}
              />
              <Text
                variant="bodySmall"
                style={[
                  styles.actionText,
                  { color: post.isLiked ? theme.colors.error : theme.colors.onSurfaceVariant },
                ]}
              >
                {post.likesCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Comments', 'Comments interface would open here')}
            >
              <Ionicons name="chatbubble-outline" size={20} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={[styles.actionText, { color: theme.colors.onSurfaceVariant }]}>
                {post.commentsCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Share', 'Share options would be here')}
            >
              <Ionicons name="share-outline" size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => handleMessageUser(post.user.id)}
          >
            <Ionicons name="mail-outline" size={16} color={theme.colors.primary} />
            <Text variant="bodySmall" style={[styles.messageText, { color: theme.colors.primary }]}>
              Message
            </Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderPlaydate = ({ item: playdate }: { item: ExtendedPlaydateRequest }) => (
    <Card style={[styles.playdateCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        {/* Playdate Header */}
        <View style={styles.playdateHeader}>
          <View style={styles.playdateInfo}>
            <Text variant="titleLarge" style={[styles.playdateTitle, { color: theme.colors.onSurface }]}>
              {playdate.title}
            </Text>
            <View style={styles.playdateMeta}>
              <Text variant="bodyMedium" style={[styles.playdateHost, { color: theme.colors.primary }]}>
                Hosted by {playdate.host.name}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color="#FFA500" />
                <Text variant="bodySmall" style={[styles.rating, { color: theme.colors.onSurfaceVariant }]}>
                  {playdate.host.rating}
                </Text>
              </View>
            </View>
          </View>
          {playdate.distance && (
            <Chip style={styles.distanceChip} textStyle={styles.distanceText}>
              {playdate.distance}mi
            </Chip>
          )}
        </View>

        {/* Playdate Details */}
        <Text variant="bodyLarge" style={[styles.playdateDescription, { color: theme.colors.onSurface }]}>
          {playdate.description}
        </Text>

        <View style={styles.playdateDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={16} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={[styles.detailText, { color: theme.colors.onSurface }]}>
              {formatScheduledDate(playdate.scheduledDate)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location" size={16} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={[styles.detailText, { color: theme.colors.onSurface }]}>
              {playdate.location}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people" size={16} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={[styles.detailText, { color: theme.colors.onSurface }]}>
              {playdate.attendees.length}/{playdate.maxAttendees} spots filled
            </Text>
          </View>
        </View>

        {/* Attendees */}
        {playdate.attendees.length > 0 && (
          <View style={styles.attendeesContainer}>
            <Text variant="bodyMedium" style={[styles.attendeesLabel, { color: theme.colors.onSurfaceVariant }]}>
              Attending:
            </Text>
            <View style={styles.attendeesList}>
              {playdate.attendees.slice(0, 3).map((attendee, index) => (
                <Avatar.Icon
                  key={attendee.id}
                  size={32}
                  icon="account"
                  style={[styles.attendeeAvatar, { marginLeft: index > 0 ? -8 : 0 }]}
                />
              ))}
              {playdate.attendees.length > 3 && (
                <Text variant="bodySmall" style={[styles.moreAttendees, { color: theme.colors.onSurfaceVariant }]}>
                  +{playdate.attendees.length - 3} more
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={playdate.attendees.length / playdate.maxAttendees}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          <Text variant="bodySmall" style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
            {Math.round((playdate.attendees.length / playdate.maxAttendees) * 100)}% full
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.playdateActions}>
          <Button
            mode="contained"
            onPress={() => handleJoinPlaydate(playdate.id)}
            style={styles.joinButton}
            disabled={playdate.attendees.length >= playdate.maxAttendees}
          >
            {playdate.attendees.length >= playdate.maxAttendees ? 'Full' : 'Join Playdate'}
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleMessageUser(playdate.host.id)}
            style={styles.contactButton}
            icon="message"
          >
            Contact Host
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderNearbyUser = ({ item: user }: { item: CommunityUser }) => (
    <Card style={[styles.userCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.nearbyUserHeader}>
          <View style={styles.nearbyUserInfo}>
            <View style={styles.avatarContainer}>
              <Avatar.Icon size={50} icon="account" style={styles.nearbyUserAvatar} />
              {user.isOnline && <View style={[styles.onlineIndicator, { backgroundColor: theme.colors.tertiary }]} />}
            </View>
            <View style={styles.nearbyUserDetails}>
              <Text variant="titleMedium" style={[styles.nearbyUserName, { color: theme.colors.onSurface }]}>
                {user.name}
              </Text>
              <Text variant="bodySmall" style={[styles.nearbyUserLocation, { color: theme.colors.onSurfaceVariant }]}>
                📍 {user.location}
              </Text>
              <View style={styles.nearbyUserMeta}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={12} color="#FFA500" />
                  <Text variant="bodySmall" style={[styles.rating, { color: theme.colors.onSurfaceVariant }]}>
                    {user.rating}
                  </Text>
                </View>
                <Text variant="bodySmall" style={[styles.playdateCount, { color: theme.colors.onSurfaceVariant }]}>
                  • {user.totalPlaydates} playdates
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.connectButton, { backgroundColor: theme.colors.primaryContainer }]}
            onPress={() => handleMessageUser(user.id)}
          >
            <Ionicons name="mail" size={16} color={theme.colors.onPrimaryContainer} />
          </TouchableOpacity>
        </View>

        {/* User Bio */}
        {user.bio && (
          <Text variant="bodyMedium" style={[styles.userBio, { color: theme.colors.onSurface }]}>
            {user.bio}
          </Text>
        )}

        {/* Pets */}
        <View style={styles.petsContainer}>
          <Text variant="bodyMedium" style={[styles.petsLabel, { color: theme.colors.onSurfaceVariant }]}>
            Pets:
          </Text>
          <View style={styles.petsList}>
            {user.pets.map((pet, index) => (
              <Chip key={pet.id} style={styles.petChip} textStyle={styles.petChipText}>
                {pet.name} ({pet.species})
              </Chip>
            ))}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && communityPosts.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
          Loading community...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Community
          </Text>
          <View style={styles.headerActions}>
            <Chip
              icon="account-group"
              style={styles.communityChip}
              textStyle={{ color: 'white' }}
            >
              {communityPosts.length + nearbyUsers.length} members
            </Chip>
          </View>
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search posts, users, or playdates..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
          inputStyle={styles.searchInput}
        />

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'feed' && { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
            ]}
            onPress={() => setSelectedTab('feed')}
          >
            <Ionicons
              name="newspaper"
              size={20}
              color={selectedTab === 'feed' ? 'white' : 'rgba(255, 255, 255, 0.7)'}
            />
            <Text
              variant="bodyMedium"
              style={[
                styles.tabText,
                { color: selectedTab === 'feed' ? 'white' : 'rgba(255, 255, 255, 0.7)' },
              ]}
            >
              Feed
            </Text>
            {selectedTab === 'feed' && (
              <Badge size={16} style={[styles.tabBadge, { backgroundColor: theme.colors.error }]}>
                {communityPosts.length}
              </Badge>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'playdates' && { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
            ]}
            onPress={() => setSelectedTab('playdates')}
          >
            <Ionicons
              name="calendar"
              size={20}
              color={selectedTab === 'playdates' ? 'white' : 'rgba(255, 255, 255, 0.7)'}
            />
            <Text
              variant="bodyMedium"
              style={[
                styles.tabText,
                { color: selectedTab === 'playdates' ? 'white' : 'rgba(255, 255, 255, 0.7)' },
              ]}
            >
              Playdates
            </Text>
            {selectedTab === 'playdates' && (
              <Badge size={16} style={[styles.tabBadge, { backgroundColor: theme.colors.error }]}>
                {playdateRequests.length}
              </Badge>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'nearby' && { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
            ]}
            onPress={() => setSelectedTab('nearby')}
          >
            <Ionicons
              name="location"
              size={20}
              color={selectedTab === 'nearby' ? 'white' : 'rgba(255, 255, 255, 0.7)'}
            />
            <Text
              variant="bodyMedium"
              style={[
                styles.tabText,
                { color: selectedTab === 'nearby' ? 'white' : 'rgba(255, 255, 255, 0.7)' },
              ]}
            >
              Nearby
            </Text>
            {selectedTab === 'nearby' && (
              <Badge size={16} style={[styles.tabBadge, { backgroundColor: theme.colors.error }]}>
                {nearbyUsers.length}
              </Badge>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      {selectedTab === 'feed' && (
        <FlatList
          data={communityPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="newspaper-outline" size={80} color={theme.colors.outline} />
              <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
                No Posts Yet
              </Text>
              <Text variant="bodyLarge" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Be the first to share something with the community!
              </Text>
              <Button mode="contained" onPress={handleCreatePost} style={styles.emptyAction}>
                Create First Post
              </Button>
            </View>
          }
        />
      )}

      {selectedTab === 'playdates' && (
        <FlatList
          data={playdateRequests}
          renderItem={renderPlaydate}
          keyExtractor={(item) => item.id}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={80} color={theme.colors.outline} />
              <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
                No Playdates Scheduled
              </Text>
              <Text variant="bodyLarge" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Create a playdate to meet other pet parents in your area!
              </Text>
              <Button mode="contained" onPress={handleCreatePlaydate} style={styles.emptyAction}>
                Schedule Playdate
              </Button>
            </View>
          }
        />
      )}

      {selectedTab === 'nearby' && (
        <FlatList
          data={nearbyUsers}
          renderItem={renderNearbyUser}
          keyExtractor={(item) => item.id}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={80} color={theme.colors.outline} />
              <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
                No Nearby Users
              </Text>
              <Text variant="bodyLarge" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Enable location sharing to find pet parents near you!
              </Text>
              <Button mode="contained" onPress={() => Alert.alert('Location', 'Location settings would open here')} style={styles.emptyAction}>
                Enable Location
              </Button>
            </View>
          }
        />
      )}

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        {selectedTab === 'feed' && (
          <FAB
            icon="plus"
            label="New Post"
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            onPress={handleCreatePost}
          />
        )}
        {selectedTab === 'playdates' && (
          <FAB
            icon="calendar-plus"
            label="New Playdate"
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            onPress={handleCreatePlaydate}
          />
        )}
        {selectedTab === 'nearby' && (
          <FAB
            icon="account-plus"
            label="Connect"
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            onPress={() => Alert.alert('Connect', 'Connection features would be here')}
          />
        )}
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerActions: {
    alignItems: 'flex-end',
  },
  communityChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchBar: {
    marginBottom: 16,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  tabText: {
    fontWeight: '500',
  },
  tabBadge: {
    position: 'absolute',
    top: -2,
    right: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  
  // Post Styles
  postCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    backgroundColor: 'rgba(103, 102, 241, 0.2)',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postTime: {
    fontSize: 12,
  },
  postLocation: {
    fontSize: 12,
  },
  postContent: {
    marginBottom: 12,
    lineHeight: 20,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    height: 28,
    backgroundColor: 'rgba(103, 102, 241, 0.1)',
  },
  tagText: {
    fontSize: 12,
    color: '#6366F1',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  actionLeft: {
    flexDirection: 'row',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(103, 102, 241, 0.1)',
  },
  messageText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Playdate Styles
  playdateCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  playdateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  playdateInfo: {
    flex: 1,
  },
  playdateTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playdateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playdateHost: {
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
  },
  distanceChip: {
    height: 28,
    backgroundColor: 'rgba(52, 168, 83, 0.1)',
  },
  distanceText: {
    color: '#34A853',
    fontSize: 12,
    fontWeight: '600',
  },
  playdateDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  playdateDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    flex: 1,
  },
  attendeesContainer: {
    marginBottom: 12,
  },
  attendeesLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  attendeesList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendeeAvatar: {
    backgroundColor: 'rgba(103, 102, 241, 0.2)',
  },
  moreAttendees: {
    marginLeft: 8,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  playdateActions: {
    flexDirection: 'row',
    gap: 12,
  },
  joinButton: {
    flex: 2,
  },
  contactButton: {
    flex: 1,
  },

  // Nearby User Styles
  userCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  nearbyUserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nearbyUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  nearbyUserAvatar: {
    backgroundColor: 'rgba(103, 102, 241, 0.2)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  nearbyUserDetails: {
    marginLeft: 12,
    flex: 1,
  },
  nearbyUserName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  nearbyUserLocation: {
    fontSize: 12,
    marginBottom: 4,
  },
  nearbyUserMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playdateCount: {
    fontSize: 12,
  },
  connectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userBio: {
    marginBottom: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  petsContainer: {
    marginTop: 8,
  },
  petsLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  petsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  petChip: {
    height: 28,
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
  },
  petChipText: {
    fontSize: 12,
    color: '#FF8C00',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  emptyAction: {
    marginTop: 10,
  },

  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fab: {
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 16,
  },
});

export default CommunityScreen;