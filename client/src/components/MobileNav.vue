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
            <router-link to="/favorites" class="mobile-nav-item" :class="{ active: $route.path === '/favorites' }">
                <i class="bi bi-heart-fill"></i>
                <span>Favorit</span>
            </router-link>
            <router-link to="/playlists" class="mobile-nav-item" :class="{ active: $route.path === '/playlists' }">
                <i class="bi bi-collection-play-fill"></i>
                <span>Playlist</span>
            </router-link>

            <router-link to="/request" class="mobile-nav-item" :class="{ active: isActive('/request') }">
                <i class="bi bi-plus-circle-fill"></i>
                <span>Request</span>
            </router-link>

            <router-link to="/donation" class="mobile-nav-item" :class="{ active: isActive('/donation') }">
                <i class="bi bi-heart-fill"></i>
                <span>Donasi</span>
            </router-link>
        </div>
    </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const isActive = (path) => {
    if (path === '/karaoke') {
        return route.path.startsWith('/karaoke')
    }
    return route.path === path
}
</script>

<style scoped>
/* Styles defined in main.css for .mobile-nav */
</style>
