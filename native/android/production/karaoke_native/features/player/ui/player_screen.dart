import 'dart:async';
import 'dart:math' as math;
import 'dart:ui';

import 'package:chewie/chewie.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import 'package:video_player/video_player.dart';

import '../../../core/di/providers.dart';
import '../../../core/utils/url_utils.dart';
import '../../../widgets/app_network_image.dart';
import '../../songs/models/song.dart';
import '../../songs/providers/songs_providers.dart';
import '../data/playback_repository.dart';

const _primaryGradient = LinearGradient(
  colors: [Color(0xFF00D17A), Color(0xFF00A3FF)],
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
);

enum VideoQuality { high, low }

class PlayerScreen extends ConsumerStatefulWidget {
  final Song song;

  const PlayerScreen({super.key, required this.song});

  @override
  ConsumerState<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends ConsumerState<PlayerScreen> {
  static const _audioChannel = MethodChannel('karaoke/audio_channel');
  VideoPlayerController? _videoController;
  ChewieController? _chewieController;
  VideoQuality _quality = VideoQuality.high;
  bool _vocalOn = false;
  bool _forceOriginalQuality = false;
  String? _overrideSourceUrl;
  String _currentLyric = '';
  String? _initError;
  int? _historyId;
  bool _completed = false;
  Timer? _lyricTimer;

  Song? _currentSong;
  final List<Song> _queue = [];
  bool _animate = false;

  double _volume = 0.8;
  double _previousVolume = 0.8;
  int _pitch = 0;
  double _tempo = 1.0;

  PlaybackRepository get _playbackRepository => PlaybackRepository(ref.read(apiClientProvider));

  @override
  void initState() {
    super.initState();
    _currentSong = widget.song;
    _startSession();
    _initPlayer();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) setState(() => _animate = true);
    });
  }

  Future<void> _startSession([Song? song]) async {
    final target = song ?? _currentSong;
    if (target == null) return;
    try {
      _historyId = await _playbackRepository.startPlayback(target.id);
    } catch (_) {
      // Ignore errors; playback can still proceed.
    }
  }

  String? _baseVideoUrl(Song song) {
    return song.videoUrlFull ?? song.videoUrlInstrumental;
  }

  String? _resolveSourceUrl() {
    final song = _currentSong;
    if (song == null) return null;
    final base = _baseVideoUrl(song);
    final chosen = _overrideSourceUrl ?? base;
    if (chosen == null || chosen.isEmpty) return null;

    final candidate = _quality == VideoQuality.low && !_forceOriginalQuality
        ? song.lowQualityUrl(chosen) ?? chosen
        : chosen;
    return UrlUtils.resolveMediaUrl(candidate);
  }

  Future<void> _initPlayer({bool autoPlay = true, Duration? startAt}) async {
    final sourceUrl = _resolveSourceUrl();
    if (sourceUrl == null) {
      if (mounted) setState(() => _initError = 'Sumber video tidak tersedia.');
      return;
    }

    await _disposePlayer();

    _videoController = VideoPlayerController.networkUrl(Uri.parse(sourceUrl));
    try {
      await _videoController!.initialize();
    } catch (error) {
      await _handlePlaybackError(error, allowFallback: true);
      return;
    }

    if (startAt != null && startAt > Duration.zero) {
      final duration = _videoController!.value.duration;
      final clamped = startAt > duration ? duration : startAt;
      await _videoController!.seekTo(clamped);
    }

    await _applyVolume();
    await _applyPlaybackRate();

    _chewieController = ChewieController(
      videoPlayerController: _videoController!,
      autoPlay: autoPlay,
      looping: false,
      showControls: false,
      allowFullScreen: true,
      allowPlaybackSpeedChanging: false,
    );

    _videoController!.addListener(_handlePlaybackUpdate);
    _startLyricTimer();
    await _applyAudioChannelMode();
    if (mounted) {
      setState(() => _initError = null);
    }
  }

  Future<bool> _applyAudioChannelMode() async {
    final controller = _videoController;
    if (controller == null) return false;
    try {
      await _audioChannel.invokeMethod('setAudioMode', {
        'playerId': controller.playerId,
        'vocalOn': _vocalOn,
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> _applyPlaybackRate() async {
    final controller = _videoController;
    if (controller == null) return;
    final pitchRate = math.pow(2, _pitch / 12).toDouble();
    final rate = (pitchRate * _tempo).clamp(0.5, 2.0);
    try {
      await controller.setPlaybackSpeed(rate);
    } catch (_) {
      // Ignore unsupported playback speed changes.
    }
  }

  Future<void> _applyVolume() async {
    final controller = _videoController;
    if (controller == null) return;
    final target = _volume.clamp(0.0, 1.0);
    try {
      await controller.setVolume(target.toDouble());
    } catch (_) {
      // Ignore volume update failures.
    }
  }

  void _handlePlaybackUpdate() {
    if (_videoController == null || _completed) return;
    final value = _videoController!.value;
    if (value.hasError) {
      _handlePlaybackError(value.errorDescription ?? 'Video error', allowFallback: true);
      return;
    }
    if (value.isInitialized && value.position >= value.duration && !value.isPlaying) {
      _completePlayback();
    }
  }

  String? _toMp4Variant(String? url) {
    if (url == null || url.isEmpty) return null;
    final parts = url.split('?');
    final path = parts.first;
    if (!path.toLowerCase().endsWith('.mpg')) return null;
    final mp4Path = '${path.substring(0, path.length - 4)}.mp4';
    if (parts.length == 1) return mp4Path;
    return '$mp4Path?${parts.sublist(1).join('?')}';
  }

  Future<void> _handlePlaybackError(Object error, {required bool allowFallback}) async {
    await _disposePlayer();
    if (!mounted) return;

    if (allowFallback && _quality == VideoQuality.low) {
      setState(() {
        _quality = VideoQuality.high;
        _forceOriginalQuality = true;
        _initError = null;
      });
      await _initPlayer();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Kualitas rendah tidak tersedia, pakai kualitas tinggi.')),
      );
      return;
    }

    if (allowFallback && _overrideSourceUrl == null) {
      final song = _currentSong;
      final base = song == null ? null : _baseVideoUrl(song);
      final mp4Variant = _toMp4Variant(base);
      if (mp4Variant != null) {
        setState(() {
          _overrideSourceUrl = mp4Variant;
          _forceOriginalQuality = true;
          _initError = null;
        });
        await _initPlayer();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Mencoba format MP4 untuk video ini.')),
        );
        return;
      }
    }

    setState(() => _initError = error.toString());
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Gagal memutar video: $error')),
    );
  }

  void _startLyricTimer() {
    _lyricTimer?.cancel();
    final song = _currentSong;
    if (song == null || song.lyrics.isEmpty || _videoController == null) {
      _currentLyric = '';
      return;
    }

    _lyricTimer = Timer.periodic(const Duration(milliseconds: 300), (_) {
      final controller = _videoController;
      if (controller == null || !controller.value.isInitialized) return;
      final position = controller.value.position.inMilliseconds / 1000.0;
      final lines = song.lyrics;
      String nextLine = _currentLyric;

      for (var i = 0; i < lines.length; i++) {
        if (position >= lines[i].time) {
          nextLine = lines[i].text;
        } else {
          break;
        }
      }

      if (nextLine != _currentLyric && mounted) {
        setState(() => _currentLyric = nextLine);
      }
    });
  }

  Future<void> _completePlayback({bool showDialog = true}) async {
    if (_completed) return;
    _completed = true;

    final historyId = _historyId;
    if (historyId == null || _videoController == null) return;
    final playedSeconds = _videoController!.value.position.inSeconds;
    try {
      final result = await _playbackRepository.endPlayback(
        historyId: historyId,
        playedDuration: playedSeconds,
      );
      if (!mounted) return;
      if (showDialog) {
        _showScoreDialog(result);
        if (_queue.isNotEmpty) {
          Future.delayed(const Duration(seconds: 2), () {
            if (mounted) _playNextFromQueue();
          });
        }
      }
    } catch (_) {
      // Ignore score errors.
    }
  }

  void _showScoreDialog(PlaybackResult result) {
    showGeneralDialog<void>(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Score',
      barrierColor: Colors.black.withValues(alpha: 0.6),
      transitionDuration: const Duration(milliseconds: 280),
      pageBuilder: (_, __, ___) => Center(
        child: _ScoreDialog(
          result: result,
          onReplay: () {
            Navigator.of(context).pop();
            final song = _currentSong;
            if (song != null) _playSong(song);
          },
        ),
      ),
      transitionBuilder: (_, animation, __, child) {
        final curved = Curves.easeOutCubic.transform(animation.value);
        return Opacity(
          opacity: animation.value,
          child: Transform.scale(
            scale: 0.92 + (0.08 * curved),
            child: child,
          ),
        );
      },
    );
  }

  Future<void> _disposePlayer() async {
    _lyricTimer?.cancel();
    if (_videoController != null) {
      _videoController!.removeListener(_handlePlaybackUpdate);
    }
    _chewieController?.dispose();
    _videoController?.dispose();
    _chewieController = null;
    _videoController = null;
  }

  Future<void> _playSong(Song song) async {
    setState(() {
      _currentSong = song;
      _currentLyric = '';
      _initError = null;
      _overrideSourceUrl = null;
      _forceOriginalQuality = false;
      _completed = false;
    });
    await _startSession(song);
    await _initPlayer();
  }

  void _addToQueue(Song song) {
    setState(() => _queue.add(song));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Ditambahkan ke antrian: ${song.title}')),
    );
  }

  Future<void> _playNextFromQueue() async {
    if (_queue.isEmpty) return;
    final nextSong = _queue.removeAt(0);
    if (mounted) setState(() {});
    await _playSong(nextSong);
  }

  void _togglePlay() {
    final controller = _videoController;
    if (controller == null) return;
    if (controller.value.isPlaying) {
      controller.pause();
    } else {
      controller.play();
    }
  }

  Future<void> _stopPlayback() async {
    final controller = _videoController;
    if (controller == null) return;
    await controller.pause();
    await controller.seekTo(Duration.zero);
  }

  void _seekTo(Duration duration) {
    final controller = _videoController;
    if (controller == null || !controller.value.isInitialized) return;
    controller.seekTo(duration);
  }

  void _skipPrev() {
    _seekTo(Duration.zero);
  }

  Future<void> _skipNext() async {
    if (_queue.isNotEmpty) {
      await _playNextFromQueue();
    }
  }

  Future<void> _toggleVocalMode() async {
    final controller = _videoController;
    final wasPlaying = controller?.value.isPlaying ?? false;
    final position = controller?.value.position ?? Duration.zero;

    setState(() {
      _vocalOn = !_vocalOn;
    });
    final applied = await _applyAudioChannelMode();
    if (applied) {
      await _applyVolume();
    } else {
      await _initPlayer(autoPlay: wasPlaying, startAt: position);
    }
  }

  void _setQuality(VideoQuality quality) {
    if (_quality == quality) return;
    setState(() {
      _quality = quality;
      _overrideSourceUrl = null;
      _forceOriginalQuality = false;
    });
    _initPlayer();
  }

  void _increasePitch() {
    if (_pitch >= 6) return;
    setState(() => _pitch += 1);
    _applyPlaybackRate();
  }

  void _decreasePitch() {
    if (_pitch <= -6) return;
    setState(() => _pitch -= 1);
    _applyPlaybackRate();
  }

  void _resetPitch() {
    if (_pitch == 0) return;
    setState(() => _pitch = 0);
    _applyPlaybackRate();
  }

  void _increaseTempo() {
    if (_tempo >= 2.0) return;
    setState(() => _tempo = double.parse((_tempo + 0.1).toStringAsFixed(1)));
    _applyPlaybackRate();
  }

  void _decreaseTempo() {
    if (_tempo <= 0.5) return;
    setState(() => _tempo = double.parse((_tempo - 0.1).toStringAsFixed(1)));
    _applyPlaybackRate();
  }

  void _resetTempo() {
    if (_tempo == 1.0) return;
    setState(() => _tempo = 1.0);
    _applyPlaybackRate();
  }

  void _setVolume(double value) {
    setState(() => _volume = value);
    _applyVolume();
  }

  void _toggleMute() {
    if (_volume > 0) {
      _previousVolume = _volume;
      _setVolume(0);
    } else {
      _setVolume(_previousVolume);
    }
  }

  void _openSongPicker() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _SongPickerSheet(
        queueCount: _queue.length,
        onPlay: (song) {
          Navigator.of(context).pop();
          _playSong(song);
        },
        onQueue: _addToQueue,
      ),
    );
  }

  @override
  void dispose() {
    _completePlayback(showDialog: false);
    _disposePlayer();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final song = _currentSong ?? widget.song;
    final size = MediaQuery.of(context).size;
    final isCompact = size.width < 380 || size.height < 700;
    final targetHeight = size.width * 9 / 16;
    final maxHeight = size.height * (isCompact ? 0.42 : 0.48);
    final double videoHeight = math.max(220.0, math.min(targetHeight, maxHeight)).toDouble();

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          const _GradientBackground(),
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                  child: _AnimatedEntry(
                    animate: _animate,
                    duration: const Duration(milliseconds: 450),
                    child: _HeaderBar(
                      title: song.title,
                      subtitle: song.artist,
                      queueCount: _queue.length,
                      onBack: () => Navigator.of(context).pop(),
                      onQueueTap: _openSongPicker,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _AnimatedEntry(
                    animate: _animate,
                    duration: const Duration(milliseconds: 550),
                    child: _VideoShell(
                      height: videoHeight,
                      song: song,
                      controller: _chewieController,
                      initError: _initError,
                      lyric: _currentLyric,
                      quality: _quality,
                      vocalOn: _vocalOn,
                      onRetry: _initPlayer,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                    child: Column(
                      children: [
                        _AnimatedEntry(
                          animate: _animate,
                          duration: const Duration(milliseconds: 650),
                          child: _GlassPanel(
                            padding: const EdgeInsets.all(14),
                            child: _ProgressArea(
                              controller: _videoController,
                              onSeek: _seekTo,
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        _AnimatedEntry(
                          animate: _animate,
                          duration: const Duration(milliseconds: 700),
                          child: _GlassPanel(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                            child: Column(
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    _IconCircleButton(
                                      icon: Icons.skip_previous_rounded,
                                      onTap: _skipPrev,
                                    ),
                                    const SizedBox(width: 12),
                                    _PlayPauseButton(
                                      controller: _videoController,
                                      onTap: _togglePlay,
                                    ),
                                    const SizedBox(width: 12),
                                    _IconCircleButton(
                                      icon: Icons.skip_next_rounded,
                                      onTap: _skipNext,
                                      enabled: _queue.isNotEmpty,
                                    ),
                                    if (!isCompact) ...[
                                      const SizedBox(width: 12),
                                      _IconCircleButton(
                                        icon: Icons.stop_rounded,
                                        onTap: _stopPlayback,
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 14),
                                Wrap(
                                  alignment: WrapAlignment.center,
                                  spacing: 10,
                                  runSpacing: 10,
                                  children: [
                                    _ActionPill(
                                      icon: Icons.queue_music,
                                      label: 'Antrian',
                                      badge: _queue.isNotEmpty ? _queue.length.toString() : null,
                                      onTap: _openSongPicker,
                                    ),
                                    _ActionPill(
                                      icon: _vocalOn ? Icons.mic : Icons.mic_off,
                                      label: _vocalOn ? 'Vokal' : 'Karaoke',
                                      onTap: _toggleVocalMode,
                                    ),
                                    _QualityToggle(
                                      value: _quality,
                                      onChanged: _setQuality,
                                    ),
                                    _ActionPill(
                                      icon: _volume > 0 ? Icons.volume_up : Icons.volume_off,
                                      label: _volume > 0 ? 'Suara' : 'Mute',
                                      onTap: _toggleMute,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        _AnimatedEntry(
                          animate: _animate,
                          duration: const Duration(milliseconds: 780),
                          child: _GlassPanel(
                            padding: const EdgeInsets.all(14),
                            child: _TuningPanel(
                              pitch: _pitch,
                              tempo: _tempo,
                              volume: _volume,
                              onPitchIncrease: _increasePitch,
                              onPitchDecrease: _decreasePitch,
                              onPitchReset: _resetPitch,
                              onTempoIncrease: _increaseTempo,
                              onTempoDecrease: _decreaseTempo,
                              onTempoReset: _resetTempo,
                              onVolumeChanged: _setVolume,
                            ),
                          ),
                        ),
                        if (_queue.isNotEmpty) ...[
                          const SizedBox(height: 16),
                          _QueuePreview(
                            queue: _queue,
                            onRemove: (index) {
                              setState(() => _queue.removeAt(index));
                            },
                            onPlay: _playSong,
                          ),
                        ],
                      ],
                    ),
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
          top: -140,
          right: -60,
          child: _GlowBlob(
            size: 260,
            colors: const [Color(0xFF64FFDA), Color(0xFF40C4FF)],
            opacity: 0.32,
          ),
        ),
        Positioned(
          bottom: -160,
          left: -60,
          child: _GlowBlob(
            size: 300,
            colors: const [Color(0xFF00C853), Color(0xFF18FFFF)],
            opacity: 0.22,
          ),
        ),
      ],
    );
  }
}

class _HeaderBar extends StatelessWidget {
  final String title;
  final String subtitle;
  final int queueCount;
  final VoidCallback onBack;
  final VoidCallback onQueueTap;

  const _HeaderBar({
    required this.title,
    required this.subtitle,
    required this.queueCount,
    required this.onBack,
    required this.onQueueTap,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _IconCircleButton(icon: Icons.arrow_back, onTap: onBack),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.white.withValues(alpha: 0.8),
                    ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        _IconCircleButton(
          icon: Icons.queue_music,
          onTap: onQueueTap,
          badge: queueCount > 0 ? queueCount.toString() : null,
        ),
      ],
    );
  }
}

class _VideoShell extends StatelessWidget {
  final double height;
  final Song song;
  final ChewieController? controller;
  final String? initError;
  final String lyric;
  final VideoQuality quality;
  final bool vocalOn;
  final Future<void> Function({bool autoPlay, Duration? startAt}) onRetry;

  const _VideoShell({
    required this.height,
    required this.song,
    required this.controller,
    required this.initError,
    required this.lyric,
    required this.quality,
    required this.vocalOn,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final thumbnail = UrlUtils.resolveMediaUrl(song.thumbnailUrl);

    return Container(
      decoration: BoxDecoration(
        gradient: _primaryGradient,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 18,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      padding: const EdgeInsets.all(2),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: SizedBox(
          height: height,
          child: Stack(
            children: [
              Positioned.fill(
                child: controller == null
                    ? AppNetworkImage(
                        url: thumbnail,
                        width: double.infinity,
                        height: double.infinity,
                        fallbackIcon: Icons.music_video,
                      )
                    : Chewie(controller: controller!),
              ),
              const Positioned.fill(
                child: DecoratedBox(
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
              ),
              Positioned(
                top: 12,
                right: 12,
                child: Wrap(
                  spacing: 8,
                  children: [
                    _StatusPill(label: vocalOn ? 'STEREO' : 'LEFT'),
                    if (quality == VideoQuality.low) const _StatusPill(label: 'LOW'),
                  ],
                ),
              ),
              Positioned(
                left: 14,
                right: 14,
                bottom: 16,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    
                    if (lyric.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 250),
                        child: Container(
                          key: ValueKey(lyric),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.55),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Text(
                            lyric,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              if (initError != null)
                Positioned.fill(
                  child: _ErrorOverlay(
                    message: initError!,
                    onRetry: () => onRetry(autoPlay: false),
                  ),
                )
              else if (controller == null)
                const Positioned.fill(
                  child: Center(
                    child: CircularProgressIndicator(color: Colors.white),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProgressArea extends StatelessWidget {
  final VideoPlayerController? controller;
  final ValueChanged<Duration> onSeek;

  const _ProgressArea({required this.controller, required this.onSeek});

  @override
  Widget build(BuildContext context) {
    final fallbackDuration = Duration.zero;

    if (controller == null) {
      return _ProgressBar(
        position: fallbackDuration,
        duration: fallbackDuration,
        onSeek: onSeek,
      );
    }

    return ValueListenableBuilder<VideoPlayerValue>(
      valueListenable: controller!,
      builder: (_, value, __) {
        final duration = value.duration == Duration.zero ? fallbackDuration : value.duration;
        final position = value.position > duration ? duration : value.position;
        return _ProgressBar(
          position: position,
          duration: duration,
          onSeek: onSeek,
        );
      },
    );
  }
}

class _ProgressBar extends StatelessWidget {
  final Duration position;
  final Duration duration;
  final ValueChanged<Duration> onSeek;

  const _ProgressBar({
    required this.position,
    required this.duration,
    required this.onSeek,
  });

  @override
  Widget build(BuildContext context) {
    final totalMs = math.max(duration.inMilliseconds, 1);
    final positionMs = position.inMilliseconds.clamp(0, totalMs).toDouble();

    return Row(
      children: [
        Text(
          _formatDuration(position),
          style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: SliderTheme(
            data: SliderTheme.of(context).copyWith(
              trackHeight: 4,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
              overlayShape: const RoundSliderOverlayShape(overlayRadius: 12),
              activeTrackColor: Colors.white,
              inactiveTrackColor: Colors.white.withValues(alpha: 0.2),
              thumbColor: Colors.white,
            ),
            child: Slider(
              min: 0,
              max: totalMs.toDouble(),
              value: positionMs,
              onChanged: (value) => onSeek(Duration(milliseconds: value.round())),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          _formatDuration(duration),
          style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white),
        ),
      ],
    );
  }
}

class _PlayPauseButton extends StatelessWidget {
  final VideoPlayerController? controller;
  final VoidCallback onTap;

  const _PlayPauseButton({required this.controller, required this.onTap});

  @override
  Widget build(BuildContext context) {
    if (controller == null) {
      return _IconCircleButton(icon: Icons.play_arrow, onTap: onTap, filled: true);
    }

    return ValueListenableBuilder<VideoPlayerValue>(
      valueListenable: controller!,
      builder: (_, value, __) {
        final isPlaying = value.isPlaying;
        return _IconCircleButton(
          icon: isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
          onTap: onTap,
          filled: true,
          size: 56,
        );
      },
    );
  }
}

class _QualityToggle extends StatelessWidget {
  final VideoQuality value;
  final ValueChanged<VideoQuality> onChanged;

  const _QualityToggle({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withValues(alpha: 0.35)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _QualityChip(
            label: 'HD',
            selected: value == VideoQuality.high,
            onTap: () => onChanged(VideoQuality.high),
          ),
          const SizedBox(width: 6),
          _QualityChip(
            label: 'LOW',
            selected: value == VideoQuality.low,
            onTap: () => onChanged(VideoQuality.low),
          ),
        ],
      ),
    );
  }
}

class _QualityChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _QualityChip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          gradient: selected ? _primaryGradient : null,
          color: selected ? null : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Text(
          label,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: selected ? Colors.white : Colors.white.withValues(alpha: 0.75),
                fontWeight: FontWeight.w600,
              ),
        ),
      ),
    );
  }
}

class _TuningPanel extends StatelessWidget {
  final int pitch;
  final double tempo;
  final double volume;
  final VoidCallback onPitchIncrease;
  final VoidCallback onPitchDecrease;
  final VoidCallback onPitchReset;
  final VoidCallback onTempoIncrease;
  final VoidCallback onTempoDecrease;
  final VoidCallback onTempoReset;
  final ValueChanged<double> onVolumeChanged;

  const _TuningPanel({
    required this.pitch,
    required this.tempo,
    required this.volume,
    required this.onPitchIncrease,
    required this.onPitchDecrease,
    required this.onPitchReset,
    required this.onTempoIncrease,
    required this.onTempoDecrease,
    required this.onTempoReset,
    required this.onVolumeChanged,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final cardWidth = width < 420 ? width : (width - 12) / 2;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Kontrol Audio',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                SizedBox(
                  width: cardWidth,
                  child: _StepperCard(
                    title: 'Pitch',
                    value: pitch >= 0 ? '+$pitch' : pitch.toString(),
                    onDecrease: onPitchDecrease,
                    onIncrease: onPitchIncrease,
                    onReset: pitch != 0 ? onPitchReset : null,
                  ),
                ),
                SizedBox(
                  width: cardWidth,
                  child: _StepperCard(
                    title: 'Tempo',
                    value: '${(tempo * 100).round()}%',
                    onDecrease: onTempoDecrease,
                    onIncrease: onTempoIncrease,
                    onReset: tempo != 1.0 ? onTempoReset : null,
                  ),
                ),
                SizedBox(
                  width: width,
                  child: _SliderCard(
                    title: 'Volume',
                    valueLabel: '${(volume * 100).round()}%',
                    value: volume,
                    onChanged: onVolumeChanged,
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }
}

class _QueuePreview extends StatelessWidget {
  final List<Song> queue;
  final ValueChanged<int> onRemove;
  final ValueChanged<Song> onPlay;

  const _QueuePreview({required this.queue, required this.onRemove, required this.onPlay});

  @override
  Widget build(BuildContext context) {
    return _GlassPanel(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Antrian Lagu',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
              ),
              const Spacer(),
              _StatusPill(label: '${queue.length} lagu'),
            ],
          ),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: queue.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final song = queue[index];
              return InkWell(
                onTap: () => onPlay(song),
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 8,
                        height: 48,
                        decoration: BoxDecoration(
                          gradient: _primaryGradient,
                          borderRadius: BorderRadius.circular(12),
                        ),
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
                              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600,
                                  ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              song.artist,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: Colors.white.withValues(alpha: 0.7),
                                  ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () => onRemove(index),
                        icon: const Icon(Icons.close, color: Colors.white),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _SongPickerSheet extends ConsumerStatefulWidget {
  final ValueChanged<Song> onPlay;
  final ValueChanged<Song> onQueue;
  final int queueCount;

  const _SongPickerSheet({
    required this.onPlay,
    required this.onQueue,
    required this.queueCount,
  });

  @override
  ConsumerState<_SongPickerSheet> createState() => _SongPickerSheetState();
}

class _SongPickerSheetState extends ConsumerState<_SongPickerSheet> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();
  Timer? _debounce;
  bool _animate = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    final state = ref.read(songsListProvider);
    _searchController.text = state.search;
    if (state.songs.isEmpty) {
      Future.microtask(() => ref.read(songsListProvider.notifier).loadSongs(reset: true));
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) setState(() => _animate = true);
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      ref.read(songsListProvider.notifier).loadSongs();
    }
  }

  void _onSearchChanged(String value) {
    setState(() {});
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      ref.read(songsListProvider.notifier).applyFilters(search: value.trim());
    });
  }

  void _resetFilters() {
    _searchController.clear();
    ref.read(songsListProvider.notifier).applyFilters(search: '', genre: null, language: null);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(songsListProvider);
    final genresAsync = ref.watch(genresProvider);
    final languagesAsync = ref.watch(languagesProvider);
    final size = MediaQuery.of(context).size;
    final isCompact = size.width < 380;

    return AnimatedPadding(
      duration: const Duration(milliseconds: 200),
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        height: size.height * 0.9,
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
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Pilih Lagu',
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                  ),
                            ),
                            const SizedBox(height: 6),
                            Wrap(
                              spacing: 8,
                              runSpacing: 6,
                              children: [
                                _StatusPill(label: '${state.songs.length} lagu'),
                                if (widget.queueCount > 0)
                                  _StatusPill(label: '${widget.queueCount} antrian'),
                                if (state.genre != null) _StatusPill(label: state.genre!),
                                if (state.language != null) _StatusPill(label: state.language!),
                              ],
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: const Icon(Icons.close, color: Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _AnimatedEntry(
                    animate: _animate,
                    duration: const Duration(milliseconds: 350),
                    child: _GlassPanel(
                      padding: const EdgeInsets.all(6),
                      child: TextField(
                        controller: _searchController,
                        onChanged: _onSearchChanged,
                        decoration: InputDecoration(
                          hintText: 'Cari judul atau artis',
                          prefixIcon: const Icon(Icons.search, color: Color(0xFF0B1D2A)),
                          suffixIcon: _searchController.text.isEmpty
                              ? null
                              : IconButton(
                                  icon: const Icon(Icons.close, color: Color(0xFF0B1D2A)),
                                  onPressed: () {
                                    _searchController.clear();
                                    _onSearchChanged('');
                                  },
                                ),
                          filled: true,
                          fillColor: Colors.white.withValues(alpha: 0.9),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: genresAsync.when(
                          data: (genres) => DropdownButtonFormField<String>(
                            key: ValueKey(state.genre ?? 'all_genre'),
                            initialValue: state.genre,
                            decoration: const InputDecoration(
                              labelText: 'Genre',
                              filled: true,
                              fillColor: Colors.white,
                            ),
                            items: [
                              const DropdownMenuItem(value: null, child: Text('Semua')),
                              ...genres.map(
                                (genre) => DropdownMenuItem(value: genre, child: Text(genre)),
                              ),
                            ],
                            onChanged: (value) {
                              ref.read(songsListProvider.notifier).applyFilters(genre: value);
                            },
                          ),
                          loading: () => const LinearProgressIndicator(),
                          error: (_, __) => const Text('Gagal memuat genre'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: languagesAsync.when(
                          data: (langs) => DropdownButtonFormField<String>(
                            key: ValueKey(state.language ?? 'all_language'),
                            initialValue: state.language,
                            decoration: const InputDecoration(
                              labelText: 'Bahasa',
                              filled: true,
                              fillColor: Colors.white,
                            ),
                            items: [
                              const DropdownMenuItem(value: null, child: Text('Semua')),
                              ...langs.map(
                                (lang) => DropdownMenuItem(value: lang, child: Text(lang)),
                              ),
                            ],
                            onChanged: (value) {
                              ref.read(songsListProvider.notifier).applyFilters(language: value);
                            },
                          ),
                          loading: () => const LinearProgressIndicator(),
                          error: (_, __) => const Text('Gagal memuat bahasa'),
                        ),
                      ),
                    ],
                  ),
                  if (state.search.isNotEmpty || state.genre != null || state.language != null) ...[
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton.icon(
                        onPressed: _resetFilters,
                        icon: const Icon(Icons.refresh, color: Colors.white),
                        label: const Text('Reset', style: TextStyle(color: Colors.white)),
                      ),
                    ),
                  ],
                  const SizedBox(height: 10),
                  Expanded(
                    child: state.errorMessage != null
                        ? _ErrorOverlay(
                            message: state.errorMessage!,
                            onRetry: () => ref.read(songsListProvider.notifier).loadSongs(reset: true),
                          )
                        : ListView.separated(
                            controller: _scrollController,
                            itemCount: state.songs.length + (state.isLoading ? 1 : 0),
                            separatorBuilder: (_, __) => const SizedBox(height: 10),
                            itemBuilder: (context, index) {
                              if (index >= state.songs.length) {
                                return const Padding(
                                  padding: EdgeInsets.symmetric(vertical: 16),
                                  child: Center(
                                    child: CircularProgressIndicator(color: Colors.white),
                                  ),
                                );
                              }
                              final song = state.songs[index];
                              final thumbnail = UrlUtils.resolveMediaUrl(song.thumbnailUrl);
                              return _SongPickerTile(
                                song: song,
                                thumbnail: thumbnail,
                                onPlay: () => widget.onPlay(song),
                                onQueue: () => widget.onQueue(song),
                                isCompact: isCompact,
                              );
                            },
                          ),
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

class _SongPickerTile extends StatelessWidget {
  final Song song;
  final String? thumbnail;
  final VoidCallback onPlay;
  final VoidCallback onQueue;
  final bool isCompact;

  const _SongPickerTile({
    required this.song,
    required this.thumbnail,
    required this.onPlay,
    required this.onQueue,
    required this.isCompact,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
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
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
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
                        color: Colors.white.withValues(alpha: 0.75),
                      ),
                ),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 8,
                  runSpacing: 4,
                  children: [
                    if (song.genre != null) _StatusPill(label: song.genre!),
                    if (song.language != null) _StatusPill(label: song.language!),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            children: [
              _SmallActionButton(
                icon: Icons.play_arrow,
                label: isCompact ? null : 'Play',
                onTap: onPlay,
              ),
              const SizedBox(height: 6),
              _SmallActionButton(
                icon: Icons.add,
                label: isCompact ? null : 'Queue',
                onTap: onQueue,
                outlined: true,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ScoreDialog extends StatelessWidget {
  final PlaybackResult result;
  final VoidCallback onReplay;

  const _ScoreDialog({required this.result, required this.onReplay});

  @override
  Widget build(BuildContext context) {
    final scorePercent = (result.score.clamp(0, 100)).toDouble();

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: _primaryGradient,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.25),
              blurRadius: 24,
              offset: const Offset(0, 16),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(22),
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Selesai',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: 12),
                Text(
                  '${result.score}',
                  style: Theme.of(context).textTheme.displaySmall?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                      ),
                ),
                Text(
                  'Skor Karaoke',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withValues(alpha: 0.85),
                      ),
                ),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: LinearProgressIndicator(
                    value: scorePercent / 100,
                    minHeight: 10,
                    backgroundColor: Colors.white.withValues(alpha: 0.2),
                    valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                ),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  alignment: WrapAlignment.center,
                  children: [
                    _StatusPill(label: 'Level ${result.level}'),
                    _StatusPill(label: result.badge),
                  ],
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.of(context).pop(),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: BorderSide(color: Colors.white.withValues(alpha: 0.6)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: const Text('Tutup'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton(
                        onPressed: onReplay,
                        style: FilledButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF0B1D2A),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: const Text('Main Lagi'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ErrorOverlay extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorOverlay({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withValues(alpha: 0.6),
      child: Center(
        child: _GlassPanel(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: Colors.white),
              const SizedBox(height: 8),
              Text(
                message,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.white,
                    ),
              ),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: onRetry,
                child: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
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
            border: Border.all(color: Colors.white.withValues(alpha: 0.35)),
          ),
          child: child,
        ),
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  final String label;

  const _StatusPill({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.35)),
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

class _IconCircleButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final bool filled;
  final double size;
  final String? badge;
  final bool enabled;

  const _IconCircleButton({
    required this.icon,
    required this.onTap,
    this.filled = false,
    this.size = 44,
    this.badge,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    final baseColor = filled ? Colors.white : Colors.white.withValues(alpha: 0.12);
    final iconColor = filled ? const Color(0xFF0B1D2A) : Colors.white;
    final border = Border.all(color: Colors.white.withValues(alpha: 0.5));

    return Opacity(
      opacity: enabled ? 1 : 0.5,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Material(
            color: baseColor,
            borderRadius: BorderRadius.circular(size / 2),
            child: InkWell(
              onTap: enabled ? onTap : null,
              borderRadius: BorderRadius.circular(size / 2),
              child: Container(
                width: size,
                height: size,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(size / 2),
                  border: border,
                ),
                child: Icon(icon, color: iconColor),
              ),
            ),
          ),
          if (badge != null)
            Positioned(
              right: -4,
              top: -4,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  gradient: _primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  badge!,
                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ActionPill extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? badge;
  final VoidCallback onTap;

  const _ActionPill({
    required this.icon,
    required this.label,
    required this.onTap,
    this.badge,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.18),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: Colors.white.withValues(alpha: 0.35)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: Colors.white, size: 18),
            const SizedBox(width: 6),
            Text(
              label,
              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
            ),
            if (badge != null) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  gradient: _primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  badge!,
                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _StepperCard extends StatelessWidget {
  final String title;
  final String value;
  final VoidCallback onDecrease;
  final VoidCallback onIncrease;
  final VoidCallback? onReset;

  const _StepperCard({
    required this.title,
    required this.value,
    required this.onDecrease,
    required this.onIncrease,
    this.onReset,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: Colors.white.withValues(alpha: 0.75),
                ),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              IconButton(
                onPressed: onDecrease,
                icon: const Icon(Icons.remove, color: Colors.white),
              ),
              Expanded(
                child: Text(
                  value,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                ),
              ),
              IconButton(
                onPressed: onIncrease,
                icon: const Icon(Icons.add, color: Colors.white),
              ),
            ],
          ),
          if (onReset != null)
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: onReset,
                child: const Text('Reset', style: TextStyle(color: Colors.white)),
              ),
            ),
        ],
      ),
    );
  }
}

class _SliderCard extends StatelessWidget {
  final String title;
  final String valueLabel;
  final double value;
  final ValueChanged<double> onChanged;

  const _SliderCard({
    required this.title,
    required this.valueLabel,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                title,
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      color: Colors.white.withValues(alpha: 0.75),
                    ),
              ),
              const Spacer(),
              Text(
                valueLabel,
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              trackHeight: 4,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
              overlayShape: const RoundSliderOverlayShape(overlayRadius: 12),
              activeTrackColor: Colors.white,
              inactiveTrackColor: Colors.white.withValues(alpha: 0.2),
              thumbColor: Colors.white,
            ),
            child: Slider(
              value: value,
              min: 0,
              max: 1,
              onChanged: onChanged,
            ),
          ),
        ],
      ),
    );
  }
}

class _SmallActionButton extends StatelessWidget {
  final IconData icon;
  final String? label;
  final VoidCallback onTap;
  final bool outlined;

  const _SmallActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
    this.outlined = false,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(
          color: outlined ? Colors.transparent : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.6),
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 16,
              color: outlined ? Colors.white : const Color(0xFF0B1D2A),
            ),
            if (label != null) ...[
              const SizedBox(width: 4),
              Text(
                label!,
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: outlined ? Colors.white : const Color(0xFF0B1D2A),
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ],
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

String _formatDuration(Duration duration) {
  final minutes = duration.inMinutes;
  final seconds = duration.inSeconds.remainder(60);
  return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
}
