import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../core/utils/url_utils.dart';
import '../../../widgets/app_network_image.dart';
import '../../player/ui/player_screen.dart';
import '../data/playlists_repository.dart';
import '../models/playlist.dart';

class PlaylistDetailScreen extends ConsumerStatefulWidget {
  final int playlistId;
  final String title;

  const PlaylistDetailScreen({super.key, required this.playlistId, required this.title});

  @override
  ConsumerState<PlaylistDetailScreen> createState() => _PlaylistDetailScreenState();
}

class _PlaylistDetailScreenState extends ConsumerState<PlaylistDetailScreen> {
  late final PlaylistsRepository _repository;
  late Future<Playlist> _loader;

  @override
  void initState() {
    super.initState();
    _repository = PlaylistsRepository(ref.read(apiClientProvider));
    _loader = _repository.fetchPlaylist(widget.playlistId);
  }

  Future<void> _refresh() async {
    setState(() => _loader = _repository.fetchPlaylist(widget.playlistId));
  }

  Future<void> _removeItem(PlaylistItem item) async {
    await _repository.removeSongFromPlaylist(widget.playlistId, item.id);
    await _refresh();
  }

  Future<void> _reorder(List<PlaylistItem> items, int oldIndex, int newIndex) async {
    if (newIndex > oldIndex) newIndex -= 1;
    final updated = [...items];
    final item = updated.removeAt(oldIndex);
    updated.insert(newIndex, item);

    final payload = <Map<String, dynamic>>[];
    for (var i = 0; i < updated.length; i++) {
      payload.add({'itemId': updated[i].id, 'position': i});
    }

    await _repository.reorderItems(widget.playlistId, payload);
    await _refresh();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: FutureBuilder<Playlist>(
        future: _loader,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Gagal memuat playlist: ${snapshot.error}'));
          }
          final playlist = snapshot.data;
          if (playlist == null) {
            return const Center(child: Text('Playlist tidak ditemukan.'));
          }
          if (playlist.items.isEmpty) {
            return const Center(child: Text('Playlist kosong.'));
          }

          return RefreshIndicator(
            onRefresh: _refresh,
            child: ReorderableListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: playlist.items.length,
              onReorder: (oldIndex, newIndex) => _reorder(playlist.items, oldIndex, newIndex),
              itemBuilder: (context, index) {
                final item = playlist.items[index];
                final song = item.song;
                final thumb = UrlUtils.resolveMediaUrl(song?.thumbnailUrl);
                return Card(
                  key: ValueKey(item.id),
                  child: ListTile(
                    leading: AppNetworkImage(
                      url: thumb,
                      width: 48,
                      height: 48,
                      borderRadius: BorderRadius.circular(8),
                      fallbackIcon: Icons.music_note,
                    ),
                    title: Text(song?.title ?? 'Unknown'),
                    subtitle: Text(song?.artist ?? ''),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline),
                      onPressed: () => _removeItem(item),
                    ),
                    onTap: song == null
                        ? null
                        : () {
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
