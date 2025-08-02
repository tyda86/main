export interface Anime {
  mal_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  synopsis?: string;
  episodes?: number;
  status: 'Finished Airing' | 'Currently Airing' | 'Not yet aired';
  aired: {
    from: string;
    to: string;
  };
  score?: number;
  genres: Array<{
    mal_id: number;
    name: string;
  }>;
  studios: Array<{
    mal_id: number;
    name: string;
  }>;
  year?: number;
  season?: string;
}

export interface Episode {
  mal_id: number;
  title: string;
  episode: string;
  url: string;
  aired?: string;
}

export interface UserAnime {
  anime: Anime;
  notifications: boolean;
  lastCheckedEpisode?: number;
  dateAdded: string;
}

export interface AnimeSearchResult {
  data: Anime[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
}

export interface EpisodeData {
  data: Episode[];
}

export interface NotificationData {
  animeName: string;
  episodeNumber: number;
  animeId: number;
}