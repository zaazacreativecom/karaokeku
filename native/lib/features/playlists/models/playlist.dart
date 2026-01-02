import 'package:equatable/equatable.dart';

import '../../songs/models/song.dart';

class PlaylistItem extends Equatable {
  final int id;
  final int position;
  final Song? song;

  const PlaylistItem({required this.id, required this.position, this.song});

  factory PlaylistItem.fromJson(Map<String, dynamic> json) {
    final songData = json['song'];
    return PlaylistItem(
      id: _parseInt(json['id']),
      position: _parseInt(json['position']),
      song: songData is Map<String, dynamic> ? Song.fromJson(songData) : null,
    );
  }

  @override
  List<Object?> get props => [id, position, song];

  static int _parseInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    return int.tryParse(value.toString()) ?? 0;
  }
}

class Playlist extends Equatable {
  final int id;
  final int userId;
  final String name;
  final String? description;
  final bool isPublic;
  final String? coverUrl;
  final List<PlaylistItem> items;
  final int songCount;

  const Playlist({
    required this.id,
    required this.userId,
    required this.name,
    this.description,
    required this.isPublic,
    this.coverUrl,
    this.items = const [],
    this.songCount = 0,
  });

  factory Playlist.fromJson(Map<String, dynamic> json) {
    final itemsData = json['items'];
    final items = <PlaylistItem>[];
    if (itemsData is List) {
      for (final item in itemsData) {
        if (item is Map<String, dynamic>) {
          items.add(PlaylistItem.fromJson(item));
        } else if (item is Map) {
          items.add(PlaylistItem.fromJson(item.cast<String, dynamic>()));
        }
      }
    }
    return Playlist(
      id: _parseInt(json['id']),
      userId: _parseInt(json['user_id']),
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      isPublic: json['is_public'] == true,
      coverUrl: json['cover_url']?.toString(),
      items: items,
      songCount: _parseInt(json['songCount']) > 0 ? _parseInt(json['songCount']) : items.length,
    );
  }

  @override
  List<Object?> get props => [id, userId, name, description, isPublic, coverUrl, items, songCount];

  static int _parseInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    return int.tryParse(value.toString()) ?? 0;
  }
}
