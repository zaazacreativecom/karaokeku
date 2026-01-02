import 'package:equatable/equatable.dart';

class ChatUser extends Equatable {
  final int id;
  final String name;
  final String? email;
  final String role;

  const ChatUser({
    required this.id,
    required this.name,
    this.email,
    required this.role,
  });

  factory ChatUser.fromJson(Map<String, dynamic> json) {
    return ChatUser(
      id: _parseInt(json['id']),
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString(),
      role: json['role']?.toString() ?? 'user',
    );
  }

  @override
  List<Object?> get props => [id, name, email, role];

  static int _parseInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    return int.tryParse(value.toString()) ?? 0;
  }
}

class ChatMessage extends Equatable {
  final int id;
  final int senderId;
  final int receiverId;
  final String message;
  final bool isRead;
  final DateTime? createdAt;
  final ChatUser? sender;
  final ChatUser? receiver;

  const ChatMessage({
    required this.id,
    required this.senderId,
    required this.receiverId,
    required this.message,
    required this.isRead,
    this.createdAt,
    this.sender,
    this.receiver,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: _parseInt(json['id']),
      senderId: _parseInt(json['sender_id']),
      receiverId: _parseInt(json['receiver_id']),
      message: json['message']?.toString() ?? '',
      isRead: json['is_read'] == true,
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at'].toString()) : null,
      sender: json['sender'] is Map<String, dynamic> ? ChatUser.fromJson(json['sender']) : null,
      receiver: json['receiver'] is Map<String, dynamic> ? ChatUser.fromJson(json['receiver']) : null,
    );
  }

  @override
  List<Object?> get props => [id, senderId, receiverId, message, isRead, createdAt, sender, receiver];

  static int _parseInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    return int.tryParse(value.toString()) ?? 0;
  }
}

class Conversation extends Equatable {
  final ChatUser partner;
  final ChatMessage lastMessage;
  final int unreadCount;

  const Conversation({
    required this.partner,
    required this.lastMessage,
    required this.unreadCount,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      partner: ChatUser.fromJson(json['partner'] as Map<String, dynamic>),
      lastMessage: ChatMessage.fromJson(json['lastMessage'] as Map<String, dynamic>),
      unreadCount: ChatUser._parseInt(json['unreadCount']),
    );
  }

  @override
  List<Object?> get props => [partner, lastMessage, unreadCount];
}
