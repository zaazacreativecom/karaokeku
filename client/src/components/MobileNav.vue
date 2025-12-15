<template>
    <nav class="mobile-nav">
        <div class="mobile-nav-items">
            <router-link to="/dashboard" class="mobile-nav-item" :class="{ active: isActive('/dashboard') }">
                <i class="bi bi-house-fill"></i>
                <span>Home</span>
            </router-link>

            <router-link to="/karaoke" class="mobile-nav-item" :class="{ active: isActive('/karaoke') }">
                <i class="bi bi-mic-fill"></i>
                <span>Karaoke</span>
            </router-link>

            <router-link to="/songs" class="mobile-nav-item" :class="{ active: $route.path === '/songs' }">
                <i class="bi bi-music-note-list"></i>
                <span>Lagu</span>
            </router-link>

            <!-- Chat Item -->
            <a href="#" class="mobile-nav-item" @click.prevent="chatStore.toggleWidget"
                :class="{ active: chatStore.isWidgetOpen }">
                <div class="icon-wrapper">
                    <i class="bi bi-chat-dots-fill"></i>
                    <span v-if="chatStore.unreadCount > 0" class="mobile-badge">{{ chatStore.unreadCount }}</span>
                </div>
                <span>Chat</span>
            </a>

            <router-link to="/playlists" class="mobile-nav-item" :class="{ active: $route.path === '/playlists' }">
                <i class="bi bi-collection-play-fill"></i>
                <span>Playlist</span>
            </router-link>

            <router-link to="/request" class="mobile-nav-item" :class="{ active: isActive('/request') }">
                <i class="bi bi-plus-circle-fill"></i>
                <span>Request</span>
            </router-link>
        </div>
    </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'

const route = useRoute()
const chatStore = useChatStore()

const isActive = (path) => {
    if (path === '/karaoke') {
        return route.path.startsWith('/karaoke')
    }
    return route.path === path
}
</script>

<style scoped>
/* Styles defined in main.css for .mobile-nav */
.mobile-nav {
    z-index: 3000;
    /* Ensure it stays above chat overlay */
    position: fixed;
    /* Ensure it defines stacking context */
}

.icon-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
}

.mobile-badge {
    position: absolute;
    top: -5px;
    right: -8px;
    background: var(--danger);
    color: white;
    font-size: 0.6rem;
    padding: 2px 4px;
    border-radius: 10px;
    min-width: 14px;
    text-align: center;
    line-height: 1;
}
</style>
