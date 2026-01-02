import '../../../core/network/api_client.dart';
import '../../../core/network/api_error.dart';
import '../models/leaderboard_entry.dart';
import '../models/play_history.dart';
import '../models/score_summary.dart';

class HistoryPage {
  final List<PlayHistoryItem> items;
  final Map<String, dynamic>? meta;

  const HistoryPage({required this.items, this.meta});
}

class HistoryRepository {
  final ApiClient _client;

  HistoryRepository(this._client);

  Future<ScoreSummary> fetchSummary() async {
    final response = await _client.get('/playback/me/scores');
    if (response.data is Map<String, dynamic>) {
      return ScoreSummary.fromJson(response.data as Map<String, dynamic>);
    }
    throw const ApiError('Ringkasan skor tidak valid');
  }

  Future<HistoryPage> fetchHistory({int page = 1, int limit = 20}) async {
    final response = await _client.get('/playback/me/history', queryParameters: {'page': page, 'limit': limit});
    if (response.data is List) {
      final items = (response.data as List)
          .whereType<Map>()
          .map((item) => PlayHistoryItem.fromJson(item.cast<String, dynamic>()))
          .toList();
      return HistoryPage(items: items, meta: response.meta);
    }
    throw const ApiError('Riwayat tidak valid');
  }

  Future<List<LeaderboardEntry>> fetchLeaderboard({int limit = 10}) async {
    final response = await _client.get('/playback/leaderboard', queryParameters: {'limit': limit});
    if (response.data is List) {
      return (response.data as List)
          .whereType<Map>()
          .map((item) => LeaderboardEntry.fromJson(item.cast<String, dynamic>()))
          .toList();
    }
    throw const ApiError('Leaderboard tidak valid');
  }
}
