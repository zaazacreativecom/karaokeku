import 'package:equatable/equatable.dart';

class LeaderboardEntry extends Equatable {
  final int rank;
  final int id;
  final String name;
  final String? avatarUrl;
  final int totalScore;
  final int totalSongsPlayed;

  const LeaderboardEntry({
    required this.rank,
    required this.id,
    required this.name,
    this.avatarUrl,
    required this.totalScore,
    required this.totalSongsPlayed,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      rank: _parseInt(json['rank']),
      id: _parseInt(json['id']),
      name: json['name']?.toString() ?? '',
      avatarUrl: json['avatar_url']?.toString(),
      totalScore: _parseInt(json['total_score']),
      totalSongsPlayed: _parseInt(json['total_songs_played']),
    );
  }

  @override
  List<Object?> get props => [rank, id, name, avatarUrl, totalScore, totalSongsPlayed];

  static int _parseInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    return int.tryParse(value.toString()) ?? 0;
  }
}
