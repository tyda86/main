import 'package:hive/hive.dart';

part 'user.g.dart';

@HiveType(typeId: 1)
class User extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String email;

  @HiveField(2)
  final String? displayName;

  @HiveField(3)
  final String? photoUrl;

  @HiveField(4)
  final DateTime createdAt;

  @HiveField(5)
  final DateTime lastLoginAt;

  @HiveField(6)
  final bool emailVerified;

  @HiveField(7)
  final String? anilistUsername;

  @HiveField(8)
  final String? malUsername;

  @HiveField(9)
  final Map<String, dynamic> preferences;

  @HiveField(10)
  final List<String> fcmTokens;

  User({
    required this.id,
    required this.email,
    this.displayName,
    this.photoUrl,
    required this.createdAt,
    required this.lastLoginAt,
    this.emailVerified = false,
    this.anilistUsername,
    this.malUsername,
    this.preferences = const {},
    this.fcmTokens = const [],
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      displayName: json['displayName'],
      photoUrl: json['photoUrl'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      lastLoginAt: DateTime.parse(json['lastLoginAt'] ?? DateTime.now().toIso8601String()),
      emailVerified: json['emailVerified'] ?? false,
      anilistUsername: json['anilistUsername'],
      malUsername: json['malUsername'],
      preferences: Map<String, dynamic>.from(json['preferences'] ?? {}),
      fcmTokens: List<String>.from(json['fcmTokens'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'displayName': displayName,
      'photoUrl': photoUrl,
      'createdAt': createdAt.toIso8601String(),
      'lastLoginAt': lastLoginAt.toIso8601String(),
      'emailVerified': emailVerified,
      'anilistUsername': anilistUsername,
      'malUsername': malUsername,
      'preferences': preferences,
      'fcmTokens': fcmTokens,
    };
  }

  User copyWith({
    String? id,
    String? email,
    String? displayName,
    String? photoUrl,
    DateTime? createdAt,
    DateTime? lastLoginAt,
    bool? emailVerified,
    String? anilistUsername,
    String? malUsername,
    Map<String, dynamic>? preferences,
    List<String>? fcmTokens,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      photoUrl: photoUrl ?? this.photoUrl,
      createdAt: createdAt ?? this.createdAt,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
      emailVerified: emailVerified ?? this.emailVerified,
      anilistUsername: anilistUsername ?? this.anilistUsername,
      malUsername: malUsername ?? this.malUsername,
      preferences: preferences ?? this.preferences,
      fcmTokens: fcmTokens ?? this.fcmTokens,
    );
  }

  // Preference getters
  bool get notificationsEnabled => preferences['notificationsEnabled'] ?? true;
  bool get subNotificationsEnabled => preferences['subNotificationsEnabled'] ?? true;
  bool get dubNotificationsEnabled => preferences['dubNotificationsEnabled'] ?? false;
  String get preferredLanguage => preferences['preferredLanguage'] ?? 'en';
  String get region => preferences['region'] ?? 'US';
  bool get darkMode => preferences['darkMode'] ?? false;
  int get notificationOffset => preferences['notificationOffset'] ?? 0; // minutes before episode airs
}