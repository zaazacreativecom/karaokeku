import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../songs/ui/song_detail_screen.dart';
import '../data/history_repository.dart';
import '../models/play_history.dart';
import '../models/score_summary.dart';
import 'leaderboard_screen.dart';

class HistoryScreen extends ConsumerStatefulWidget {
  const HistoryScreen({super.key});

  @override
  ConsumerState<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends ConsumerState<HistoryScreen> {
  late final HistoryRepository _repository;
  late Future<ScoreSummary> _summaryLoader;
  late Future<List<PlayHistoryItem>> _historyLoader;

  @override
  void initState() {
    super.initState();
    _repository = HistoryRepository(ref.read(apiClientProvider));
    _summaryLoader = _repository.fetchSummary();
    _historyLoader = _repository.fetchHistory().then((page) => page.items);
  }

  Future<void> _refresh() async {
    setState(() {
      _summaryLoader = _repository.fetchSummary();
      _historyLoader = _repository.fetchHistory().then((page) => page.items);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Riwayat & Skor'),
        actions: [
          IconButton(
            icon: const Icon(Icons.emoji_events),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const LeaderboardScreen()),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            FutureBuilder<ScoreSummary>(
              future: _summaryLoader,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Text('Gagal memuat ringkasan: ${snapshot.error}');
                }
                final summary = snapshot.data;
                if (summary == null) return const SizedBox.shrink();
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Level: ${summary.level} ${summary.badge}', style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 8),
                        Text('Total lagu dimainkan: ${summary.totalSongsPlayed}'),
                        Text('Durasi: ${summary.totalDurationMinutes} menit'),
                        Text('Skor rata-rata: ${summary.averageScore}'),
                      ],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 16),
            Text('Riwayat Terbaru', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            FutureBuilder<List<PlayHistoryItem>>(
              future: _historyLoader,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Text('Gagal memuat riwayat: ${snapshot.error}');
                }
                final history = snapshot.data ?? [];
                if (history.isEmpty) {
                  return const Text('Belum ada riwayat.');
                }
                return Column(
                  children: history.map((item) {
                    final song = item.song;
                    return Card(
                      child: ListTile(
                        title: Text(song?.title ?? 'Unknown'),
                        subtitle: Text(song?.artist ?? ''),
                        trailing: Text('${item.score ?? 0}'),
                        onTap: song == null
                            ? null
                            : () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(builder: (_) => SongDetailScreen(songId: song.id)),
                                );
                              },
                      ),
                    );
                  }).toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
