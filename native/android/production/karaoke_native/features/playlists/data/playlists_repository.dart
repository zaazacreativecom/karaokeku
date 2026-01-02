import '../../../core/network/api_client.dart';
import '../../../core/network/api_error.dart';
import '../models/playlist.dart';

class PlaylistsRepository {
  final ApiClient _client;

  PlaylistsRepository(this._client);

  Future<List<Playlist>> fetchMyPlaylists() async {
    final response = await _client.get('/playlists');
    if (response.data is List) {
      return (response.data as List)
          .whereType<Map>()
          .map((item) => Playlist.fromJson(item.cast<String, dynamic>()))
          .toList();
    }
    throw const ApiError('Playlist tidak valid');
  }

  Future<Playlist> fetchPlaylist(int id) async {
    final response = await _client.get('/playlists/$id');
    if (response.data is Map<String, dynamic>) {
      return Playlist.fromJson(response.data as Map<String, dynamic>);
    }
    throw const ApiError('Detail playlist tidak valid');
  }

  Future<Playlist> createPlaylist({required String name, String? description, bool isPublic = false}) async {
    final response = await _client.post(
      '/playlists',
      data: {
        'name': name,
        'description': description,
        'is_public': isPublic,
      },
    );
    if (response.data is Map<String, dynamic>) {
      return Playlist.fromJson(response.data as Map<String, dynamic>);
    }
    throw const ApiError('Gagal membuat playlist');
  }

  Future<Playlist> updatePlaylist(int id, Map<String, dynamic> payload) async {
    final response = await _client.put('/playlists/$id', data: payload);
    if (response.data is Map<String, dynamic>) {
      return Playlist.fromJson(response.data as Map<String, dynamic>);
    }
    throw const ApiError('Gagal mengupdate playlist');
  }

  Future<void> deletePlaylist(int id) async {
    await _client.delete('/playlists/$id');
  }

  Future<void> addSongToPlaylist(int playlistId, int songId) async {
    await _client.post('/playlists/$playlistId/songs', data: {'songId': songId});
  }

  Future<void> removeSongFromPlaylist(int playlistId, int itemId) async {
    await _client.delete('/playlists/$playlistId/songs/$itemId');
  }

  Future<void> reorderItems(int playlistId, List<Map<String, dynamic>> items) async {
    await _client.put('/playlists/$playlistId/reorder', data: {'items': items});
  }
}
