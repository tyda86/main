class AppConstants {
  // API Endpoints
  static const String anilistGraphqlEndpoint = 'https://graphql.anilist.co';
  static const String myAnimeListApiBase = 'https://api.myanimelist.net/v2';
  static const String jikanApiBase = 'https://api.jikan.moe/v4';
  
  // Storage Keys
  static const String userBoxKey = 'user_box';
  static const String animeBoxKey = 'anime_box';
  static const String watchlistBoxKey = 'watchlist_box';
  static const String settingsBoxKey = 'settings_box';
  
  // SharedPreferences Keys
  static const String authTokenKey = 'auth_token';
  static const String userIdKey = 'user_id';
  static const String themeKey = 'theme_mode';
  static const String notificationsEnabledKey = 'notifications_enabled';
  static const String firstLaunchKey = 'first_launch';
  
  // Firebase Collections
  static const String usersCollection = 'users';
  static const String watchlistCollection = 'watchlist';
  static const String notificationsCollection = 'notifications';
  static const String animeUpdatesCollection = 'anime_updates';
  
  // Notification Channels
  static const String episodeNotificationChannelId = 'episode_notifications';
  static const String episodeNotificationChannelName = 'Episode Alerts';
  static const String episodeNotificationChannelDescription = 'Notifications for new anime episodes';
  
  static const String generalNotificationChannelId = 'general_notifications';
  static const String generalNotificationChannelName = 'General';
  static const String generalNotificationChannelDescription = 'General app notifications';
  
  // Anime Statuses
  static const List<String> animeStatuses = [
    'RELEASING',
    'FINISHED',
    'NOT_YET_RELEASED',
    'CANCELLED',
    'HIATUS'
  ];
  
  // Anime Formats
  static const List<String> animeFormats = [
    'TV',
    'TV_SHORT',
    'MOVIE',
    'SPECIAL',
    'OVA',
    'ONA',
    'MUSIC'
  ];
  
  // Seasons
  static const List<String> animeSeasons = [
    'SPRING',
    'SUMMER',
    'FALL',
    'WINTER'
  ];
  
  // Streaming Platforms
  static const Map<String, String> streamingPlatforms = {
    'Crunchyroll': 'https://www.crunchyroll.com',
    'Funimation': 'https://www.funimation.com',
    'Netflix': 'https://www.netflix.com',
    'Hulu': 'https://www.hulu.com',
    'Amazon Prime Video': 'https://www.primevideo.com',
    'VRV': 'https://vrv.co',
    'Hidive': 'https://www.hidive.com',
    'Tubi': 'https://tubitv.com',
    'Bilibili': 'https://www.bilibili.tv',
    'Wakanim': 'https://www.wakanim.tv',
  };
  
  // App Settings
  static const int defaultNotificationOffset = 0; // minutes before episode airs
  static const int maxWatchlistSize = 500;
  static const int searchResultsPerPage = 20;
  static const int cacheExpiryHours = 24;
  
  // Social Media
  static const String twitterBaseUrl = 'https://twitter.com/intent/tweet';
  static const List<String> popularAnimeHashtags = [
    '#anime',
    '#newepisode',
    '#otaku',
    '#animeepisode',
    '#animealert'
  ];
  
  // UI Constants
  static const double defaultPadding = 16.0;
  static const double smallPadding = 8.0;
  static const double largePadding = 24.0;
  static const double borderRadius = 12.0;
  static const double smallBorderRadius = 8.0;
  static const double largeBorderRadius = 16.0;
  
  // Animation Durations
  static const Duration shortAnimationDuration = Duration(milliseconds: 200);
  static const Duration mediumAnimationDuration = Duration(milliseconds: 300);
  static const Duration longAnimationDuration = Duration(milliseconds: 500);
  
  // Image Sizes
  static const String smallImageSize = 'small';
  static const String mediumImageSize = 'medium';
  static const String largeImageSize = 'large';
  
  // Error Messages
  static const String networkErrorMessage = 'Network error. Please check your connection.';
  static const String serverErrorMessage = 'Server error. Please try again later.';
  static const String unknownErrorMessage = 'An unknown error occurred.';
  static const String noDataMessage = 'No data available.';
  static const String authErrorMessage = 'Authentication failed. Please log in again.';
  
  // Success Messages
  static const String addedToWatchlistMessage = 'Added to watchlist successfully!';
  static const String removedFromWatchlistMessage = 'Removed from watchlist successfully!';
  static const String progressUpdatedMessage = 'Progress updated successfully!';
  static const String settingsSavedMessage = 'Settings saved successfully!';
  
  // Regex Patterns
  static const String emailPattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
  static const String usernamePattern = r'^[a-zA-Z0-9_]{3,20}$';
  
  // Time Formats
  static const String timeFormat24 = 'HH:mm';
  static const String timeFormat12 = 'h:mm a';
  static const String dateFormat = 'MMM dd, yyyy';
  static const String dateTimeFormat = 'MMM dd, yyyy • h:mm a';
  
  // Supported Languages
  static const Map<String, String> supportedLanguages = {
    'en': 'English',
    'ja': '日本語',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'pt': 'Português',
    'ko': '한국어',
    'zh': '中文',
  };
  
  // Regions for streaming availability
  static const Map<String, String> supportedRegions = {
    'US': 'United States',
    'CA': 'Canada',
    'GB': 'United Kingdom',
    'AU': 'Australia',
    'JP': 'Japan',
    'DE': 'Germany',
    'FR': 'France',
    'ES': 'Spain',
    'IT': 'Italy',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'IN': 'India',
    'KR': 'South Korea',
    'CN': 'China',
    'TH': 'Thailand',
    'PH': 'Philippines',
    'SG': 'Singapore',
    'MY': 'Malaysia',
    'ID': 'Indonesia',
    'VN': 'Vietnam',
  };
}