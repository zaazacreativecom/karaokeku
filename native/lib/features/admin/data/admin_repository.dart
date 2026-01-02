import '../../../core/network/api_client.dart';
import '../../../core/network/api_error.dart';
import '../../auth/models/user.dart';
import '../../donations/models/donation.dart';
import '../../donations/models/payment_method.dart';
import '../../requests/models/song_request.dart';
import '../../songs/models/song.dart';
import '../../uploads/models/upload.dart';
import '../models/dashboard_stats.dart';

class AdminRepository {
  final ApiClient _client;

  AdminRepository(this._client);

  Future<DashboardStats> fetchDashboard() async {
    final response = await _client.get('/admin/dashboard');
    if (response.data is Map<String, dynamic>) {
      return DashboardStats.fromJson(response.data as Map<String, dynamic>);
    }
    throw const ApiError('Dashboard tidak valid');
  }

  Future<List<User>> fetchUsers({int page = 1, int limit = 20}) async {
    final response = await _client.get('/admin/users', queryParameters: {'page': page, 'limit': limit});
    if (response.data is List) {
      return (response.data as List)
          .whereType<Map>()
          .map((item) => User.fromJson(item.cast<String, dynamic>()))
          .toList();
    }
    throw const ApiError('User tidak valid');
  }

  Future<User> updateUserRole(int userId, String role) async {
    final response = await _client.put('/admin/users/$userId', data: {'role': role});
    if (response.data is Map<String, dynamic>) {
      return User.fromJson(response.data as Map<String, dynamic>);
    }
    throw const ApiError('Update user gagal');
  }

  Future<void> deleteUser(int userId) async {
    await _client.delete('/admin/users/$userId');
  }

  Future<List<Song>> fetchSongs({int page = 1, int limit = 20}) async {
    final response = await _client.get('/admin/songs', queryParameters: {'page': page, 'limit': limit});
    if (response.data is List) {
      return (response.data as List)
          .whereType<Map>()
          .map((item) => Song.fromJson(item.cast<String, dynamic>()))
          .toList();
    }
    throw const ApiError('Lagu tidak valid');
  }

  Future<void> deleteSong(int songId) async {
    await _client.delete('/admin/songs/$songId');
  }

  Future<List<UploadItem>> fetchUploads({String? status, int page = 1, int limit = 20}) async {
    final response = await _client.get(
      '/admin/uploads',
      queryParameters: {
        if (status != null && status.isNotEmpty) 'status': status,
        'page': page,
        'limit': limit,
      },
    );
    if (response.data is List) {
      return (response.data as List)
          .whereType<Map>()
          .map((item) => UploadItem.fromJson(item.cast<String, dynamic>()))
          .toList();
    }
    throw const ApiError('Upload tidak valid');
  }

  Future<void> reviewUpload(int uploadId, {required String status, String? adminNote}) async {
    await _client.put('/admin/uploads/$uploadId', data: {'status': status, 'admin_note': adminNote});
  }

  Future<List<SongRequest>> fetchRequests({String? status}) async {
    final response = await _client.get('/requests', queryParameters: {'status': status});
    if (response.data is List) {
      return (response.data as List)
          .whereType<Map>()
          .map((item) => SongRequest.fromJson(item.cast<String, dynamic>()))
          .toList();
    }
    throw const ApiError('Request tidak valid');
  }

  Future<void> updateRequestStatus(int requestId, String status) async {
    await _client.put('/requests/$requestId/status', data: {'status': status});
  }

  Future<List<Donation>> fetchDonations({String? status}) async {
    final response = await _client.get('/donations', queryParameters: {'status': status});
    if (response.data is List) {
      return (response.data as List)
          .whereType<Map>()
          .map((item) => Donation.fromJson(item.cast<String, dynamic>()))
          .toList();
    }
    throw const ApiError('Donasi tidak valid');
  }

  Future<void> verifyDonation(int donationId, String status, {String? adminNotes}) async {
    await _client.put('/donations/$donationId/verify', data: {'status': status, 'admin_notes': adminNotes});
  }

  Future<List<PaymentMethod>> fetchPaymentMethodsAdmin() async {
    final response = await _client.get('/payment-methods/admin');
    if (response.data is List) {
      return (response.data as List)
          .whereType<Map>()
          .map((item) => PaymentMethod.fromJson(item.cast<String, dynamic>()))
          .toList();
    }
    throw const ApiError('Metode pembayaran tidak valid');
  }

  Future<void> togglePaymentMethod(int methodId) async {
    await _client.put('/payment-methods/$methodId/toggle');
  }
}
