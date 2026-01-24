import 'dart:ui';

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

const _primaryGradient = LinearGradient(
  colors: [Color(0xFF00D17A), Color(0xFF00A3FF)],
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
);

class SongDetailScreen extends ConsumerStatefulWidget {
  final int songId;

  const SongDetailScreen({super.key, required this.songId});

  @override
  ConsumerState<SongDetailScreen> createState() => _SongDetailScreenState();
}

class _SongDetailScreenState extends ConsumerState<SongDetailScreen> {
  bool? _isFavorite;
  bool _animate = false;
  late final PlaylistsRepository _playlistsRepository;
  Future<List<Playlist>>? _playlistsLoader;

  @override
  void initState() {
    super.initState();
    _loadFavorite();
    _playlistsRepository = PlaylistsRepository(ref.read(apiClientProvider));
    _playlistsLoader = _playlistsRepository.fetchMyPlaylists();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) setState(() => _animate = true);
    });
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
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
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
    final size = MediaQuery.of(context).size;
    final isCompact = size.width < 380 || size.height < 700;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: FutureBuilder<Song>(
        future: repository.fetchSongById(widget.songId),
        builder: (context, snapshot) {
          return Stack(
            children: [
              const _GradientBackground(),
              if (snapshot.connectionState == ConnectionState.waiting)
                const _LoadingState()
              else if (snapshot.hasError)
                _ErrorState(message: 'Gagal memuat lagu: ${snapshot.error}')
              else if (!snapshot.hasData)
                const _ErrorState(message: 'Lagu tidak ditemukan.')
              else
                FutureBuilder<List<Playlist>>(
                  future: _playlistsLoader,
                  builder: (context, playlistsSnapshot) {
                    final playlists = playlistsSnapshot.data ?? const <Playlist>[];
                    return _SongDetailContent(
                      song: snapshot.data!,
                      animate: _animate,
                      isCompact: isCompact,
                      isFavorite: _isFavorite,
                      onToggleFavorite: _toggleFavorite,
                      playlists: playlists,
                      playlistsLoading:
                          playlistsSnapshot.connectionState == ConnectionState.waiting,
                      playlistsError: playlistsSnapshot.hasError
                          ? playlistsSnapshot.error.toString()
                          : null,
                      onRetryPlaylists: _reloadPlaylists,
                      onOpenPlaylistPicker: () =>
                          _openPlaylistPicker(snapshot.data!, playlists),
                    );
                  },
                ),
            ],
          );
        },
      ),
    );
  }
}

class _SongDetailContent extends StatelessWidget {
  final Song song;
  final bool animate;
  final bool isCompact;
  final bool? isFavorite;
  final VoidCallback onToggleFavorite;
  final List<Playlist> playlists;
  final bool playlistsLoading;
  final String? playlistsError;
  final VoidCallback onRetryPlaylists;
  final VoidCallback onOpenPlaylistPicker;

  const _SongDetailContent({
    required this.song,
    required this.animate,
    required this.isCompact,
    required this.isFavorite,
    required this.onToggleFavorite,
    required this.playlists,
    required this.playlistsLoading,
    required this.playlistsError,
    required this.onRetryPlaylists,
    required this.onOpenPlaylistPicker,
  });

  @override
  Widget build(BuildContext context) {
    final thumbnail = UrlUtils.resolveMediaUrl(song.thumbnailUrl);
    final canOpenPicker = !playlistsLoading && playlistsError == null;
    final tags = <String>[
      if (song.genre?.isNotEmpty ?? false) song.genre!,
      if (song.language?.isNotEmpty ?? false) song.language!,
    ];
    final durationLabel = _formatDuration(song.duration);
    final stats = <_StatItem>[
      _StatItem(
        icon: Icons.trending_up,
        label: 'Diputar',
        value: '${song.playCount}x',
      ),
      if (song.year != null)
        _StatItem(icon: Icons.event, label: 'Tahun', value: song.year.toString()),
      if (durationLabel != null)
        _StatItem(icon: Icons.timer, label: 'Durasi', value: durationLabel),
    ];
    if (stats.isEmpty) {
      stats.add(_StatItem(icon: Icons.music_note, label: 'Status', value: song.status));
    }

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: isCompact ? 280 : 320,
          pinned: true,
          stretch: true,
          elevation: 0,
          backgroundColor: Colors.transparent,
          centerTitle: false,
          leadingWidth: 56,
          leading: Padding(
            padding: const EdgeInsets.only(left: 12),
            child: _GlassIconButton(
              icon: Icons.arrow_back,
              onTap: () => Navigator.of(context).pop(),
            ),
          ),
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: _GlassIconButton(
                icon: isFavorite == true ? Icons.favorite : Icons.favorite_border,
                onTap: onToggleFavorite,
              ),
            ),
          ],
          title: Text(
            song.title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
          ),
          flexibleSpace: FlexibleSpaceBar(
            collapseMode: CollapseMode.parallax,
            background: Stack(
              fit: StackFit.expand,
              children: [
                AppNetworkImage(
                  url: thumbnail,
                  width: double.infinity,
                  height: double.infinity,
                  fallbackIcon: Icons.music_video,
                ),
                const DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Color(0x22000000),
                        Color(0xCC0B1D2A),
                      ],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                ),
                Positioned(
                  left: 20,
                  right: 20,
                  bottom: 20,
                  child: _GlassPanel(
                    padding: EdgeInsets.all(isCompact ? 12 : 14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _GradientText(
                          text: song.title,
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                              ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          song.artist,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                color: Colors.white.withValues(alpha: 0.9),
                              ),
                        ),
                        if (tags.isNotEmpty) ...[
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 8,
                            runSpacing: 6,
                            children: tags.map((tag) => _InfoBadge(label: tag)).toList(),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _AnimatedEntry(
                  animate: animate,
                  duration: const Duration(milliseconds: 500),
                  child: const _SectionHeader(title: 'Ringkasan'),
                ),
                const SizedBox(height: 12),
                _AnimatedEntry(
                  animate: animate,
                  duration: const Duration(milliseconds: 650),
                  child: _GlassPanel(
                    padding: const EdgeInsets.all(16),
                    child: LayoutBuilder(
                      builder: (context, constraints) {
                        final cardWidth = stats.length == 1
                            ? constraints.maxWidth
                            : (constraints.maxWidth - 12) / 2;
                        return Wrap(
                          spacing: 12,
                          runSpacing: 12,
                          children: stats
                              .map(
                                (stat) => SizedBox(
                                  width: cardWidth,
                                  child: _StatCard(
                                    icon: stat.icon,
                                    label: stat.label,
                                    value: stat.value,
                                  ),
                                ),
                              )
                              .toList(),
                        );
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                _AnimatedEntry(
                  animate: animate,
                  duration: const Duration(milliseconds: 750),
                  child: _GradientButton(
                    icon: Icons.play_arrow,
                    label: 'Mulai Karaoke',
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => PlayerScreen(song: song)),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 20),
                _AnimatedEntry(
                  animate: animate,
                  duration: const Duration(milliseconds: 850),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Playlist',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                              ),
                        ),
                      ),
                      TextButton.icon(
                        onPressed: canOpenPicker ? onOpenPlaylistPicker : null,
                        icon: const Icon(Icons.playlist_add, color: Colors.white),
                        label: const Text('Tambah', style: TextStyle(color: Colors.white)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                _AnimatedEntry(
                  animate: animate,
                  duration: const Duration(milliseconds: 900),
                  child: _GlassPanel(
                    padding: const EdgeInsets.all(16),
                    child: _PlaylistSection(
                      song: song,
                      playlists: playlists,
                      isLoading: playlistsLoading,
                      errorMessage: playlistsError,
                      onRetry: onRetryPlaylists,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _GradientBackground extends StatelessWidget {
  const _GradientBackground();

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        const SizedBox.expand(
          child: DecoratedBox(decoration: BoxDecoration(gradient: _primaryGradient)),
        ),
        Positioned(
          top: -120,
          right: -40,
          child: _GlowBlob(
            size: 240,
            colors: const [Color(0xFF64FFDA), Color(0xFF40C4FF)],
            opacity: 0.3,
          ),
        ),
        Positioned(
          bottom: -140,
          left: -60,
          child: _GlowBlob(
            size: 280,
            colors: const [Color(0xFF00C853), Color(0xFF18FFFF)],
            opacity: 0.22,
          ),
        ),
      ],
    );
  }
}

class _LoadingState extends StatelessWidget {
  const _LoadingState();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: CircularProgressIndicator(color: Colors.white),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;

  const _ErrorState({required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: _GlassPanel(
          padding: const EdgeInsets.all(16),
          child: Text(
            message,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white,
                ),
          ),
        ),
      ),
    );
  }
}

class _GlassIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _GlassIconButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white.withValues(alpha: 0.18),
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.white.withValues(alpha: 0.5)),
          ),
          child: Icon(icon, color: Colors.white),
        ),
      ),
    );
  }
}

class _GradientButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  const _GradientButton({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Ink(
          decoration: BoxDecoration(
            gradient: _primaryGradient,
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.2),
                blurRadius: 16,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 18),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: Colors.white),
                const SizedBox(width: 10),
                Text(
                  label,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _PlaylistSection extends StatelessWidget {
  final Song song;
  final List<Playlist> playlists;
  final bool isLoading;
  final String? errorMessage;
  final VoidCallback onRetry;

  const _PlaylistSection({
    required this.song,
    required this.playlists,
    required this.isLoading,
    required this.errorMessage,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(8),
          child: CircularProgressIndicator(color: Colors.white),
        ),
      );
    }

    if (errorMessage != null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Gagal memuat playlist.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white.withValues(alpha: 0.85),
                ),
          ),
          const SizedBox(height: 8),
          Text(
            errorMessage!,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.white.withValues(alpha: 0.7),
                ),
          ),
          const SizedBox(height: 10),
          FilledButton(onPressed: onRetry, child: const Text('Coba Lagi')),
        ],
      );
    }

    final addedPlaylists = playlists
        .where(
          (playlist) => playlist.items.any((item) => item.song?.id == song.id),
        )
        .toList();

    if (addedPlaylists.isEmpty) {
      return Text(
        'Lagu ini belum ditambahkan ke playlist.',
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.white.withValues(alpha: 0.85),
            ),
      );
    }

    return Column(
      children: [
        ...addedPlaylists.map(
          (playlist) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: _PlaylistCard(playlist: playlist),
          ),
        ),
      ],
    );
  }
}

class _PlaylistCard extends StatelessWidget {
  final Playlist playlist;

  const _PlaylistCard({required this.playlist});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              gradient: _primaryGradient,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.queue_music, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  playlist.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${playlist.songCount} lagu',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.white.withValues(alpha: 0.75),
                      ),
                ),
              ],
            ),
          ),
          const Icon(Icons.check_circle, color: Colors.white),
        ],
      ),
    );
  }
}

class _PlaylistPickerSheet extends ConsumerStatefulWidget {
  final Song song;
  final List<Playlist> playlists;
  final Future<void> Function(Playlist playlist) onAdd;

  const _PlaylistPickerSheet({
    required this.song,
    required this.playlists,
    required this.onAdd,
  });

  @override
  ConsumerState<_PlaylistPickerSheet> createState() => _PlaylistPickerSheetState();
}

class _PlaylistPickerSheetState extends ConsumerState<_PlaylistPickerSheet> {
  late final Set<int> _addedIds;
  final Set<int> _loadingIds = {};

  @override
  void initState() {
    super.initState();
    _addedIds = widget.playlists
        .where(
          (playlist) => playlist.items.any((item) => item.song?.id == widget.song.id),
        )
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
    final size = MediaQuery.of(context).size;

    return Container(
      height: size.height * 0.75,
      decoration: const BoxDecoration(
        gradient: _primaryGradient,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
          child: Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.1),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
              border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
            ),
            child: Column(
              children: [
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Tambah ke Playlist',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.close, color: Colors.white),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                if (widget.playlists.isEmpty)
                  Expanded(
                    child: Center(
                      child: Text(
                        'Belum ada playlist. Buat playlist terlebih dahulu.',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.white.withValues(alpha: 0.85),
                            ),
                      ),
                    ),
                  )
                else
                  Expanded(
                    child: ListView.separated(
                      itemCount: widget.playlists.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final playlist = widget.playlists[index];
                        final isAdded = _addedIds.contains(playlist.id);
                        final isLoading = _loadingIds.contains(playlist.id);
                        return _PlaylistPickerTile(
                          playlist: playlist,
                          isAdded: isAdded,
                          isLoading: isLoading,
                          onAdd: () => _handleAdd(playlist),
                        );
                      },
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _PlaylistPickerTile extends StatelessWidget {
  final Playlist playlist;
  final bool isAdded;
  final bool isLoading;
  final VoidCallback onAdd;

  const _PlaylistPickerTile({
    required this.playlist,
    required this.isAdded,
    required this.isLoading,
    required this.onAdd,
  });

  @override
  Widget build(BuildContext context) {
    final buttonLabel = isAdded ? 'Sudah' : 'Tambah';
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              gradient: _primaryGradient,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.queue_music, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  playlist.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${playlist.songCount} lagu',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.white.withValues(alpha: 0.75),
                      ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          SizedBox(
            height: 34,
            child: OutlinedButton(
              onPressed: isAdded || isLoading ? null : onAdd,
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white,
                side: BorderSide(color: Colors.white.withValues(alpha: 0.6)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: isLoading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text(buttonLabel),
            ),
          ),
        ],
      ),
    );
  }
}

class _GlassPanel extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;

  const _GlassPanel({required this.child, this.padding = const EdgeInsets.all(12)});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(18),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.16),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: Colors.white.withValues(alpha: 0.4)),
          ),
          child: child,
        ),
      ),
    );
  }
}

class _InfoBadge extends StatelessWidget {
  final String label;

  const _InfoBadge({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        gradient: _primaryGradient,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.16),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.35)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              gradient: _primaryGradient,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: Colors.white.withValues(alpha: 0.8),
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                ),
          ),
        ),
        Container(
          width: 32,
          height: 4,
          decoration: BoxDecoration(
            gradient: _primaryGradient,
            borderRadius: BorderRadius.circular(20),
          ),
        ),
      ],
    );
  }
}

class _GradientText extends StatelessWidget {
  final String text;
  final TextStyle? style;

  const _GradientText({required this.text, this.style});

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      shaderCallback: (bounds) => _primaryGradient.createShader(bounds),
      child: Text(text, style: style ?? const TextStyle(color: Colors.white)),
    );
  }
}

class _AnimatedEntry extends StatelessWidget {
  final bool animate;
  final Duration duration;
  final Widget child;

  const _AnimatedEntry({
    required this.animate,
    required this.duration,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: animate ? 1 : 0,
      duration: duration,
      curve: Curves.easeOutCubic,
      child: AnimatedSlide(
        offset: animate ? Offset.zero : const Offset(0, 0.06),
        duration: duration,
        curve: Curves.easeOutCubic,
        child: child,
      ),
    );
  }
}

class _GlowBlob extends StatelessWidget {
  final double size;
  final List<Color> colors;
  final double opacity;

  const _GlowBlob({
    required this.size,
    required this.colors,
    required this.opacity,
  });

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: opacity,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(
            colors: colors,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
      ),
    );
  }
}

class _StatItem {
  final IconData icon;
  final String label;
  final String value;

  const _StatItem({
    required this.icon,
    required this.label,
    required this.value,
  });
}

String? _formatDuration(int? seconds) {
  if (seconds == null || seconds <= 0) return null;
  final duration = Duration(seconds: seconds);
  final minutes = duration.inMinutes;
  final remainingSeconds = duration.inSeconds.remainder(60);
  return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
}
