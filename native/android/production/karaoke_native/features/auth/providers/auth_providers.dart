import 'package:firebase_auth/firebase_auth.dart' as firebase;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../../../core/config/app_config.dart';
import '../../../core/network/api_error.dart';
import '../../../core/di/providers.dart';
import '../data/auth_api.dart';
import '../data/auth_repository.dart';
import '../models/user.dart';

enum AuthStatus { loading, authenticated, unauthenticated }

class AuthState {
  final AuthStatus status;
  final User? user;
  final String? errorMessage;

  const AuthState({required this.status, this.user, this.errorMessage});

  AuthState copyWith({AuthStatus? status, User? user, String? errorMessage}) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage,
    );
  }

  static const loading = AuthState(status: AuthStatus.loading);
  static const unauthenticated = AuthState(status: AuthStatus.unauthenticated);
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final apiClient = ref.read(apiClientProvider);
  final secureStorage = ref.read(secureStorageProvider);
  final cache = ref.read(localCacheProvider);
  return AuthRepository(AuthApi(apiClient), secureStorage, cache);
});

final firebaseAuthProvider = Provider<firebase.FirebaseAuth>((ref) => firebase.FirebaseAuth.instance);

final googleSignInProvider = Provider<GoogleSignIn>((ref) {
  return GoogleSignIn(
    clientId: AppConfig.googleIosClientId(),
    serverClientId: AppConfig.googleWebClientId(),
    scopes: const ['email', 'profile'],
  );
});

final authControllerProvider = StateNotifierProvider<AuthController, AuthState>((ref) {
  final controller = AuthController(
    authRepository: ref.read(authRepositoryProvider),
    firebaseAuth: ref.read(firebaseAuthProvider),
    googleSignIn: ref.read(googleSignInProvider),
  );
  controller.bootstrap();
  return controller;
});

class AuthController extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;
  final firebase.FirebaseAuth _firebaseAuth;
  final GoogleSignIn _googleSignIn;

  AuthController({
    required AuthRepository authRepository,
    required firebase.FirebaseAuth firebaseAuth,
    required GoogleSignIn googleSignIn,
  })  : _authRepository = authRepository,
        _firebaseAuth = firebaseAuth,
        _googleSignIn = googleSignIn,
        super(AuthState.loading);

  Future<void> bootstrap() async {
    state = AuthState.loading;
    final token = await _authRepository.readToken();
    final cachedUser = await _authRepository.readCachedUser();

    if (token == null || token.isEmpty) {
      state = cachedUser != null
          ? AuthState(status: AuthStatus.unauthenticated, user: cachedUser)
          : AuthState.unauthenticated;
      return;
    }

    try {
      final profile = await _authRepository.fetchProfile();
      state = AuthState(status: AuthStatus.authenticated, user: profile);
    } catch (error) {
      await _authRepository.signOut();
      state = AuthState.unauthenticated;
    }
  }

  Future<bool> login({required String emailOrUsername, required String password}) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      final session = await _authRepository.login(
        emailOrUsername: emailOrUsername,
        password: password,
      );
      await _authRepository.persistSession(session);
      state = AuthState(status: AuthStatus.authenticated, user: session.user);
      return true;
    } catch (error) {
      state = state.copyWith(status: AuthStatus.unauthenticated, errorMessage: _parseError(error));
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String username,
    required String password,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      final session = await _authRepository.register(
        name: name,
        email: email,
        username: username,
        password: password,
      );
      await _authRepository.persistSession(session);
      state = AuthState(status: AuthStatus.authenticated, user: session.user);
      return true;
    } catch (error) {
      state = state.copyWith(status: AuthStatus.unauthenticated, errorMessage: _parseError(error));
      return false;
    }
  }

  Future<bool> loginWithGoogle() async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      final account = await _googleSignIn.signIn();
      if (account == null) {
        state = state.copyWith(status: AuthStatus.unauthenticated);
        return false;
      }

      final auth = await account.authentication;
      final credential = firebase.GoogleAuthProvider.credential(
        idToken: auth.idToken,
        accessToken: auth.accessToken,
      );

      final result = await _firebaseAuth.signInWithCredential(credential);
      final idToken = await result.user?.getIdToken();
      if (idToken == null || idToken.isEmpty) {
        throw Exception('Firebase token kosong');
      }

      final session = await _authRepository.loginWithGoogle(idToken: idToken);
      await _authRepository.persistSession(session);
      state = AuthState(status: AuthStatus.authenticated, user: session.user);
      return true;
    } catch (error) {
      state = state.copyWith(status: AuthStatus.unauthenticated, errorMessage: _parseError(error));
      return false;
    }
  }

  Future<void> refreshProfile() async {
    try {
      final profile = await _authRepository.fetchProfile();
      state = state.copyWith(status: AuthStatus.authenticated, user: profile);
    } catch (_) {
      state = state.copyWith(status: AuthStatus.authenticated);
    }
  }

  Future<void> signOut() async {
    await _authRepository.signOut();
    await _firebaseAuth.signOut();
    await _googleSignIn.signOut();
    state = AuthState.unauthenticated;
  }

  String _parseError(Object error) {
    if (error is ApiError) return error.message;
    return error.toString();
  }
}
