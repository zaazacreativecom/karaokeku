import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/url_utils.dart';
import '../../../widgets/app_network_image.dart';
import '../data/donations_repository.dart';
import '../models/donation.dart';
import '../models/payment_method.dart';
import 'donation_submit_screen.dart';

class DonationsScreen extends ConsumerStatefulWidget {
  const DonationsScreen({super.key});

  @override
  ConsumerState<DonationsScreen> createState() => _DonationsScreenState();
}

class _DonationsScreenState extends ConsumerState<DonationsScreen> {
  late final DonationsRepository _repository;
  late Future<List<PaymentMethod>> _methodsLoader;
  late Future<List<Donation>> _donationsLoader;

  @override
  void initState() {
    super.initState();
    _repository = DonationsRepository(ref.read(apiClientProvider));
    _methodsLoader = _repository.fetchPaymentMethods();
    _donationsLoader = _repository.fetchMyDonations();
  }

  Future<void> _refresh() async {
    setState(() {
      _methodsLoader = _repository.fetchPaymentMethods();
      _donationsLoader = _repository.fetchMyDonations();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Donasi'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () async {
              await Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const DonationSubmitScreen()),
              );
              await _refresh();
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text('Metode Pembayaran', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            FutureBuilder<List<PaymentMethod>>(
              future: _methodsLoader,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Text('Gagal memuat metode: ${snapshot.error}');
                }
                final methods = snapshot.data ?? [];
                if (methods.isEmpty) {
                  return const Text('Belum ada metode pembayaran aktif.');
                }
                return Column(
                  children: methods.map((method) {
                    final qrUrl = UrlUtils.resolveMediaUrl(method.qrCodeUrl);
                    return Card(
                      child: ListTile(
                        leading: AppNetworkImage(
                          url: qrUrl,
                          width: 48,
                          height: 48,
                          borderRadius: BorderRadius.circular(8),
                          fallbackIcon: Icons.qr_code,
                        ),
                        title: Text(method.name),
                        subtitle: Text(method.accountNumber ?? ''),
                      ),
                    );
                  }).toList(),
                );
              },
            ),
            const SizedBox(height: 16),
            Text('Riwayat Donasi', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            FutureBuilder<List<Donation>>(
              future: _donationsLoader,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Text('Gagal memuat donasi: ${snapshot.error}');
                }
                final donations = snapshot.data ?? [];
                if (donations.isEmpty) {
                  return const Text('Belum ada donasi.');
                }
                return Column(
                  children: donations.map((donation) {
                    return Card(
                      child: ListTile(
                        title: Text(Formatters.currency(donation.amount)),
                        subtitle: Text('Metode: ${donation.method}'),
                        trailing: Chip(label: Text(donation.status)),
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
