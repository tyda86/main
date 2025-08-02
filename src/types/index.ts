export interface Anime {
  id: number;
  title: {
    romaji: string;
    english?: string;
    native: string;
  };
  description?: string;
  coverImage: {
    medium: string;
    large: string;
  };
  episodes?: number;
  status: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
  season?: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
  seasonYear?: number;
  genres: string[];
  averageScore?: number;
  nextAiringEpisode?: {
    airingAt: number;
    timeUntilAiring: number;
    episode: number;
  };
}

export interface UserAnime {
  animeId: number;
  anime: Anime;
  addedAt: string;
  notificationsEnabled: boolean;
  lastNotifiedEpisode?: number;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationTime: 'immediate' | '1hour' | '24hours';
}

export interface Episode {
  number: number;
  title?: string;
  airingAt: number;
  animeId: number;
}

export interface SearchFilters {
  status?: Anime['status'];
  genre?: string;
  season?: Anime['season'];
  year?: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  language: 'en' | 'ja';
}

export type RootStackParamList = {
  Main: undefined;
  AnimeDetails: { animeId: number };
};