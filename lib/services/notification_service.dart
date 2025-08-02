import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz;
import '../constants/app_constants.dart';
import '../models/anime.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _localNotifications = 
      FlutterLocalNotificationsPlugin();
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  bool _initialized = false;
  String? _fcmToken;

  // Getters
  bool get isInitialized => _initialized;
  String? get fcmToken => _fcmToken;

  // Initialize notification service
  Future<void> initialize() async {
    if (_initialized) return;

    try {
      // Initialize timezone
      tz.initializeTimeZones();

      // Initialize local notifications
      await _initializeLocalNotifications();

      // Initialize Firebase messaging
      await _initializeFirebaseMessaging();

      _initialized = true;
    } catch (e) {
      print('Error initializing notification service: $e');
    }
  }

  // Initialize local notifications
  Future<void> _initializeLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Create notification channels for Android
    if (defaultTargetPlatform == TargetPlatform.android) {
      await _createNotificationChannels();
    }
  }

  // Create notification channels for Android
  Future<void> _createNotificationChannels() async {
    const episodeChannel = AndroidNotificationChannel(
      AppConstants.episodeNotificationChannelId,
      AppConstants.episodeNotificationChannelName,
      description: AppConstants.episodeNotificationChannelDescription,
      importance: Importance.high,
      sound: RawResourceAndroidNotificationSound('notification'),
      enableVibration: true,
      vibrationPattern: Int64List.fromList([0, 500, 250, 500]),
    );

    const generalChannel = AndroidNotificationChannel(
      AppConstants.generalNotificationChannelId,
      AppConstants.generalNotificationChannelName,
      description: AppConstants.generalNotificationChannelDescription,
      importance: Importance.defaultImportance,
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(episodeChannel);

    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(generalChannel);
  }

  // Initialize Firebase messaging
  Future<void> _initializeFirebaseMessaging() async {
    // Request permission
    final notificationSettings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      announcement: false,
    );

    if (notificationSettings.authorizationStatus == AuthorizationStatus.authorized ||
        notificationSettings.authorizationStatus == AuthorizationStatus.provisional) {
      print('User granted permission');
    } else {
      print('User declined or has not accepted permission');
    }

    // Get FCM token
    _fcmToken = await _firebaseMessaging.getToken();
    print('FCM Token: $_fcmToken');

    // Listen for token refresh
    _firebaseMessaging.onTokenRefresh.listen((token) {
      _fcmToken = token;
      print('FCM Token refreshed: $token');
      // TODO: Update token in backend
    });

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Handle background message taps
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);

    // Handle initial message (when app is opened from notification)
    final initialMessage = await _firebaseMessaging.getInitialMessage();
    if (initialMessage != null) {
      _handleMessageOpenedApp(initialMessage);
    }
  }

  // Handle foreground messages
  Future<void> _handleForegroundMessage(RemoteMessage message) async {
    print('Received foreground message: ${message.notification?.title}');
    
    // Show local notification for foreground messages
    await showNotification(
      title: message.notification?.title ?? 'New Episode',
      body: message.notification?.body ?? 'A new episode is available!',
      payload: message.data.toString(),
    );
  }

  // Handle message opened app
  void _handleMessageOpenedApp(RemoteMessage message) {
    print('Message opened app: ${message.notification?.title}');
    // TODO: Navigate to appropriate screen based on message data
  }

  // Handle notification tap
  void _onNotificationTapped(NotificationResponse response) {
    print('Notification tapped: ${response.payload}');
    // TODO: Handle notification tap navigation
  }

  // Request notification permissions
  Future<bool> requestPermissions() async {
    if (defaultTargetPlatform == TargetPlatform.android) {
      final status = await Permission.notification.request();
      return status.isGranted;
    } else if (defaultTargetPlatform == TargetPlatform.iOS) {
      final settings = await _firebaseMessaging.requestPermission();
      return settings.authorizationStatus == AuthorizationStatus.authorized;
    }
    return false;
  }

  // Check if notifications are enabled
  Future<bool> areNotificationsEnabled() async {
    if (defaultTargetPlatform == TargetPlatform.android) {
      return await Permission.notification.isGranted;
    } else if (defaultTargetPlatform == TargetPlatform.iOS) {
      final settings = await _firebaseMessaging.getNotificationSettings();
      return settings.authorizationStatus == AuthorizationStatus.authorized;
    }
    return false;
  }

  // Show immediate notification
  Future<void> showNotification({
    required String title,
    required String body,
    String? payload,
    int? id,
    String? imageUrl,
  }) async {
    final notificationId = id ?? DateTime.now().millisecondsSinceEpoch ~/ 1000;

    const androidDetails = AndroidNotificationDetails(
      AppConstants.episodeNotificationChannelId,
      AppConstants.episodeNotificationChannelName,
      channelDescription: AppConstants.episodeNotificationChannelDescription,
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      styleInformation: BigTextStyleInformation(''),
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      notificationId,
      title,
      body,
      details,
      payload: payload,
    );
  }

  // Schedule episode notification
  Future<void> scheduleEpisodeNotification({
    required Anime anime,
    required int episode,
    required DateTime airTime,
    int offsetMinutes = 0,
  }) async {
    final notificationTime = airTime.subtract(Duration(minutes: offsetMinutes));
    
    // Don't schedule if time is in the past
    if (notificationTime.isBefore(DateTime.now())) {
      return;
    }

    final notificationId = anime.id * 1000 + episode;
    final title = 'New Episode Available!';
    final body = '${anime.displayTitle} Episode $episode is now airing!';

    const androidDetails = AndroidNotificationDetails(
      AppConstants.episodeNotificationChannelId,
      AppConstants.episodeNotificationChannelName,
      channelDescription: AppConstants.episodeNotificationChannelDescription,
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      styleInformation: BigTextStyleInformation(''),
      icon: '@mipmap/ic_launcher',
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.zonedSchedule(
      notificationId,
      title,
      body,
      tz.TZDateTime.from(notificationTime, tz.local),
      details,
      payload: 'episode_${anime.id}_$episode',
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      matchDateTimeComponents: DateTimeComponents.time,
    );

    print('Scheduled notification for ${anime.displayTitle} Episode $episode at $notificationTime');
  }

  // Cancel scheduled notification
  Future<void> cancelEpisodeNotification({
    required int animeId,
    required int episode,
  }) async {
    final notificationId = animeId * 1000 + episode;
    await _localNotifications.cancel(notificationId);
    print('Cancelled notification for anime $animeId episode $episode');
  }

  // Cancel all notifications for an anime
  Future<void> cancelAnimeNotifications(int animeId) async {
    final pendingNotifications = await _localNotifications.pendingNotificationRequests();
    
    for (final notification in pendingNotifications) {
      if (notification.id >= animeId * 1000 && notification.id < (animeId + 1) * 1000) {
        await _localNotifications.cancel(notification.id);
      }
    }
    
    print('Cancelled all notifications for anime $animeId');
  }

  // Get pending notifications
  Future<List<PendingNotificationRequest>> getPendingNotifications() async {
    return await _localNotifications.pendingNotificationRequests();
  }

  // Cancel all notifications
  Future<void> cancelAllNotifications() async {
    await _localNotifications.cancelAll();
    print('Cancelled all notifications');
  }

  // Subscribe to topic (for general anime news)
  Future<void> subscribeToTopic(String topic) async {
    try {
      await _firebaseMessaging.subscribeToTopic(topic);
      print('Subscribed to topic: $topic');
    } catch (e) {
      print('Error subscribing to topic $topic: $e');
    }
  }

  // Unsubscribe from topic
  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _firebaseMessaging.unsubscribeFromTopic(topic);
      print('Unsubscribed from topic: $topic');
    } catch (e) {
      print('Error unsubscribing from topic $topic: $e');
    }
  }

  // Show episode reminder notification
  Future<void> showEpisodeReminder({
    required Anime anime,
    required int episode,
    required Duration timeUntil,
  }) async {
    final title = 'Episode Reminder';
    final body = '${anime.displayTitle} Episode $episode airs in ${_formatDuration(timeUntil)}!';
    
    await showNotification(
      title: title,
      body: body,
      payload: 'reminder_${anime.id}_$episode',
    );
  }

  // Format duration for display
  String _formatDuration(Duration duration) {
    if (duration.inDays > 0) {
      return '${duration.inDays} day${duration.inDays > 1 ? 's' : ''}';
    } else if (duration.inHours > 0) {
      return '${duration.inHours} hour${duration.inHours > 1 ? 's' : ''}';
    } else if (duration.inMinutes > 0) {
      return '${duration.inMinutes} minute${duration.inMinutes > 1 ? 's' : ''}';
    } else {
      return 'less than a minute';
    }
  }

  // Dispose resources
  void dispose() {
    // Clean up any resources if needed
  }
}