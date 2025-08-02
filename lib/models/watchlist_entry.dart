import 'package:hive/hive.dart';
import 'anime.dart';

part 'watchlist_entry.g.dart';

@HiveType(typeId: 2)
class WatchlistEntry extends HiveObject {
  @HiveField(0)
  final String userId;

  @HiveField(1)
  final int animeId;

  @HiveField(2)
  final Anime anime;

  @HiveField(3)
  final WatchStatus status;

  @HiveField(4)
  final int progress; // episodes watched

  @HiveField(5)
  final DateTime addedAt;

  @HiveField(6)
  final DateTime? startedWatchingAt;

  @HiveField(7)
  final DateTime? completedAt;

  @HiveField(8)
  final DateTime? lastWatchedAt;

  @HiveField(9)
  final double? personalScore;

  @HiveField(10)
  final bool notificationsEnabled;

  @HiveField(11)
  final bool subNotificationsEnabled;

  @HiveField(12)
  final bool dubNotificationsEnabled;

  @HiveField(13)
  final int priority; // 1-5, 5 being highest

  @HiveField(14)
  final String? notes;

  @HiveField(15)
  final List<String> tags;

  @HiveField(16)
  final bool private;

  @HiveField(17)
  final int rewatchCount;

  @HiveField(18)
  final bool notifyOnlyOnDelay;

  WatchlistEntry({
    required this.userId,
    required this.animeId,
    required this.anime,
    this.status = WatchStatus.planToWatch,
    this.progress = 0,
    required this.addedAt,
    this.startedWatchingAt,
    this.completedAt,
    this.lastWatchedAt,
    this.personalScore,
    this.notificationsEnabled = true,
    this.subNotificationsEnabled = true,
    this.dubNotificationsEnabled = false,
    this.priority = 3,
    this.notes,
    this.tags = const [],
    this.private = false,
    this.rewatchCount = 0,
    this.notifyOnlyOnDelay = false,
  });

  factory WatchlistEntry.fromJson(Map<String, dynamic> json) {
    return WatchlistEntry(
      userId: json['userId'] ?? '',
      animeId: json['animeId'] ?? 0,
      anime: Anime.fromJson(json['anime'] ?? {}),
      status: WatchStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => WatchStatus.planToWatch,
      ),
      progress: json['progress'] ?? 0,
      addedAt: DateTime.parse(json['addedAt'] ?? DateTime.now().toIso8601String()),
      startedWatchingAt: json['startedWatchingAt'] != null 
          ? DateTime.parse(json['startedWatchingAt']) 
          : null,
      completedAt: json['completedAt'] != null 
          ? DateTime.parse(json['completedAt']) 
          : null,
      lastWatchedAt: json['lastWatchedAt'] != null 
          ? DateTime.parse(json['lastWatchedAt']) 
          : null,
      personalScore: json['personalScore']?.toDouble(),
      notificationsEnabled: json['notificationsEnabled'] ?? true,
      subNotificationsEnabled: json['subNotificationsEnabled'] ?? true,
      dubNotificationsEnabled: json['dubNotificationsEnabled'] ?? false,
      priority: json['priority'] ?? 3,
      notes: json['notes'],
      tags: List<String>.from(json['tags'] ?? []),
      private: json['private'] ?? false,
      rewatchCount: json['rewatchCount'] ?? 0,
      notifyOnlyOnDelay: json['notifyOnlyOnDelay'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'animeId': animeId,
      'anime': anime.toJson(),
      'status': status.toString().split('.').last,
      'progress': progress,
      'addedAt': addedAt.toIso8601String(),
      'startedWatchingAt': startedWatchingAt?.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'lastWatchedAt': lastWatchedAt?.toIso8601String(),
      'personalScore': personalScore,
      'notificationsEnabled': notificationsEnabled,
      'subNotificationsEnabled': subNotificationsEnabled,
      'dubNotificationsEnabled': dubNotificationsEnabled,
      'priority': priority,
      'notes': notes,
      'tags': tags,
      'private': private,
      'rewatchCount': rewatchCount,
      'notifyOnlyOnDelay': notifyOnlyOnDelay,
    };
  }

  WatchlistEntry copyWith({
    String? userId,
    int? animeId,
    Anime? anime,
    WatchStatus? status,
    int? progress,
    DateTime? addedAt,
    DateTime? startedWatchingAt,
    DateTime? completedAt,
    DateTime? lastWatchedAt,
    double? personalScore,
    bool? notificationsEnabled,
    bool? subNotificationsEnabled,
    bool? dubNotificationsEnabled,
    int? priority,
    String? notes,
    List<String>? tags,
    bool? private,
    int? rewatchCount,
    bool? notifyOnlyOnDelay,
  }) {
    return WatchlistEntry(
      userId: userId ?? this.userId,
      animeId: animeId ?? this.animeId,
      anime: anime ?? this.anime,
      status: status ?? this.status,
      progress: progress ?? this.progress,
      addedAt: addedAt ?? this.addedAt,
      startedWatchingAt: startedWatchingAt ?? this.startedWatchingAt,
      completedAt: completedAt ?? this.completedAt,
      lastWatchedAt: lastWatchedAt ?? this.lastWatchedAt,
      personalScore: personalScore ?? this.personalScore,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      subNotificationsEnabled: subNotificationsEnabled ?? this.subNotificationsEnabled,
      dubNotificationsEnabled: dubNotificationsEnabled ?? this.dubNotificationsEnabled,
      priority: priority ?? this.priority,
      notes: notes ?? this.notes,
      tags: tags ?? this.tags,
      private: private ?? this.private,
      rewatchCount: rewatchCount ?? this.rewatchCount,
      notifyOnlyOnDelay: notifyOnlyOnDelay ?? this.notifyOnlyOnDelay,
    );
  }

  // Convenience getters
  bool get isCompleted => status == WatchStatus.completed;
  bool get isWatching => status == WatchStatus.watching;
  bool get isPlanToWatch => status == WatchStatus.planToWatch;
  bool get isOnHold => status == WatchStatus.onHold;
  bool get isDropped => status == WatchStatus.dropped;

  int get episodesRemaining {
    if (anime.episodes == null) return 0;
    return (anime.episodes! - progress).clamp(0, anime.episodes!);
  }

  double get progressPercentage {
    if (anime.episodes == null || anime.episodes == 0) return 0.0;
    return (progress / anime.episodes!).clamp(0.0, 1.0);
  }

  bool get isBehind {
    if (!anime.isCurrentlyAiring || anime.nextEpisode == null) return false;
    return progress < (anime.nextEpisode! - 1);
  }

  int get episodesBehind {
    if (!isBehind || anime.nextEpisode == null) return 0;
    return (anime.nextEpisode! - 1 - progress).clamp(0, anime.nextEpisode! - 1);
  }

  bool get shouldNotify {
    if (!notificationsEnabled || !anime.isCurrentlyAiring) return false;
    if (isCompleted || isDropped) return false;
    if (notifyOnlyOnDelay && !isBehind) return false;
    return true;
  }
}

@HiveType(typeId: 3)
enum WatchStatus {
  @HiveField(0)
  watching,
  
  @HiveField(1)
  completed,
  
  @HiveField(2)
  onHold,
  
  @HiveField(3)
  dropped,
  
  @HiveField(4)
  planToWatch,
  
  @HiveField(5)
  rewatching,
}

extension WatchStatusExtension on WatchStatus {
  String get displayName {
    switch (this) {
      case WatchStatus.watching:
        return 'Currently Watching';
      case WatchStatus.completed:
        return 'Completed';
      case WatchStatus.onHold:
        return 'On Hold';
      case WatchStatus.dropped:
        return 'Dropped';
      case WatchStatus.planToWatch:
        return 'Plan to Watch';
      case WatchStatus.rewatching:
        return 'Rewatching';
    }
  }

  String get shortName {
    switch (this) {
      case WatchStatus.watching:
        return 'Watching';
      case WatchStatus.completed:
        return 'Completed';
      case WatchStatus.onHold:
        return 'On Hold';
      case WatchStatus.dropped:
        return 'Dropped';
      case WatchStatus.planToWatch:
        return 'Plan to Watch';
      case WatchStatus.rewatching:
        return 'Rewatching';
    }
  }
}