import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_providers.dart';
import '../models/chat_models.dart';
import '../providers/chat_providers.dart';

class ChatDetailScreen extends ConsumerStatefulWidget {
  final ChatUser partner;

  const ChatDetailScreen({super.key, required this.partner});

  @override
  ConsumerState<ChatDetailScreen> createState() => _ChatDetailScreenState();
}

class _ChatDetailScreenState extends ConsumerState<ChatDetailScreen> {
  final _messageController = TextEditingController();
  List<ChatMessage> _messages = [];
  bool _loading = true;
  StreamSubscription? _messageSub;

  @override
  void initState() {
    super.initState();
    _loadMessages();
    _listenSocket();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _messageSub?.cancel();
    super.dispose();
  }

  Future<void> _loadMessages() async {
    final repo = ref.read(chatRepositoryProvider);
    try {
      final messages = await repo.fetchMessages(widget.partner.id);
      if (!mounted) return;
      setState(() {
        _messages = messages;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  void _listenSocket() {
    final socket = ref.read(socketServiceProvider);
    _messageSub = socket.onMessage.listen((data) {
      if (data is Map && data['message'] is Map) {
        final message = ChatMessage.fromJson((data['message'] as Map).cast<String, dynamic>());
        final isPartner = message.senderId == widget.partner.id || message.receiverId == widget.partner.id;
        if (isPartner) {
          setState(() => _messages = [..._messages, message]);
        }
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;
    _messageController.clear();
    final repo = ref.read(chatRepositoryProvider);
    try {
      final message = await repo.sendMessage(widget.partner.id, text);
      if (!mounted) return;
      setState(() => _messages = [..._messages, message]);
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gagal mengirim pesan.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = ref.watch(authControllerProvider).user;
    return Scaffold(
      appBar: AppBar(title: Text(widget.partner.name)),
      body: Column(
        children: [
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      final message = _messages[index];
                      final isMe = currentUser != null && message.senderId == currentUser.id;
                      return Align(
                        alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          constraints: const BoxConstraints(maxWidth: 280),
                          decoration: BoxDecoration(
                            color: isMe ? Theme.of(context).colorScheme.primary : Colors.grey.shade300,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            message.message,
                            style: TextStyle(color: isMe ? Colors.white : Colors.black),
                          ),
                        ),
                      );
                    },
                  ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: const InputDecoration(hintText: 'Ketik pesan...'),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.send),
                    onPressed: _sendMessage,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
