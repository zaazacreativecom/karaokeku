import '../../../core/network/api_client.dart';
import '../../../core/network/api_error.dart';
import '../../../core/storage/local_cache.dart';
import '../models/song.dart';

class SongsPage {
  final List<Song> songs;
  final Map<String, dynamic>? meta;

  const SongsPage({required this.songs, this.meta});
}

class SongsRepository {
  static const _cacheDefaultKey = 'songs_list_default';
  static const _cacheTopKey = 'songs_top';

  final ApiClient _client;
  final LocalCache? _cache;

  SongsRepository(this._client, {LocalCache? cache}) : _cache = cache;

  Future<SongsPage> fetchSongs({
    String? search,
    String? genre,
    String? language,
    int page = 1,
    int limit = 20,
    String sortBy = 'created_at',
    String sortOrder = 'ASC',
  }) async {
    final isDefault = (search == null || search.isEmpty) &&
        (genre == null || genre.isEmpty) &&
        (language == null || language.isEmpty) &&
        page == 1;

    try {
      final response = await _client.get(
        '/songs',
        queryParameters: {
          if (search != null && search.isNotEmpty) 'search': search,
          if (genre != null && genre.isNotEmpty) 'genre': genre,
          if (language != null && language.isNotEmpty) 'language': language,
          'page': page,
          'limit': limit,
          'sortBy': sortBy,
          'sortOrder': sortOrder,
        },
      );
      if (response.data is List) {
        final songs = (response.data as List)
            .whereType<Map>()
            .map((item) => Song.fromJson(item.cast<String, dynamic>()))
            .toList();
        final cache = _cache;
        if (isDefault && cache != null) {
          await cache.writeJsonList(
            _cacheDefaultKey,
            songs.map((song) => song.toJson()).toList(),
          );
        }
        return SongsPage(songs: songs, meta: response.meta);
      }
      throw const ApiError('Response lagu tidak valid');
    } catch (error) {
      final cache = _cache;
      if (isDefault && cache != null) {
        final cached = await cache.readJsonList(_cacheDefaultKey);
        if (cached.isNotEmpty) {
          final songs = cached.map((item) => Song.fromJson(item)).toList();
          return SongsPage(songs: songs, meta: const {'hasNextPage': false});
        }
      }
      rethrow;
    }
  }

  Future<Song> fetchSongById(int id) async {
    final response = await _client.get('/songs/$id');
    if (response.data is Map<String, dynamic>) {
      return Song.fromJson(response.data as Map<String, dynamic>);
    }
    throw const ApiError('Detail lagu tidak valid');
  }

  Future<List<Song>> fetchTopSongs({int limit = 10}) async {
    try {
      final response = await _client.get('/songs/top', queryParameters: {'limit': limit});
      if (response.data is List) {
        final songs = (response.data as List)
            .whereType<Map>()
            .map((item) => Song.fromJson(item.cast<String, dynamic>()))
            .toList();
        final cache = _cache;
        if (cache != null) {
          await cache.writeJsonList(
            _cacheTopKey,
            songs.map((song) => song.toJson()).toList(),
          );
        }
        return songs;
      }
      throw const ApiError('Top songs tidak valid');
    } catch (error) {
      final cache = _cache;
      if (cache != null) {
        final cached = await cache.readJsonList(_cacheTopKey);
        if (cached.isNotEmpty) {
          return cached.map((item) => Song.fromJson(item)).toList();
        }
      }
      rethrow;
    }
  }

  Future<List<String>> fetchGenres() async {
    final response = await _client.get('/songs/genres');
    if (response.data is List) {
      return (response.data as List).map((item) => item.toString()).toList();
    }
    return [];
  }

  Future<List<String>> fetchLanguages() async {
    final response = await _client.get('/songs/languages');
    if (response.data is List) {
      return (response.data as List).map((item) => item.toString()).toList();
    }
    return [];
  }

  Future<List<Song>> quickSearch(String query, {int limit = 10}) async {
    final response = await _client.get(
      '/songs/search',
      queryParameters: {'q': query, 'limit': limit},
    );
    if (response.data is List) {
      return (response.data as List)
          .whereType<Map>()
          .map((item) => Song.fromJson(item.cast<String, dynamic>()))
          .toList();
    }
    return [];
  }
}
