import '../../../core/network/api_client.dart';
import '../../../core/network/api_error.dart';
import '../models/chat_models.dart';

class ChatRepository {
  final ApiClient _client;

  ChatRepository(this._client);

  Future<List<Conversation>> fetchConversations() async {
    final response = await _client.get('/chat/conversations');
    if (response.data is List) {
      return (response.data as List)
          .whereType<Map>()
          .map((item) => Conversation.fromJson(item.cast<String, dynamic>()))
          .toList();
    }
    throw const ApiError('Conversations tidak valid');
  }

  Future<List<ChatUser>> fetchUsers() async {
    final response = await _client.get('/chat/users');
    if (response.data is List) {
      return (response.data as List)
          .whereType<Map>()
          .map((item) => ChatUser.fromJson(item.cast<String, dynamic>()))
          .toList();
    }
    throw const ApiError('User chat tidak valid');
  }

  Future<List<ChatMessage>> fetchMessages(int partnerId, {int page = 1, int limit = 50}) async {
    final response = await _client.get(
      '/chat/messages/$partnerId',
      queryParameters: {'page': page, 'limit': limit},
    );
    if (response.data is List) {
      return (response.data as List)
          .whereType<Map>()
          .map((item) => ChatMessage.fromJson(item.cast<String, dynamic>()))
          .toList();
    }
    throw const ApiError('Pesan tidak valid');
  }

  Future<ChatMessage> sendMessage(int receiverId, String message) async {
    final response = await _client.post(
      '/chat/send',
      data: {'receiver_id': receiverId, 'message': message},
    );
    if (response.data is Map<String, dynamic>) {
      return ChatMessage.fromJson(response.data as Map<String, dynamic>);
    }
    throw const ApiError('Kirim pesan gagal');
  }

  Future<void> markAsRead(int messageId) async {
    await _client.put('/chat/read/$messageId');
  }

  Future<int> fetchUnreadCount() async {
    final response = await _client.get('/chat/unread');
    if (response.data is Map<String, dynamic>) {
      return int.tryParse(response.data['unread']?.toString() ?? '0') ?? 0;
    }
    return 0;
  }
}
