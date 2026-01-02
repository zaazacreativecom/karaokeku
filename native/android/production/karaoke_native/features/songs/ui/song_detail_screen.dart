import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../core/utils/url_utils.dart';
import '../../../widgets/app_network_image.dart';
import '../../favorites/data/favorites_repository.dart';
import '../../player/ui/player_screen.dart';
import '../models/song.dart';
import '../providers/songs_providers.dart';

class SongDetailScreen extends ConsumerStatefulWidget {
  final int songId;

  const SongDetailScreen({super.key, required this.songId});

  @override
  ConsumerState<SongDetailScreen> createState() => _SongDetailScreenState();
}

class _SongDetailScreenState extends ConsumerState<SongDetailScreen> {
  bool? _isFavorite;

  @override
  void initState() {
    super.initState();
    _loadFavorite();
  }

  Future<void> _loadFavorite() async {
    final repo = FavoritesRepository(ref.read(apiClientProvider));
    try {
      final ids = await repo.fetchFavoriteIds();
      if (!mounted) return;
      setState(() => _isFavorite = ids.contains(widget.songId));
    } catch (_) {
      if (!mounted) return;
      setState(() => _isFavorite = false);
    }
  }

  Future<void> _toggleFavorite() async {
    final repo = FavoritesRepository(ref.read(apiClientProvider));
    try {
      final isFavorite = await repo.toggleFavorite(widget.songId);
      if (!mounted) return;
      setState(() => _isFavorite = isFavorite);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final repository = ref.read(songsRepositoryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Lagu'),
        actions: [
          IconButton(
            icon: Icon(_isFavorite == true ? Icons.favorite : Icons.favorite_border),
            onPressed: _toggleFavorite,
          ),
        ],
      ),
      body: FutureBuilder<Song>(
        future: repository.fetchSongById(widget.songId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Gagal memuat lagu: ${snapshot.error}'));
          }
          final song = snapshot.data;
          if (song == null) {
            return const Center(child: Text('Lagu tidak ditemukan.'));
          }

          final thumbnail = UrlUtils.resolveMediaUrl(song.thumbnailUrl);

          return ListView(
            padding: const EdgeInsets.all(24),
            children: [
              AppNetworkImage(
                url: thumbnail,
                height: 200,
                width: double.infinity,
                borderRadius: BorderRadius.circular(16),
                fallbackIcon: Icons.music_video,
              ),
              const SizedBox(height: 16),
              Text(song.title, style: Theme.of(context).textTheme.headlineSmall),
              Text(song.artist, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Wrap(
                spacing: 12,
                runSpacing: 8,
                children: [
                  _InfoChip(label: song.genre ?? 'Genre'),
                  _InfoChip(label: song.language ?? 'Bahasa'),
                  _InfoChip(label: 'Diputar ${song.playCount}x'),
                ],
              ),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => PlayerScreen(song: song)),
                  );
                },
                icon: const Icon(Icons.play_arrow),
                label: const Text('Mulai Karaoke'),
              ),
              const SizedBox(height: 12),
              if (song.lyrics.isNotEmpty)
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Lirik (Preview)', style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 8),
                        ...song.lyrics.take(5).map((line) => Text(line.text)),
                        if (song.lyrics.length > 5)
                          const Padding(
                            padding: EdgeInsets.only(top: 8),
                            child: Text('...'),
                          ),
                      ],
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label;

  const _InfoChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Chip(label: Text(label));
  }
}
