import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../data/requests_repository.dart';

class RequestSongScreen extends ConsumerStatefulWidget {
  const RequestSongScreen({super.key});

  @override
  ConsumerState<RequestSongScreen> createState() => _RequestSongScreenState();
}

class _RequestSongScreenState extends ConsumerState<RequestSongScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _artistController = TextEditingController();
  final _genreController = TextEditingController();
  final _languageController = TextEditingController();
  final _linkController = TextEditingController();
  final _notesController = TextEditingController();

  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _artistController.dispose();
    _genreController.dispose();
    _languageController.dispose();
    _linkController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);
    final repo = RequestsRepository(ref.read(apiClientProvider));
    try {
      await repo.createRequest(
        title: _titleController.text.trim(),
        artist: _artistController.text.trim(),
        genre: _genreController.text.trim(),
        language: _languageController.text.trim(),
        link: _linkController.text.trim(),
        notes: _notesController.text.trim(),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Request lagu berhasil dikirim.')),
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
    return Scaffold(
      appBar: AppBar(title: const Text('Request Lagu Baru')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    TextFormField(
                      controller: _titleController,
                      decoration: const InputDecoration(labelText: 'Judul Lagu'),
                      validator: (value) => value == null || value.trim().isEmpty ? 'Judul wajib diisi' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _artistController,
                      decoration: const InputDecoration(labelText: 'Artis'),
                      validator: (value) => value == null || value.trim().isEmpty ? 'Artis wajib diisi' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _genreController,
                      decoration: const InputDecoration(labelText: 'Genre (opsional)'),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _languageController,
                      decoration: const InputDecoration(labelText: 'Bahasa (opsional)'),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _linkController,
                      decoration: const InputDecoration(labelText: 'Link YouTube/Spotify (opsional)'),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _notesController,
                      decoration: const InputDecoration(labelText: 'Catatan (opsional)'),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 20),
                    FilledButton(
                      onPressed: _isSubmitting ? null : _submit,
                      child: _isSubmitting
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Text('Kirim Request'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
