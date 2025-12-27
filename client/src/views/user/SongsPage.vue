<template>
  <div class="page-layout">
    <!-- Background (decorative) -->
    <div class="page-bg" aria-hidden="true">
      <div class="bg-mesh"></div>
      <div class="bg-particles"></div>
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
    </div>

    <aside class="dashboard-sidebar">
      <!-- Sidebar sama seperti Dashboard -->
      <div class="sidebar-header">
        <router-link to="/dashboard" class="brand">
          <i class="bi bi-music-note-beamed"></i>
          <span>Karaoke<span class="text-gradient">Ku</span></span>
        </router-link>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item"><i
            class="bi bi-grid-1x2-fill"></i><span>Dashboard</span></router-link>
        <router-link to="/karaoke" class="nav-item"><i class="bi bi-mic-fill"></i><span>Karaoke</span></router-link>
        <router-link to="/songs" class="nav-item active"><i class="bi bi-music-note-list"></i><span>Pilih
            Lagu</span></router-link>
        <router-link to="/favorites" class="nav-item"><i class="bi bi-heart-fill"></i><span>Lagu
            Favorit</span></router-link>
        <router-link to="/playlists" class="nav-item"><i class="bi bi-collection-play-fill"></i><span>Playlist
            Saya</span></router-link>
        <router-link to="/upload" class="nav-item"><i class="bi bi-cloud-upload-fill"></i><span>Upload
            Lagu</span></router-link>
        <router-link to="/history" class="nav-item"><i class="bi bi-clock-history"></i><span>Riwayat &
            Score</span></router-link>
        <router-link to="/request" class="nav-item"><i class="bi bi-plus-circle-fill"></i><span>Request
            Lagu</span></router-link>
        <router-link to="/donation" class="nav-item"><i class="bi bi-heart-fill"></i><span>Donasi</span></router-link>
        <div class="nav-divider"></div>
        <router-link to="/settings" class="nav-item"><i
            class="bi bi-gear-fill"></i><span>Pengaturan</span></router-link>
      </nav>
    </aside>

    <main class="page-main">
      <div class="page-content">
        <!-- Mobile Topbar (sidebar hidden by global CSS) -->
        <div class="mobile-topbar">
          <router-link to="/dashboard" class="brand brand--compact">
            <i class="bi bi-music-note-beamed"></i>
            <span>Karaoke<span class="text-gradient">Ku</span></span>
          </router-link>
          <div class="mobile-topbar__actions">
            <button class="icon-btn" type="button" @click="focusSearch" aria-label="Cari lagu">
              <i class="bi bi-search"></i>
            </button>
            <button class="icon-btn" type="button" :class="{ active: mobileFiltersOpen }"
              @click="mobileFiltersOpen = !mobileFiltersOpen" aria-label="Filter">
              <i class="bi bi-sliders"></i>
            </button>
          </div>
        </div>

        <!-- Hero -->
        <section class="hero reveal" style="--d: 0ms">
          <div class="hero__content">
            <div class="hero__badge">
              <i class="bi bi-music-note-list"></i>
              <span>Pilih Lagu</span>
            </div>
            <h1>
              Temukan lagu <span class="text-gradient">favoritmu</span>
            </h1>
            <p class="hero__sub text-white">
              Cari judul atau artis, filter genre & bahasa, lalu mulai karaoke dalam 1 klik.
            </p>

            <div class="hero__stats">
              <div class="stat-pill">
                <i class="bi bi-music-note"></i>
                <span>{{ totalLabel }}</span>
              </div>
              <div v-if="activeFilterCount > 0" class="stat-pill stat-pill--soft">
                <i class="bi bi-funnel"></i>
                <span>{{ activeFilterCount }} filter aktif</span>
              </div>
              <button v-if="hasActiveFilters" class="btn btn-ghost btn-sm btn-reset" @click="clearFilters">
                <i class="bi bi-x-circle me-1"></i>
                Reset
              </button>
            </div>
          </div>

          <div class="hero__art">
            <div class="hero-card hero-card--primary">
              <div class="hero-card__icon">
                <i class="bi bi-play-circle-fill"></i>
              </div>
              <div class="hero-card__title">Mulai cepat</div>
              <div class="hero-card__text">Klik Play di kartu lagu, atau buka mode Karaoke.</div>
              <router-link to="/karaoke" class="btn btn-primary btn-sm hero-card__btn">
                <i class="bi bi-mic-fill"></i>
                Karaoke
              </router-link>
            </div>

            <div class="hero-card hero-card--soft">
              <div class="hero-card__icon">
                <i class="bi bi-heart-fill"></i>
              </div>
              <div class="hero-card__title">Favorit</div>
              <div class="hero-card__text">Simpan lagu yang sering kamu nyanyikan.</div>
              <router-link to="/favorites" class="btn btn-ghost btn-sm hero-card__btn">
                <i class="bi bi-heart"></i>
                Lihat
              </router-link>
            </div>
          </div>
        </section>

        <!-- Search & Filters -->
        <section class="filters-card reveal" style="--d: 120ms">
          <div class="filters-top">
            <div class="search-box">
              <i class="bi bi-search"></i>
              <input ref="searchInputRef" type="text" v-model="searchQuery" @input="debouncedSearch"
                placeholder="Cari judul atau artis..." class="form-control" />
              <button v-if="searchQuery" class="search-clear" type="button" @click="clearSearch"
                aria-label="Hapus pencarian">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <button class="btn btn-primary btn-sm btn-mobile-filters" type="button"
              @click="mobileFiltersOpen = !mobileFiltersOpen">
              <i class="bi bi-sliders"></i>
              Filter
            </button>
          </div>

          <div class="filters-row" :class="{ open: mobileFiltersOpen }">
            <div class="filter-field">
              <label class="filter-label">Genre</label>
              <select v-model="filterGenre" @change="fetchSongs" class="form-select">
                <option value="">Semua Genre</option>
                <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
            <div class="filter-field">
              <label class="filter-label">Bahasa</label>
              <select v-model="filterLanguage" @change="fetchSongs" class="form-select">
                <option value="">Semua Bahasa</option>
                <option v-for="l in languages" :key="l" :value="l">{{ l }}</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Songs Grid -->
        <div v-if="loading && songs.length === 0" class="songs-grid songs-grid--skeleton" aria-hidden="true">
          <div v-for="n in 10" :key="n" class="song-card song-card--skeleton">
            <div class="song-thumbnail">
              <div class="skeleton-media loading-skeleton"></div>
            </div>
            <div class="song-info">
              <div class="skeleton-line loading-skeleton"></div>
              <div class="skeleton-line skeleton-line--sm loading-skeleton"></div>
              <div class="skeleton-row">
                <div class="skeleton-pill loading-skeleton"></div>
                <div class="skeleton-pill loading-skeleton"></div>
              </div>
            </div>
            <div class="song-actions">
              <div class="skeleton-btn loading-skeleton"></div>
              <div class="skeleton-btn skeleton-btn--icon loading-skeleton"></div>
            </div>
          </div>
        </div>

        <div v-else class="songs-grid">
          <div v-for="(song, idx) in songs" :key="song.id" class="song-card reveal"
            :style="{ '--d': `${Math.min(idx * 35, 280)}ms` }">
            <div class="song-thumbnail">
              <img v-if="getThumbnailUrl(song)" :src="getThumbnailUrl(song)" :alt="song.title" loading="lazy" />
              <div v-else class="thumbnail-placeholder">
                <i class="bi bi-music-note-beamed"></i>
              </div>

              <div class="song-overlay">
                <button class="btn-play-song" @click="playSong(song)" :aria-label="`Play ${song.title}`">
                  <i class="bi bi-play-fill"></i>
                </button>
              </div>

              <!-- Favorite Button -->
              <button class="btn-favorite" :class="{ active: favoriteStore.isFavorite(song.id) }"
                @click.stop="toggleFavorite(song)"
                :aria-label="favoriteStore.isFavorite(song.id) ? 'Hapus dari favorit' : 'Tambah ke favorit'">
                <i :class="favoriteStore.isFavorite(song.id) ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
              </button>
            </div>
            <div class="song-info">
              <h4 :title="toCamelCase(song.title)">{{ toCamelCase(song.title) }}</h4>
              <p :title="toCamelCase(song.artist)">{{ toCamelCase(song.artist) }}</p>
              <div class="song-meta">
                <span v-if="song.genre" class="meta-pill"><i class="bi bi-tag"></i> {{ toCamelCase(song.genre) }}</span>
                <span class="meta-pill meta-pill--soft"><i class="bi bi-play-fill"></i> {{ song.play_count || 0
                  }}</span>
              </div>
            </div>
            <div class="song-actions">
              <button class="btn btn-primary btn-sm" @click="playSong(song)">
                <i class="bi bi-play-fill"></i> Play
              </button>
              <button class="btn btn-ghost btn-sm btn-icon" @click="showAddToPlaylist(song)"
                aria-label="Tambah ke playlist">
                <i class="bi bi-plus-lg"></i>
              </button>
            </div>
          </div>
        </div>

        <div v-if="loading && songs.length > 0" class="loading-more">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <span class="text-muted">Memuat lagi...</span>
        </div>

        <div v-if="!loading && songs.length === 0" class="empty-state">
          <i class="bi bi-music-note"></i>
          <p>Tidak ada lagu ditemukan</p>
        </div>

        <!-- Infinite Scroll Sentinel -->
        <div ref="sentinelRef" class="infinite-sentinel" aria-hidden="true"></div>

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

    <!-- Mobile Navigation -->
    <MobileNav />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaylistStore } from '@/stores/playlist'
import { useFavoriteStore } from '@/stores/favorite'
import { songsAPI } from '@/services/api'
import MobileNav from '@/components/MobileNav.vue'
import { getThumbnailUrl } from '@/utils/media'

const router = useRouter()
const playlistStore = usePlaylistStore()
const favoriteStore = useFavoriteStore()

const toCamelCase = (value) => {
  if (value === null || value === undefined) return ''
  const input = String(value).trim()
  if (!input) return ''

  return input
    .replace(/_/g, ' ')
    .split(/\s+/g)
    .filter(Boolean)
    .map((word) =>
      word
        .split('-')
        .filter(Boolean)
        .map((part) => {
          const clean = part.trim()
          if (!clean) return ''
          if (/\d/.test(clean)) return clean.toUpperCase()
          if (clean === clean.toUpperCase() && clean.length <= 2) return clean
          const lower = clean.toLowerCase()
          return lower.charAt(0).toUpperCase() + lower.slice(1)
        })
        .join('-')
    )
    .join(' ')
}

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
const totalSongs = ref(0)
const mobileFiltersOpen = ref(false)
const searchInputRef = ref(null)
const sentinelRef = ref(null)

let searchTimeout = null
let infiniteObserver = null

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
    totalSongs.value = response.data.meta?.total || 0
  } catch (error) {
    console.error('Error fetching songs:', error)
  } finally {
    loading.value = false
    requestAnimationFrame(() => {
      maybeAutoLoadMore()
    })
  }
}

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchSongs(), 300)
}

const focusSearch = () => {
  nextTick(() => {
    if (searchInputRef.value) searchInputRef.value.focus()
  })
}

const clearSearch = () => {
  clearTimeout(searchTimeout)
  searchQuery.value = ''
  fetchSongs()
  focusSearch()
}

const activeFilterCount = computed(() => {
  let count = 0
  if (searchQuery.value.trim()) count += 1
  if (filterGenre.value) count += 1
  if (filterLanguage.value) count += 1
  return count
})

const hasActiveFilters = computed(() => activeFilterCount.value > 0)

const totalLabel = computed(() => {
  if (loading.value && songs.value.length === 0) return 'Memuat lagu...'
  if (totalSongs.value > 0) return `Menampilkan ${songs.value.length} dari ${totalSongs.value} lagu`
  return `${songs.value.length} lagu`
})

const clearFilters = () => {
  clearTimeout(searchTimeout)
  searchQuery.value = ''
  filterGenre.value = ''
  filterLanguage.value = ''
  mobileFiltersOpen.value = false
  fetchSongs()
}

const loadMore = () => {
  if (loading.value || !hasMore.value) return
  page.value++
  fetchSongs(false)
}

const sentinelNearViewport = () => {
  if (typeof window === 'undefined') return false
  const el = sentinelRef.value
  if (!el) return false
  const rect = el.getBoundingClientRect()
  return rect.top <= window.innerHeight + 600
}

const maybeAutoLoadMore = () => {
  if (loading.value || !hasMore.value) return
  if (sentinelNearViewport()) loadMore()
}

const setupInfiniteScroll = () => {
  if (typeof window === 'undefined') return
  if (!('IntersectionObserver' in window)) return

  if (infiniteObserver) infiniteObserver.disconnect()

  infiniteObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry?.isIntersecting) return
      if (loading.value || !hasMore.value) return
      loadMore()
    },
    { root: null, rootMargin: '800px 0px', threshold: 0.01 }
  )

  if (sentinelRef.value) infiniteObserver.observe(sentinelRef.value)
}

const teardownInfiniteScroll = () => {
  if (infiniteObserver) {
    infiniteObserver.disconnect()
    infiniteObserver = null
  }
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

const toggleFavorite = async (song) => {
  if (!song) return
  await favoriteStore.toggleFavorite(song.id)
}

onMounted(() => {
  fetchSongs()
  favoriteStore.fetchFavoriteIds()
  fetchFilters()
  setupInfiniteScroll()
})

onUnmounted(() => {
  teardownInfiniteScroll()
  clearTimeout(searchTimeout)
})
</script>

<style scoped>
.page-layout {
  /* Local theme override (green–blue gradient) */
  --sp-green: #22c55e;
  --sp-cyan: #06b6d4;
  --sp-blue: #3b82f6;

  --primary: var(--sp-cyan);
  --primary-light: #22d3ee;
  --primary-dark: #0891b2;
  --secondary: var(--sp-green);
  --accent: var(--sp-blue);

  --bg-dark: #061319;
  --bg-darker: #040c10;
  --bg-card: rgba(10, 22, 28, 0.72);
  --bg-card-hover: rgba(14, 30, 37, 0.82);
  --border-color: rgba(94, 234, 212, 0.14);
  --border-color-light: rgba(94, 234, 212, 0.28);

  --gradient-primary: linear-gradient(135deg, #22c55e 0%, #06b6d4 55%, #3b82f6 100%);
  --gradient-glow: linear-gradient(135deg,
      rgba(34, 197, 94, 0.28) 0%,
      rgba(6, 182, 212, 0.32) 55%,
      rgba(59, 130, 246, 0.22) 100%);
  --shadow-glow: 0 0 36px rgba(6, 182, 212, 0.35);

  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  overflow-x: hidden;
  position: relative;
  background: var(--bg-dark);
}

/* Background */
.page-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.bg-mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(900px 600px at 8% 10%, rgba(34, 197, 94, 0.22) 0%, transparent 55%),
    radial-gradient(820px 560px at 92% 16%, rgba(6, 182, 212, 0.2) 0%, transparent 55%),
    radial-gradient(980px 680px at 70% 92%, rgba(59, 130, 246, 0.15) 0%, transparent 60%),
    linear-gradient(180deg, rgba(2, 6, 23, 0.12) 0%, rgba(2, 6, 23, 0.92) 70%),
    var(--bg-dark);
}

.bg-particles {
  position: absolute;
  inset: 0;
  opacity: 0.85;
  background-image: url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306b6d4' fill-opacity='0.06'%3E%3Ccircle cx='10' cy='14' r='1.6'/%3E%3Ccircle cx='38' cy='30' r='1.4'/%3E%3Ccircle cx='54' cy='50' r='1.8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.bg-orb {
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  filter: blur(72px);
  opacity: 0.34;
  animation: orbFloat 16s ease-in-out infinite;
}

.orb-1 {
  background: rgba(34, 197, 94, 0.32);
  top: -180px;
  left: -180px;
}

.orb-2 {
  background: rgba(6, 182, 212, 0.34);
  bottom: -220px;
  right: -200px;
  animation-delay: -5s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: rgba(59, 130, 246, 0.2);
  top: 38%;
  right: 20%;
  animation-delay: -10s;
}

@keyframes orbFloat {

  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    transform: translate3d(18px, -14px, 0) scale(1.06);
  }
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
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
}

.sidebar-header {
  padding: 1.25rem 1.25rem 1.1rem;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.sidebar-header::after {
  content: '';
  position: absolute;
  left: 1.25rem;
  right: 1.25rem;
  bottom: -1px;
  height: 1px;
  background: var(--gradient-glow);
  opacity: 0.7;
  pointer-events: none;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  transition: transform var(--transition-normal), opacity var(--transition-normal);
}

.brand:hover {
  transform: translateY(-1px);
  opacity: 0.95;
}

.brand i {
  font-size: 1.5rem;
  color: var(--primary-light);
  filter: drop-shadow(0 0 16px rgba(34, 197, 94, 0.18));
}

.sidebar-nav {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.nav-divider {
  height: 1px;
  background: rgba(94, 234, 212, 0.14);
  margin: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 0.25rem;
  transition: transform var(--transition-fast), background var(--transition-fast), color var(--transition-fast),
    border-color var(--transition-fast);
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

.nav-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-glow);
  opacity: 0;
  transform: translateX(-10%);
  transition: opacity var(--transition-normal), transform var(--transition-normal);
}

.nav-item>* {
  position: relative;
  z-index: 1;
}

.nav-item:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(94, 234, 212, 0.18);
  transform: translateY(-1px);
}

.nav-item:hover::before {
  opacity: 0.18;
  transform: translateX(0);
}

.nav-item.active {
  color: white;
  background: linear-gradient(135deg,
      rgba(34, 197, 94, 0.18) 0%,
      rgba(6, 182, 212, 0.12) 55%,
      rgba(59, 130, 246, 0.16) 100%);
  border-color: rgba(94, 234, 212, 0.28);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 4px;
  height: 22px;
  transform: translateY(-50%);
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  box-shadow: 0 0 18px rgba(6, 182, 212, 0.45);
}

.page-main {
  flex: 1;
  margin-left: 260px;
  position: relative;
  z-index: 1;
}

.page-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

/* Mobile topbar */
.mobile-topbar {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1rem;
  margin: -0.5rem -0.5rem 1rem;
  border: 1px solid rgba(94, 234, 212, 0.16);
  border-radius: var(--radius-xl);
  background: rgba(4, 12, 16, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  position: sticky;
  top: 0.75rem;
  z-index: 10;
}

.brand--compact {
  font-size: 1.1rem;
}

.mobile-topbar__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-btn {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
}

.icon-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.28);
  background: rgba(255, 255, 255, 0.1);
}

.icon-btn.active {
  background: rgba(6, 182, 212, 0.14);
  border-color: rgba(94, 234, 212, 0.3);
}

/* Hero */
.hero {
  display: grid;
  grid-template-columns: 1.35fr 0.9fr;
  gap: 1.25rem;
  padding: 1.4rem;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: linear-gradient(180deg, rgba(10, 22, 28, 0.72) 0%, rgba(4, 12, 16, 0.7) 100%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  overflow: hidden;
  position: relative;
  margin-bottom: 1.25rem;
  box-shadow: 0 16px 70px rgba(0, 0, 0, 0.45);
}

.hero::before {
  content: '';
  position: absolute;
  inset: -1px;
  background:
    radial-gradient(540px 220px at 25% 0%, rgba(34, 197, 94, 0.16) 0%, transparent 60%),
    radial-gradient(520px 200px at 85% 35%, rgba(6, 182, 212, 0.14) 0%, transparent 60%),
    radial-gradient(520px 220px at 70% 110%, rgba(59, 130, 246, 0.12) 0%, transparent 60%);
  pointer-events: none;
}

.hero__content,
.hero__art {
  position: relative;
  z-index: 1;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-full);
  border: 1px solid rgba(94, 234, 212, 0.22);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-size: 0.85rem;
  margin-bottom: 0.85rem;
}

.hero__badge i {
  color: var(--primary-light);
}

.hero h1 {
  margin: 0 0 0.35rem 0;
  font-size: 2rem;
  letter-spacing: -0.02em;
}

.hero__sub {
  margin: 0 0 1.1rem 0;
  max-width: 62ch;
}

.hero__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.7rem;
  border-radius: var(--radius-full);
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(0, 0, 0, 0.22);
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.stat-pill i {
  color: var(--primary-light);
}

.stat-pill--soft {
  background: rgba(6, 182, 212, 0.08);
}

.btn-reset {
  border: 1px solid rgba(94, 234, 212, 0.16);
}

.hero__art {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.9rem;
}

.hero-card {
  padding: 1rem 1rem 0.9rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.25);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  display: grid;
  gap: 0.5rem;
}

.hero-card--primary {
  background: linear-gradient(135deg,
      rgba(34, 197, 94, 0.12) 0%,
      rgba(6, 182, 212, 0.1) 55%,
      rgba(59, 130, 246, 0.12) 100%);
}

.hero-card__icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(94, 234, 212, 0.18);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-light);
}

.hero-card__title {
  font-weight: 700;
  letter-spacing: -0.01em;
}

.hero-card__text {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.hero-card__btn {
  justify-self: start;
}

/* Filters */
.filters-card {
  padding: 1rem;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(10, 22, 28, 0.6);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.4);
  position: sticky;
  top: 1rem;
  z-index: 8;
  margin-bottom: 1.25rem;
}

.filters-top {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-box input {
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  border-radius: 16px;
  border-color: rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.25);
}

.search-box input:focus {
  border-color: rgba(94, 234, 212, 0.34);
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.15);
}

.search-clear {
  position: absolute;
  right: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border-radius: 12px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast);
}

.search-clear:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(94, 234, 212, 0.26);
  transform: translateY(-50%) scale(1.03);
}

.btn-mobile-filters {
  display: none;
  border-radius: 16px;
  box-shadow: var(--shadow-glow);
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
  margin-top: 0.9rem;
}

.filter-field {
  display: grid;
  gap: 0.35rem;
}

.filter-label {
  color: var(--text-muted);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.filters-row .form-select {
  border-radius: 16px;
  border-color: rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.25);
}

.filters-row .form-select:focus {
  border-color: rgba(94, 234, 212, 0.34);
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.15);
}

.songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.song-card {
  background: var(--bg-card);
  border: 1px solid rgba(94, 234, 212, 0.14);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal);
  box-shadow: 0 14px 60px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  position: relative;
}

.song-card:hover {
  border-color: rgba(94, 234, 212, 0.28);
  transform: translateY(-6px);
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5);
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
  transform: scale(1.02);
  transition: transform var(--transition-slow), filter var(--transition-slow);
}

.song-card:hover .song-thumbnail img {
  transform: scale(1.06);
  filter: saturate(1.06);
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
  background:
    radial-gradient(240px 160px at 50% 50%, rgba(6, 182, 212, 0.18) 0%, rgba(0, 0, 0, 0.65) 65%),
    rgba(0, 0, 0, 0.6);
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
  background: var(--gradient-primary);
  border: 1px solid rgba(94, 234, 212, 0.22);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 0 0 10px rgba(6, 182, 212, 0.12), 0 18px 60px rgba(0, 0, 0, 0.45);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.btn-play-song:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 0 0 12px rgba(6, 182, 212, 0.14), 0 26px 80px rgba(0, 0, 0, 0.5);
}

.btn-favorite {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(94, 234, 212, 0.14);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all var(--transition-fast);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.btn-favorite:hover,
.btn-favorite.active {
  background: rgba(6, 182, 212, 0.22);
  border-color: rgba(94, 234, 212, 0.26);
  transform: scale(1.1);
}

.btn-favorite.active i {
  color: white;
}

.song-info {
  padding: 1rem;
}

.song-info h4 {
  font-size: 1rem;
  margin: 0 0 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-info p {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.song-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(94, 234, 212, 0.14);
  color: var(--text-secondary);
}

.meta-pill--soft {
  background: rgba(6, 182, 212, 0.08);
}

.song-actions {
  padding: 0 1rem 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-icon {
  width: 42px;
  height: 42px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem 0.5rem;
}

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

.load-more {
  text-align: center;
  margin-top: 2rem;
}

.infinite-sentinel {
  height: 1px;
  width: 100%;
  margin-top: 1.25rem;
}

/* Skeleton */
.song-card--skeleton {
  transform: none !important;
}

.skeleton-media {
  width: 100%;
  height: 100%;
}

.skeleton-line {
  height: 0.95rem;
  width: 100%;
  border-radius: 10px;
}

.skeleton-line--sm {
  height: 0.75rem;
  width: 70%;
  margin-top: 0.35rem;
}

.skeleton-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.65rem;
}

.skeleton-pill {
  height: 0.9rem;
  width: 78px;
  border-radius: 999px;
}

.skeleton-btn {
  height: 42px;
  border-radius: 14px;
  width: 120px;
}

.skeleton-btn--icon {
  width: 42px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 3600;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 1rem;
}

.modal-content {
  background: rgba(10, 22, 28, 0.78);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 400px;
  border: 1px solid rgba(94, 234, 212, 0.16);
  box-shadow: 0 24px 90px rgba(0, 0, 0, 0.65);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0) 100%);
}

.modal-header h3 {
  margin: 0;
}

.modal-header button {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(94, 234, 212, 0.12);
  color: var(--text-secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
}

.modal-header button:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.22);
  background: rgba(255, 255, 255, 0.08);
}

.modal-body {
  padding: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.playlist-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast), border-color var(--transition-fast);
  border: 1px solid transparent;
  background: rgba(0, 0, 0, 0.18);
}

.playlist-option:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(94, 234, 212, 0.18);
  transform: translateY(-1px);
}

.playlist-option .song-count {
  margin-left: auto;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.empty-playlists {
  text-align: center;
  padding: 1rem;
}

/* In-page button theme overrides (avoid purple hover shadow from global styles) */
.btn-primary {
  box-shadow: var(--shadow-glow);
}

.btn-primary:hover {
  box-shadow: 0 0 52px rgba(6, 182, 212, 0.45);
  filter: saturate(1.08);
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.08);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.14);
}

/* Entrance animation */
.reveal {
  animation: reveal 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: var(--d, 0ms);
  will-change: transform, opacity;
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bg-orb {
    animation: none;
  }

  .reveal {
    animation: none;
  }

  .song-card,
  .btn,
  .nav-item,
  .icon-btn {
    transition: none !important;
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero__art {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .dashboard-sidebar {
    width: 70px;
  }

  .sidebar-header .brand span,
  .nav-item span {
    display: none;
  }

  .page-main {
    margin-left: 70px;
  }

  .nav-item {
    justify-content: center;
    padding: 0.75rem;
  }
}

@media (max-width: 768px) {
  .page-content {
    padding: 1.25rem;
  }

  .mobile-topbar {
    display: flex;
  }

  .filters-card {
    top: 5.1rem;
  }

  .btn-mobile-filters {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
  }

  .filters-top {
    grid-template-columns: 1fr auto;
  }

  .filters-row {
    grid-template-columns: 1fr;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    margin-top: 0;
    transition: max-height var(--transition-slow), opacity var(--transition-slow), margin-top var(--transition-slow);
  }

  .filters-row.open {
    max-height: 240px;
    opacity: 1;
    margin-top: 0.9rem;
  }

  .songs-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .song-info h4 {
    font-size: 0.95rem;
  }

  .hero {
    padding: 1.15rem;
  }

  .hero h1 {
    font-size: 1.55rem;
  }

  .hero__art {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 425px) {
  .songs-grid {
    grid-template-columns: 1fr;
  }

  .filters-top {
    grid-template-columns: 1fr;
  }

  .btn-mobile-filters {
    width: 100%;
  }

  .filters-card {
    top: 5.4rem;
  }
}
</style>
