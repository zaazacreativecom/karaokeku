import '../../../core/network/api_client.dart';
import '../../../core/network/api_error.dart';

class PlaybackResult {
  final int score;
  final int historyId;
  final String level;
  final String badge;

  const PlaybackResult({
    required this.score,
    required this.historyId,
    required this.level,
    required this.badge,
  });

  factory PlaybackResult.fromJson(Map<String, dynamic> json) {
    return PlaybackResult(
      score: _parseInt(json['score']),
      historyId: _parseInt(json['historyId']),
      level: json['level']?.toString() ?? 'Pemula',
      badge: json['badge']?.toString() ?? '🎤',
    );
  }

  static int _parseInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    return int.tryParse(value.toString()) ?? 0;
  }
}

class PlaybackRepository {
  final ApiClient _client;

  PlaybackRepository(this._client);

  Future<int> startPlayback(int songId) async {
    final response = await _client.post('/playback/start', data: {'songId': songId});
    if (response.data is Map<String, dynamic>) {
      final data = response.data as Map<String, dynamic>;
      return PlaybackResult._parseInt(data['historyId']);
    }
    throw const ApiError('Start playback tidak valid');
  }

  Future<PlaybackResult> endPlayback({required int historyId, required int playedDuration}) async {
    final response = await _client.post(
      '/playback/end',
      data: {
        'historyId': historyId,
        'playedDuration': playedDuration,
      },
    );
    if (response.data is Map<String, dynamic>) {
      return PlaybackResult.fromJson(response.data as Map<String, dynamic>);
    }
    throw const ApiError('End playback tidak valid');
  }
}
