import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

class AuthApi {
  final ApiClient _client;

  AuthApi(this._client);

  Future<ApiResponse> login({required String emailOrUsername, required String password}) {
    return _client.post(
      '/auth/login',
      data: {
        'emailOrUsername': emailOrUsername,
        'password': password,
      },
    );
  }

  Future<ApiResponse> register({
    required String name,
    required String email,
    required String username,
    required String password,
  }) {
    return _client.post(
      '/auth/register',
      data: {
        'name': name,
        'email': email,
        'username': username,
        'password': password,
      },
    );
  }

  Future<ApiResponse> loginWithGoogle({required String idToken}) {
    return _client.post('/auth/google', data: {'idToken': idToken});
  }

  Future<ApiResponse> getProfile() {
    return _client.get('/auth/me');
  }

  Future<ApiResponse> updateProfile(Map<String, dynamic> payload) {
    return _client.put('/auth/profile', data: payload);
  }

  Future<ApiResponse> changePassword({required String currentPassword, required String newPassword}) {
    return _client.put(
      '/auth/password',
      data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      },
    );
  }
}
