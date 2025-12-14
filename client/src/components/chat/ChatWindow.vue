<template>
    <div class="chat-window">
        <!-- Header -->
        <div class="chat-header">
            <div class="user-info">
                <div class="avatar">
                    <i class="bi bi-person-fill"></i>
                </div>
                <div class="details">
                    <span class="name">{{ partner?.name || 'Unknown' }}</span>
                    <span class="status">{{ isOnline ? 'Online' : 'Offline' }}</span>
                </div>
            </div>
            <button class="btn-close-chat" @click="$emit('close')">
                <i class="bi bi-x mb-2"></i>
            </button>
        </div>

        <!-- Messages -->
        <div class="chat-messages" ref="messagesContainer">
            <div v-if="loading" class="text-center p-3">
                <span class="spinner-border spinner-border-sm"></span>
            </div>
            <template v-else>
                <ChatBubble v-for="msg in messages" :key="msg.id" :message="msg" />
            </template>
        </div>

        <!-- Input -->
        <div class="chat-input">
            <form @submit.prevent="sendMessage">
                <input v-model="newMessage" type="text" placeholder="Ketik pesan..." :disabled="sending">
                <button type="submit" :disabled="!newMessage.trim() || sending">
                    <i class="bi bi-send-fill"></i>
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { useChatStore } from '@/stores/chat';
import ChatBubble from './ChatBubble.vue';

const props = defineProps({
    partnerId: {
        type: Number,
        required: true
    }
});

defineEmits(['close']);

const chatStore = useChatStore();
const newMessage = ref('');
const messagesContainer = ref(null);
const sending = ref(false);
const loading = ref(true);

const messages = computed(() => chatStore.messages);
const partner = computed(() => {
    // Try to find partner info from conversations or users list
    const conv = chatStore.conversations.find(c => c.partner.id === props.partnerId);
    if (conv) return conv.partner;

    return chatStore.users.find(u => u.id === props.partnerId);
});

// Mock online status for now (socket logic handles this but simpler for UI first)
const isOnline = ref(true);

const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
};

const sendMessage = async () => {
    if (!newMessage.value.trim()) return;

    sending.value = true;
    const success = await chatStore.sendMessage(newMessage.value);
    sending.value = false;

    if (success) {
        newMessage.value = '';
        scrollToBottom();
    }
};

onMounted(async () => {
    loading.value = true;
    await chatStore.fetchMessages(props.partnerId);
    loading.value = false;
    scrollToBottom();
});

watch(() => chatStore.messages.length, () => {
    scrollToBottom();
});
</script>

<style scoped>
.chat-window {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-card);
}

.chat-header {
    padding: 0.75rem;
    background: var(--primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top-left-radius: var(--radius-lg);
    border-top-right-radius: var(--radius-lg);
}

.user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.avatar {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.details {
    display: flex;
    flex-direction: column;
}

.name {
    font-weight: 600;
    font-size: 0.9rem;
}

.status {
    font-size: 0.7rem;
    opacity: 0.8;
}

.btn-close-chat {
    background: none;
    border: none;
    color: white;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0;
}

.chat-messages {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    background: var(--bg-main);
    display: flex;
    flex-direction: column;
}

.chat-input {
    padding: 0.75rem;
    background: var(--bg-card);
    border-top: 1px solid var(--border-color);
}

.chat-input form {
    display: flex;
    gap: 0.5rem;
}

.chat-input input {
    flex: 1;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    border: 1px solid var(--border-color);
    background: var(--bg-darker);
    color: var(--text-primary);
    outline: none;
}

.chat-input input:focus {
    border-color: var(--primary);
}

.chat-input button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.chat-input button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.chat-input button:not(:disabled):hover {
    transform: scale(1.05);
}
</style>
