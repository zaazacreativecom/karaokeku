import 'package:equatable/equatable.dart';

class SongRequest extends Equatable {
  final int id;
  final String title;
  final String artist;
  final String? genre;
  final String? language;
  final String? link;
  final String status;
  final String? notes;

  const SongRequest({
    required this.id,
    required this.title,
    required this.artist,
    this.genre,
    this.language,
    this.link,
    required this.status,
    this.notes,
  });

  factory SongRequest.fromJson(Map<String, dynamic> json) {
    return SongRequest(
      id: _parseInt(json['id']),
      title: json['title']?.toString() ?? '',
      artist: json['artist']?.toString() ?? '',
      genre: json['genre']?.toString(),
      language: json['language']?.toString(),
      link: json['link']?.toString(),
      status: json['status']?.toString() ?? 'pending',
      notes: json['notes']?.toString(),
    );
  }

  @override
  List<Object?> get props => [id, title, artist, genre, language, link, status, notes];

  static int _parseInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    return int.tryParse(value.toString()) ?? 0;
  }
}
