import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import AnimeService from './AnimeService';
import { UserAnime, Episode } from '../types';

const LAST_CHECK_KEY = '@last_episode_check';
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

class EpisodeCheckService {
  private static instance: EpisodeCheckService;
  private animeService: AnimeService;

  private constructor() {
    this.animeService = AnimeService.getInstance();
  }

  public static getInstance(): EpisodeCheckService {
    if (!EpisodeCheckService.instance) {
      EpisodeCheckService.instance = new EpisodeCheckService();
    }
    return EpisodeCheckService.instance;
  }

  async checkForNewEpisodes(): Promise<void> {
    try {
      console.log('Checking for new episodes...');
      
      // Get user's anime list
      const userAnimeListString = await AsyncStorage.getItem('@anime_list');
      if (!userAnimeListString) {
        console.log('No anime in user list');
        return;
      }

      const userAnimeList: UserAnime[] = JSON.parse(userAnimeListString);
      const animeWithNotifications = userAnimeList.filter(item => 
        item.notifications && item.anime.status === 'Currently Airing'
      );

      if (animeWithNotifications.length === 0) {
        console.log('No anime with notifications enabled');
        return;
      }

      console.log(`Checking ${animeWithNotifications.length} anime for new episodes`);

      // Check each anime for new episodes
      for (const userAnime of animeWithNotifications) {
        await this.checkAnimeForNewEpisodes(userAnime);
        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Update last check time
      await AsyncStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
      console.log('Episode check completed');
    } catch (error) {
      console.error('Error checking for new episodes:', error);
    }
  }

  private async checkAnimeForNewEpisodes(userAnime: UserAnime): Promise<void> {
    try {
      const { anime, lastCheckedEpisode = 0 } = userAnime;
      
      // Get latest episodes
      const episodeData = await this.animeService.getAnimeEpisodes(anime.mal_id, 1);
      const episodes = episodeData.data;

      if (episodes.length === 0) {
        return;
      }

      // Find new episodes
      const newEpisodes = episodes.filter(episode => {
        const episodeNumber = parseInt(episode.episode, 10);
        return episodeNumber > lastCheckedEpisode && episode.aired;
      });

      if (newEpisodes.length > 0) {
        console.log(`Found ${newEpisodes.length} new episodes for ${anime.title}`);
        
        // Send notification for the latest new episode
        const latestEpisode = newEpisodes.reduce((latest, current) => {
          const latestNum = parseInt(latest.episode, 10);
          const currentNum = parseInt(current.episode, 10);
          return currentNum > latestNum ? current : latest;
        });

        await this.sendEpisodeNotification(anime.title, latestEpisode);
        
        // Update last checked episode
        await this.updateLastCheckedEpisode(anime.mal_id, parseInt(latestEpisode.episode, 10));
      }
    } catch (error) {
      console.error(`Error checking episodes for ${userAnime.anime.title}:`, error);
    }
  }

  private async sendEpisodeNotification(animeTitle: string, episode: Episode): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎌 New Episode Available!',
          body: `${animeTitle} - Episode ${episode.episode} "${episode.title}" is now available!`,
          data: {
            animeTitle,
            episodeNumber: episode.episode,
            episodeTitle: episode.title,
          },
          sound: 'default',
          badge: 1,
        },
        trigger: null, // Send immediately
      });
      console.log(`Notification sent for ${animeTitle} Episode ${episode.episode}`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  private async updateLastCheckedEpisode(animeId: number, episodeNumber: number): Promise<void> {
    try {
      const userAnimeListString = await AsyncStorage.getItem('@anime_list');
      if (!userAnimeListString) return;

      const userAnimeList: UserAnime[] = JSON.parse(userAnimeListString);
      const updatedList = userAnimeList.map(userAnime => {
        if (userAnime.anime.mal_id === animeId) {
          return {
            ...userAnime,
            lastCheckedEpisode: Math.max(userAnime.lastCheckedEpisode || 0, episodeNumber),
          };
        }
        return userAnime;
      });

      await AsyncStorage.setItem('@anime_list', JSON.stringify(updatedList));
    } catch (error) {
      console.error('Error updating last checked episode:', error);
    }
  }

  async getLastCheckTime(): Promise<Date | null> {
    try {
      const lastCheckString = await AsyncStorage.getItem(LAST_CHECK_KEY);
      return lastCheckString ? new Date(lastCheckString) : null;
    } catch (error) {
      console.error('Error getting last check time:', error);
      return null;
    }
  }

  async shouldCheckForEpisodes(): Promise<boolean> {
    try {
      const lastCheck = await this.getLastCheckTime();
      if (!lastCheck) return true;

      const now = new Date();
      const timeSinceLastCheck = now.getTime() - lastCheck.getTime();
      return timeSinceLastCheck >= CHECK_INTERVAL;
    } catch (error) {
      console.error('Error checking if should check for episodes:', error);
      return true;
    }
  }

  async scheduleBackgroundCheck(): Promise<void> {
    try {
      // Cancel any existing scheduled notifications for background checks
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const backgroundChecks = scheduledNotifications.filter(
        notification => notification.content.data?.type === 'background_check'
      );

      for (const notification of backgroundChecks) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      // Schedule next background check in 24 hours
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Checking for new episodes...',
          body: 'Anime Episode Alert is checking for new episodes',
          data: { type: 'background_check' },
        },
        trigger: {
          seconds: CHECK_INTERVAL / 1000, // 24 hours
          repeats: true,
        },
      });

      console.log('Background episode check scheduled');
    } catch (error) {
      console.error('Error scheduling background check:', error);
    }
  }

  // Method to be called when app comes to foreground
  async checkOnAppForeground(): Promise<void> {
    const shouldCheck = await this.shouldCheckForEpisodes();
    if (shouldCheck) {
      await this.checkForNewEpisodes();
    }
  }
}

export default EpisodeCheckService;