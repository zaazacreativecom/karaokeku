import 'dart:async';

import 'package:socket_io_client/socket_io_client.dart' as io;

import '../../../core/config/app_config.dart';
import '../../../core/storage/secure_storage_service.dart';

class SocketService {
  final SecureStorageService _secureStorage;
  io.Socket? _socket;

  final _messageController = StreamController<dynamic>.broadcast();
  final _onlineUsersController = StreamController<List<int>>.broadcast();
  final _userOnlineController = StreamController<int>.broadcast();
  final _userOfflineController = StreamController<int>.broadcast();

  SocketService(this._secureStorage);

  Stream<dynamic> get onMessage => _messageController.stream;
  Stream<List<int>> get onOnlineUsers => _onlineUsersController.stream;
  Stream<int> get onUserOnline => _userOnlineController.stream;
  Stream<int> get onUserOffline => _userOfflineController.stream;

  Future<void> connect() async {
    final token = await _secureStorage.readToken();
    if (token == null || token.isEmpty) return;

    _socket ??= io.io(
      AppConfig.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setAuth({'token': token})
          .build(),
    );

    _socket!
      ..onConnect((_) {})
      ..on('receive_message', (data) => _messageController.add(data))
      ..on('online_users', (data) {
        final ids = (data?['userIds'] as List?)?.map((e) => int.tryParse(e.toString()) ?? 0).toList();
        if (ids != null) _onlineUsersController.add(ids);
      })
      ..on('user_online', (data) {
        final id = int.tryParse(data?['userId']?.toString() ?? '') ?? 0;
        _userOnlineController.add(id);
      })
      ..on('user_offline', (data) {
        final id = int.tryParse(data?['userId']?.toString() ?? '') ?? 0;
        _userOfflineController.add(id);
      });

    _socket!.connect();
  }

  void requestOnlineUsers() {
    _socket?.emit('get_online_users');
  }

  void disconnect() {
    _socket?.disconnect();
  }

  void dispose() {
    _messageController.close();
    _onlineUsersController.close();
    _userOnlineController.close();
    _userOfflineController.close();
    _socket?.dispose();
  }
}
