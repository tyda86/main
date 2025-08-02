import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/user.dart' as app_user;
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  
  app_user.User? _user;
  bool _isLoading = false;
  String? _error;

  // Getters
  app_user.User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;
  bool get isEmailVerified => _authService.isEmailVerified;

  AuthProvider() {
    _init();
  }

  void _init() {
    // Listen to auth state changes
    _authService.authStateChanges.listen((User? firebaseUser) {
      if (firebaseUser != null) {
        _loadUserData(firebaseUser.uid);
      } else {
        _user = null;
        notifyListeners();
      }
    });
  }

  // Load user data from Firestore
  Future<void> _loadUserData(String uid) async {
    try {
      // For now, we'll create a basic user object
      // In a real implementation, this would fetch from Firestore
      _user = app_user.User(
        id: uid,
        email: _authService.currentUser?.email ?? '',
        displayName: _authService.currentUser?.displayName,
        photoUrl: _authService.currentUser?.photoURL,
        createdAt: DateTime.now(),
        lastLoginAt: DateTime.now(),
        emailVerified: _authService.currentUser?.emailVerified ?? false,
      );
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load user data: $e';
      notifyListeners();
    }
  }

  // Sign up with email and password
  Future<bool> signUpWithEmailAndPassword({
    required String email,
    required String password,
    String? displayName,
  }) async {
    try {
      _setLoading(true);
      _clearError();

      final user = await _authService.signUpWithEmailAndPassword(
        email: email,
        password: password,
        displayName: displayName,
      );

      if (user != null) {
        _user = user;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Sign in with email and password
  Future<bool> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      _setLoading(true);
      _clearError();

      final user = await _authService.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (user != null) {
        _user = user;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Sign in with Google
  Future<bool> signInWithGoogle() async {
    try {
      _setLoading(true);
      _clearError();

      final user = await _authService.signInWithGoogle();
      if (user != null) {
        _user = user;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Sign out
  Future<void> signOut() async {
    try {
      _setLoading(true);
      await _authService.signOut();
      _user = null;
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // Reset password
  Future<bool> resetPassword(String email) async {
    try {
      _setLoading(true);
      _clearError();
      
      await _authService.resetPassword(email);
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Update user profile
  Future<bool> updateProfile({
    String? displayName,
    String? photoUrl,
    String? anilistUsername,
    String? malUsername,
    Map<String, dynamic>? preferences,
  }) async {
    try {
      _setLoading(true);
      _clearError();

      final updatedUser = await _authService.updateUserProfile(
        displayName: displayName,
        photoUrl: photoUrl,
        anilistUsername: anilistUsername,
        malUsername: malUsername,
        preferences: preferences,
      );

      if (updatedUser != null) {
        _user = updatedUser;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Update preferences
  Future<bool> updatePreferences(Map<String, dynamic> preferences) async {
    try {
      await _authService.updateUserPreferences(preferences);
      
      if (_user != null) {
        _user = _user!.copyWith(preferences: preferences);
        notifyListeners();
      }
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    }
  }

  // Send email verification
  Future<bool> sendEmailVerification() async {
    try {
      _setLoading(true);
      _clearError();
      
      await _authService.sendEmailVerification();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Reload user
  Future<void> reloadUser() async {
    try {
      await _authService.reloadUser();
      if (_authService.currentUser != null) {
        await _loadUserData(_authService.currentUser!.uid);
      }
    } catch (e) {
      _setError(e.toString());
    }
  }

  // Delete account
  Future<bool> deleteAccount() async {
    try {
      _setLoading(true);
      _clearError();
      
      await _authService.deleteAccount();
      _user = null;
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Add FCM token
  Future<void> addFCMToken(String token) async {
    try {
      await _authService.addFCMToken(token);
    } catch (e) {
      // Silently handle FCM token errors
      if (kDebugMode) {
        print('Failed to add FCM token: $e');
      }
    }
  }

  // Remove FCM token
  Future<void> removeFCMToken(String token) async {
    try {
      await _authService.removeFCMToken(token);
    } catch (e) {
      // Silently handle FCM token errors
      if (kDebugMode) {
        print('Failed to remove FCM token: $e');
      }
    }
  }

  // Private helper methods
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

  // Clear all state
  void clear() {
    _user = null;
    _isLoading = false;
    _error = null;
    notifyListeners();
  }
}