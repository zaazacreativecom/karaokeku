import 'package:equatable/equatable.dart';

class LyricLine extends Equatable {
  final double time;
  final String text;

  const LyricLine({required this.time, required this.text});

  factory LyricLine.fromJson(Map<String, dynamic> json) {
    final rawTime = json['time'];
    final parsed = rawTime is num ? rawTime.toDouble() : double.tryParse(rawTime.toString()) ?? 0;
    return LyricLine(
      time: parsed,
      text: json['text']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'time': time,
      'text': text,
    };
  }

  @override
  List<Object?> get props => [time, text];
}

class Song extends Equatable {
  final int id;
  final String title;
  final String artist;
  final String? genre;
  final String? language;
  final int? duration;
  final int? year;
  final String? videoUrlFull;
  final String? videoUrlInstrumental;
  final String? thumbnailUrl;
  final List<LyricLine> lyrics;
  final String status;
  final int playCount;

  const Song({
    required this.id,
    required this.title,
    required this.artist,
    this.genre,
    this.language,
    this.duration,
    this.year,
    this.videoUrlFull,
    this.videoUrlInstrumental,
    this.thumbnailUrl,
    this.lyrics = const [],
    required this.status,
    required this.playCount,
  });

  factory Song.fromJson(Map<String, dynamic> json) {
    final lyricsData = json['lyrics_data'];
    final lyrics = <LyricLine>[];
    if (lyricsData is List) {
      for (final item in lyricsData) {
        if (item is Map<String, dynamic>) {
          lyrics.add(LyricLine.fromJson(item));
        } else if (item is Map) {
          lyrics.add(LyricLine.fromJson(item.cast<String, dynamic>()));
        }
      }
    }

    return Song(
      id: _parseInt(json['id']),
      title: json['title']?.toString() ?? '',
      artist: json['artist']?.toString() ?? '',
      genre: json['genre']?.toString(),
      language: json['language']?.toString(),
      duration: _parseNullableInt(json['duration']),
      year: _parseNullableInt(json['year']),
      videoUrlFull: json['video_url_full']?.toString(),
      videoUrlInstrumental: json['video_url_instrumental']?.toString(),
      thumbnailUrl: json['thumbnail_url']?.toString(),
      lyrics: lyrics,
      status: json['status']?.toString() ?? 'active',
      playCount: _parseInt(json['play_count']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'artist': artist,
      'genre': genre,
      'language': language,
      'duration': duration,
      'year': year,
      'video_url_full': videoUrlFull,
      'video_url_instrumental': videoUrlInstrumental,
      'thumbnail_url': thumbnailUrl,
      'lyrics_data': lyrics.map((line) => line.toJson()).toList(),
      'status': status,
      'play_count': playCount,
    };
  }

  String? lowQualityUrl(String? source) {
    final url = source;
    if (url == null || url.isEmpty) return null;
    if (url.contains('/videos/low/')) return url;
    if (url.contains('/videos/')) {
      return url.replaceFirst('/videos/', '/videos/low/');
    }
    return null;
  }

  @override
  List<Object?> get props => [
        id,
        title,
        artist,
        genre,
        language,
        duration,
        year,
        videoUrlFull,
        videoUrlInstrumental,
        thumbnailUrl,
        lyrics,
        status,
        playCount,
      ];

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
