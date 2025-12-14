<template>
    <div class="chat-widget-container" v-if="authStore.isLoggedIn">
        <!-- Chat Window (Popup) -->
        <div class="chat-popup" :class="{ open: isOpen || chatStore.isChatOpen }">

            <!-- Conversation List View -->
            <div v-if="!chatStore.isChatOpen" class="conversation-list-view">
                <div class="popup-header">
                    <h3>Chat</h3>
                    <button class="btn-close-popup" @click="toggleChat">
                        <i class="bi bi-chevron-down mb-3"></i>
                    </button>
                </div>

                <div class="user-search">
                    <input v-model="searchQuery" placeholder="Cari pengguna..." type="text" @focus="showUsers = true">
                </div>

                <div class="conversations-list">
                    <!-- Active Users / Contacts -->
                    <template v-if="showUsers && searchQuery">
                        <div v-for="user in filteredUsers" :key="user.id" class="conversation-item"
                            @click="openConversation(user.id)">
                            <div class="avatar">
                                <i class="bi bi-person-fill"></i>
                            </div>
                            <div class="conv-info">
                                <span class="conv-name">{{ user.name }}</span>
                                <span class="conv-role">{{ user.role }}</span>
                            </div>
                        </div>
                    </template>

                    <template v-else>
                        <div v-if="chatStore.conversations.length === 0" class="empty-chat">
                            <p>Belum ada percakapan</p>
                            <button @click="showUsers = true; searchQuery = ''"
                                class="btn btn-sm btn-outline-primary mt-2">Mulai Chat Baru</button>
                        </div>

                        <div v-for="conv in chatStore.conversations" :key="conv.partner.id" class="conversation-item"
                            @click="openConversation(conv.partner.id)">
                            <div class="avatar">
                                <i class="bi bi-person-fill"></i>
                            </div>
                            <div class="conv-info">
                                <div class="conv-top">
                                    <span class="conv-name">{{ conv.partner.name }}</span>
                                    <span class="conv-time" v-if="conv.lastMessage">{{
                                        formatTime(conv.lastMessage.created_at) }}</span>
                                </div>
                                <div class="conv-bottom">
                                    <span class="conv-last-msg text-truncate">
                                        {{ conv.lastMessage?.message || 'Memulai percakapan' }}</span>
                                    <span v-if="conv.unreadCount > 0" class="badge-unread">{{ conv.unreadCount }}</span>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Active Chat Window -->
            <ChatWindow v-else :partnerId="chatStore.activePartnerId" @close="chatStore.closeChat()" />

        </div>

        <!-- Floating Trigger Button -->
        <button class="chat-trigger-btn" @click="toggleChat">
            <div class="trigger-icon">
                <i class="bi" :class="isOpen || chatStore.isChatOpen ? 'bi-x' : 'bi-chat-dots-fill'"></i>
            </div>
            <span v-if="chatStore.unreadCount > 0 && !isOpen" class="main-badge-unread">{{ chatStore.unreadCount
                }}</span>
        </button>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import ChatWindow from './ChatWindow.vue';

const authStore = useAuthStore();
const chatStore = useChatStore();

const isOpen = ref(false);
const showUsers = ref(false);
const searchQuery = ref('');

const filteredUsers = computed(() => {
    if (!searchQuery.value) return chatStore.users;
    return chatStore.users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
})

const toggleChat = () => {
    if (chatStore.isChatOpen) {
        chatStore.closeChat();
        isOpen.value = true; // Keep list open
    } else {
        isOpen.value = !isOpen.value;
    }

    // Load conversations when opening
    if (isOpen.value) {
        chatStore.fetchConversations();
        chatStore.fetchUsers();
    }
};

const openConversation = (partnerId) => {
    chatStore.openChat(partnerId);
    showUsers.value = false;
    searchQuery.value = '';
};

const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
    // Init socket connection
    if (authStore.isLoggedIn) {
        chatStore.init();
    }
});
</script>

<style scoped>
.chat-widget-container {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.chat-trigger-btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--gradient-primary);
    border: none;
    color: white;
    font-size: 1.75rem;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all var(--transition-normal);
}

.chat-trigger-btn:hover {
    transform: scale(1.1);
}

.main-badge-unread {
    position: absolute;
    top: 0;
    right: 0;
    background: var(--danger);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--bg-main);
}

.chat-popup {
    width: 350px;
    height: 500px;
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    margin-bottom: 1rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);

    /* Transition state */
    transform-origin: bottom right;
    transform: scale(0);
    opacity: 0;
    transition: all var(--transition-normal);
    pointer-events: none;
}

.chat-popup.open {
    transform: scale(1);
    opacity: 1;
    pointer-events: all;
}

/* Conversation List Styles */
.conversation-list-view {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.popup-header {
    padding: 1rem;
    background: var(--primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.popup-header h3 {
    margin: 0;
    font-size: 1.1rem;
}

.btn-close-popup {
    background: none;
    border: none;
    color: white;
    font-size: 1.25rem;
    cursor: pointer;
}

.user-search {
    padding: 0.75rem;
    background: var(--bg-darker);
    border-bottom: 1px solid var(--border-color);
}

.user-search input {
    width: 100%;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-primary);
}

.conversations-list {
    flex: 1;
    overflow-y: auto;
}

.conversation-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background var(--transition-fast);
    border-bottom: 1px solid var(--border-color);
}

.conversation-item:hover {
    background: rgba(255, 255, 255, 0.05);
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--bg-darker);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
}

.conv-info {
    flex: 1;
    min-width: 0;
}

.conv-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
}

.conv-name {
    font-weight: 600;
    font-size: 0.9rem;
}

.conv-time {
    font-size: 0.75rem;
    color: var(--text-muted);
}

.conv-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.conv-last-msg {
    font-size: 0.8rem;
    color: var(--text-muted);
    max-width: 80%;
}

.badge-unread {
    background: var(--danger);
    color: white;
    font-size: 0.7rem;
    padding: 0.1rem 0.4rem;
    border-radius: 1rem;
}

.empty-chat {
    text-align: center;
    padding: 2rem;
    color: var(--text-muted);
}
</style>
