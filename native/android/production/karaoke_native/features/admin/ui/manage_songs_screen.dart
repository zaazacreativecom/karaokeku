import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../songs/models/song.dart';
import '../data/admin_repository.dart';

class ManageSongsScreen extends ConsumerStatefulWidget {
  const ManageSongsScreen({super.key});

  @override
  ConsumerState<ManageSongsScreen> createState() => _ManageSongsScreenState();
}

class _ManageSongsScreenState extends ConsumerState<ManageSongsScreen> {
  late final AdminRepository _repository;
  late Future<List<Song>> _loader;

  @override
  void initState() {
    super.initState();
    _repository = AdminRepository(ref.read(apiClientProvider));
    _loader = _repository.fetchSongs();
  }

  Future<void> _refresh() async {
    setState(() => _loader = _repository.fetchSongs());
  }

  Future<void> _deleteSong(Song song) async {
    await _repository.deleteSong(song.id);
    await _refresh();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Manage Songs')),
      body: FutureBuilder<List<Song>>(
        future: _loader,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Gagal memuat lagu: ${snapshot.error}'));
          }
          final songs = snapshot.data ?? [];
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: songs.length,
              itemBuilder: (context, index) {
                final song = songs[index];
                return Card(
                  child: ListTile(
                    title: Text(song.title),
                    subtitle: Text(song.artist),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline),
                      onPressed: () => _deleteSong(song),
                    ),
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
