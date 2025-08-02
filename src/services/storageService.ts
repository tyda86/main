import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAnime, AppSettings, NotificationSettings } from '../types/index';

const STORAGE_KEYS = {
  USER_ANIME_LIST: 'user_anime_list',
  APP_SETTINGS: 'app_settings',
  LAST_SYNC: 'last_sync',
} as const;

export class StorageService {
  // User Anime List Management
  static async getUserAnimeList(): Promise<UserAnime[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_ANIME_LIST);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading user anime list:', error);
      return [];
    }
  }

  static async saveUserAnimeList(animeList: UserAnime[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_ANIME_LIST,
        JSON.stringify(animeList)
      );
    } catch (error) {
      console.error('Error saving user anime list:', error);
      throw error;
    }
  }

  static async addAnimeToList(userAnime: UserAnime): Promise<void> {
    try {
      const currentList = await this.getUserAnimeList();
      const existingIndex = currentList.findIndex(
        item => item.animeId === userAnime.animeId
      );

      if (existingIndex >= 0) {
        currentList[existingIndex] = userAnime;
      } else {
        currentList.push(userAnime);
      }

      await this.saveUserAnimeList(currentList);
    } catch (error) {
      console.error('Error adding anime to list:', error);
      throw error;
    }
  }

  static async removeAnimeFromList(animeId: number): Promise<void> {
    try {
      const currentList = await this.getUserAnimeList();
      const filteredList = currentList.filter(item => item.animeId !== animeId);
      await this.saveUserAnimeList(filteredList);
    } catch (error) {
      console.error('Error removing anime from list:', error);
      throw error;
    }
  }

  static async updateAnimeNotificationSettings(
    animeId: number,
    notificationsEnabled: boolean
  ): Promise<void> {
    try {
      const currentList = await this.getUserAnimeList();
      const animeIndex = currentList.findIndex(item => item.animeId === animeId);

      if (animeIndex >= 0) {
        currentList[animeIndex].notificationsEnabled = notificationsEnabled;
        await this.saveUserAnimeList(currentList);
      }
    } catch (error) {
      console.error('Error updating anime notification settings:', error);
      throw error;
    }
  }

  static async updateLastNotifiedEpisode(
    animeId: number,
    episodeNumber: number
  ): Promise<void> {
    try {
      const currentList = await this.getUserAnimeList();
      const animeIndex = currentList.findIndex(item => item.animeId === animeId);

      if (animeIndex >= 0) {
        currentList[animeIndex].lastNotifiedEpisode = episodeNumber;
        await this.saveUserAnimeList(currentList);
      }
    } catch (error) {
      console.error('Error updating last notified episode:', error);
      throw error;
    }
  }

  // App Settings Management
  static async getAppSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      return data ? JSON.parse(data) : this.getDefaultSettings();
    } catch (error) {
      console.error('Error loading app settings:', error);
      return this.getDefaultSettings();
    }
  }

  static async saveAppSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.APP_SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Error saving app settings:', error);
      throw error;
    }
  }

  static async updateNotificationSettings(
    notificationSettings: NotificationSettings
  ): Promise<void> {
    try {
      const currentSettings = await this.getAppSettings();
      currentSettings.notifications = notificationSettings;
      await this.saveAppSettings(currentSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  static async updateTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
    try {
      const currentSettings = await this.getAppSettings();
      currentSettings.theme = theme;
      await this.saveAppSettings(currentSettings);
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  }

  // Sync Management
  static async getLastSyncTime(): Promise<Date | null> {
    try {
      const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return timestamp ? new Date(timestamp) : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  static async updateLastSyncTime(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_SYNC,
        new Date().toISOString()
      );
    } catch (error) {
      console.error('Error updating last sync time:', error);
      throw error;
    }
  }

  // Utility Methods
  private static getDefaultSettings(): AppSettings {
    return {
      theme: 'system',
      notifications: {
        enabled: true,
        soundEnabled: true,
        vibrationEnabled: true,
        notificationTime: 'immediate',
      },
      language: 'en',
    };
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  static async exportUserData(): Promise<string> {
    try {
      const animeList = await this.getUserAnimeList();
      const settings = await this.getAppSettings();
      const lastSync = await this.getLastSyncTime();

      const exportData = {
        animeList,
        settings,
        lastSync,
        exportDate: new Date().toISOString(),
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }
}