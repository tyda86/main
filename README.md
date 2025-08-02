# Anime Episode Alert 📺

A lightweight, mobile-first React Native app that sends push notifications when new episodes of user-selected anime series are released, helping otaku stay updated without manually checking streaming platforms or schedules.

![React Native](https://img.shields.io/badge/React%20Native-0.72.6-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.8.4-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 🌟 Features

### Core Functionality
- **📱 Cross-Platform**: Runs on both iOS and Android
- **🔍 Anime Search**: Powerful search with filters (status, genre, season)
- **⭐ Personal List**: Add/remove anime from your personal watchlist
- **🔔 Push Notifications**: Customizable notifications for new episodes
- **📅 Episode Tracking**: Track upcoming episodes with countdown timers
- **🎨 Modern UI**: Beautiful, responsive design with dark/light themes

### Advanced Features
- **🔄 Background Sync**: Automatic updates for episode information
- **⚙️ Customizable Settings**: Notification timing, sound, vibration controls
- **🌙 Theme Support**: Light, dark, and system theme modes
- **📊 Statistics**: Track your anime watching habits
- **💾 Data Export**: Export your anime list and settings
- **🔗 AniList Integration**: Powered by AniList's comprehensive anime database

## 📱 Screenshots

### Home Screen
- Trending anime carousel
- Current season highlights
- Quick access to personal list

### Search & Discovery
- Real-time search with autocomplete
- Advanced filtering options
- Genre-based exploration

### Personal Anime List
- Grid/list view toggle
- Notification controls per anime
- Sorting and filtering options

### Settings & Customization
- Theme selection
- Notification preferences
- Data management tools

## 🚀 Getting Started

### Prerequisites

- Node.js (>=16.0.0)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)
- Yarn or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/anime-episode-alert.git
   cd anime-episode-alert
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **iOS Setup (iOS only)**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Start Metro bundler**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Run the app**
   
   For Android:
   ```bash
   npm run android
   # or
   yarn android
   ```
   
   For iOS:
   ```bash
   npm run ios
   # or
   yarn ios
   ```

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
│   └── AnimeCard.tsx   # Anime display card
├── contexts/           # React contexts
│   └── ThemeContext.tsx # Theme management
├── screens/            # Screen components
│   ├── HomeScreen.tsx
│   ├── SearchScreen.tsx
│   ├── MyAnimeScreen.tsx
│   ├── SettingsScreen.tsx
│   └── AnimeDetailsScreen.tsx
├── services/           # Business logic & API
│   ├── anilistApi.ts          # AniList GraphQL API
│   ├── storageService.ts      # Local data storage
│   ├── notificationService.ts # Push notifications
│   └── backgroundSyncService.ts # Background updates
├── types/              # TypeScript definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── theme.ts        # Theme definitions
└── App.tsx             # Main app component
```

### Key Technologies

- **React Native**: Cross-platform mobile development
- **TypeScript**: Type safety and better developer experience
- **React Navigation**: Navigation between screens
- **AsyncStorage**: Local data persistence
- **React Native Push Notification**: Local and push notifications
- **Axios**: HTTP client for API requests
- **AniList GraphQL API**: Anime data source

## 📡 API Integration

### AniList GraphQL API

The app integrates with AniList's public GraphQL API to fetch:

- Trending anime
- Current season anime
- Detailed anime information
- Episode schedules
- Search results with filters

#### Key Queries Used:

```graphql
# Search anime with filters
query ($search: String, $status: MediaStatus, $genre: String) {
  Page {
    media(search: $search, type: ANIME, status: $status, genre: $genre) {
      id
      title { romaji, english, native }
      coverImage { medium, large }
      status
      nextAiringEpisode {
        airingAt
        episode
      }
      # ... more fields
    }
  }
}
```

## 🔔 Notification System

### Features
- **Local Notifications**: No external push service required
- **Customizable Timing**: Immediate, 1 hour, or 24 hours after episode airs
- **Per-Anime Control**: Enable/disable notifications for individual anime
- **Smart Scheduling**: Automatic rescheduling when episode times change

### Implementation
```typescript
// Schedule episode notification
await NotificationService.scheduleEpisodeNotification(anime, episode);

// Cancel notifications for an anime
NotificationService.cancelAnimeNotifications(animeId);
```

## 💾 Data Management

### Local Storage
- User anime lists
- App settings and preferences
- Notification states
- Last sync timestamps

### Data Export
Users can export their data in JSON format for backup or migration purposes.

## 🔄 Background Sync

### Automatic Updates
- Checks for episode updates every 30 minutes when app is active
- Syncs when app comes to foreground
- Updates episode schedules and reschedules notifications
- Rate-limited to respect API guidelines

### Smart Sync Logic
- Only updates currently airing anime
- Compares episode data to detect changes
- Handles network failures gracefully
- Maintains data integrity

## 🎨 Theming & UI

### Theme System
- **Light Theme**: Clean, bright interface
- **Dark Theme**: OLED-friendly dark colors
- **System Theme**: Follows device settings
- **Consistent Design**: Unified color palette and spacing

### Responsive Design
- Adaptive layouts for different screen sizes
- Optimized for both phones and tablets
- Touch-friendly interface elements
- Smooth animations and transitions

## 🧪 Testing

### Running Tests
```bash
npm test
# or
yarn test
```

### Test Coverage
- Unit tests for services and utilities
- Component testing with React Native Testing Library
- Integration tests for key user flows

## 📦 Build & Deployment

### Android Release Build
```bash
cd android
./gradlew assembleRelease
```

### iOS Release Build
```bash
cd ios
xcodebuild -workspace AnimeEpisodeAlert.xcworkspace -scheme AnimeEpisodeAlert -configuration Release
```

### Environment Variables
Create a `.env` file for configuration:
```env
API_BASE_URL=https://graphql.anilist.co
NOTIFICATION_CHANNEL_ID=anime-episodes
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Style
- ESLint configuration included
- Prettier for code formatting
- TypeScript strict mode enabled
- Conventional commit messages

## 📋 Roadmap

### Upcoming Features
- [ ] **Cloud Sync**: Backup data across devices
- [ ] **Watch History**: Track completed episodes
- [ ] **Custom Lists**: Create themed anime lists
- [ ] **Social Features**: Share favorite anime
- [ ] **Widgets**: Home screen episode countdown
- [ ] **Offline Mode**: Basic functionality without internet

### Performance Improvements
- [ ] Image caching for better performance
- [ ] Lazy loading for large lists
- [ ] Database optimization
- [ ] Bundle size reduction

## 🐛 Troubleshooting

### Common Issues

**"ReferenceError: Property 'require' doesn't exist" (Hermes Engine)**
1. Clear Metro cache: `npm run start:reset`
2. Clean and reinstall dependencies: `npm run clean`
3. For Android: `npm run clean:android`
4. For iOS: `npm run clean:ios`
5. Restart Metro bundler: `npm start`
6. If still failing, try: `rm -rf node_modules && npm install && npm start`

**Module resolution errors**
- All import paths have been converted to relative imports for Hermes compatibility
- If you see import errors, ensure all paths use `./` or `../` syntax
- Run `npm run setup` for automated configuration

**Notifications not working**
- Check device notification permissions
- Verify notification settings in app
- Test with the notification test button

**App crashes on startup**
- Clear app cache and data
- Reinstall the app
- Check React Native version compatibility

**Search not returning results**
- Check internet connection
- Verify AniList API availability
- Try different search terms

### Debug Mode
Enable debug mode in settings to see:
- API request logs
- Notification scheduling details
- Background sync status

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AniList**: For providing the comprehensive anime database API
- **React Native Community**: For the amazing ecosystem of packages
- **MyAnimeList**: For inspiration on anime tracking features
- **The Anime Community**: For feedback and feature suggestions

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/anime-episode-alert/issues)
- **Discord**: [Join our community](https://discord.gg/anime-episode-alert)
- **Email**: support@animeepisodealert.com
- **Docs**: [Full Documentation](https://docs.animeepisodealert.com)

---

Made with ❤️ for the anime community

**Stay updated, never miss an episode! 🎌**