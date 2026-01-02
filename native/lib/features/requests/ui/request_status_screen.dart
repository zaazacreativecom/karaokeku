import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../data/requests_repository.dart';
import '../models/song_request.dart';

class RequestStatusScreen extends ConsumerStatefulWidget {
  const RequestStatusScreen({super.key});

  @override
  ConsumerState<RequestStatusScreen> createState() => _RequestStatusScreenState();
}

class _RequestStatusScreenState extends ConsumerState<RequestStatusScreen> {
  late final RequestsRepository _repository;
  late Future<List<SongRequest>> _loader;

  @override
  void initState() {
    super.initState();
    _repository = RequestsRepository(ref.read(apiClientProvider));
    _loader = _repository.fetchMyRequests();
  }

  Future<void> _refresh() async {
    setState(() => _loader = _repository.fetchMyRequests());
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'approved':
        return Colors.green;
      case 'rejected':
        return Colors.red;
      case 'completed':
        return Colors.blue;
      default:
        return Colors.orange;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Status Request Lagu')),
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
            return const Center(child: Text('Belum ada request lagu.'));
          }
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: requests.length,
              itemBuilder: (context, index) {
                final req = requests[index];
                return Card(
                  child: ListTile(
                    title: Text('${req.title} - ${req.artist}'),
                    subtitle: Text(req.genre ?? 'Genre tidak ada'),
                    trailing: Chip(
                      label: Text(req.status),
                      backgroundColor: _statusColor(req.status).withValues(alpha: 0.15),
                      labelStyle: TextStyle(color: _statusColor(req.status)),
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
