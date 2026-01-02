import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/utils/url_utils.dart';
import '../../../widgets/app_network_image.dart';
import '../models/song.dart';
import '../providers/songs_providers.dart';
import 'song_detail_screen.dart';

const _primaryGradient = LinearGradient(
  colors: [Color(0xFF00D17A), Color(0xFF00A3FF)],
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
);

class SongsListScreen extends ConsumerStatefulWidget {
  const SongsListScreen({super.key});

  @override
  ConsumerState<SongsListScreen> createState() => _SongsListScreenState();
}

class _SongsListScreenState extends ConsumerState<SongsListScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();
  bool _animate = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) setState(() => _animate = true);
    });
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
      backgroundColor: Colors.white,
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
    final size = MediaQuery.of(context).size;
    final isCompact = size.width < 380 || size.height < 700;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          Container(decoration: const BoxDecoration(gradient: _primaryGradient)),
          Positioned(
            top: -100,
            right: -60,
            child: _GlowBlob(
              size: 220,
              colors: const [Color(0xFF64FFDA), Color(0xFF40C4FF)],
              opacity: 0.35,
            ),
          ),
          Positioned(
            bottom: -120,
            left: -40,
            child: _GlowBlob(
              size: 260,
              colors: const [Color(0xFF00C853), Color(0xFF18FFFF)],
              opacity: 0.22,
            ),
          ),
          SafeArea(
            child: RefreshIndicator(
              color: Colors.white,
              backgroundColor: const Color(0xFF00A3FF),
              onRefresh: () => ref.read(songsListProvider.notifier).loadSongs(reset: true),
              child: ListView(
                controller: _scrollController,
                padding: EdgeInsets.fromLTRB(16, isCompact ? 12 : 20, 16, 32),
                children: [
                  _AnimatedEntry(
                    animate: _animate,
                    duration: const Duration(milliseconds: 650),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _GradientText(
                                text: 'Lagu Karaoke',
                                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                      fontWeight: FontWeight.w700,
                                      color: Colors.white,
                                    ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Temukan lagu favoritmu dengan cepat.',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: Colors.white.withValues(alpha: 0.85),
                                    ),
                              ),
                            ],
                          ),
                        ),
                        _GradientIconButton(
                          icon: Icons.filter_list,
                          onTap: () => _openFilters(context, state),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  _AnimatedEntry(
                    animate: _animate,
                    duration: const Duration(milliseconds: 750),
                    child: _GlassPanel(
                      child: TextField(
                        controller: _searchController,
                        decoration: InputDecoration(
                          hintText: 'Cari judul atau artis',
                          prefixIcon: const Icon(Icons.search, color: Color(0xFF0B1D2A)),
                          suffixIcon: IconButton(
                            icon: const Icon(Icons.close, color: Color(0xFF0B1D2A)),
                            onPressed: () {
                              _searchController.clear();
                              ref.read(songsListProvider.notifier).applyFilters(search: '');
                            },
                          ),
                          filled: true,
                          fillColor: Colors.white.withValues(alpha: 0.9),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        onSubmitted: (value) {
                          ref.read(songsListProvider.notifier).applyFilters(search: value.trim());
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  _AnimatedEntry(
                    animate: _animate,
                    duration: const Duration(milliseconds: 850),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _SectionTitle(title: 'Top Songs'),
                        const SizedBox(height: 12),
                        topSongs.when(
                          data: (songs) => _TopSongsCarousel(
                            songs: songs,
                            isCompact: isCompact,
                          ),
                          loading: () => const SizedBox(
                            height: 140,
                            child: Center(child: CircularProgressIndicator(color: Colors.white)),
                          ),
                          error: (_, __) => const SizedBox.shrink(),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 22),
                  _SectionTitle(title: 'Semua Lagu'),
                  const SizedBox(height: 12),
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    child: state.errorMessage != null
                        ? _ErrorCard(message: state.errorMessage!)
                        : const SizedBox.shrink(),
                  ),
                  ...state.songs.asMap().entries.map(
                        (entry) => _SongTile(
                          song: entry.value,
                          index: entry.key,
                          isCompact: isCompact,
                        ),
                      ),
                  if (state.isLoading)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 16),
                      child: Center(child: CircularProgressIndicator(color: Colors.white)),
                    ),
                  if (!state.hasNext && state.songs.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Center(
                        child: Text(
                          'Tidak ada lagu lagi.',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.white.withValues(alpha: 0.85),
                              ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SongTile extends StatelessWidget {
  final Song song;
  final int index;
  final bool isCompact;

  const _SongTile({required this.song, required this.index, required this.isCompact});

  @override
  Widget build(BuildContext context) {
    final thumbnail = UrlUtils.resolveMediaUrl(song.thumbnailUrl);
    final delay = (index % 6) * 40;

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 300 + delay),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        return Opacity(
          opacity: value,
          child: Transform.translate(
            offset: Offset(0, (1 - value) * 12),
            child: child,
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Material(
          color: Colors.white.withValues(alpha: 0.92),
          borderRadius: BorderRadius.circular(18),
          child: InkWell(
            borderRadius: BorderRadius.circular(18),
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => SongDetailScreen(songId: song.id)),
              );
            },
            child: Container(
              padding: EdgeInsets.all(isCompact ? 12 : 14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE2EEF6)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 16,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 4,
                    height: 56,
                    decoration: BoxDecoration(
                      gradient: _primaryGradient,
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  const SizedBox(width: 12),
                  AppNetworkImage(
                    url: thumbnail,
                    width: 60,
                    height: 60,
                    borderRadius: BorderRadius.circular(12),
                    fallbackIcon: Icons.music_note,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          song.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          song.artist,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: const Color(0xFF6B7B8E),
                              ),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 4,
                          children: [
                            if (song.genre != null)
                              _TagChip(label: song.genre!),
                            if (song.language != null)
                              _TagChip(label: song.language!),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0B1D2A).withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.chevron_right, color: Color(0xFF0B1D2A)),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _TopSongsCarousel extends StatelessWidget {
  final List<Song> songs;
  final bool isCompact;

  const _TopSongsCarousel({required this.songs, required this.isCompact});

  @override
  Widget build(BuildContext context) {
    if (songs.isEmpty) return const SizedBox.shrink();
    return SizedBox(
      height: isCompact ? 170 : 190,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: songs.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (context, index) {
          final song = songs[index];
          final thumbnail = UrlUtils.resolveMediaUrl(song.thumbnailUrl);
          return TweenAnimationBuilder<double>(
            tween: Tween(begin: 0, end: 1),
            duration: Duration(milliseconds: 300 + (index * 70)),
            curve: Curves.easeOutCubic,
            builder: (context, value, child) {
              return Opacity(
                opacity: value,
                child: Transform.translate(
                  offset: Offset(0, (1 - value) * 12),
                  child: child,
                ),
              );
            },
            child: GestureDetector(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => SongDetailScreen(songId: song.id)),
                );
              },
              child: SizedBox(
                width: isCompact ? 160 : 180,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(18),
                  child: Stack(
                    children: [
                      AppNetworkImage(
                        url: thumbnail,
                        width: isCompact ? 160 : 180,
                        height: isCompact ? 170 : 190,
                        fallbackIcon: Icons.music_video,
                      ),
                      Positioned.fill(
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Colors.black.withValues(alpha: 0.0),
                                Colors.black.withValues(alpha: 0.55),
                              ],
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        left: 12,
                        right: 12,
                        bottom: 12,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              song.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                  ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              song.artist,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: Colors.white.withValues(alpha: 0.85),
                                  ),
                            ),
                          ],
                        ),
                      ),
                      Positioned(
                        top: 12,
                        right: 12,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.85),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.trending_up, size: 14, color: Color(0xFF0B1D2A)),
                              const SizedBox(width: 4),
                              Text(
                                '${song.playCount}',
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      fontWeight: FontWeight.w700,
                                      color: const Color(0xFF0B1D2A),
                                    ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
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

class _TagChip extends StatelessWidget {
  final String label;

  const _TagChip({required this.label});

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

class _ErrorCard extends StatelessWidget {
  final String message;

  const _ErrorCard({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFF4B4B4)),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber_rounded, color: Color(0xFFD32F2F)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: const Color(0xFFD32F2F),
                  ),
            ),
          ),
        ],
      ),
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
      child: Text(
        text,
        style: style ?? const TextStyle(color: Colors.white),
      ),
    );
  }
}

class _GradientIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _GradientIconButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white.withValues(alpha: 0.18),
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withValues(alpha: 0.5)),
          ),
          child: Icon(icon, color: Colors.white),
        ),
      ),
    );
  }
}

class _GlassPanel extends StatelessWidget {
  final Widget child;

  const _GlassPanel({required this.child});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(18),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
        child: Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.18),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: Colors.white.withValues(alpha: 0.4)),
          ),
          child: child,
        ),
      ),
    );
  }
}

class _GlowBlob extends StatelessWidget {
  final double size;
  final List<Color> colors;
  final double opacity;

  const _GlowBlob({required this.size, required this.colors, required this.opacity});

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

class _AnimatedEntry extends StatelessWidget {
  final bool animate;
  final Duration duration;
  final Widget child;

  const _AnimatedEntry({required this.animate, required this.duration, required this.child});

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: animate ? 1 : 0,
      duration: duration,
      curve: Curves.easeOutCubic,
      child: AnimatedSlide(
        offset: animate ? Offset.zero : const Offset(0, 0.08),
        duration: duration,
        curve: Curves.easeOutCubic,
        child: child,
      ),
    );
  }
}
