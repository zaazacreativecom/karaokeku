import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../core/utils/url_utils.dart';
import '../../../widgets/app_network_image.dart';
import '../../favorites/data/favorites_repository.dart';
import '../../playlists/data/playlists_repository.dart';
import '../../playlists/models/playlist.dart';
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
  late final PlaylistsRepository _playlistsRepository;
  Future<List<Playlist>>? _playlistsLoader;

  @override
  void initState() {
    super.initState();
    _loadFavorite();
    _playlistsRepository = PlaylistsRepository(ref.read(apiClientProvider));
    _playlistsLoader = _playlistsRepository.fetchMyPlaylists();
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

  Future<void> _reloadPlaylists() async {
    setState(() {
      _playlistsLoader = _playlistsRepository.fetchMyPlaylists();
    });
  }

  Future<void> _addSongToPlaylist(Playlist playlist, Song song) async {
    await _playlistsRepository.addSongToPlaylist(playlist.id, song.id);
    await _reloadPlaylists();
  }

  void _openPlaylistPicker(Song song, List<Playlist> playlists) {
    showModalBottomSheet<void>(
      context: context,
      builder: (_) => _PlaylistPickerSheet(
        song: song,
        playlists: playlists,
        onAdd: (playlist) => _addSongToPlaylist(playlist, song),
      ),
    );
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

          return FutureBuilder<List<Playlist>>(
            future: _playlistsLoader,
            builder: (context, playlistsSnapshot) {
              final playlists = playlistsSnapshot.data ?? const <Playlist>[];
              final canOpenPicker = playlistsSnapshot.connectionState != ConnectionState.waiting &&
                  !playlistsSnapshot.hasError;
              final addedPlaylists = playlists
                  .where((playlist) => playlist.items.any((item) => item.song?.id == song.id))
                  .toList();

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
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Playlist',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ),
                      TextButton.icon(
                        onPressed: canOpenPicker ? () => _openPlaylistPicker(song, playlists) : null,
                        icon: const Icon(Icons.playlist_add),
                        label: const Text('Tambah'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (playlistsSnapshot.connectionState == ConnectionState.waiting)
                    const Center(child: CircularProgressIndicator())
                  else if (playlistsSnapshot.hasError)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Gagal memuat playlist.'),
                        const SizedBox(height: 8),
                        Text(playlistsSnapshot.error.toString()),
                        const SizedBox(height: 8),
                        OutlinedButton(
                          onPressed: _reloadPlaylists,
                          child: const Text('Coba Lagi'),
                        ),
                      ],
                    )
                  else if (addedPlaylists.isEmpty)
                    const Text('Lagu ini belum ditambahkan ke playlist.')
                  else
                    ...addedPlaylists.map(
                      (playlist) => Card(
                        child: ListTile(
                          leading: const Icon(Icons.queue_music),
                          title: Text(playlist.name),
                          subtitle: Text('${playlist.songCount} lagu'),
                          trailing: const Icon(Icons.check_circle, color: Colors.green),
                        ),
                      ),
                    ),
                ],
              );
            },
          );
        },
      ),
    );
  }
}

class _PlaylistPickerSheet extends StatefulWidget {
  final Song song;
  final List<Playlist> playlists;
  final Future<void> Function(Playlist playlist) onAdd;

  const _PlaylistPickerSheet({
    required this.song,
    required this.playlists,
    required this.onAdd,
  });

  @override
  State<_PlaylistPickerSheet> createState() => _PlaylistPickerSheetState();
}

class _PlaylistPickerSheetState extends State<_PlaylistPickerSheet> {
  late final Set<int> _addedIds;
  final Set<int> _loadingIds = {};

  @override
  void initState() {
    super.initState();
    _addedIds = widget.playlists
        .where((playlist) => playlist.items.any((item) => item.song?.id == widget.song.id))
        .map((playlist) => playlist.id)
        .toSet();
  }

  Future<void> _handleAdd(Playlist playlist) async {
    if (_addedIds.contains(playlist.id) || _loadingIds.contains(playlist.id)) {
      return;
    }
    setState(() => _loadingIds.add(playlist.id));
    try {
      await widget.onAdd(playlist);
      if (!mounted) return;
      setState(() {
        _loadingIds.remove(playlist.id);
        _addedIds.add(playlist.id);
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Ditambahkan ke playlist ${playlist.name}.')),
      );
    } catch (error) {
      if (!mounted) return;
      setState(() => _loadingIds.remove(playlist.id));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final height = MediaQuery.of(context).size.height * 0.6;
    return SafeArea(
      child: SizedBox(
        height: height,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Tambah ke Playlist',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              if (widget.playlists.isEmpty)
                const Expanded(
                  child: Center(
                    child: Text('Belum ada playlist. Buat playlist terlebih dahulu.'),
                  ),
                )
              else
                Expanded(
                  child: ListView.separated(
                    itemCount: widget.playlists.length,
                    separatorBuilder: (_, __) => const Divider(height: 12),
                    itemBuilder: (context, index) {
                      final playlist = widget.playlists[index];
                      final isAdded = _addedIds.contains(playlist.id);
                      final isLoading = _loadingIds.contains(playlist.id);
                      return ListTile(
                        leading: const Icon(Icons.queue_music),
                        title: Text(playlist.name),
                        subtitle: Text('${playlist.songCount} lagu'),
                        trailing: isLoading
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : TextButton(
                                onPressed: isAdded ? null : () => _handleAdd(playlist),
                                child: Text(isAdded ? 'Sudah' : 'Tambah'),
                              ),
                      );
                    },
                  ),
                ),
            ],
          ),
        ),
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
