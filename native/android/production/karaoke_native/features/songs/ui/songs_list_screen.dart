import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/utils/url_utils.dart';
import '../../../widgets/app_network_image.dart';
import '../models/song.dart';
import '../providers/songs_providers.dart';
import 'song_detail_screen.dart';

class SongsListScreen extends ConsumerStatefulWidget {
  const SongsListScreen({super.key});

  @override
  ConsumerState<SongsListScreen> createState() => _SongsListScreenState();
}

class _SongsListScreenState extends ConsumerState<SongsListScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      ref.read(songsListProvider.notifier).loadSongs();
    }
  }

  void _openFilters(BuildContext context, SongsListState state) {
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      isScrollControlled: true,
      builder: (ctx) => Consumer(
        builder: (context, ref, _) {
          final genresAsync = ref.watch(genresProvider);
          final languagesAsync = ref.watch(languagesProvider);
          return Padding(
            padding: EdgeInsets.only(
              left: 24,
              right: 24,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
              top: 12,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Filter Lagu', style: Theme.of(ctx).textTheme.titleLarge),
                const SizedBox(height: 16),
                genresAsync.when(
                  data: (genres) => DropdownButtonFormField<String>(
                    key: ValueKey(state.genre ?? 'all_genre'),
                    initialValue: state.genre,
                    decoration: const InputDecoration(labelText: 'Genre'),
                    items: [
                      const DropdownMenuItem(value: null, child: Text('Semua')),
                      ...genres.map((genre) => DropdownMenuItem(value: genre, child: Text(genre))),
                    ],
                    onChanged: (value) {
                      ref.read(songsListProvider.notifier).applyFilters(genre: value);
                    },
                  ),
                  loading: () => const LinearProgressIndicator(),
                  error: (_, __) => const Text('Gagal memuat genre'),
                ),
                const SizedBox(height: 12),
                languagesAsync.when(
                  data: (langs) => DropdownButtonFormField<String>(
                    key: ValueKey(state.language ?? 'all_language'),
                    initialValue: state.language,
                    decoration: const InputDecoration(labelText: 'Bahasa'),
                    items: [
                      const DropdownMenuItem(value: null, child: Text('Semua')),
                      ...langs.map((lang) => DropdownMenuItem(value: lang, child: Text(lang))),
                    ],
                    onChanged: (value) {
                      ref.read(songsListProvider.notifier).applyFilters(language: value);
                    },
                  ),
                  loading: () => const LinearProgressIndicator(),
                  error: (_, __) => const Text('Gagal memuat bahasa'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  key: ValueKey('sortBy_${state.sortBy}'),
                  initialValue: state.sortBy,
                  decoration: const InputDecoration(labelText: 'Urutkan'),
                  items: const [
                    DropdownMenuItem(value: 'created_at', child: Text('Terbaru')),
                    DropdownMenuItem(value: 'title', child: Text('Judul')),
                    DropdownMenuItem(value: 'play_count', child: Text('Paling sering dimainkan')),
                  ],
                  onChanged: (value) {
                    if (value == null) return;
                    ref.read(songsListProvider.notifier).applyFilters(sortBy: value);
                  },
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  key: ValueKey('sortOrder_${state.sortOrder}'),
                  initialValue: state.sortOrder,
                  decoration: const InputDecoration(labelText: 'Arah Urutan'),
                  items: const [
                    DropdownMenuItem(value: 'ASC', child: Text('Naik')),
                    DropdownMenuItem(value: 'DESC', child: Text('Turun')),
                  ],
                  onChanged: (value) {
                    if (value == null) return;
                    ref.read(songsListProvider.notifier).applyFilters(sortOrder: value);
                  },
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: () => Navigator.of(ctx).pop(),
                  child: const Text('Tutup'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(songsListProvider);
    final topSongs = ref.watch(topSongsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lagu Karaoke'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () => _openFilters(context, state),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(songsListProvider.notifier).loadSongs(reset: true),
        child: ListView(
          controller: _scrollController,
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Cari judul atau artis',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () {
                    _searchController.clear();
                    ref.read(songsListProvider.notifier).applyFilters(search: '');
                  },
                ),
              ),
              onSubmitted: (value) {
                ref.read(songsListProvider.notifier).applyFilters(search: value.trim());
              },
            ),
            const SizedBox(height: 16),
            topSongs.when(
              data: (songs) => _TopSongsCarousel(songs: songs),
              loading: () => const SizedBox(height: 120, child: Center(child: CircularProgressIndicator())),
              error: (_, __) => const SizedBox.shrink(),
            ),
            const SizedBox(height: 16),
            if (state.errorMessage != null)
              Text(state.errorMessage!, style: const TextStyle(color: Colors.red)),
            ...state.songs.map((song) => _SongTile(song: song)),
            if (state.isLoading) const Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: Center(child: CircularProgressIndicator()),
            ),
            if (!state.hasNext && state.songs.isNotEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 12),
                child: Center(child: Text('Tidak ada lagu lagi.')),
              ),
          ],
        ),
      ),
    );
  }
}

class _SongTile extends StatelessWidget {
  final Song song;

  const _SongTile({required this.song});

  @override
  Widget build(BuildContext context) {
    final thumbnail = UrlUtils.resolveMediaUrl(song.thumbnailUrl);
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: AppNetworkImage(
          url: thumbnail,
          width: 56,
          height: 56,
          borderRadius: BorderRadius.circular(8),
          fallbackIcon: Icons.music_note,
        ),
        title: Text(song.title),
        subtitle: Text('${song.artist} • ${song.genre ?? 'Unknown'}'),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => SongDetailScreen(songId: song.id)),
          );
        },
      ),
    );
  }
}

class _TopSongsCarousel extends StatelessWidget {
  final List<Song> songs;

  const _TopSongsCarousel({required this.songs});

  @override
  Widget build(BuildContext context) {
    if (songs.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Top Songs', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        SizedBox(
          height: 160,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: songs.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final song = songs[index];
              final thumbnail = UrlUtils.resolveMediaUrl(song.thumbnailUrl);
              return GestureDetector(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => SongDetailScreen(songId: song.id)),
                  );
                },
                child: SizedBox(
                  width: 140,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AppNetworkImage(
                        url: thumbnail,
                        width: 140,
                        height: 100,
                        borderRadius: BorderRadius.circular(12),
                        fallbackIcon: Icons.music_video,
                      ),
                      const SizedBox(height: 8),
                      Text(song.title, maxLines: 1, overflow: TextOverflow.ellipsis),
                      Text(song.artist, style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
