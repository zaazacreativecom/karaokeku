import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/chat_models.dart';
import '../providers/chat_providers.dart';
import 'chat_detail_screen.dart';

class ChatListScreen extends ConsumerStatefulWidget {
  const ChatListScreen({super.key});

  @override
  ConsumerState<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends ConsumerState<ChatListScreen> {
  List<Conversation> _conversations = [];
  final Set<int> _onlineUsers = {};
  StreamSubscription? _messageSub;
  StreamSubscription? _onlineSub;
  StreamSubscription? _userOnlineSub;
  StreamSubscription? _userOfflineSub;

  @override
  void initState() {
    super.initState();
    _initSocket();
    _loadConversations();
  }

  @override
  void dispose() {
    _messageSub?.cancel();
    _onlineSub?.cancel();
    _userOnlineSub?.cancel();
    _userOfflineSub?.cancel();
    super.dispose();
  }

  Future<void> _initSocket() async {
    final socket = ref.read(socketServiceProvider);
    await socket.connect();
    socket.requestOnlineUsers();

    _onlineSub = socket.onOnlineUsers.listen((ids) {
      setState(() {
        _onlineUsers
          ..clear()
          ..addAll(ids);
      });
    });

    _userOnlineSub = socket.onUserOnline.listen((id) {
      setState(() => _onlineUsers.add(id));
    });

    _userOfflineSub = socket.onUserOffline.listen((id) {
      setState(() => _onlineUsers.remove(id));
    });

    _messageSub = socket.onMessage.listen((_) {
      _loadConversations();
    });
  }

  Future<void> _loadConversations() async {
    final repo = ref.read(chatRepositoryProvider);
    try {
      final conversations = await repo.fetchConversations();
      if (!mounted) return;
      setState(() => _conversations = conversations);
    } catch (_) {
      // Ignore
    }
  }

  Future<void> _startNewChat() async {
    final repo = ref.read(chatRepositoryProvider);
    try {
      final users = await repo.fetchUsers();
      if (!mounted) return;
      showModalBottomSheet(
        context: context,
        showDragHandle: true,
        builder: (context) {
          return ListView.builder(
            itemCount: users.length,
            itemBuilder: (context, index) {
              final user = users[index];
              final online = _onlineUsers.contains(user.id);
              return ListTile(
                leading: CircleAvatar(child: Text(user.name.substring(0, 1).toUpperCase())),
                title: Text(user.name),
                subtitle: Text(online ? 'Online' : 'Offline'),
                onTap: () {
                  Navigator.of(context).pop();
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => ChatDetailScreen(partner: user),
                    ),
                  );
                },
              );
            },
          );
        },
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gagal memuat user chat.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chat'),
        actions: [
          IconButton(icon: const Icon(Icons.add_comment), onPressed: _startNewChat),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadConversations,
        child: _conversations.isEmpty
            ? ListView(
                children: const [
                  SizedBox(height: 200),
                  Center(child: Text('Belum ada percakapan.')),
                ],
              )
            : ListView.builder(
                itemCount: _conversations.length,
                itemBuilder: (context, index) {
                  final conv = _conversations[index];
                  final online = _onlineUsers.contains(conv.partner.id);
                  return ListTile(
                    leading: Stack(
                      children: [
                        CircleAvatar(child: Text(conv.partner.name.substring(0, 1).toUpperCase())),
                        Positioned(
                          right: 0,
                          bottom: 0,
                          child: Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: online ? Colors.green : Colors.grey,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                      ],
                    ),
                    title: Text(conv.partner.name),
                    subtitle: Text(conv.lastMessage.message, maxLines: 1, overflow: TextOverflow.ellipsis),
                    trailing: conv.unreadCount > 0
                        ? CircleAvatar(
                            radius: 12,
                            backgroundColor: Colors.red,
                            child: Text(
                              conv.unreadCount.toString(),
                              style: const TextStyle(color: Colors.white, fontSize: 12),
                            ),
                          )
                        : null,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => ChatDetailScreen(partner: conv.partner)),
                      );
                    },
                  );
                },
              ),
      ),
    );
  }
}
