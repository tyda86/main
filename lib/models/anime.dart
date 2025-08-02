import 'package:hive/hive.dart';

part 'anime.g.dart';

@HiveType(typeId: 0)
class Anime extends HiveObject {
  @HiveField(0)
  final int id;

  @HiveField(1)
  final String title;

  @HiveField(2)
  final String? englishTitle;

  @HiveField(3)
  final String? romajiTitle;

  @HiveField(4)
  final String? description;

  @HiveField(5)
  final String? coverImage;

  @HiveField(6)
  final String? bannerImage;

  @HiveField(7)
  final int? episodes;

  @HiveField(8)
  final String? status; // RELEASING, FINISHED, NOT_YET_RELEASED, etc.

  @HiveField(9)
  final DateTime? startDate;

  @HiveField(10)
  final DateTime? endDate;

  @HiveField(11)
  final String? season; // SPRING, SUMMER, FALL, WINTER

  @HiveField(12)
  final int? seasonYear;

  @HiveField(13)
  final List<String> genres;

  @HiveField(14)
  final double? averageScore;

  @HiveField(15)
  final int? popularity;

  @HiveField(16)
  final String? format; // TV, MOVIE, OVA, etc.

  @HiveField(17)
  final List<String> streamingPlatforms;

  @HiveField(18)
  final String? nextEpisodeAiringAt;

  @HiveField(19)
  final int? nextEpisode;

  @HiveField(20)
  final String? studio;

  @HiveField(21)
  final String? source; // MANGA, ORIGINAL, etc.

  @HiveField(22)
  final bool isAdult;

  @HiveField(23)
  final String? trailer;

  @HiveField(24)
  final Map<String, String>? externalLinks; // Crunchyroll, Netflix, etc.

  Anime({
    required this.id,
    required this.title,
    this.englishTitle,
    this.romajiTitle,
    this.description,
    this.coverImage,
    this.bannerImage,
    this.episodes,
    this.status,
    this.startDate,
    this.endDate,
    this.season,
    this.seasonYear,
    this.genres = const [],
    this.averageScore,
    this.popularity,
    this.format,
    this.streamingPlatforms = const [],
    this.nextEpisodeAiringAt,
    this.nextEpisode,
    this.studio,
    this.source,
    this.isAdult = false,
    this.trailer,
    this.externalLinks,
  });

  factory Anime.fromJson(Map<String, dynamic> json) {
    return Anime(
      id: json['id'] ?? 0,
      title: json['title']?['userPreferred'] ?? 
             json['title']?['romaji'] ?? 
             json['title']?['english'] ?? 
             'Unknown Title',
      englishTitle: json['title']?['english'],
      romajiTitle: json['title']?['romaji'],
      description: json['description'],
      coverImage: json['coverImage']?['large'] ?? json['coverImage']?['medium'],
      bannerImage: json['bannerImage'],
      episodes: json['episodes'],
      status: json['status'],
      startDate: _parseDate(json['startDate']),
      endDate: _parseDate(json['endDate']),
      season: json['season'],
      seasonYear: json['seasonYear'],
      genres: List<String>.from(json['genres'] ?? []),
      averageScore: json['averageScore']?.toDouble(),
      popularity: json['popularity'],
      format: json['format'],
      streamingPlatforms: _extractStreamingPlatforms(json['externalLinks']),
      nextEpisodeAiringAt: json['nextAiringEpisode']?['airingAt']?.toString(),
      nextEpisode: json['nextAiringEpisode']?['episode'],
      studio: _extractStudio(json['studios']),
      source: json['source'],
      isAdult: json['isAdult'] ?? false,
      trailer: json['trailer']?['id'],
      externalLinks: _extractExternalLinks(json['externalLinks']),
    );
  }

  static DateTime? _parseDate(Map<String, dynamic>? dateMap) {
    if (dateMap == null) return null;
    try {
      final year = dateMap['year'];
      final month = dateMap['month'] ?? 1;
      final day = dateMap['day'] ?? 1;
      if (year != null) {
        return DateTime(year, month, day);
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  static List<String> _extractStreamingPlatforms(List<dynamic>? links) {
    if (links == null) return [];
    return links
        .where((link) => link['type'] == 'STREAMING')
        .map<String>((link) => link['site'] as String)
        .toList();
  }

  static String? _extractStudio(Map<String, dynamic>? studios) {
    if (studios == null || studios['nodes'] == null) return null;
    final studioList = studios['nodes'] as List<dynamic>;
    if (studioList.isNotEmpty) {
      return studioList.first['name'];
    }
    return null;
  }

  static Map<String, String>? _extractExternalLinks(List<dynamic>? links) {
    if (links == null) return null;
    final Map<String, String> linkMap = {};
    for (final link in links) {
      if (link['url'] != null && link['site'] != null) {
        linkMap[link['site']] = link['url'];
      }
    }
    return linkMap.isEmpty ? null : linkMap;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'englishTitle': englishTitle,
      'romajiTitle': romajiTitle,
      'description': description,
      'coverImage': coverImage,
      'bannerImage': bannerImage,
      'episodes': episodes,
      'status': status,
      'startDate': startDate?.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
      'season': season,
      'seasonYear': seasonYear,
      'genres': genres,
      'averageScore': averageScore,
      'popularity': popularity,
      'format': format,
      'streamingPlatforms': streamingPlatforms,
      'nextEpisodeAiringAt': nextEpisodeAiringAt,
      'nextEpisode': nextEpisode,
      'studio': studio,
      'source': source,
      'isAdult': isAdult,
      'trailer': trailer,
      'externalLinks': externalLinks,
    };
  }

  bool get isCurrentlyAiring => status == 'RELEASING';
  bool get isFinished => status == 'FINISHED';
  bool get isUpcoming => status == 'NOT_YET_RELEASED';

  String get displayTitle => englishTitle ?? romajiTitle ?? title;

  DateTime? get nextAiringDateTime {
    if (nextEpisodeAiringAt == null) return null;
    try {
      return DateTime.fromMillisecondsSinceEpoch(
        int.parse(nextEpisodeAiringAt!) * 1000,
      );
    } catch (e) {
      return null;
    }
  }

  Duration? get timeUntilNextEpisode {
    final nextAiring = nextAiringDateTime;
    if (nextAiring == null) return null;
    return nextAiring.difference(DateTime.now());
  }

  bool get hasNextEpisode => nextEpisode != null && nextAiringDateTime != null;
}