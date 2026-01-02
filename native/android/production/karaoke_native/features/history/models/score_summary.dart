import 'package:equatable/equatable.dart';

import '../../songs/models/song.dart';
import 'play_history.dart';

class ScoreSummary extends Equatable {
  final int totalSongsPlayed;
  final int totalDurationMinutes;
  final int averageScore;
  final String level;
  final String badge;
  final int scoreMin;
  final int scoreMax;
  final List<Song> highScores;
  final List<PlayHistoryItem> recentPlays;

  const ScoreSummary({
    required this.totalSongsPlayed,
    required this.totalDurationMinutes,
    required this.averageScore,
    required this.level,
    required this.badge,
    required this.scoreMin,
    required this.scoreMax,
    required this.highScores,
    required this.recentPlays,
  });

  factory ScoreSummary.fromJson(Map<String, dynamic> json) {
    final highScoresData = json['highScores'];
    final recentPlaysData = json['recentPlays'];

    final highScores = <Song>[];
    if (highScoresData is List) {
      for (final item in highScoresData) {
        if (item is Map<String, dynamic>) {
          final songData = item['song'] ?? item;
          if (songData is Map<String, dynamic>) {
            highScores.add(Song.fromJson(songData));
          }
        }
      }
    }

    final recentPlays = <PlayHistoryItem>[];
    if (recentPlaysData is List) {
      for (final item in recentPlaysData) {
        if (item is Map<String, dynamic>) {
          recentPlays.add(PlayHistoryItem.fromJson(item));
        }
      }
    }

    return ScoreSummary(
      totalSongsPlayed: _parseInt(json['totalSongsPlayed']),
      totalDurationMinutes: _parseInt(json['totalDurationMinutes']),
      averageScore: _parseInt(json['averageScore']),
      level: json['level']?.toString() ?? 'Pemula',
      badge: json['badge']?.toString() ?? '🎤',
      scoreMin: _parseInt(json['scoreMin']),
      scoreMax: _parseInt(json['scoreMax']),
      highScores: highScores,
      recentPlays: recentPlays,
    );
  }

  @override
  List<Object?> get props => [
        totalSongsPlayed,
        totalDurationMinutes,
        averageScore,
        level,
        badge,
        scoreMin,
        scoreMax,
        highScores,
        recentPlays,
      ];

  static int _parseInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    return int.tryParse(value.toString()) ?? 0;
  }
}
