<template>
  <div class="page-layout">
    <aside class="dashboard-sidebar">
      <!-- Sidebar sama seperti Dashboard -->
      <div class="sidebar-header">
        <router-link to="/dashboard" class="brand">
          <i class="bi bi-music-note-beamed"></i>
          <span>Karaoke<span class="text-gradient">Ku</span></span>
        </router-link>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item"><i class="bi bi-grid-1x2-fill"></i><span>Dashboard</span></router-link>
        <router-link to="/karaoke" class="nav-item"><i class="bi bi-mic-fill"></i><span>Karaoke</span></router-link>
        <router-link to="/songs" class="nav-item active"><i class="bi bi-music-note-list"></i><span>Pilih Lagu</span></router-link>
        <router-link to="/playlists" class="nav-item"><i class="bi bi-collection-play-fill"></i><span>Playlist Saya</span></router-link>
        <router-link to="/upload" class="nav-item"><i class="bi bi-cloud-upload-fill"></i><span>Upload Lagu</span></router-link>
        <router-link to="/history" class="nav-item"><i class="bi bi-clock-history"></i><span>Riwayat & Score</span></router-link>
      </nav>
    </aside>

    <main class="page-main">
      <div class="page-content">
        <div class="page-header">
          <h1><i class="bi bi-music-note-list me-2"></i>Pilih Lagu</h1>
          <p class="text-muted">Cari dan pilih lagu untuk karaoke</p>
        </div>

        <!-- Search & Filters -->
        <div class="filters-bar">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" v-model="searchQuery" @input="debouncedSearch" placeholder="Cari judul atau artis..." class="form-control" />
          </div>
          <select v-model="filterGenre" @change="fetchSongs" class="form-select">
            <option value="">Semua Genre</option>
            <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
          </select>
          <select v-model="filterLanguage" @change="fetchSongs" class="form-select">
            <option value="">Semua Bahasa</option>
            <option v-for="l in languages" :key="l" :value="l">{{ l }}</option>
          </select>
        </div>

        <!-- Songs Grid -->
        <div class="songs-grid">
          <div v-for="song in songs" :key="song.id" class="song-card">
            <div class="song-thumbnail">
              <i class="bi bi-music-note-beamed"></i>
              <div class="song-overlay">
                <button class="btn-play-song" @click="playSong(song)">
                  <i class="bi bi-play-fill"></i>
                </button>
              </div>
            </div>
            <div class="song-info">
              <h4>{{ song.title }}</h4>
              <p>{{ song.artist }}</p>
              <div class="song-meta">
                <span v-if="song.genre"><i class="bi bi-tag"></i> {{ song.genre }}</span>
                <span><i class="bi bi-play-fill"></i> {{ song.play_count || 0 }}</span>
              </div>
            </div>
            <div class="song-actions">
              <button class="btn btn-primary btn-sm" @click="playSong(song)">
                <i class="bi bi-play-fill"></i> Play
              </button>
              <button class="btn btn-ghost btn-sm" @click="showAddToPlaylist(song)">
                <i class="bi bi-plus-lg"></i>
              </button>
            </div>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner-border text-primary"></div>
        </div>

        <div v-if="!loading && songs.length === 0" class="empty-state">
          <i class="bi bi-music-note"></i>
          <p>Tidak ada lagu ditemukan</p>
        </div>

        <!-- Load More -->
        <div v-if="hasMore && !loading" class="load-more">
          <button class="btn btn-outline-primary" @click="loadMore">
            Muat Lebih Banyak
          </button>
        </div>
      </div>
    </main>

    <!-- Add to Playlist Modal -->
    <div v-if="showPlaylistModal" class="modal-overlay" @click.self="showPlaylistModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Tambah ke Playlist</h3>
          <button @click="showPlaylistModal = false"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-body">
          <div v-if="playlists.length > 0">
            <div v-for="pl in playlists" :key="pl.id" class="playlist-option" @click="addToPlaylist(pl.id)">
              <i class="bi bi-collection-play"></i>
              <span>{{ pl.name }}</span>
              <span class="song-count">{{ pl.songCount || 0 }} lagu</span>
            </div>
          </div>
          <div v-else class="empty-playlists">
            <p>Belum ada playlist</p>
            <router-link to="/playlists" class="btn btn-primary btn-sm">Buat Playlist</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { usePlaylistStore } from '@/stores/playlist'
import { songsAPI } from '@/services/api'

const router = useRouter()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()

const songs = ref([])
const genres = ref([])
const languages = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filterGenre = ref('')
const filterLanguage = ref('')
const page = ref(1)
const hasMore = ref(false)
const showPlaylistModal = ref(false)
const selectedSong = ref(null)
const playlists = ref([])

let searchTimeout = null

const fetchSongs = async (reset = true) => {
  loading.value = true
  if (reset) page.value = 1

  try {
    const response = await songsAPI.getAll({
      search: searchQuery.value,
      genre: filterGenre.value,
      language: filterLanguage.value,
      page: page.value,
      limit: 20
    })

    if (reset) {
      songs.value = response.data.data || []
    } else {
      songs.value.push(...(response.data.data || []))
    }

    hasMore.value = response.data.meta?.hasNextPage || false
  } catch (error) {
    console.error('Error fetching songs:', error)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchSongs(), 300)
}

const loadMore = () => {
  page.value++
  fetchSongs(false)
}

const fetchFilters = async () => {
  try {
    const [g, l] = await Promise.all([songsAPI.getGenres(), songsAPI.getLanguages()])
    genres.value = g.data.data || []
    languages.value = l.data.data || []
  } catch (e) {
    console.error(e)
  }
}

const playSong = (song) => {
  router.push(`/karaoke/${song.id}`)
}

const showAddToPlaylist = async (song) => {
  selectedSong.value = song
  await playlistStore.fetchPlaylists()
  playlists.value = playlistStore.playlists
  showPlaylistModal.value = true
}

const addToPlaylist = async (playlistId) => {
  if (!selectedSong.value) return
  const result = await playlistStore.addSongToPlaylist(playlistId, selectedSong.value.id)
  if (result.success) {
    showPlaylistModal.value = false
  }
}

onMounted(() => {
  fetchSongs()
  fetchFilters()
})
</script>

<style scoped>
.page-layout { display: flex; min-height: 100vh; }
.dashboard-sidebar { width: 260px; background: var(--bg-card); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; }
.sidebar-header { padding: 1.5rem; border-bottom: 1px solid var(--border-color); }
.brand { display: flex; align-items: center; gap: 0.75rem; font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
.brand i { font-size: 1.5rem; color: var(--primary); }
.sidebar-nav { flex: 1; padding: 1rem; }
.nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: var(--text-secondary); border-radius: var(--radius-md); margin-bottom: 0.25rem; transition: all var(--transition-fast); }
.nav-item:hover { color: var(--text-primary); background: rgba(255,255,255,0.05); }
.nav-item.active { color: white; background: var(--gradient-primary); }
.page-main { flex: 1; margin-left: 260px; }
.page-content { padding: 2rem; max-width: 1400px; }
.page-header { margin-bottom: 2rem; }
.page-header h1 { margin: 0; }
.filters-bar { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
.search-box { flex: 1; min-width: 250px; position: relative; }
.search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
.search-box input { padding-left: 2.5rem; }
.filters-bar select { width: 180px; }
.songs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }
.song-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; transition: all var(--transition-normal); }
.song-card:hover { border-color: var(--primary); transform: translateY(-4px); }
.song-thumbnail { height: 140px; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; font-size: 3rem; position: relative; }
.song-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity var(--transition-fast); }
.song-card:hover .song-overlay { opacity: 1; }
.btn-play-song { width: 56px; height: 56px; border-radius: 50%; background: var(--primary); border: none; color: white; font-size: 1.5rem; cursor: pointer; }
.song-info { padding: 1rem; }
.song-info h4 { font-size: 1rem; margin: 0 0 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.song-info p { font-size: 0.875rem; color: var(--text-muted); margin: 0; }
.song-meta { display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-muted); }
.song-actions { padding: 0 1rem 1rem; display: flex; gap: 0.5rem; }
.loading-state, .empty-state { text-align: center; padding: 3rem; color: var(--text-muted); }
.empty-state i { font-size: 3rem; display: block; margin-bottom: 1rem; }
.load-more { text-align: center; margin-top: 2rem; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 200; display: flex; align-items: center; justify-content: center; }
.modal-content { background: var(--bg-card); border-radius: var(--radius-lg); width: 90%; max-width: 400px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.modal-header h3 { margin: 0; }
.modal-header button { background: none; border: none; color: var(--text-muted); cursor: pointer; }
.modal-body { padding: 1rem; max-height: 300px; overflow-y: auto; }
.playlist-option { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: var(--radius-sm); cursor: pointer; transition: background var(--transition-fast); }
.playlist-option:hover { background: rgba(255,255,255,0.05); }
.playlist-option .song-count { margin-left: auto; font-size: 0.8rem; color: var(--text-muted); }
.empty-playlists { text-align: center; padding: 1rem; }
</style>
