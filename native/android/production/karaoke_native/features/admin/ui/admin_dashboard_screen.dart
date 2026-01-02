import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../songs/models/song.dart';
import '../data/admin_repository.dart';
import '../models/dashboard_stats.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  ConsumerState<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen> {
  late final AdminRepository _repository;
  late Future<DashboardStats> _loader;

  @override
  void initState() {
    super.initState();
    _repository = AdminRepository(ref.read(apiClientProvider));
    _loader = _repository.fetchDashboard();
  }

  Future<void> _refresh() async {
    setState(() => _loader = _repository.fetchDashboard());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Admin Dashboard')),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<DashboardStats>(
          future: _loader,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return Center(child: Text('Gagal memuat dashboard: ${snapshot.error}'));
            }
            final stats = snapshot.data;
            if (stats == null) return const SizedBox.shrink();

            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: [
                    _StatCard(title: 'Total Users', value: stats.totalUsers.toString()),
                    _StatCard(title: 'Total Songs', value: stats.totalSongs.toString()),
                    _StatCard(title: 'Active Songs', value: stats.activeSongs.toString()),
                    _StatCard(title: 'Plays Today', value: stats.playsToday.toString()),
                    _StatCard(title: 'Pending Uploads', value: stats.pendingUploads.toString()),
                  ],
                ),
                const SizedBox(height: 16),
                Text('Top Songs', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                ...stats.topSongs.map((song) => _SongRow(song: song)),
                const SizedBox(height: 16),
                Text('Recent Users', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                ...stats.recentUsers.map((user) {
                  return Card(
                    child: ListTile(
                      title: Text(user.name),
                      subtitle: Text(user.email),
                    ),
                  );
                }),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;

  const _StatCard({required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 160,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 8),
              Text(value, style: Theme.of(context).textTheme.titleLarge),
            ],
          ),
        ),
      ),
    );
  }
}

class _SongRow extends StatelessWidget {
  final Song song;

  const _SongRow({required this.song});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(song.title),
        subtitle: Text(song.artist),
        trailing: Text(song.playCount.toString()),
      ),
    );
  }
}
