package id.zaaza.karaokeku.data.model

data class ChatConversation(
    val partnerId: Int,
    val partnerName: String,
    val lastMessage: ChatMessage?,
    val unreadCount: Int = 0
)

data class ChatMessage(
    val id: Int,
    val senderId: Int,
    val receiverId: Int,
    val message: String,
    val isRead: Boolean,
    val createdAt: String?
)
