import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../core/utils/url_utils.dart';
import '../../../widgets/app_network_image.dart';
import '../../player/ui/player_screen.dart';
import '../../songs/models/song.dart';
import '../data/favorites_repository.dart';

class FavoritesScreen extends ConsumerStatefulWidget {
  const FavoritesScreen({super.key});

  @override
  ConsumerState<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends ConsumerState<FavoritesScreen> {
  late final FavoritesRepository _repository;
  late Future<List<Song>> _loader;

  @override
  void initState() {
    super.initState();
    _repository = FavoritesRepository(ref.read(apiClientProvider));
    _loader = _repository.fetchFavorites();
  }

  Future<void> _refresh() async {
    setState(() => _loader = _repository.fetchFavorites());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Favorit')),
      body: FutureBuilder<List<Song>>(
        future: _loader,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Gagal memuat favorit: ${snapshot.error}'));
          }
          final songs = snapshot.data ?? [];
          if (songs.isEmpty) {
            return const Center(child: Text('Belum ada lagu favorit.'));
          }
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: songs.length,
              itemBuilder: (context, index) {
                final song = songs[index];
                final thumb = UrlUtils.resolveMediaUrl(song.thumbnailUrl);
                return Card(
                  child: ListTile(
                    leading: AppNetworkImage(
                      url: thumb,
                      width: 48,
                      height: 48,
                      borderRadius: BorderRadius.circular(8),
                      fallbackIcon: Icons.music_note,
                    ),
                    title: Text(song.title),
                    subtitle: Text(song.artist),
                    trailing: const Icon(Icons.play_arrow),
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => PlayerScreen(song: song)),
                      );
                    },
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
