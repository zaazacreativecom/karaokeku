import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../donations/models/donation.dart';
import '../data/admin_repository.dart';

class ReviewDonationsScreen extends ConsumerStatefulWidget {
  const ReviewDonationsScreen({super.key});

  @override
  ConsumerState<ReviewDonationsScreen> createState() => _ReviewDonationsScreenState();
}

class _ReviewDonationsScreenState extends ConsumerState<ReviewDonationsScreen> {
  late final AdminRepository _repository;
  late Future<List<Donation>> _loader;

  @override
  void initState() {
    super.initState();
    _repository = AdminRepository(ref.read(apiClientProvider));
    _loader = _repository.fetchDonations();
  }

  Future<void> _refresh() async {
    setState(() => _loader = _repository.fetchDonations());
  }

  Future<void> _verify(Donation donation, String status) async {
    await _repository.verifyDonation(donation.id, status);
    await _refresh();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Review Donasi')),
      body: FutureBuilder<List<Donation>>(
        future: _loader,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Gagal memuat donasi: ${snapshot.error}'));
          }
          final donations = snapshot.data ?? [];
          if (donations.isEmpty) {
            return const Center(child: Text('Tidak ada donasi.'));
          }
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: donations.length,
              itemBuilder: (context, index) {
                final donation = donations[index];
                return Card(
                  child: ListTile(
                    title: Text('Rp ${donation.amount}'),
                    subtitle: Text('Metode: ${donation.method} • Status: ${donation.status}'),
                    trailing: PopupMenuButton<String>(
                      onSelected: (value) => _verify(donation, value),
                      itemBuilder: (context) => const [
                        PopupMenuItem(value: 'verified', child: Text('Verifikasi')),
                        PopupMenuItem(value: 'rejected', child: Text('Tolak')),
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
