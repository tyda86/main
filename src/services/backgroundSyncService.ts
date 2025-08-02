import { AppState, AppStateStatus } from 'react-native';
import { StorageService } from './storageService';
import { AniListApi } from './anilistApi';
import { NotificationService } from './notificationService';
import { UserAnime, Episode } from '../types/index';

export class BackgroundSyncService {
  private static syncInterval: NodeJS.Timeout | null = null;
  private static isInitialized = false;
  private static lastSyncTime: Date | null = null;

  static initialize(): void {
    if (this.isInitialized) return;

    // Listen for app state changes
    AppState.addEventListener('change', this.handleAppStateChange);

    // Start periodic sync
    this.startPeriodicSync();

    this.isInitialized = true;
    console.log('Background sync service initialized');
  }

  static cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    AppState.removeEventListener('change', this.handleAppStateChange);
    this.isInitialized = false;
  }

  private static handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground, check if we need to sync
      await this.syncIfNeeded();
    }
  };

  private static startPeriodicSync(): void {
    // Sync every 30 minutes when app is active
    this.syncInterval = setInterval(async () => {
      if (AppState.currentState === 'active') {
        await this.performSync();
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  private static async syncIfNeeded(): Promise<void> {
    try {
      const lastSyncTime = await StorageService.getLastSyncTime();
      const now = new Date();

      // If no previous sync or last sync was more than 1 hour ago
      if (!lastSyncTime || (now.getTime() - lastSyncTime.getTime()) > 60 * 60 * 1000) {
        await this.performSync();
      }
    } catch (error) {
      console.error('Error checking sync status:', error);
    }
  }

  private static async performSync(): Promise<void> {
    try {
      console.log('Starting background sync...');
      
      const userAnimeList = await StorageService.getUserAnimeList();
      
      if (userAnimeList.length === 0) {
        console.log('No anime in user list, skipping sync');
        return;
      }

      let updatedAnime: UserAnime[] = [];
      let hasUpdates = false;

      // Update anime information for currently airing shows
      for (const userAnime of userAnimeList) {
        try {
          // Only update anime that are currently releasing
          if (userAnime.anime.status === 'RELEASING') {
            const updatedAnimeData = await AniListApi.getAnimeById(userAnime.animeId);
            
            // Check if there are updates to the next airing episode
            const hasEpisodeUpdate = this.hasEpisodeUpdate(userAnime.anime, updatedAnimeData);
            
            if (hasEpisodeUpdate) {
              hasUpdates = true;
              
              // Update the user anime with new data
              const updatedUserAnime: UserAnime = {
                ...userAnime,
                anime: updatedAnimeData,
              };
              
              updatedAnime.push(updatedUserAnime);

              // Schedule new notification if notifications are enabled
              if (userAnime.notificationsEnabled && updatedAnimeData.nextAiringEpisode) {
                const episode: Episode = {
                  number: updatedAnimeData.nextAiringEpisode.episode,
                  airingAt: updatedAnimeData.nextAiringEpisode.airingAt,
                  animeId: updatedAnimeData.id,
                };

                // Cancel old notifications for this anime
                NotificationService.cancelAnimeNotifications(userAnime.animeId);
                
                // Schedule new notification
                await NotificationService.scheduleEpisodeNotification(updatedAnimeData, episode);
                
                console.log(`Updated notification for ${updatedAnimeData.title.romaji}`);
              }
            } else {
              updatedAnime.push(userAnime);
            }
          } else {
            updatedAnime.push(userAnime);
          }
        } catch (error) {
          console.error(`Error updating anime ${userAnime.animeId}:`, error);
          // Keep the old data if update fails
          updatedAnime.push(userAnime);
        }

        // Add a small delay to avoid rate limiting
        await this.delay(100);
      }

      // Save updated anime list if there were changes
      if (hasUpdates) {
        await StorageService.saveUserAnimeList(updatedAnime);
        console.log(`Sync completed with updates for ${updatedAnime.length} anime`);
      } else {
        console.log('Sync completed, no updates found');
      }

      // Update last sync time
      await StorageService.updateLastSyncTime();
      this.lastSyncTime = new Date();

    } catch (error) {
      console.error('Error during background sync:', error);
    }
  }

  private static hasEpisodeUpdate(oldAnime: any, newAnime: any): boolean {
    // Check if there's a new next airing episode
    if (!oldAnime.nextAiringEpisode && newAnime.nextAiringEpisode) {
      return true;
    }

    if (oldAnime.nextAiringEpisode && newAnime.nextAiringEpisode) {
      return (
        oldAnime.nextAiringEpisode.episode !== newAnime.nextAiringEpisode.episode ||
        oldAnime.nextAiringEpisode.airingAt !== newAnime.nextAiringEpisode.airingAt
      );
    }

    // Check if status changed
    if (oldAnime.status !== newAnime.status) {
      return true;
    }

    return false;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async forcSync(): Promise<void> {
    console.log('Force sync requested');
    await this.performSync();
  }

  static getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  static async checkForNewEpisodes(): Promise<void> {
    try {
      const userAnimeList = await StorageService.getUserAnimeList();
      const now = new Date();

      for (const userAnime of userAnimeList) {
        if (userAnime.anime.nextAiringEpisode) {
          const airingTime = new Date(userAnime.anime.nextAiringEpisode.airingAt * 1000);
          
          // If episode should have aired and we haven't notified about it yet
          if (
            airingTime <= now && 
            (!userAnime.lastNotifiedEpisode || userAnime.lastNotifiedEpisode < userAnime.anime.nextAiringEpisode.episode)
          ) {
            if (userAnime.notificationsEnabled) {
              const episode: Episode = {
                number: userAnime.anime.nextAiringEpisode.episode,
                airingAt: userAnime.anime.nextAiringEpisode.airingAt,
                animeId: userAnime.anime.id,
              };

              NotificationService.sendImmediateNotification(userAnime.anime, episode);
              
              // Update last notified episode
              await StorageService.updateLastNotifiedEpisode(
                userAnime.animeId,
                userAnime.anime.nextAiringEpisode.episode
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking for new episodes:', error);
    }
  }

  static async scheduleAllNotifications(): Promise<void> {
    try {
      console.log('Scheduling all notifications...');
      
      const userAnimeList = await StorageService.getUserAnimeList();
      
      for (const userAnime of userAnimeList) {
        if (userAnime.notificationsEnabled && userAnime.anime.nextAiringEpisode) {
          const episode: Episode = {
            number: userAnime.anime.nextAiringEpisode.episode,
            airingAt: userAnime.anime.nextAiringEpisode.airingAt,
            animeId: userAnime.anime.id,
          };

          await NotificationService.scheduleEpisodeNotification(userAnime.anime, episode);
        }
      }
      
      console.log('All notifications scheduled');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }
}