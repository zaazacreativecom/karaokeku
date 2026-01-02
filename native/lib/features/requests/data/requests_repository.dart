import '../../../core/network/api_client.dart';
import '../../../core/network/api_error.dart';
import '../models/song_request.dart';

class RequestsRepository {
  final ApiClient _client;

  RequestsRepository(this._client);

  Future<List<SongRequest>> fetchMyRequests() async {
    final response = await _client.get('/requests/my');
    if (response.data is List) {
      return (response.data as List)
          .whereType<Map>()
          .map((item) => SongRequest.fromJson(item.cast<String, dynamic>()))
          .toList();
    }
    throw const ApiError('Request lagu tidak valid');
  }

  Future<void> createRequest({
    required String title,
    required String artist,
    String? genre,
    String? language,
    String? link,
    String? notes,
  }) async {
    await _client.post(
      '/requests',
      data: {
        'title': title,
        'artist': artist,
        'genre': genre,
        'language': language,
        'link': link,
        'notes': notes,
      },
    );
  }
}
