import 'package:flutter/foundation.dart';
import '../models/anime.dart';
import '../models/watchlist_entry.dart';
import '../services/anilist_service.dart';

class WatchlistProvider with ChangeNotifier {
  final AniListService _aniListService = AniListService();
  
  List<WatchlistEntry> _watchlist = [];
  List<Anime> _searchResults = [];
  List<Anime> _trendingAnime = [];
  List<Anime> _currentSeasonAnime = [];
  List<Map<String, dynamic>> _airingSchedule = [];
  
  bool _isLoading = false;
  bool _isSearching = false;
  bool _isSyncing = false;
  String? _error;
  String _searchQuery = '';

  // Getters
  List<WatchlistEntry> get watchlist => _watchlist;
  List<Anime> get searchResults => _searchResults;
  List<Anime> get trendingAnime => _trendingAnime;
  List<Anime> get currentSeasonAnime => _currentSeasonAnime;
  List<Map<String, dynamic>> get airingSchedule => _airingSchedule;
  
  bool get isLoading => _isLoading;
  bool get isSearching => _isSearching;
  bool get isSyncing => _isSyncing;
  String? get error => _error;
  String get searchQuery => _searchQuery;

  int get watchlistCount => _watchlist.length;
  int get watchingCount => _watchlist.where((entry) => entry.isWatching).length;
  int get completedCount => _watchlist.where((entry) => entry.isCompleted).length;
  int get planToWatchCount => _watchlist.where((entry) => entry.isPlanToWatch).length;

  // Initialize provider
  Future<void> initialize() async {
    await loadWatchlist();
    await loadTrendingAnime();
    await loadCurrentSeasonAnime();
    await loadAiringSchedule();
  }

  // Load watchlist from storage
  Future<void> loadWatchlist() async {
    try {
      _setLoading(true);
      // TODO: Load from Hive/Firestore
      // For now, initialize with empty list
      _watchlist = [];
      notifyListeners();
    } catch (e) {
      _setError('Failed to load watchlist: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Search anime
  Future<void> searchAnime(String query) async {
    try {
      _isSearching = true;
      _searchQuery = query;
      _clearError();
      notifyListeners();

      if (query.trim().isEmpty) {
        _searchResults = [];
        _isSearching = false;
        notifyListeners();
        return;
      }

      final results = await _aniListService.searchAnime(
        query: query,
        page: 1,
        perPage: 20,
      );

      _searchResults = results;
    } catch (e) {
      _setError('Search failed: $e');
    } finally {
      _isSearching = false;
      notifyListeners();
    }
  }

  // Clear search results
  void clearSearch() {
    _searchResults = [];
    _searchQuery = '';
    notifyListeners();
  }

  // Load trending anime
  Future<void> loadTrendingAnime() async {
    try {
      final trending = await _aniListService.getTrendingAnime(page: 1, perPage: 10);
      _trendingAnime = trending;
      notifyListeners();
    } catch (e) {
      _setError('Failed to load trending anime: $e');
    }
  }

  // Load current season anime
  Future<void> loadCurrentSeasonAnime() async {
    try {
      final currentSeason = await _aniListService.getCurrentSeasonAnime(page: 1, perPage: 20);
      _currentSeasonAnime = currentSeason;
      notifyListeners();
    } catch (e) {
      _setError('Failed to load current season anime: $e');
    }
  }

  // Load airing schedule
  Future<void> loadAiringSchedule() async {
    try {
      final schedule = await _aniListService.getAiringSchedule();
      _airingSchedule = schedule;
      notifyListeners();
    } catch (e) {
      _setError('Failed to load airing schedule: $e');
    }
  }

  // Add anime to watchlist
  Future<bool> addToWatchlist({
    required Anime anime,
    required String userId,
    WatchStatus status = WatchStatus.planToWatch,
    int progress = 0,
    bool notificationsEnabled = true,
  }) async {
    try {
      // Check if already in watchlist
      if (isInWatchlist(anime.id)) {
        _setError('Anime is already in your watchlist');
        return false;
      }

      final entry = WatchlistEntry(
        userId: userId,
        animeId: anime.id,
        anime: anime,
        status: status,
        progress: progress,
        addedAt: DateTime.now(),
        notificationsEnabled: notificationsEnabled,
      );

      _watchlist.add(entry);
      notifyListeners();

      // TODO: Save to Hive/Firestore
      await _saveWatchlist();
      
      return true;
    } catch (e) {
      _setError('Failed to add to watchlist: $e');
      return false;
    }
  }

  // Remove from watchlist
  Future<bool> removeFromWatchlist(int animeId) async {
    try {
      _watchlist.removeWhere((entry) => entry.animeId == animeId);
      notifyListeners();

      // TODO: Save to Hive/Firestore
      await _saveWatchlist();
      
      return true;
    } catch (e) {
      _setError('Failed to remove from watchlist: $e');
      return false;
    }
  }

  // Update watchlist entry
  Future<bool> updateWatchlistEntry({
    required int animeId,
    WatchStatus? status,
    int? progress,
    double? personalScore,
    bool? notificationsEnabled,
    String? notes,
  }) async {
    try {
      final index = _watchlist.indexWhere((entry) => entry.animeId == animeId);
      if (index == -1) {
        _setError('Anime not found in watchlist');
        return false;
      }

      final entry = _watchlist[index];
      final updatedEntry = entry.copyWith(
        status: status,
        progress: progress,
        personalScore: personalScore,
        notificationsEnabled: notificationsEnabled,
        notes: notes,
        lastWatchedAt: progress != null && progress > entry.progress 
            ? DateTime.now() 
            : entry.lastWatchedAt,
        completedAt: status == WatchStatus.completed && entry.status != WatchStatus.completed
            ? DateTime.now()
            : entry.completedAt,
      );

      _watchlist[index] = updatedEntry;
      notifyListeners();

      // TODO: Save to Hive/Firestore
      await _saveWatchlist();
      
      return true;
    } catch (e) {
      _setError('Failed to update watchlist entry: $e');
      return false;
    }
  }

  // Check if anime is in watchlist
  bool isInWatchlist(int animeId) {
    return _watchlist.any((entry) => entry.animeId == animeId);
  }

  // Get watchlist entry by anime ID
  WatchlistEntry? getWatchlistEntry(int animeId) {
    try {
      return _watchlist.firstWhere((entry) => entry.animeId == animeId);
    } catch (e) {
      return null;
    }
  }

  // Get watchlist by status
  List<WatchlistEntry> getWatchlistByStatus(WatchStatus status) {
    return _watchlist.where((entry) => entry.status == status).toList();
  }

  // Get currently airing anime from watchlist
  List<WatchlistEntry> get currentlyAiringWatchlist {
    return _watchlist.where((entry) => 
      entry.anime.isCurrentlyAiring && 
      (entry.isWatching || entry.isPlanToWatch)
    ).toList();
  }

  // Get anime that have new episodes
  List<WatchlistEntry> get animeWithNewEpisodes {
    return _watchlist.where((entry) => 
      entry.isBehind && entry.shouldNotify
    ).toList();
  }

  // Sync with cloud (Firestore)
  Future<void> syncWatchlist() async {
    try {
      _isSyncing = true;
      notifyListeners();

      // TODO: Implement cloud sync
      // This would involve:
      // 1. Upload local changes to Firestore
      // 2. Download remote changes from Firestore
      // 3. Resolve conflicts
      // 4. Update local storage

      await Future.delayed(const Duration(seconds: 1)); // Placeholder
    } catch (e) {
      _setError('Failed to sync watchlist: $e');
    } finally {
      _isSyncing = false;
      notifyListeners();
    }
  }

  // Import from external service (AniList/MyAnimeList)
  Future<bool> importFromExternalService({
    required String service,
    required String username,
  }) async {
    try {
      _setLoading(true);
      _clearError();

      // TODO: Implement import from external services
      // This would involve:
      // 1. Fetch user's list from AniList/MAL API
      // 2. Convert to our WatchlistEntry format
      // 3. Merge with existing watchlist
      // 4. Save to storage

      await Future.delayed(const Duration(seconds: 2)); // Placeholder
      
      return true;
    } catch (e) {
      _setError('Failed to import from $service: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Export watchlist
  Future<String?> exportWatchlist() async {
    try {
      // TODO: Implement export functionality
      // This would return a JSON string or file path
      return null;
    } catch (e) {
      _setError('Failed to export watchlist: $e');
      return null;
    }
  }

  // Private helper methods
  Future<void> _saveWatchlist() async {
    // TODO: Save to Hive and optionally sync to Firestore
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }

  // Refresh all data
  Future<void> refresh() async {
    await Future.wait([
      loadTrendingAnime(),
      loadCurrentSeasonAnime(),
      loadAiringSchedule(),
    ]);
  }

  // Clear all data
  void clear() {
    _watchlist.clear();
    _searchResults.clear();
    _trendingAnime.clear();
    _currentSeasonAnime.clear();
    _airingSchedule.clear();
    _isLoading = false;
    _isSearching = false;
    _isSyncing = false;
    _error = null;
    _searchQuery = '';
    notifyListeners();
  }

  @override
  void dispose() {
    clear();
    super.dispose();
  }
}