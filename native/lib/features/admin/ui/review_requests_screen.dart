import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../requests/models/song_request.dart';
import '../data/admin_repository.dart';

class ReviewRequestsScreen extends ConsumerStatefulWidget {
  const ReviewRequestsScreen({super.key});

  @override
  ConsumerState<ReviewRequestsScreen> createState() => _ReviewRequestsScreenState();
}

class _ReviewRequestsScreenState extends ConsumerState<ReviewRequestsScreen> {
  late final AdminRepository _repository;
  late Future<List<SongRequest>> _loader;

  @override
  void initState() {
    super.initState();
    _repository = AdminRepository(ref.read(apiClientProvider));
    _loader = _repository.fetchRequests();
  }

  Future<void> _refresh() async {
    setState(() => _loader = _repository.fetchRequests());
  }

  Future<void> _updateStatus(SongRequest request, String status) async {
    await _repository.updateRequestStatus(request.id, status);
    await _refresh();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Review Requests')),
      body: FutureBuilder<List<SongRequest>>(
        future: _loader,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Gagal memuat request: ${snapshot.error}'));
          }
          final requests = snapshot.data ?? [];
          if (requests.isEmpty) {
            return const Center(child: Text('Tidak ada request.'));
          }
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: requests.length,
              itemBuilder: (context, index) {
                final request = requests[index];
                return Card(
                  child: ListTile(
                    title: Text('${request.title} - ${request.artist}'),
                    subtitle: Text('Status: ${request.status}'),
                    trailing: PopupMenuButton<String>(
                      onSelected: (value) => _updateStatus(request, value),
                      itemBuilder: (context) => const [
                        PopupMenuItem(value: 'approved', child: Text('Approve')),
                        PopupMenuItem(value: 'rejected', child: Text('Reject')),
                        PopupMenuItem(value: 'completed', child: Text('Completed')),
                      ],
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
