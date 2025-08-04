import axios from 'axios';

const ANILIST_API_URL = 'https://graphql.anilist.co';

export interface AnimeData {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  description: string;
  coverImage: {
    large: string;
    medium: string;
  };
  bannerImage?: string;
  episodes?: number;
  status: string;
  startDate: {
    year: number;
    month: number;
    day: number;
  };
  endDate?: {
    year: number;
    month: number;
    day: number;
  };
  nextAiringEpisode?: {
    episode: number;
    airingAt: number;
  };
  genres: string[];
  averageScore?: number;
  studios: {
    nodes: {
      name: string;
    }[];
  };
  season?: string;
  seasonYear?: number;
  format: string;
}

export interface SearchResponse {
  data: {
    Page: {
      media: AnimeData[];
      pageInfo: {
        hasNextPage: boolean;
        currentPage: number;
        lastPage: number;
      };
    };
  };
}

const SEARCH_QUERY = `
  query ($search: String, $page: Int, $perPage: Int, $type: MediaType) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
        lastPage
      }
      media(search: $search, type: $type, format_in: [TV, MOVIE, OVA, ONA, SPECIAL]) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          medium
        }
        bannerImage
        episodes
        status
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        nextAiringEpisode {
          episode
          airingAt
        }
        genres
        averageScore
        studios {
          nodes {
            name
          }
        }
        season
        seasonYear
        format
      }
    }
  }
`;

const TRENDING_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
        lastPage
      }
      media(sort: TRENDING_DESC, type: ANIME, format_in: [TV, MOVIE, OVA, ONA, SPECIAL]) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          medium
        }
        bannerImage
        episodes
        status
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        nextAiringEpisode {
          episode
          airingAt
        }
        genres
        averageScore
        studios {
          nodes {
            name
          }
        }
        season
        seasonYear
        format
      }
    }
  }
`;

const ANIME_DETAILS_QUERY = `
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
        large
        medium
      }
      bannerImage
      episodes
      status
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      nextAiringEpisode {
        episode
        airingAt
      }
      genres
      averageScore
      studios {
        nodes {
          name
        }
      }
      season
      seasonYear
      format
      duration
      source
      trailer {
        id
        site
      }
      relations {
        edges {
          relationType
          node {
            id
            title {
              romaji
              english
            }
            coverImage {
              medium
            }
            format
            type
          }
        }
      }
      recommendations {
        nodes {
          mediaRecommendation {
            id
            title {
              romaji
              english
            }
            coverImage {
              medium
            }
            averageScore
          }
        }
      }
    }
  }
`;

export const searchAnime = async (query: string, page = 1, perPage = 20): Promise<SearchResponse> => {
  try {
    const response = await axios.post(ANILIST_API_URL, {
      query: SEARCH_QUERY,
      variables: {
        search: query,
        page,
        perPage,
        type: 'ANIME',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching anime:', error);
    throw new Error('Failed to search anime');
  }
};

export const getTrendingAnime = async (page = 1, perPage = 20): Promise<SearchResponse> => {
  try {
    const response = await axios.post(ANILIST_API_URL, {
      query: TRENDING_QUERY,
      variables: {
        page,
        perPage,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending anime:', error);
    throw new Error('Failed to fetch trending anime');
  }
};

export const getAnimeDetails = async (id: number): Promise<{ data: { Media: AnimeData } }> => {
  try {
    const response = await axios.post(ANILIST_API_URL, {
      query: ANIME_DETAILS_QUERY,
      variables: {
        id,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime details:', error);
    throw new Error('Failed to fetch anime details');
  }
};

export const getCurrentSeasonAnime = async (year?: number, season?: string) => {
  const currentDate = new Date();
  const currentYear = year || currentDate.getFullYear();
  const currentSeason = season || getCurrentSeason();

  const query = `
    query ($year: Int, $season: MediaSeason) {
      Page(page: 1, perPage: 50) {
        media(seasonYear: $year, season: $season, type: ANIME, format_in: [TV, MOVIE, OVA, ONA, SPECIAL], sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            medium
          }
          episodes
          status
          nextAiringEpisode {
            episode
            airingAt
          }
          averageScore
          genres
        }
      }
    }
  `;

  try {
    const response = await axios.post(ANILIST_API_URL, {
      query,
      variables: {
        year: currentYear,
        season: currentSeason.toUpperCase(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current season anime:', error);
    throw new Error('Failed to fetch current season anime');
  }
};

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}