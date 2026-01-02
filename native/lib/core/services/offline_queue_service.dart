import 'package:uuid/uuid.dart';

import '../storage/local_cache.dart';

class PendingUpload {
  final String id;
  final String title;
  final String? artist;
  final String? genre;
  final String? language;
  final String videoPath;
  final String? thumbnailPath;
  final String? lyricsData;

  const PendingUpload({
    required this.id,
    required this.title,
    required this.videoPath,
    this.artist,
    this.genre,
    this.language,
    this.thumbnailPath,
    this.lyricsData,
  });

  factory PendingUpload.create({
    required String title,
    required String videoPath,
    String? artist,
    String? genre,
    String? language,
    String? thumbnailPath,
    String? lyricsData,
  }) {
    return PendingUpload(
      id: const Uuid().v4(),
      title: title,
      videoPath: videoPath,
      artist: artist,
      genre: genre,
      language: language,
      thumbnailPath: thumbnailPath,
      lyricsData: lyricsData,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'artist': artist,
      'genre': genre,
      'language': language,
      'videoPath': videoPath,
      'thumbnailPath': thumbnailPath,
      'lyricsData': lyricsData,
    };
  }

  factory PendingUpload.fromJson(Map<String, dynamic> json) {
    return PendingUpload(
      id: json['id']?.toString() ?? const Uuid().v4(),
      title: json['title']?.toString() ?? '',
      artist: json['artist']?.toString(),
      genre: json['genre']?.toString(),
      language: json['language']?.toString(),
      videoPath: json['videoPath']?.toString() ?? '',
      thumbnailPath: json['thumbnailPath']?.toString(),
      lyricsData: json['lyricsData']?.toString(),
    );
  }
}

class OfflineQueueService {
  static const _queueKey = 'offline_upload_queue';

  final LocalCache _cache;

  OfflineQueueService(this._cache);

  Future<List<PendingUpload>> loadQueue() async {
    final raw = await _cache.readJsonList(_queueKey);
    return raw.map(PendingUpload.fromJson).toList();
  }

  Future<void> enqueue(PendingUpload upload) async {
    final queue = await loadQueue();
    queue.add(upload);
    await _persist(queue);
  }

  Future<void> removeById(String id) async {
    final queue = await loadQueue();
    queue.removeWhere((item) => item.id == id);
    await _persist(queue);
  }

  Future<void> replaceAll(List<PendingUpload> uploads) async {
    await _persist(uploads);
  }

  Future<void> _persist(List<PendingUpload> uploads) async {
    await _cache.writeJsonList(
      _queueKey,
      uploads.map((item) => item.toJson()).toList(),
    );
  }
}
