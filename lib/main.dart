import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'package:get/get.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'services/anilist_service.dart';
import 'services/auth_service.dart';
import 'services/notification_service.dart';
import 'providers/auth_provider.dart';
import 'providers/watchlist_provider.dart';
import 'providers/theme_provider.dart';
import 'screens/splash_screen.dart';
import 'screens/auth/auth_wrapper.dart';
import 'screens/home/home_screen.dart';
import 'utils/app_theme.dart';
import 'constants/app_constants.dart';

// Global notification plugin instance
final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

// Background message handler
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print('Handling a background message: ${message.messageId}');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp();
  
  // Set background message handler
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  
  // Initialize Hive
  await Hive.initFlutter();
  
  // Initialize services
  AniListService().initialize();
  NotificationService().initialize();
  
  // Register Hive adapters (we'll skip this for now since build_runner isn't working)
  // This would normally be:
  // Hive.registerAdapter(AnimeAdapter());
  // Hive.registerAdapter(UserAdapter());
  // Hive.registerAdapter(WatchlistEntryAdapter());
  // Hive.registerAdapter(WatchStatusAdapter());
  
  runApp(const AnimeEpisodeAlertApp());
}

class AnimeEpisodeAlertApp extends StatelessWidget {
  const AnimeEpisodeAlertApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => WatchlistProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return GetMaterialApp(
            title: 'Anime Episode Alert',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeProvider.themeMode,
            home: const SplashScreen(),
            getPages: [
              GetPage(
                name: '/',
                page: () => const SplashScreen(),
              ),
              GetPage(
                name: '/auth',
                page: () => const AuthWrapper(),
              ),
              GetPage(
                name: '/home',
                page: () => const HomeScreen(),
              ),
            ],
            // Global app configurations
            defaultTransition: Transition.cupertino,
            transitionDuration: AppConstants.mediumAnimationDuration,
            
            // Localization support (future enhancement)
            locale: const Locale('en', 'US'),
            fallbackLocale: const Locale('en', 'US'),
            
            // Global theme configurations
            builder: (context, child) {
              return MediaQuery(
                // Ensure text doesn't scale with system settings
                data: MediaQuery.of(context).copyWith(
                  textScaler: TextScaler.noScaling,
                ),
                child: child!,
              );
            },
          );
        },
      ),
    );
  }
}