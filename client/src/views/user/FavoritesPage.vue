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
        <router-link to="/donation" class="nav-item"><i class="bi bi-heart-fill"></i><span>Donasi</span></router-link>
        <div class="nav-divider"></div>
        <router-link to="/settings" class="nav-item"><i
            class="bi bi-gear-fill"></i><span>Pengaturan</span></router-link>
      </nav>
    </aside>

    <main class="page-main">
      <div class="page-content">
        <!-- Mobile Topbar (sidebar hidden by CSS on small screens) -->
        <div class="mobile-topbar">
          <router-link to="/dashboard" class="brand brand--compact">
            <i class="bi bi-music-note-beamed"></i>
            <span>Karaoke<span class="text-gradient">Ku</span></span>
          </router-link>
          <div class="mobile-topbar__actions">
            <button class="icon-btn" type="button" @click="goToSongs" aria-label="Cari lagu">
              <i class="bi bi-search"></i>
            </button>
            <router-link to="/karaoke" class="icon-btn" aria-label="Karaoke">
              <i class="bi bi-mic-fill"></i>
            </router-link>
          </div>
        </div>

        <!-- Hero -->
        <section class="hero reveal" style="--d: 0ms">
          <div class="hero__content">
            <div class="hero__badge">
              <i class="bi bi-heart-fill"></i>
              <span>Lagu Favorit</span>
            </div>
            <h1>
              Koleksi lagu <span class="text-gradient">favorit</span> kamu
            </h1>
            <p class="hero__sub text-white">
              Semua lagu yang kamu sukai tersimpan di sini. Klik Play untuk mulai karaoke atau kelola favoritmu.
            </p>

            <div class="hero__stats">
              <div class="stat-pill">
                <i class="bi bi-heart-fill"></i>
                <span>{{ favoriteCount }} lagu favorit</span>
              </div>
              <div v-if="favoriteStore.loading" class="stat-pill stat-pill--soft" aria-live="polite">
                <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                <span>Memuat...</span>
              </div>

              <button class="btn btn-primary btn-sm" type="button" @click="goToSongs">
                <i class="bi bi-search me-1"></i>
                Cari Lagu
              </button>
              <router-link to="/karaoke" class="btn btn-ghost btn-sm">
                <i class="bi bi-mic-fill me-1"></i>
                Karaoke
              </router-link>
            </div>
          </div>

          <div class="hero__art">
            <div class="hero-card hero-card--primary">
              <div class="hero-card__icon">
                <i class="bi bi-music-note-list"></i>
              </div>
              <div class="hero-card__title">Tambah Favorit</div>
              <div class="hero-card__text">Cari lagu baru dan simpan ke favorit untuk akses cepat.</div>
              <button class="btn btn-primary btn-sm hero-card__btn" type="button" @click="goToSongs">
                <i class="bi bi-plus-lg"></i>
                Pilih Lagu
              </button>
            </div>

            <div class="hero-card hero-card--soft">
              <div class="hero-card__icon">
                <i class="bi bi-trophy-fill"></i>
              </div>
              <div class="hero-card__title">Raih High Score</div>
              <div class="hero-card__text">Mainkan lagu favoritmu dan kumpulkan skor terbaik.</div>
              <router-link to="/karaoke" class="btn btn-ghost btn-sm hero-card__btn">
                <i class="bi bi-play-circle-fill"></i>
                Mulai
              </router-link>
            </div>
          </div>
        </section>

        <!-- Skeleton -->
        <div v-if="favoriteStore.loading && favoriteStore.favorites.length === 0"
          class="songs-grid songs-grid--skeleton" aria-hidden="true">
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

        <!-- Empty -->
        <div v-else-if="!favoriteStore.loading && favoriteStore.favorites.length === 0" class="empty-state reveal"
          style="--d: 120ms">
          <div class="empty-icon">
            <i class="bi bi-heartbreak"></i>
          </div>
          <h2>Belum ada lagu favorit</h2>
          <p class="text-muted">Yuk cari lagu yang kamu suka, lalu klik ikon favorit untuk menyimpannya.</p>
          <button class="btn btn-primary" type="button" @click="goToSongs">
            <i class="bi bi-search me-1"></i>
            Cari Lagu
          </button>
        </div>

        <!-- Grid -->
        <div v-else class="songs-grid">
          <div v-for="(song, idx) in favoriteStore.favorites" :key="song.id" class="song-card reveal"
            :style="{ '--d': `${Math.min(idx * 35, 280)}ms` }">
            <div class="song-thumbnail">
              <img v-if="getThumbnailUrl(song)" :src="getThumbnailUrl(song)" :alt="song.title" loading="lazy" />
              <div v-else class="thumbnail-placeholder">
                <i class="bi bi-music-note-beamed"></i>
              </div>

              <div class="song-overlay">
                <button class="btn-play-song" type="button" @click="playSong(song)" :aria-label="`Play ${song.title}`">
                  <i class="bi bi-play-fill"></i>
                </button>
              </div>
            </div>

            <div class="song-info">
              <h4 :title="song.title">{{ song.title }}</h4>
              <p :title="song.artist">{{ song.artist }}</p>
              <div class="song-meta">
                <span v-if="song.genre" class="meta-pill"><i class="bi bi-tag"></i> {{ song.genre }}</span>
                <span class="meta-pill meta-pill--soft"><i class="bi bi-play-fill"></i> {{ song.play_count || 0
                  }}</span>
              </div>
            </div>

            <div class="song-actions">
              <button class="btn btn-primary btn-sm" type="button" @click="playSong(song)">
                <i class="bi bi-play-fill"></i> Play
              </button>
              <button class="btn btn-ghost btn-sm btn-icon" type="button" @click.stop="toggleFavorite(song)"
                aria-label="Hapus dari favorit">
                <i class="bi bi-heartbreak-fill"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <MobileNav />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favorite'
import { getThumbnailUrl } from '@/utils/media'
import MobileNav from '@/components/MobileNav.vue'

const router = useRouter()
const favoriteStore = useFavoriteStore()

const favoriteCount = computed(() => favoriteStore.favorites.length)

const playSong = (song) => {
  router.push(`/karaoke/${song.id}`)
}

const goToSongs = () => {
  router.push('/songs')
}

const toggleFavorite = async (song) => {
  await favoriteStore.toggleFavorite(song.id)
  favoriteStore.fetchFavorites()
}

onMounted(() => {
  favoriteStore.fetchFavorites()
})
</script>

<style scoped>
.page-layout {
  /* Local theme override (green–blue gradient) */
  --fp-green: #22c55e;
  --fp-cyan: #06b6d4;
  --fp-blue: #3b82f6;

  --primary: var(--fp-cyan);
  --primary-light: #22d3ee;
  --primary-dark: #0891b2;
  --secondary: var(--fp-green);
  --accent: var(--fp-blue);

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
  text-decoration: none;
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
  text-decoration: none;
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
  text-decoration: none;
}

.icon-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.28);
  background: rgba(255, 255, 255, 0.1);
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

.stat-pill .spinner-border {
  width: 0.95rem;
  height: 0.95rem;
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
  background: transparent;
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

.empty-state {
  text-align: center;
  padding: 2.75rem 1rem;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(10, 22, 28, 0.6);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.4);
}

.empty-icon {
  width: 78px;
  height: 78px;
  border-radius: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.22);
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.45);
  margin-bottom: 1rem;
}

.empty-icon i {
  font-size: 2.2rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.empty-state h2 {
  font-weight: 800;
  font-size: 1.3rem;
  margin: 0 0 0.35rem;
}

.empty-state p {
  margin: 0 0 1.1rem;
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
  .dashboard-sidebar {
    display: none;
  }

  .page-main {
    margin-left: 0;
  }

  .page-content {
    padding: 1.25rem;
  }

  .mobile-topbar {
    display: flex;
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
}
</style>
