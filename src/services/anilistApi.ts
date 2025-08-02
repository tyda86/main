import axios from 'axios';
import { Anime, SearchFilters } from '@types/index';

const ANILIST_API_URL = 'https://graphql.anilist.co';

export class AniListApi {
  private static async query(query: string, variables: any = {}) {
    try {
      const response = await axios.post(ANILIST_API_URL, {
        query,
        variables,
      });
      
      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('AniList API Error:', error);
      throw error;
    }
  }

  static async searchAnime(
    searchTerm: string,
    page: number = 1,
    perPage: number = 20,
    filters: SearchFilters = {}
  ): Promise<{ media: Anime[]; pageInfo: any }> {
    const query = `
      query ($search: String, $page: Int, $perPage: Int, $status: MediaStatus, $genre: String, $season: MediaSeason, $seasonYear: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
          }
          media(search: $search, type: ANIME, status: $status, genre: $genre, season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              medium
              large
            }
            episodes
            status
            season
            seasonYear
            genres
            averageScore
            nextAiringEpisode {
              airingAt
              timeUntilAiring
              episode
            }
          }
        }
      }
    `;

    const variables = {
      search: searchTerm,
      page,
      perPage,
      status: filters.status,
      genre: filters.genre,
      season: filters.season,
      seasonYear: filters.year,
    };

    const data = await this.query(query, variables);
    return data.Page;
  }

  static async getAnimeById(id: number): Promise<Anime> {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          description
          coverImage {
            medium
            large
          }
          episodes
          status
          season
          seasonYear
          genres
          averageScore
          nextAiringEpisode {
            airingAt
            timeUntilAiring
            episode
          }
        }
      }
    `;

    const data = await this.query(query, { id });
    return data.Media;
  }

  static async getTrendingAnime(page: number = 1, perPage: number = 20): Promise<{ media: Anime[]; pageInfo: any }> {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
          }
          media(type: ANIME, sort: TRENDING_DESC, status: RELEASING) {
            id
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              medium
              large
            }
            episodes
            status
            season
            seasonYear
            genres
            averageScore
            nextAiringEpisode {
              airingAt
              timeUntilAiring
              episode
            }
          }
        }
      }
    `;

    const data = await this.query(query, { page, perPage });
    return data.Page;
  }

  static async getCurrentSeasonAnime(page: number = 1, perPage: number = 20): Promise<{ media: Anime[]; pageInfo: any }> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Determine current season
    let currentSeason: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
    if (currentMonth >= 12 || currentMonth <= 2) {
      currentSeason = 'WINTER';
    } else if (currentMonth >= 3 && currentMonth <= 5) {
      currentSeason = 'SPRING';
    } else if (currentMonth >= 6 && currentMonth <= 8) {
      currentSeason = 'SUMMER';
    } else {
      currentSeason = 'FALL';
    }

    const query = `
      query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
          }
          media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              medium
              large
            }
            episodes
            status
            season
            seasonYear
            genres
            averageScore
            nextAiringEpisode {
              airingAt
              timeUntilAiring
              episode
            }
          }
        }
      }
    `;

    const data = await this.query(query, { page, perPage, season: currentSeason, seasonYear: currentYear });
    return data.Page;
  }
}