<template>
    <div class="chat-bubble" :class="{ 'mine': isMine }">
        <div class="bubble-content">
            <p>{{ message.message }}</p>
            <span class="bubble-time">{{ formatTime(message.created_at) }}</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
    message: {
        type: Object,
        required: true
    }
});

const authStore = useAuthStore();
const isMine = computed(() => props.message.sender_id === authStore.user?.id);

const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.chat-bubble {
    display: flex;
    margin-bottom: 0.5rem;
}

.chat-bubble.mine {
    justify-content: flex-end;
}

.bubble-content {
    max-width: 70%;
    padding: 0.5rem 1rem;
    border-radius: 1rem;
    background: var(--bg-card);
    color: var(--text-primary);
    position: relative;
}

.chat-bubble.mine .bubble-content {
    background: var(--primary);
    color: white;
    border-bottom-right-radius: 0.25rem;
}

.chat-bubble:not(.mine) .bubble-content {
    background: var(--bg-darker);
    border-bottom-left-radius: 0.25rem;
}

.bubble-content p {
    margin: 0;
    word-wrap: break-word;
}

.bubble-time {
    font-size: 0.65rem;
    opacity: 0.7;
    display: block;
    text-align: right;
    margin-top: 0.25rem;
}
</style>
