import 'dart:convert';
import 'package:dio/dio.dart';
import '../constants/app_constants.dart';
import '../models/anime.dart';

class AniListService {
  static final AniListService _instance = AniListService._internal();
  factory AniListService() => _instance;
  AniListService._internal();

  late final Dio _dio;

  void initialize() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.anilistGraphqlEndpoint,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
    ));

    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      error: true,
    ));
  }

  // GraphQL Queries
  static const String _animeSearchQuery = '''
    query (\$search: String, \$page: Int, \$perPage: Int, \$sort: [MediaSort], \$status: MediaStatus, \$season: MediaSeason, \$seasonYear: Int, \$format: MediaFormat) {
      Page(page: \$page, perPage: \$perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(search: \$search, type: ANIME, sort: \$sort, status: \$status, season: \$season, seasonYear: \$seasonYear, format: \$format) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          description(asHtml: false)
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
          season
          seasonYear
          genres
          averageScore
          popularity
          format
          studios(isMain: true) {
            nodes {
              name
            }
          }
          source
          isAdult
          trailer {
            id
            site
          }
          externalLinks {
            site
            url
            type
          }
          nextAiringEpisode {
            airingAt
            episode
            timeUntilAiring
          }
        }
      }
    }
  ''';

  static const String _animeDetailsQuery = '''
    query (\$id: Int) {
      Media(id: \$id, type: ANIME) {
        id
        title {
          romaji
          english
          native
          userPreferred
        }
        description(asHtml: false)
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
        season
        seasonYear
        genres
        averageScore
        popularity
        format
        studios(isMain: true) {
          nodes {
            name
          }
        }
        source
        isAdult
        trailer {
          id
          site
        }
        externalLinks {
          site
          url
          type
        }
        nextAiringEpisode {
          airingAt
          episode
          timeUntilAiring
        }
        relations {
          edges {
            relationType
            node {
              id
              title {
                userPreferred
              }
              format
              status
            }
          }
        }
        characters(sort: ROLE, perPage: 10) {
          edges {
            role
            node {
              id
              name {
                full
              }
              image {
                medium
              }
            }
            voiceActors(language: JAPANESE, sort: RELEVANCE) {
              id
              name {
                full
              }
              image {
                medium
              }
            }
          }
        }
        recommendations(sort: RATING_DESC, perPage: 5) {
          nodes {
            mediaRecommendation {
              id
              title {
                userPreferred
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
  ''';

  static const String _trendingAnimeQuery = '''
    query (\$page: Int, \$perPage: Int) {
      Page(page: \$page, perPage: \$perPage) {
        media(type: ANIME, sort: TRENDING_DESC, status: RELEASING) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          coverImage {
            large
            medium
          }
          bannerImage
          episodes
          status
          season
          seasonYear
          genres
          averageScore
          popularity
          format
          nextAiringEpisode {
            airingAt
            episode
            timeUntilAiring
          }
        }
      }
    }
  ''';

  static const String _currentSeasonAnimeQuery = '''
    query (\$season: MediaSeason, \$seasonYear: Int, \$page: Int, \$perPage: Int) {
      Page(page: \$page, perPage: \$perPage) {
        media(type: ANIME, season: \$season, seasonYear: \$seasonYear, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          coverImage {
            large
            medium
          }
          bannerImage
          episodes
          status
          season
          seasonYear
          genres
          averageScore
          popularity
          format
          nextAiringEpisode {
            airingAt
            episode
            timeUntilAiring
          }
        }
      }
    }
  ''';

  static const String _airingScheduleQuery = '''
    query (\$page: Int, \$perPage: Int, \$airingAt_greater: Int, \$airingAt_lesser: Int) {
      Page(page: \$page, perPage: \$perPage) {
        airingSchedules(airingAt_greater: \$airingAt_greater, airingAt_lesser: \$airingAt_lesser, sort: TIME) {
          id
          airingAt
          episode
          timeUntilAiring
          media {
            id
            title {
              romaji
              english
              native
              userPreferred
            }
            coverImage {
              medium
            }
            status
            genres
            averageScore
            format
          }
        }
      }
    }
  ''';

  // Search anime
  Future<List<Anime>> searchAnime({
    String? query,
    int page = 1,
    int perPage = 20,
    String? status,
    String? season,
    int? seasonYear,
    String? format,
    List<String> sort = const ['POPULARITY_DESC'],
  }) async {
    try {
      final variables = <String, dynamic>{
        'page': page,
        'perPage': perPage,
        'sort': sort,
      };

      if (query != null && query.isNotEmpty) {
        variables['search'] = query;
      }
      if (status != null) {
        variables['status'] = status;
      }
      if (season != null) {
        variables['season'] = season;
      }
      if (seasonYear != null) {
        variables['seasonYear'] = seasonYear;
      }
      if (format != null) {
        variables['format'] = format;
      }

      final response = await _dio.post(
        '',
        data: {
          'query': _animeSearchQuery,
          'variables': variables,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['errors'] != null) {
          throw Exception('GraphQL Error: ${data['errors']}');
        }

        final mediaList = data['data']['Page']['media'] as List;
        return mediaList.map((json) => Anime.fromJson(json)).toList();
      } else {
        throw Exception('HTTP Error: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to search anime: $e');
    }
  }

  // Get anime details by ID
  Future<Anime?> getAnimeDetails(int id) async {
    try {
      final response = await _dio.post(
        '',
        data: {
          'query': _animeDetailsQuery,
          'variables': {'id': id},
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['errors'] != null) {
          throw Exception('GraphQL Error: ${data['errors']}');
        }

        final media = data['data']['Media'];
        if (media != null) {
          return Anime.fromJson(media);
        }
      }
      return null;
    } catch (e) {
      throw Exception('Failed to get anime details: $e');
    }
  }

  // Get trending anime
  Future<List<Anime>> getTrendingAnime({int page = 1, int perPage = 20}) async {
    try {
      final response = await _dio.post(
        '',
        data: {
          'query': _trendingAnimeQuery,
          'variables': {
            'page': page,
            'perPage': perPage,
          },
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['errors'] != null) {
          throw Exception('GraphQL Error: ${data['errors']}');
        }

        final mediaList = data['data']['Page']['media'] as List;
        return mediaList.map((json) => Anime.fromJson(json)).toList();
      } else {
        throw Exception('HTTP Error: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to get trending anime: $e');
    }
  }

  // Get current season anime
  Future<List<Anime>> getCurrentSeasonAnime({int page = 1, int perPage = 20}) async {
    try {
      final now = DateTime.now();
      final season = _getCurrentSeason(now.month);
      final year = now.year;

      final response = await _dio.post(
        '',
        data: {
          'query': _currentSeasonAnimeQuery,
          'variables': {
            'season': season,
            'seasonYear': year,
            'page': page,
            'perPage': perPage,
          },
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['errors'] != null) {
          throw Exception('GraphQL Error: ${data['errors']}');
        }

        final mediaList = data['data']['Page']['media'] as List;
        return mediaList.map((json) => Anime.fromJson(json)).toList();
      } else {
        throw Exception('HTTP Error: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to get current season anime: $e');
    }
  }

  // Get airing schedule
  Future<List<Map<String, dynamic>>> getAiringSchedule({
    int page = 1,
    int perPage = 50,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final now = DateTime.now();
      final start = startDate ?? now;
      final end = endDate ?? now.add(const Duration(days: 7));

      final response = await _dio.post(
        '',
        data: {
          'query': _airingScheduleQuery,
          'variables': {
            'page': page,
            'perPage': perPage,
            'airingAt_greater': start.millisecondsSinceEpoch ~/ 1000,
            'airingAt_lesser': end.millisecondsSinceEpoch ~/ 1000,
          },
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['errors'] != null) {
          throw Exception('GraphQL Error: ${data['errors']}');
        }

        final scheduleList = data['data']['Page']['airingSchedules'] as List;
        return scheduleList.map((json) => {
          'id': json['id'],
          'airingAt': json['airingAt'],
          'episode': json['episode'],
          'timeUntilAiring': json['timeUntilAiring'],
          'anime': Anime.fromJson(json['media']),
        }).toList();
      } else {
        throw Exception('HTTP Error: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to get airing schedule: $e');
    }
  }

  // Get popular anime by genre
  Future<List<Anime>> getAnimeByGenre(String genre, {int page = 1, int perPage = 20}) async {
    try {
      final response = await _dio.post(
        '',
        data: {
          'query': _animeSearchQuery,
          'variables': {
            'page': page,
            'perPage': perPage,
            'sort': ['POPULARITY_DESC'],
          },
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['errors'] != null) {
          throw Exception('GraphQL Error: ${data['errors']}');
        }

        final mediaList = data['data']['Page']['media'] as List;
        final animeList = mediaList.map((json) => Anime.fromJson(json)).toList();
        
        // Filter by genre
        return animeList.where((anime) => 
          anime.genres.any((g) => g.toLowerCase() == genre.toLowerCase())
        ).toList();
      } else {
        throw Exception('HTTP Error: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to get anime by genre: $e');
    }
  }

  // Helper method to get current season
  String _getCurrentSeason(int month) {
    switch (month) {
      case 12:
      case 1:
      case 2:
        return 'WINTER';
      case 3:
      case 4:
      case 5:
        return 'SPRING';
      case 6:
      case 7:
      case 8:
        return 'SUMMER';
      case 9:
      case 10:
      case 11:
        return 'FALL';
      default:
        return 'SPRING';
    }
  }

  // Get upcoming anime (next season)
  Future<List<Anime>> getUpcomingAnime({int page = 1, int perPage = 20}) async {
    try {
      final now = DateTime.now();
      final nextSeasonMonth = (now.month + 3) % 12;
      final nextSeasonYear = nextSeasonMonth < now.month ? now.year + 1 : now.year;
      final nextSeason = _getCurrentSeason(nextSeasonMonth == 0 ? 12 : nextSeasonMonth);

      return await searchAnime(
        page: page,
        perPage: perPage,
        season: nextSeason,
        seasonYear: nextSeasonYear,
        status: 'NOT_YET_RELEASED',
        sort: ['POPULARITY_DESC'],
      );
    } catch (e) {
      throw Exception('Failed to get upcoming anime: $e');
    }
  }

  // Get recently updated anime (for notifications)
  Future<List<Anime>> getRecentlyUpdatedAnime() async {
    try {
      return await searchAnime(
        perPage: 50,
        status: 'RELEASING',
        sort: ['UPDATED_AT_DESC'],
      );
    } catch (e) {
      throw Exception('Failed to get recently updated anime: $e');
    }
  }
}