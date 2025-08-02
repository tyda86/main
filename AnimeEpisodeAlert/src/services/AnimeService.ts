import axios from 'axios';
import { Anime, AnimeSearchResult, EpisodeData } from '../types';

const BASE_URL = 'https://api.jikan.moe/v4';

class AnimeService {
  private static instance: AnimeService;
  private axiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
    });

    // Add request interceptor for rate limiting
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Jikan API has rate limits, so we add a small delay
        return new Promise((resolve) => {
          setTimeout(() => resolve(config), 1000);
        });
      },
      (error) => Promise.reject(error)
    );
  }

  public static getInstance(): AnimeService {
    if (!AnimeService.instance) {
      AnimeService.instance = new AnimeService();
    }
    return AnimeService.instance;
  }

  async searchAnime(query: string, page: number = 1): Promise<AnimeSearchResult> {
    try {
      const response = await this.axiosInstance.get('/anime', {
        params: {
          q: query,
          page,
          limit: 20,
          order_by: 'score',
          sort: 'desc',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching anime:', error);
      throw new Error('Failed to search anime');
    }
  }

  async getAnimeById(id: number): Promise<Anime> {
    try {
      const response = await this.axiosInstance.get(`/anime/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting anime by ID:', error);
      throw new Error('Failed to get anime details');
    }
  }

  async getAnimeEpisodes(id: number, page: number = 1): Promise<EpisodeData> {
    try {
      const response = await this.axiosInstance.get(`/anime/${id}/episodes`, {
        params: {
          page,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting anime episodes:', error);
      throw new Error('Failed to get anime episodes');
    }
  }

  async getCurrentSeasonAnime(): Promise<AnimeSearchResult> {
    try {
      const response = await this.axiosInstance.get('/seasons/now', {
        params: {
          page: 1,
          limit: 20,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting current season anime:', error);
      throw new Error('Failed to get current season anime');
    }
  }

  async getTopAnime(): Promise<AnimeSearchResult> {
    try {
      const response = await this.axiosInstance.get('/top/anime', {
        params: {
          page: 1,
          limit: 20,
          filter: 'airing',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting top anime:', error);
      throw new Error('Failed to get top anime');
    }
  }
}

export default AnimeService;