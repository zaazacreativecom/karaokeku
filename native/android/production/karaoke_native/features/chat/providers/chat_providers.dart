import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../data/chat_repository.dart';
import '../data/socket_service.dart';

final chatRepositoryProvider = Provider<ChatRepository>(
  (ref) => ChatRepository(ref.read(apiClientProvider)),
);

final socketServiceProvider = Provider<SocketService>((ref) {
  final service = SocketService(ref.read(secureStorageProvider));
  ref.onDispose(service.dispose);
  return service;
});
