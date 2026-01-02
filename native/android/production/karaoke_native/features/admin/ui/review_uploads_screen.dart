import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../uploads/models/upload.dart';
import '../data/admin_repository.dart';

class ReviewUploadsScreen extends ConsumerStatefulWidget {
  const ReviewUploadsScreen({super.key});

  @override
  ConsumerState<ReviewUploadsScreen> createState() => _ReviewUploadsScreenState();
}

class _ReviewUploadsScreenState extends ConsumerState<ReviewUploadsScreen> {
  late final AdminRepository _repository;
  late Future<List<UploadItem>> _loader;

  @override
  void initState() {
    super.initState();
    _repository = AdminRepository(ref.read(apiClientProvider));
    _loader = _repository.fetchUploads();
  }

  Future<void> _refresh() async {
    setState(() => _loader = _repository.fetchUploads());
  }

  Future<void> _reviewUpload(UploadItem upload, String status) async {
    await _repository.reviewUpload(upload.id, status: status);
    await _refresh();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Review Uploads')),
      body: FutureBuilder<List<UploadItem>>(
        future: _loader,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Gagal memuat upload: ${snapshot.error}'));
          }
          final uploads = snapshot.data ?? [];
          if (uploads.isEmpty) {
            return const Center(child: Text('Tidak ada upload.'));
          }
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: uploads.length,
              itemBuilder: (context, index) {
                final upload = uploads[index];
                return Card(
                  child: ListTile(
                    title: Text(upload.title),
                    subtitle: Text('Status: ${upload.status}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.check_circle, color: Colors.green),
                          onPressed: () => _reviewUpload(upload, 'approved'),
                        ),
                        IconButton(
                          icon: const Icon(Icons.cancel, color: Colors.red),
                          onPressed: () => _reviewUpload(upload, 'rejected'),
                        ),
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
