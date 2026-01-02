import 'package:equatable/equatable.dart';

class User extends Equatable {
  final int id;
  final String name;
  final String email;
  final String username;
  final String role;
  final String? avatarUrl;
  final int totalScore;
  final int totalSongsPlayed;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.username,
    required this.role,
    this.avatarUrl,
    required this.totalScore,
    required this.totalSongsPlayed,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] is int ? json['id'] as int : int.parse(json['id'].toString()),
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      username: json['username']?.toString() ?? '',
      role: json['role']?.toString() ?? 'user',
      avatarUrl: json['avatar_url']?.toString(),
      totalScore: _parseInt(json['total_score']),
      totalSongsPlayed: _parseInt(json['total_songs_played']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'username': username,
      'role': role,
      'avatar_url': avatarUrl,
      'total_score': totalScore,
      'total_songs_played': totalSongsPlayed,
    };
  }

  @override
  List<Object?> get props => [id, name, email, username, role, avatarUrl, totalScore, totalSongsPlayed];

  static int _parseInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    return int.tryParse(value.toString()) ?? 0;
  }
}
