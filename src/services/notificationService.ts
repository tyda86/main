import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';
import { StorageService } from './storageService';
import { Anime, Episode } from '../types/index';

export class NotificationService {
  private static isInitialized = false;

  static initialize(): void {
    if (this.isInitialized) return;

    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);

        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },

      onAction: function (notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },

      onRegistrationError: function (err) {
        console.error(err.message, err);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'anime-episodes',
          channelName: 'Anime Episodes',
          channelDescription: 'Notifications for new anime episodes',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );
    }

    this.isInitialized = true;
  }

  static async requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      if (Platform.OS === 'ios') {
        PushNotificationIOS.requestPermissions({
          alert: true,
          badge: true,
          sound: true,
        }).then((permissions) => {
          resolve(permissions.alert || permissions.badge || permissions.sound);
        });
      } else {
        PushNotification.requestPermissions().then((permissions) => {
          resolve(!!permissions);
        });
      }
    });
  }

  static async scheduleEpisodeNotification(
    anime: Anime,
    episode: Episode,
    delay: number = 0
  ): Promise<void> {
    try {
      const settings = await StorageService.getAppSettings();
      
      if (!settings.notifications.enabled) {
        return;
      }

      const notificationTime = new Date(episode.airingAt * 1000);
      
      // Apply delay based on user settings
      switch (settings.notifications.notificationTime) {
        case '1hour':
          notificationTime.setHours(notificationTime.getHours() + 1);
          break;
        case '24hours':
          notificationTime.setDate(notificationTime.getDate() + 1);
          break;
        // 'immediate' needs no delay
      }

      const now = new Date();
      if (notificationTime <= now) {
        // Episode already aired, send immediate notification
        this.sendImmediateNotification(anime, episode);
        return;
      }

      const title = `New Episode Available!`;
      const message = `${anime.title.english || anime.title.romaji} - Episode ${episode.number}`;

      const notificationId = `${anime.id}-${episode.number}`;

      PushNotification.localNotificationSchedule({
        id: notificationId,
        title,
        message,
        date: notificationTime,
        playSound: settings.notifications.soundEnabled,
        vibrate: settings.notifications.vibrationEnabled,
        channelId: 'anime-episodes',
        actions: ['View', 'Dismiss'],
        userInfo: {
          animeId: anime.id,
          episodeNumber: episode.number,
          type: 'episode_release',
        },
        ...(Platform.OS === 'android' && {
          largeIcon: 'ic_launcher',
          smallIcon: 'ic_notification',
        }),
      });

      console.log(`Scheduled notification for ${anime.title.romaji} Episode ${episode.number}`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  static sendImmediateNotification(anime: Anime, episode: Episode): void {
    try {
      const title = `New Episode Available!`;
      const message = `${anime.title.english || anime.title.romaji} - Episode ${episode.number}`;

      PushNotification.localNotification({
        title,
        message,
        playSound: true,
        vibrate: true,
        channelId: 'anime-episodes',
        actions: ['View', 'Dismiss'],
        userInfo: {
          animeId: anime.id,
          episodeNumber: episode.number,
          type: 'episode_release',
        },
        ...(Platform.OS === 'android' && {
          largeIcon: 'ic_launcher',
          smallIcon: 'ic_notification',
        }),
      });
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  }

  static cancelAnimeNotifications(animeId: number): void {
    try {
      PushNotification.getScheduledLocalNotifications((notifications) => {
        notifications.forEach((notification) => {
          if (notification.userInfo?.animeId === animeId) {
            PushNotification.cancelLocalNotification(notification.id);
          }
        });
      });
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  static cancelEpisodeNotification(animeId: number, episodeNumber: number): void {
    try {
      const notificationId = `${animeId}-${episodeNumber}`;
      PushNotification.cancelLocalNotification(notificationId);
    } catch (error) {
      console.error('Error canceling episode notification:', error);
    }
  }

  static clearAllNotifications(): void {
    try {
      PushNotification.cancelAllLocalNotifications();
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  }

  static async getScheduledNotifications(): Promise<any[]> {
    return new Promise((resolve) => {
      PushNotification.getScheduledLocalNotifications((notifications) => {
        resolve(notifications);
      });
    });
  }

  static async rescheduleAllNotifications(): Promise<void> {
    try {
      // Clear existing notifications first
      this.clearAllNotifications();

      // Get user's anime list
      const userAnimeList = await StorageService.getUserAnimeList();
      
      // Reschedule notifications for each anime with upcoming episodes
      for (const userAnime of userAnimeList) {
        if (userAnime.notificationsEnabled && userAnime.anime.nextAiringEpisode) {
          const episode: Episode = {
            number: userAnime.anime.nextAiringEpisode.episode,
            airingAt: userAnime.anime.nextAiringEpisode.airingAt,
            animeId: userAnime.anime.id,
          };

          await this.scheduleEpisodeNotification(userAnime.anime, episode);
        }
      }
    } catch (error) {
      console.error('Error rescheduling notifications:', error);
    }
  }

  static async testNotification(): Promise<void> {
    try {
      PushNotification.localNotification({
        title: 'Test Notification',
        message: 'This is a test notification for Anime Episode Alert',
        playSound: true,
        vibrate: true,
        channelId: 'anime-episodes',
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }
}