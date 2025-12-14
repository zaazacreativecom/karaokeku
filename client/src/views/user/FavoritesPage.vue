<template>
    <div class="page-layout">
        <aside class="dashboard-sidebar">
            <!-- Sidebar sama seperti Dashboard (nanti kita buat component sidebar terpisah agar lebih DRY) -->
            <div class="sidebar-header">
                <router-link to="/dashboard" class="brand">
                    <i class="bi bi-music-note-beamed"></i>
                    <span>Karaoke<span class="text-gradient">Ku</span></span>
                </router-link>
            </div>
            <nav class="sidebar-nav">
                <router-link to="/dashboard" class="nav-item"><i
                        class="bi bi-grid-1x2-fill"></i><span>Dashboard</span></router-link>
                <router-link to="/karaoke" class="nav-item"><i
                        class="bi bi-mic-fill"></i><span>Karaoke</span></router-link>
                <router-link to="/songs" class="nav-item"><i class="bi bi-music-note-list"></i><span>Pilih
                        Lagu</span></router-link>
                <router-link to="/favorites" class="nav-item active"><i class="bi bi-heart-fill"></i><span>Lagu
                        Favorit</span></router-link>
                <router-link to="/playlists" class="nav-item"><i class="bi bi-collection-play-fill"></i><span>Playlist
                        Saya</span></router-link>
                <router-link to="/upload" class="nav-item"><i class="bi bi-cloud-upload-fill"></i><span>Upload
                        Lagu</span></router-link>
                <router-link to="/history" class="nav-item"><i class="bi bi-clock-history"></i><span>Riwayat &
                        Score</span></router-link>
                <router-link to="/request" class="nav-item"><i class="bi bi-plus-circle-fill"></i><span>Request
                        Lagu</span></router-link>
                <router-link to="/donation" class="nav-item"><i
                        class="bi bi-heart-fill"></i><span>Donasi</span></router-link>
                <div class="nav-divider"></div>
                <router-link to="/settings" class="nav-item"><i
                        class="bi bi-gear-fill"></i><span>Pengaturan</span></router-link>
            </nav>
        </aside>

        <main class="page-main">
            <div class="page-content">
                <div class="page-header">
                    <h1><i class="bi bi-heart-fill me-2 text-danger"></i>Lagu Favorit Saya</h1>
                    <p class="text-muted">Daftar lagu yang Anda sukai</p>
                </div>

                <div class="songs-grid" v-if="!favoriteStore.loading && favoriteStore.favorites.length > 0">
                    <div v-for="song in favoriteStore.favorites" :key="song.id" class="song-card">
                        <div class="song-thumbnail">
                            <img v-if="getThumbnailUrl(song)" :src="getThumbnailUrl(song)" :alt="song.title"
                                loading="lazy" />
                            <div v-else class="thumbnail-placeholder">
                                <i class="bi bi-music-note-beamed"></i>
                            </div>
                            <div class="song-overlay">
                                <button class="btn-play-song" @click="playSong(song)">
                                    <i class="bi bi-play-fill"></i>
                                </button>
                            </div>
                            <button class="btn-favorite active" @click.stop="toggleFavorite(song)">
                                <i class="bi bi-heart-fill"></i>
                            </button>
                        </div>
                        <div class="song-info">
                            <h4>{{ song.title }}</h4>
                            <p>{{ song.artist }}</p>
                            <div class="song-meta">
                                <span v-if="song.genre"><i class="bi bi-tag"></i> {{ song.genre }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="favoriteStore.loading" class="loading-state">
                    <div class="spinner-border text-primary"></div>
                </div>

                <div v-if="!favoriteStore.loading && favoriteStore.favorites.length === 0" class="empty-state">
                    <i class="bi bi-heart-break"></i>
                    <p>Belum ada lagu favorit</p>
                    <router-link to="/songs" class="btn btn-primary mt-3">Cari Lagu</router-link>
                </div>
            </div>
        </main>
        <MobileNav />
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favorite'
import { getThumbnailUrl } from '@/utils/media'
import MobileNav from '@/components/MobileNav.vue'

const router = useRouter()
const favoriteStore = useFavoriteStore()

const playSong = (song) => {
    router.push(`/karaoke/${song.id}`)
}

const toggleFavorite = async (song) => {
    await favoriteStore.toggleFavorite(song.id)
    // Refresh list
    favoriteStore.fetchFavorites()
}

onMounted(() => {
    favoriteStore.fetchFavorites()
})
</script>

<style scoped>
.page-layout {
    display: flex;
    min-height: 100vh;
}

.dashboard-sidebar {
    width: 260px;
    background: var(--bg-card);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 100;
}

.sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
}

.brand i {
    font-size: 1.5rem;
    color: var(--primary);
}

.sidebar-nav {
    flex: 1;
    padding: 1rem;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: var(--text-secondary);
    border-radius: var(--radius-md);
    margin-bottom: 0.25rem;
    transition: all var(--transition-fast);
}

.nav-item:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
    color: white;
    background: var(--gradient-primary);
}

.page-main {
    flex: 1;
    margin-left: 260px;
}

.page-content {
    padding: 2rem;
    max-width: 1400px;
}

.page-header {
    margin-bottom: 2rem;
}

.songs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
}

.song-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: all var(--transition-normal);
}

.song-card:hover {
    border-color: var(--primary);
    transform: translateY(-4px);
}

.song-thumbnail {
    width: 100%;
    aspect-ratio: 16/9;
    height: auto;
    background: var(--bg-darker);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: var(--text-muted);
    position: relative;
    overflow: hidden;
}

.song-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.thumbnail-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-darker);
}

.song-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity var(--transition-fast);
}

.song-card:hover .song-overlay {
    opacity: 1;
}

.btn-play-song {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--primary);
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
}

.btn-favorite {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all var(--transition-fast);
}

.btn-favorite:hover,
.btn-favorite.active {
    background: var(--primary);
    transform: scale(1.1);
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--text-muted);
}

.empty-state i {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
}
</style>
