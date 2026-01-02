import 'package:equatable/equatable.dart';

import '../../songs/models/song.dart';

class PlayHistoryItem extends Equatable {
  final int id;
  final Song? song;
  final int? score;
  final int? durationPlayed;
  final DateTime? startedAt;

  const PlayHistoryItem({
    required this.id,
    this.song,
    this.score,
    this.durationPlayed,
    this.startedAt,
  });

  factory PlayHistoryItem.fromJson(Map<String, dynamic> json) {
    final songData = json['song'];
    return PlayHistoryItem(
      id: _parseInt(json['id']),
      song: songData is Map<String, dynamic> ? Song.fromJson(songData) : null,
      score: _parseNullableInt(json['score']),
      durationPlayed: _parseNullableInt(json['duration_played']),
      startedAt: json['started_at'] != null ? DateTime.tryParse(json['started_at'].toString()) : null,
    );
  }

  @override
  List<Object?> get props => [id, song, score, durationPlayed, startedAt];

  static int _parseInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    return int.tryParse(value.toString()) ?? 0;
  }

  static int? _parseNullableInt(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    return int.tryParse(value.toString());
  }
}
