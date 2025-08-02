# 🎌 Anime Episode Alert

A lightweight, mobile-first React Native app that sends push notifications when new episodes of user-selected anime series are released, helping otaku stay updated without manually checking streaming platforms or schedules.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)

## ✨ Features

- **🔍 Anime Search**: Search and discover anime using the comprehensive Jikan API (MyAnimeList data)
- **📱 Cross-Platform**: Works on both iOS and Android devices
- **🔔 Push Notifications**: Get notified instantly when new episodes are available
- **💾 Local Storage**: Your anime list is stored locally on your device
- **🎨 Beautiful UI**: Dark theme with anime-inspired design
- **⚡ Real-time Updates**: Automatic episode checking and notifications
- **📊 Episode Tracking**: Keep track of which episodes you've seen
- **🎯 Selective Notifications**: Toggle notifications per anime series

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AnimeEpisodeAlert
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your preferred platform**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web (for testing)
   npm run web
   ```

## 📱 App Architecture

### Tech Stack

- **Frontend Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: React Context API
- **Local Storage**: AsyncStorage
- **Notifications**: Expo Notifications
- **API**: Jikan API (MyAnimeList data)
- **HTTP Client**: Axios

### Project Structure

```
src/
├── contexts/           # React contexts for state management
│   ├── AnimeContext.tsx
│   └── NotificationContext.tsx
├── screens/            # App screens
│   ├── HomeScreen.tsx
│   ├── SearchScreen.tsx
│   ├── MyAnimeScreen.tsx
│   ├── SettingsScreen.tsx
│   └── AnimeDetailScreen.tsx
├── services/           # API and background services
│   ├── AnimeService.ts
│   └── EpisodeCheckService.ts
├── types/              # TypeScript type definitions
│   └── index.ts
└── components/         # Reusable components (future)
```

## 🎯 Core Features

### 1. Anime Discovery
- Search through thousands of anime titles
- View detailed information including synopsis, genres, scores
- See current airing status and episode counts
- Browse current season and top airing anime

### 2. Personal Anime List
- Add anime to your watchlist with one tap
- Toggle notifications per anime series
- Remove anime from your list
- Track your watching progress

### 3. Episode Notifications
- Automatic background checking for new episodes
- Smart notifications only for currently airing anime
- Customizable notification settings
- Episode tracking to avoid duplicate notifications

### 4. Settings & Customization
- Notification preferences (sound, vibration)
- App information and debug tools
- Privacy-focused (all data stored locally)

## 🔔 Notification System

The app uses a sophisticated notification system that:

1. **Checks for new episodes** every 24 hours
2. **Respects API rate limits** with proper delays
3. **Only notifies for enabled anime** in your list
4. **Tracks episode progress** to avoid duplicates
5. **Works in background** when app is closed

### Notification Flow
```
App Launch → Check if 24h passed → Fetch user anime list → 
Check each anime for new episodes → Send notifications → 
Update episode tracking → Schedule next check
```

## 📊 Data Sources

- **Primary API**: [Jikan API](https://jikan.moe/) - Unofficial MyAnimeList API
- **Rate Limiting**: 1 request per second to respect API limits
- **Data Coverage**: Complete anime database with episodes, scores, and metadata

## 🔒 Privacy & Security

- **Local Data Only**: All user preferences stored locally
- **No Account Required**: No sign-up or personal information needed
- **API Usage**: Only fetches public anime data
- **Permissions**: Only requests notification permissions

## 🚀 Deployment

### Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Or use EAS Build (recommended)
npx eas-cli build --platform all
```

### Publishing Updates

```bash
# Publish OTA update
expo publish

# Or with EAS Update
npx eas-cli update
```

## 🐛 Known Limitations

- **API Dependency**: Relies on Jikan API availability
- **Episode Timing**: New episodes detected when API is updated (may have delays)
- **Background Processing**: Limited by platform background execution policies
- **No Streaming Links**: App doesn't provide streaming links (focuses on notifications)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Jikan API](https://jikan.moe/) for providing free MyAnimeList data
- [MyAnimeList](https://myanimelist.net/) for the comprehensive anime database
- [Expo](https://expo.dev/) for the amazing development platform
- The anime community for inspiration

## 📞 Support

If you encounter any issues or have suggestions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Or start a [Discussion](../../discussions)

---

Made with ❤️ for anime fans worldwide! 🌟
