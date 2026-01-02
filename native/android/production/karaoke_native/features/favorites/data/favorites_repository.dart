import '../../../core/network/api_client.dart';
import '../../../core/network/api_error.dart';
import '../../songs/models/song.dart';

class FavoritesRepository {
  final ApiClient _client;

  FavoritesRepository(this._client);

  Future<List<Song>> fetchFavorites({int page = 1, int limit = 20}) async {
    final response = await _client.get('/favorites', queryParameters: {'page': page, 'limit': limit});
    if (response.data is List) {
      return (response.data as List)
          .whereType<Map>()
          .map((item) => Song.fromJson(item.cast<String, dynamic>()))
          .toList();
    }
    throw const ApiError('Favorit tidak valid');
  }

  Future<bool> toggleFavorite(int songId) async {
    final response = await _client.post('/favorites/toggle', data: {'songId': songId});
    if (response.data is Map<String, dynamic>) {
      final data = response.data as Map<String, dynamic>;
      return data['isFavorite'] == true;
    }
    throw const ApiError('Toggle favorit gagal');
  }

  Future<List<int>> fetchFavoriteIds() async {
    final response = await _client.get('/favorites/ids');
    if (response.data is List) {
      return (response.data as List).map((id) => int.tryParse(id.toString()) ?? 0).toList();
    }
    return [];
  }
}
