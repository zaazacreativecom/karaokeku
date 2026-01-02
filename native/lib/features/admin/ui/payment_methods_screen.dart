import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../donations/models/payment_method.dart';
import '../data/admin_repository.dart';

class PaymentMethodsScreen extends ConsumerStatefulWidget {
  const PaymentMethodsScreen({super.key});

  @override
  ConsumerState<PaymentMethodsScreen> createState() => _PaymentMethodsScreenState();
}

class _PaymentMethodsScreenState extends ConsumerState<PaymentMethodsScreen> {
  late final AdminRepository _repository;
  late Future<List<PaymentMethod>> _loader;

  @override
  void initState() {
    super.initState();
    _repository = AdminRepository(ref.read(apiClientProvider));
    _loader = _repository.fetchPaymentMethodsAdmin();
  }

  Future<void> _refresh() async {
    setState(() => _loader = _repository.fetchPaymentMethodsAdmin());
  }

  Future<void> _toggle(PaymentMethod method) async {
    await _repository.togglePaymentMethod(method.id);
    await _refresh();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payment Methods')),
      body: FutureBuilder<List<PaymentMethod>>(
        future: _loader,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Gagal memuat metode: ${snapshot.error}'));
          }
          final methods = snapshot.data ?? [];
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: methods.length,
              itemBuilder: (context, index) {
                final method = methods[index];
                return Card(
                  child: SwitchListTile(
                    value: method.isActive,
                    onChanged: (_) => _toggle(method),
                    title: Text(method.name),
                    subtitle: Text(method.accountNumber ?? ''),
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
