# 🎌 Anime Episode Alert App

A beautiful, modern anime episode tracking and notification app built with Flutter for iOS and Android. Never miss your favorite anime episodes again!

![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
![Material Design 3](https://img.shields.io/badge/Material_Design_3-757575?style=for-the-badge&logo=material-design&logoColor=white)

## ✨ Features

### 🔔 Smart Notifications
- **Episode Alerts**: Get notified when new episodes of your watchlist anime are released
- **Customizable Timing**: Set notification offset (e.g., 30 minutes before episode airs)
- **Sub/Dub Preferences**: Choose to get notified for subtitled or dubbed releases
- **Platform-Specific**: Notifications based on actual streaming platform availability

### 📱 Beautiful UI/UX
- **Material Design 3**: Modern, clean interface with dynamic theming
- **Dark/Light Themes**: Full theme support with system preference detection
- **Smooth Animations**: Delightful animations and transitions throughout the app
- **Responsive Design**: Optimized for both phones and tablets

### 🔍 Discover & Track
- **Anime Search**: Powerful search with AniList API integration
- **Trending Section**: Discover currently popular anime
- **Season Charts**: Browse current and upcoming seasonal anime
- **Detailed Information**: Rich anime details with genres, studios, scores, and more

### 📚 Watchlist Management
- **Multiple Statuses**: Watching, Completed, Plan to Watch, On Hold, Dropped
- **Progress Tracking**: Track episodes watched with progress indicators
- **Personal Ratings**: Rate anime with personal scores
- **Custom Notes**: Add personal notes and tags to entries

### 📅 Airing Schedule
- **Weekly Calendar**: Visual calendar showing when your anime air
- **Countdown Timers**: See exactly when next episodes are coming
- **Behind Alerts**: Get notified when you're behind on currently airing series

### 🔄 Sync & Import
- **Cloud Sync**: Sync your watchlist across devices with Firebase
- **AniList Integration**: Import watchlist from AniList (planned)
- **MyAnimeList Support**: Import from MyAnimeList (planned)
- **Backup & Export**: Export your data for backup

### 🌐 Social Features
- **Share Episodes**: One-tap sharing to social media with anime hashtags
- **Community**: See what other users are watching (planned)
- **Reviews & Discussions**: Community features for anime discussions (planned)

## 🛠️ Technology Stack

- **Frontend**: Flutter 3.24.5
- **Backend**: Firebase (Firestore, Auth, FCM)
- **State Management**: Provider pattern
- **Local Storage**: Hive for offline data
- **API**: AniList GraphQL API for anime data
- **Notifications**: Firebase Cloud Messaging + Local Notifications
- **Navigation**: GetX for routing and navigation

## 📋 Dependencies

Key packages used in this project:

```yaml
# Core Framework
flutter: sdk

# State Management
provider: ^6.1.1
get: ^4.6.6

# Firebase & Cloud Services
firebase_core: ^2.24.2
firebase_auth: ^4.15.3
firebase_firestore: ^4.13.6
firebase_messaging: ^14.7.10
firebase_analytics: ^10.7.4

# Authentication
google_sign_in: ^6.2.1

# Networking
dio: ^5.4.0
http: ^1.1.2

# Local Storage & Caching
hive: ^2.2.3
hive_flutter: ^1.1.0
shared_preferences: ^2.2.2

# Notifications
flutter_local_notifications: ^16.3.2
timezone: ^0.9.2

# UI Components
cached_network_image: ^3.3.0
shimmer: ^3.0.0
lottie: ^2.7.0
table_calendar: ^3.0.9

# Utilities
url_launcher: ^6.2.2
share_plus: ^7.2.2
permission_handler: ^11.1.0
```

## 🚀 Getting Started

### Prerequisites

- Flutter SDK (3.24.5 or higher)
- Dart SDK (3.1.4 or higher)
- Android Studio / VS Code
- iOS development setup (for iOS builds)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/anime-episode-alert.git
   cd anime-episode-alert
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Add Android and iOS apps to your Firebase project
   - Download and place configuration files:
     - `google-services.json` in `android/app/`
     - `GoogleService-Info.plist` in `ios/Runner/`
   - Enable Authentication, Firestore, and FCM in Firebase Console

4. **Configure API Keys**
   - The app uses AniList's public GraphQL API (no API key required)
   - For production, consider implementing rate limiting

5. **Generate code (optional)**
   ```bash
   flutter packages pub run build_runner build
   ```

6. **Run the app**
   ```bash
   flutter run
   ```

## 🏗️ Project Structure

```
lib/
├── constants/          # App constants and configuration
├── models/            # Data models (Anime, User, WatchlistEntry)
├── providers/         # State management (Auth, Watchlist, Theme)
├── screens/           # UI screens and pages
│   ├── auth/         # Authentication screens
│   ├── home/         # Main app screens
│   └── splash/       # Splash screen
├── services/          # External services (API, Auth, Notifications)
├── utils/            # Utilities and helpers
├── widgets/          # Reusable UI components
└── main.dart         # App entry point
```

## 🔥 Firebase Setup

### Authentication
- Email/Password authentication
- Google Sign-In integration
- User profile management

### Firestore Collections
```
users/
├── {userId}/
│   ├── email: string
│   ├── displayName: string
│   ├── preferences: map
│   └── fcmTokens: array

watchlist/
├── {entryId}/
│   ├── userId: string
│   ├── animeId: number
│   ├── status: string
│   ├── progress: number
│   └── notifications: map
```

### Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Watchlist entries are user-specific
    match /watchlist/{entryId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## 📱 Platform-Specific Setup

### Android
1. **Minimum SDK**: API 21 (Android 5.0)
2. **Permissions** (automatically handled):
   - Internet access
   - Network state
   - Notification permissions
   - Background app refresh

### iOS
1. **Minimum Version**: iOS 12.0
2. **Capabilities** (add to `ios/Runner/Runner.entitlements`):
   ```xml
   <key>com.apple.developer.associated-domains</key>
   <array>
     <string>applinks:your-domain.com</string>
   </array>
   ```

## 🔧 Configuration

### Notification Settings
Configure notification channels and behavior in `lib/services/notification_service.dart`:

```dart
// Episode notification channel
const episodeChannel = AndroidNotificationChannel(
  'episode_notifications',
  'Episode Alerts',
  description: 'Notifications for new anime episodes',
  importance: Importance.high,
);
```

### Theme Customization
Customize app themes in `lib/utils/app_theme.dart`:

```dart
// Custom anime-inspired colors
static const Color animeBlue = Color(0xFF2196F3);
static const Color animePink = Color(0xFFE91E63);
static const Color animeOrange = Color(0xFFFF9800);
```

## 🚢 Deployment

### Android (Play Store)
1. **Build release APK**
   ```bash
   flutter build apk --release
   ```

2. **Build App Bundle** (recommended)
   ```bash
   flutter build appbundle --release
   ```

3. **Upload to Play Console**
   - Create app listing
   - Upload AAB file
   - Complete store listing with screenshots

### iOS (App Store)
1. **Build for iOS**
   ```bash
   flutter build ios --release
   ```

2. **Archive in Xcode**
   - Open `ios/Runner.xcworkspace`
   - Product → Archive
   - Upload to App Store Connect

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow [Flutter style guide](https://docs.flutter.dev/development/tools/formatting)
- Use meaningful variable and function names
- Add comments for complex logic
- Write unit tests for new features

## 🐛 Known Issues & Limitations

- [ ] Hive type adapters need to be generated with build_runner
- [ ] Firebase configuration files not included (need to be added per setup)
- [ ] Some streaming platform links may not be available for all regions
- [ ] Notification scheduling depends on system reliability

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Core app structure and navigation
- [x] AniList API integration
- [x] Basic watchlist management
- [x] Firebase authentication
- [x] Push notifications setup

### Phase 2 (Coming Soon)
- [ ] Complete notification scheduling
- [ ] AniList/MAL import functionality
- [ ] Advanced search filters
- [ ] Episode calendar view
- [ ] Offline support improvements

### Phase 3 (Future)
- [ ] Social features and community
- [ ] Manga tracking support
- [ ] Advanced recommendation engine
- [ ] Widget support
- [ ] Apple Watch/Wear OS companion

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [AniList](https://anilist.co/) for providing the comprehensive anime database API
- [Flutter](https://flutter.dev/) team for the amazing framework
- [Firebase](https://firebase.google.com/) for backend services
- [Material Design](https://material.io/) for design guidelines
- Anime community for inspiration and feedback

## 📧 Contact

For questions, suggestions, or support:
- Email: anime.alert.app@gmail.com
- Twitter: [@AnimeAlertApp](https://twitter.com/AnimeAlertApp)
- Discord: [Join our server](https://discord.gg/anime-alert)

---

**Made with ❤️ for the anime community**

*Never miss an episode again! 🎌*