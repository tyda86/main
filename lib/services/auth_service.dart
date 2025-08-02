import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_firestore/firebase_firestore.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../models/user.dart' as app_user;
import '../constants/app_constants.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  // Get current user
  User? get currentUser => _auth.currentUser;
  
  // Auth state stream
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Sign up with email and password
  Future<app_user.User?> signUpWithEmailAndPassword({
    required String email,
    required String password,
    String? displayName,
  }) async {
    try {
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (credential.user != null) {
        // Update display name if provided
        if (displayName != null && displayName.isNotEmpty) {
          await credential.user!.updateDisplayName(displayName);
        }

        // Send email verification
        await credential.user!.sendEmailVerification();

        // Create user document in Firestore
        final appUser = app_user.User(
          id: credential.user!.uid,
          email: email,
          displayName: displayName ?? credential.user!.displayName,
          photoUrl: credential.user!.photoURL,
          createdAt: DateTime.now(),
          lastLoginAt: DateTime.now(),
          emailVerified: credential.user!.emailVerified,
        );

        await _createUserDocument(appUser);
        return appUser;
      }
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    } catch (e) {
      throw Exception('An unexpected error occurred: $e');
    }
    return null;
  }

  // Sign in with email and password
  Future<app_user.User?> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (credential.user != null) {
        return await _getUserDocument(credential.user!.uid);
      }
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    } catch (e) {
      throw Exception('An unexpected error occurred: $e');
    }
    return null;
  }

  // Sign in with Google
  Future<app_user.User?> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null;

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await _auth.signInWithCredential(credential);
      if (userCredential.user != null) {
        final user = userCredential.user!;
        
        // Check if user document exists, create if not
        final existingUser = await _getUserDocument(user.uid);
        if (existingUser != null) {
          return existingUser;
        } else {
          final appUser = app_user.User(
            id: user.uid,
            email: user.email!,
            displayName: user.displayName,
            photoUrl: user.photoURL,
            createdAt: DateTime.now(),
            lastLoginAt: DateTime.now(),
            emailVerified: user.emailVerified,
          );
          await _createUserDocument(appUser);
          return appUser;
        }
      }
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    } catch (e) {
      throw Exception('An unexpected error occurred: $e');
    }
    return null;
  }

  // Sign out
  Future<void> signOut() async {
    try {
      await Future.wait([
        _auth.signOut(),
        _googleSignIn.signOut(),
      ]);
    } catch (e) {
      throw Exception('Failed to sign out: $e');
    }
  }

  // Reset password
  Future<void> resetPassword(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email);
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    } catch (e) {
      throw Exception('An unexpected error occurred: $e');
    }
  }

  // Update user profile
  Future<app_user.User?> updateUserProfile({
    String? displayName,
    String? photoUrl,
    String? anilistUsername,
    String? malUsername,
    Map<String, dynamic>? preferences,
  }) async {
    try {
      final user = _auth.currentUser;
      if (user == null) throw Exception('No user logged in');

      // Update Firebase Auth profile
      if (displayName != null || photoUrl != null) {
        await user.updateProfile(
          displayName: displayName,
          photoURL: photoUrl,
        );
      }

      // Update Firestore document
      final updates = <String, dynamic>{
        'lastLoginAt': DateTime.now().toIso8601String(),
      };

      if (displayName != null) updates['displayName'] = displayName;
      if (photoUrl != null) updates['photoUrl'] = photoUrl;
      if (anilistUsername != null) updates['anilistUsername'] = anilistUsername;
      if (malUsername != null) updates['malUsername'] = malUsername;
      if (preferences != null) updates['preferences'] = preferences;

      await _firestore
          .collection(AppConstants.usersCollection)
          .doc(user.uid)
          .update(updates);

      return await _getUserDocument(user.uid);
    } catch (e) {
      throw Exception('Failed to update profile: $e');
    }
  }

  // Update user preferences
  Future<void> updateUserPreferences(Map<String, dynamic> preferences) async {
    try {
      final user = _auth.currentUser;
      if (user == null) throw Exception('No user logged in');

      await _firestore
          .collection(AppConstants.usersCollection)
          .doc(user.uid)
          .update({'preferences': preferences});
    } catch (e) {
      throw Exception('Failed to update preferences: $e');
    }
  }

  // Add FCM token
  Future<void> addFCMToken(String token) async {
    try {
      final user = _auth.currentUser;
      if (user == null) return;

      await _firestore
          .collection(AppConstants.usersCollection)
          .doc(user.uid)
          .update({
        'fcmTokens': FieldValue.arrayUnion([token]),
      });
    } catch (e) {
      // Silently fail for FCM token updates
      print('Failed to add FCM token: $e');
    }
  }

  // Remove FCM token
  Future<void> removeFCMToken(String token) async {
    try {
      final user = _auth.currentUser;
      if (user == null) return;

      await _firestore
          .collection(AppConstants.usersCollection)
          .doc(user.uid)
          .update({
        'fcmTokens': FieldValue.arrayRemove([token]),
      });
    } catch (e) {
      // Silently fail for FCM token updates
      print('Failed to remove FCM token: $e');
    }
  }

  // Send email verification
  Future<void> sendEmailVerification() async {
    try {
      final user = _auth.currentUser;
      if (user != null && !user.emailVerified) {
        await user.sendEmailVerification();
      }
    } catch (e) {
      throw Exception('Failed to send verification email: $e');
    }
  }

  // Reload user
  Future<void> reloadUser() async {
    try {
      await _auth.currentUser?.reload();
    } catch (e) {
      throw Exception('Failed to reload user: $e');
    }
  }

  // Delete account
  Future<void> deleteAccount() async {
    try {
      final user = _auth.currentUser;
      if (user == null) throw Exception('No user logged in');

      // Delete user document from Firestore
      await _firestore
          .collection(AppConstants.usersCollection)
          .doc(user.uid)
          .delete();

      // Delete user watchlist
      final watchlistQuery = await _firestore
          .collection(AppConstants.watchlistCollection)
          .where('userId', isEqualTo: user.uid)
          .get();

      final batch = _firestore.batch();
      for (final doc in watchlistQuery.docs) {
        batch.delete(doc.reference);
      }
      await batch.commit();

      // Delete Firebase Auth account
      await user.delete();
    } catch (e) {
      throw Exception('Failed to delete account: $e');
    }
  }

  // Private helper methods
  Future<void> _createUserDocument(app_user.User user) async {
    await _firestore
        .collection(AppConstants.usersCollection)
        .doc(user.id)
        .set(user.toJson());
  }

  Future<app_user.User?> _getUserDocument(String uid) async {
    try {
      final doc = await _firestore
          .collection(AppConstants.usersCollection)
          .doc(uid)
          .get();

      if (doc.exists) {
        return app_user.User.fromJson(doc.data()!);
      }
    } catch (e) {
      print('Error getting user document: $e');
    }
    return null;
  }

  String _handleAuthException(FirebaseAuthException e) {
    switch (e.code) {
      case 'weak-password':
        return 'The password provided is too weak.';
      case 'email-already-in-use':
        return 'An account already exists for this email.';
      case 'invalid-email':
        return 'The email address is not valid.';
      case 'user-disabled':
        return 'This user account has been disabled.';
      case 'user-not-found':
        return 'No user found for this email.';
      case 'wrong-password':
        return 'Wrong password provided.';
      case 'too-many-requests':
        return 'Too many requests. Try again later.';
      case 'operation-not-allowed':
        return 'Operation not allowed. Please contact support.';
      case 'network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return e.message ?? 'An authentication error occurred.';
    }
  }

  // Check if user is logged in
  bool get isLoggedIn => _auth.currentUser != null;

  // Get current user ID
  String? get currentUserId => _auth.currentUser?.uid;

  // Check if email is verified
  bool get isEmailVerified => _auth.currentUser?.emailVerified ?? false;
}