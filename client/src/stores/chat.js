/**
 * Chat Store - Manage chat state
 * File: src/stores/chat.js
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chatAPI } from '@/services/api'
import { getSocket } from '@/services/socket'
import { useAuthStore } from '@/stores/auth'

export const useChatStore = defineStore('chat', () => {
  const conversations = ref([])
  const activePartnerId = ref(null)
  const messages = ref([]) 
  const unreadCount = ref(0)
  const users = ref([])
  const isChatOpen = ref(false)
  const isWidgetOpen = ref(false)
  const socket = ref(null)
  
  const activeConversation = computed(() => {
    if (!activePartnerId.value) return null
    return conversations.value.find(c => 
      (c.partner.id === activePartnerId.value)
    )
  })

  // Initialize store and socket listeners
  const init = () => {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) return

    socket.value = getSocket()
    
    if (socket.value) {
      // Listen for new messages
      socket.value.on('receive_message', (data) => {
        handleIncomingMessage(data)
      })

      // Listen for read receipts
      socket.value.on('message_read', (data) => {
        markMessageAsReadLocal(data.messageId)
      })
    }
    
    fetchUnreadCount()
  }

  const handleIncomingMessage = (data) => {
    // If chat is open with sender, append message and mark read
    if (isChatOpen.value && activePartnerId.value === data.sender.id) {
      messages.value.push(data.message)
      // TODO: Mark as read immediately on server
      markAsRead(data.message.id)
    } else {
        // Increment unread count globally
        unreadCount.value++
        
        // Update conversation list if exists
        const conv = conversations.value.find(c => c.partner.id === data.sender.id)
        if(conv) {
            conv.unreadCount++
            conv.lastMessage = data.message
        } else {
            // Fetch conversations again to get new one
            fetchConversations()
        }
    }
  }

  const markMessageAsReadLocal = (messageId) => {
    const msg = messages.value.find(m => m.id === messageId);
    if (msg) {
        msg.is_read = true;
        msg.read_at = new Date();
    }
  }

  // Actions
  const fetchConversations = async () => {
    try {
      const res = await chatAPI.getConversations()
      conversations.value = res.data.data
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  }

  const fetchMessages = async (partnerId) => {
    try {
      if(!partnerId) return;
      activePartnerId.value = partnerId
      const res = await chatAPI.getMessages(partnerId)
      messages.value = res.data.data
      
      // Reset unread count for this conversation
      const conv = conversations.value.find(c => c.partner.id === partnerId)
      if (conv) {
          unreadCount.value -= conv.unreadCount
          conv.unreadCount = 0 // Locally reset
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }
  
  const sendMessage = async (text) => {
    if (!activePartnerId.value || !text.trim()) return

    try {
      const res = await chatAPI.sendMessage({
        receiver_id: activePartnerId.value,
        message: text
      })
      
      if (res.data.success) {
        messages.value.push(res.data.data)
        
        // Update conversation last message
        const conv = conversations.value.find(c => c.partner.id === activePartnerId.value)
        if(conv) {
            conv.lastMessage = res.data.data
        }
      }
      return true
    } catch (error) {
      console.error('Failed to send message:', error)
      return false
    }
  }
  
  const fetchUnreadCount = async () => {
      try {
          const res = await chatAPI.getUnreadCount()
          unreadCount.value = res.data.data.unread
      } catch (error) {
          console.error(error)
      }
  }
  
  const fetchUsers = async () => {
      try {
          const res = await chatAPI.getUsers()
          users.value = res.data.data
      } catch (error) {
          console.error(error)
      }
  }
  
  const markAsRead = async (messageId) => {
      try {
          await chatAPI.markRead(messageId)
      } catch (error) {
          console.error(error)
      }
  }

  const openChat = (partnerId) => {
      activePartnerId.value = partnerId
      isChatOpen.value = true
      isWidgetOpen.value = true
      fetchMessages(partnerId)
  }
  
  const closeChat = () => {
      isChatOpen.value = false
      activePartnerId.value = null
  }

  const toggleWidget = () => {
      isWidgetOpen.value = !isWidgetOpen.value
      // If opening, fetch conversations
      if (isWidgetOpen.value) {
          fetchConversations()
          fetchUsers()
      }
  }

  return {
    conversations,
    activePartnerId,
    activeConversation,
    messages,
    unreadCount,
    users,
    isChatOpen,
    isWidgetOpen,
    init,
    fetchConversations,
    fetchMessages,
    sendMessage,
    fetchUnreadCount,
    fetchUsers,
    openChat,
    closeChat,
    toggleWidget
  }
})
