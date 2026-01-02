import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../data/donations_repository.dart';
import '../models/payment_method.dart';

class DonationSubmitScreen extends ConsumerStatefulWidget {
  const DonationSubmitScreen({super.key});

  @override
  ConsumerState<DonationSubmitScreen> createState() => _DonationSubmitScreenState();
}

class _DonationSubmitScreenState extends ConsumerState<DonationSubmitScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _donorController = TextEditingController();
  final _messageController = TextEditingController();
  final _proofController = TextEditingController();

  PaymentMethod? _selectedMethod;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _amountController.dispose();
    _donorController.dispose();
    _messageController.dispose();
    _proofController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedMethod == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pilih metode pembayaran.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    final repo = DonationsRepository(ref.read(apiClientProvider));
    try {
      await repo.createDonation(
        amount: double.parse(_amountController.text.replaceAll(',', '.')),
        method: _mapDonationMethod(_selectedMethod!),
        donorName: _donorController.text.trim(),
        message: _messageController.text.trim(),
        proofUrl: _proofController.text.trim(),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Donasi berhasil dikirim.')),
      );
      Navigator.of(context).pop();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final repo = DonationsRepository(ref.read(apiClientProvider));

    return Scaffold(
      appBar: AppBar(title: const Text('Kirim Donasi')),
      body: SafeArea(
        child: FutureBuilder<List<PaymentMethod>>(
          future: repo.fetchPaymentMethods(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return Center(child: Text('Gagal memuat metode: ${snapshot.error}'));
            }
            final methods = snapshot.data ?? [];
            return SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        TextFormField(
                          controller: _amountController,
                          decoration: const InputDecoration(labelText: 'Nominal'),
                          keyboardType: TextInputType.number,
                          validator: (value) => value == null || value.trim().isEmpty ? 'Nominal wajib diisi' : null,
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<String>(
                          key: ValueKey(_selectedMethod?.id ?? 0),
                          initialValue: _selectedMethod?.id.toString(),
                          items: methods
                              .map((method) => DropdownMenuItem(
                                    value: method.id.toString(),
                                    child: Text(method.name),
                                  ))
                              .toList(),
                          onChanged: (value) {
                            final selected = methods.firstWhere(
                              (method) => method.id.toString() == value,
                              orElse: () => methods.first,
                            );
                            setState(() => _selectedMethod = selected);
                          },
                          decoration: const InputDecoration(labelText: 'Metode Pembayaran'),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _donorController,
                          decoration: const InputDecoration(labelText: 'Nama Donatur (opsional)'),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _messageController,
                          decoration: const InputDecoration(labelText: 'Pesan (opsional)'),
                          maxLines: 3,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _proofController,
                          decoration: const InputDecoration(labelText: 'URL Bukti Transfer (opsional)'),
                        ),
                        const SizedBox(height: 20),
                        FilledButton(
                          onPressed: _isSubmitting ? null : _submit,
                          child: _isSubmitting
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                              : const Text('Kirim Donasi'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  String _mapDonationMethod(PaymentMethod method) {
    final name = method.name.toLowerCase();
    if (name.contains('qris')) return 'qris';
    if (name.contains('gopay')) return 'gopay';
    if (name.contains('ovo')) return 'ovo';
    if (name.contains('dana')) return 'dana';
    if (name.contains('shopee')) return 'shopeepay';
    if (name.contains('bca')) return 'bca';
    if (name.contains('bni')) return 'bni';
    if (name.contains('mandiri')) return 'mandiri';
    return 'other';
  }
}
