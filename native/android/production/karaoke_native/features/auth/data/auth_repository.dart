import '../../../core/network/api_error.dart';
import '../../../core/storage/local_cache.dart';
import '../../../core/storage/secure_storage_service.dart';
import '../models/user.dart';
import 'auth_api.dart';

class AuthSession {
  final User user;
  final String token;

  const AuthSession({required this.user, required this.token});
}

class AuthRepository {
  static const _userCacheKey = 'auth_user';

  final AuthApi _api;
  final SecureStorageService _secureStorage;
  final LocalCache _cache;

  AuthRepository(this._api, this._secureStorage, this._cache);

  Future<AuthSession> login({required String emailOrUsername, required String password}) async {
    final response = await _api.login(emailOrUsername: emailOrUsername, password: password);
    return _parseSession(response.data);
  }

  Future<AuthSession> register({
    required String name,
    required String email,
    required String username,
    required String password,
  }) async {
    final response = await _api.register(
      name: name,
      email: email,
      username: username,
      password: password,
    );
    return _parseSession(response.data);
  }

  Future<AuthSession> loginWithGoogle({required String idToken}) async {
    final response = await _api.loginWithGoogle(idToken: idToken);
    return _parseSession(response.data);
  }

  Future<User> fetchProfile() async {
    final response = await _api.getProfile();
    final data = response.data;
    if (data is Map<String, dynamic>) {
      final user = User.fromJson(data);
      await _cache.writeJson(_userCacheKey, user.toJson());
      return user;
    }
    throw const ApiError('Profile response invalid');
  }

  Future<User?> readCachedUser() async {
    final cached = await _cache.readJson(_userCacheKey);
    if (cached == null) return null;
    return User.fromJson(cached);
  }

  Future<void> persistSession(AuthSession session) async {
    await _secureStorage.writeToken(session.token);
    await _cache.writeJson(_userCacheKey, session.user.toJson());
  }

  Future<String?> readToken() => _secureStorage.readToken();

  Future<User> updateProfile(Map<String, dynamic> payload) async {
    final response = await _api.updateProfile(payload);
    final data = response.data;
    if (data is Map<String, dynamic>) {
      final user = User.fromJson(data);
      await _cache.writeJson(_userCacheKey, user.toJson());
      return user;
    }
    throw const ApiError('Update profile response invalid');
  }

  Future<void> changePassword({required String currentPassword, required String newPassword}) {
    return _api.changePassword(currentPassword: currentPassword, newPassword: newPassword).then((_) => null);
  }

  Future<void> signOut() async {
    await _secureStorage.deleteToken();
    await _cache.remove(_userCacheKey);
  }

  AuthSession _parseSession(dynamic data) {
    if (data is Map<String, dynamic>) {
      final userData = data['user'];
      final token = data['token']?.toString();
      if (userData is Map<String, dynamic> && token != null && token.isNotEmpty) {
        final user = User.fromJson(userData);
        return AuthSession(user: user, token: token);
      }
    }
    throw const ApiError('Auth response invalid');
  }
}
