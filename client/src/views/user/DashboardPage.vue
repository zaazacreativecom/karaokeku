<template>
  <div class="dashboard-layout">
    <!-- Background (decorative) -->
    <div class="dashboard-bg" aria-hidden="true">
      <div class="bg-mesh"></div>
      <div class="bg-particles"></div>
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
    </div>

    <!-- Sidebar -->
    <aside class="dashboard-sidebar">
      <div class="sidebar-header">
        <router-link to="/dashboard" class="brand">
          <i class="bi bi-music-note-beamed"></i>
          <span>Karaoke<span class="text-gradient">Ku</span></span>
        </router-link>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" :class="{ active: $route.name === 'Dashboard' }">
          <i class="bi bi-grid-1x2-fill"></i>
          <span>Dashboard</span>
        </router-link>

        <router-link to="/karaoke" class="nav-item"
          :class="{ active: $route.name === 'Karaoke' || $route.name === 'KaraokePlay' }">
          <i class="bi bi-mic-fill"></i>
          <span>Karaoke</span>
        </router-link>

        <router-link to="/songs" class="nav-item" :class="{ active: $route.name === 'Songs' }">
          <i class="bi bi-music-note-list"></i>
          <span>Pilih Lagu</span>
        </router-link>

        <router-link to="/favorites" class="nav-item" :class="{ active: $route.name === 'Favorites' }">
          <i class="bi bi-heart-fill"></i>
          <span>Lagu Favorit</span>
        </router-link>

        <router-link to="/playlists" class="nav-item" :class="{ active: $route.name === 'Playlists' }">
          <i class="bi bi-collection-play-fill"></i>
          <span>Playlist Saya</span>
        </router-link>

        <router-link to="/upload" class="nav-item" :class="{ active: $route.name === 'Upload' }">
          <i class="bi bi-cloud-upload-fill"></i>
          <span>Upload Lagu</span>
        </router-link>

        <router-link to="/history" class="nav-item" :class="{ active: $route.name === 'History' }">
          <i class="bi bi-clock-history"></i>
          <span>Riwayat & Score</span>
        </router-link>

        <router-link to="/request" class="nav-item" :class="{ active: $route.name === 'Request' }">
          <i class="bi bi-plus-circle-fill"></i>
          <span>Request Lagu</span>
        </router-link>

        <router-link to="/donation" class="nav-item" :class="{ active: $route.name === 'Donation' }">
          <i class="bi bi-heart-fill"></i>
          <span>Donasi</span>
        </router-link>

        <div class="nav-divider"></div>

        <router-link to="/settings" class="nav-item" :class="{ active: $route.name === 'Settings' }">
          <i class="bi bi-gear-fill"></i>
          <span>Pengaturan</span>
        </router-link>

        <router-link v-if="authStore.isAdmin" to="/admin" class="nav-item nav-item-admin">
          <i class="bi bi-shield-lock-fill"></i>
          <span>Admin Panel</span>
        </router-link>
      </nav>

      <!-- User Info -->
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">
            <i class="bi bi-person-fill"></i>
          </div>
          <div class="user-details">
            <span class="user-name">{{ authStore.user?.name }}</span>
            <span class="user-role">{{ authStore.isAdmin ? 'Admin' : 'User' }}</span>
          </div>
        </div>
        <button class="btn-logout" @click="handleLogout">
          <i class="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="dashboard-main">
      <div class="main-content">
        <!-- Mobile Topbar (shown on small screens; sidebar hidden by global CSS) -->
        <div class="mobile-topbar">
          <router-link to="/dashboard" class="brand brand--compact">
            <i class="bi bi-music-note-beamed"></i>
            <span>Karaoke<span class="text-gradient">Ku</span></span>
          </router-link>
          <button class="btn-logout btn-logout--mobile" @click="handleLogout" aria-label="Logout">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>

        <!-- Hero -->
        <section class="hero reveal" style="--d: 0ms">
          <div class="hero__content">
            <div class="hero__badge">
              <i class="bi bi-stars"></i>
              <span>Dashboard</span>
            </div>
            <h1>
              Selamat datang, <span class="text-gradient">{{ firstName }}</span>
            </h1>
            <p class="hero__sub text-muted">
              Siap untuk karaoke hari ini? Mulai cepat, atau jelajahi lagu favoritmu.
            </p>

            <div class="hero__actions">
              <router-link to="/karaoke" class="btn btn-primary btn-lg">
                <i class="bi bi-play-fill me-2"></i>
                Mulai Karaoke
              </router-link>
              <router-link to="/songs" class="btn btn-ghost btn-lg">
                <i class="bi bi-music-note-list me-2"></i>
                Pilih Lagu
              </router-link>
            </div>
          </div>

          <div class="hero__panel">
            <div class="hero__panel-card">
              <div class="panel-label">Level</div>
              <div v-if="!loading" class="panel-value">{{ stats.level || 'Pemula' }}</div>
              <div v-else class="panel-value panel-skeleton loading-skeleton" aria-hidden="true"></div>
              <div class="panel-meta">
                <span v-if="!loading"><i class="bi bi-trophy-fill"></i> Avg {{ stats.avgScore || 0 }}</span>
                <span v-else class="panel-pill loading-skeleton" aria-hidden="true"></span>
                <span v-if="!loading"><i class="bi bi-clock-fill"></i> {{ stats.totalMinutes || 0 }}m</span>
                <span v-else class="panel-pill loading-skeleton" aria-hidden="true"></span>
              </div>
            </div>
            <div class="hero__panel-card hero__panel-card--soft">
              <div class="panel-label">Aktivitas</div>
              <div v-if="!loading" class="panel-value">{{ stats.totalPlays || 0 }}</div>
              <div v-else class="panel-value panel-skeleton loading-skeleton" aria-hidden="true"></div>
              <div class="panel-meta panel-meta--single">Lagu dimainkan</div>
            </div>
          </div>
        </section>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card reveal" style="--d: 90ms">
            <div class="stat-icon stat-icon--plays">
              <i class="bi bi-music-note-list"></i>
            </div>
            <div class="stat-info">
              <span v-if="!loading" class="stat-value">{{ stats.totalPlays || 0 }}</span>
              <span v-else class="stat-value stat-skeleton loading-skeleton" aria-hidden="true"></span>
              <span class="stat-label">Lagu Dimainkan</span>
            </div>
          </div>

          <div class="stat-card reveal" style="--d: 140ms">
            <div class="stat-icon stat-icon--score">
              <i class="bi bi-trophy-fill"></i>
            </div>
            <div class="stat-info">
              <span v-if="!loading" class="stat-value">{{ stats.avgScore || 0 }}</span>
              <span v-else class="stat-value stat-skeleton loading-skeleton" aria-hidden="true"></span>
              <span class="stat-label">Rata-rata Score</span>
            </div>
          </div>

          <div class="stat-card reveal" style="--d: 190ms">
            <div class="stat-icon stat-icon--time">
              <i class="bi bi-clock-fill"></i>
            </div>
            <div class="stat-info">
              <span v-if="!loading" class="stat-value">{{ stats.totalMinutes || 0 }}m</span>
              <span v-else class="stat-value stat-skeleton loading-skeleton" aria-hidden="true"></span>
              <span class="stat-label">Total Waktu</span>
            </div>
          </div>

          <div class="stat-card reveal" style="--d: 240ms">
            <div class="stat-icon stat-icon--level">
              <i class="bi bi-star-fill"></i>
            </div>
            <div class="stat-info">
              <span v-if="!loading" class="stat-value">{{ stats.level || 'Pemula' }}</span>
              <span v-else class="stat-value stat-skeleton stat-skeleton--text loading-skeleton" aria-hidden="true"></span>
              <span class="stat-label">Level</span>
            </div>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="content-grid">
          <!-- Recent Songs -->
          <div class="content-card reveal" style="--d: 290ms">
            <div class="card-header">
              <h3><i class="bi bi-clock-history me-2"></i>Terakhir Dimainkan</h3>
              <router-link to="/history" class="btn btn-ghost btn-sm">Lihat Semua</router-link>
            </div>
            <div class="card-body">
              <div v-if="loading" class="song-list">
                <div v-for="n in 5" :key="n" class="song-row song-row--skeleton" aria-hidden="true">
                  <div class="song-info">
                    <div class="skeleton-line loading-skeleton"></div>
                    <div class="skeleton-line skeleton-line--sm loading-skeleton"></div>
                  </div>
                  <div class="skeleton-pill loading-skeleton"></div>
                </div>
              </div>
              <div v-else-if="recentSongs.length > 0" class="song-list">
                <div v-for="item in recentSongs" :key="item.id" class="song-row">
                  <div class="song-info">
                    <h4>{{ item.song?.title || 'Unknown' }}</h4>
                    <p>{{ item.song?.artist || 'Unknown Artist' }}</p>
                  </div>
                  <span class="song-score" v-if="item.score">{{ item.score }} pts</span>
                </div>
              </div>
              <div v-else class="empty-state">
                <i class="bi bi-music-note"></i>
                <p>Belum ada lagu yang dimainkan</p>
              </div>
            </div>
          </div>

          <!-- Top Songs -->
          <div class="content-card reveal" style="--d: 340ms">
            <div class="card-header">
              <h3><i class="bi bi-fire me-2"></i>Lagu Populer</h3>
              <router-link to="/songs" class="btn btn-ghost btn-sm">Lihat Semua</router-link>
            </div>
            <div class="card-body">
              <div v-if="loading" class="song-list">
                <div v-for="n in 5" :key="n" class="song-row song-row--skeleton" aria-hidden="true">
                  <div class="song-rank loading-skeleton"></div>
                  <div class="song-info">
                    <div class="skeleton-line loading-skeleton"></div>
                    <div class="skeleton-line skeleton-line--sm loading-skeleton"></div>
                  </div>
                  <div class="skeleton-pill loading-skeleton"></div>
                </div>
              </div>
              <div v-else-if="topSongs.length > 0" class="song-list">
                <div v-for="(song, index) in topSongs" :key="song.id" class="song-row clickable"
                  role="button" tabindex="0" @click="goToSong(song.id)"
                  @keydown.enter="goToSong(song.id)" @keydown.space.prevent="goToSong(song.id)">
                  <span class="song-rank">{{ index + 1 }}</span>
                  <div class="song-info">
                    <h4>{{ song.title }}</h4>
                    <p>{{ song.artist }}</p>
                  </div>
                  <span class="song-plays">
                    <i class="bi bi-play-fill"></i>
                    {{ song.play_count || 0 }}
                  </span>
                </div>
              </div>
              <div v-else class="empty-state">
                <i class="bi bi-music-note"></i>
                <p>Belum ada lagu populer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Mobile Navigation -->
    <MobileNav />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { playbackAPI, songsAPI } from '@/services/api'
import MobileNav from '@/components/MobileNav.vue'

const router = useRouter()
const authStore = useAuthStore()

// State
const stats = ref({})
const recentSongs = ref([])
const topSongs = ref([])
const loading = ref(true)

const firstName = computed(() => authStore.user?.name?.trim()?.split(' ')[0] || 'Kamu')

// Methods
const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

const goToSong = (songId) => {
  router.push(`/karaoke/${songId}`)
}

const fetchDashboardData = async () => {
  loading.value = true
  try {
    // Fetch user scores/stats
    const [scoresResponse, topResponse] = await Promise.all([
      playbackAPI.getScores(),
      songsAPI.getTop(5)
    ])

    const data = scoresResponse.data.data

    stats.value = {
      totalPlays: data.totalSongsPlayed || 0,
      avgScore: data.averageScore || 0,
      totalMinutes: data.totalDurationMinutes || 0,
      level: data.level || 'Pemula'
    }

    recentSongs.value = data.recentPlays?.slice(0, 5) || []

    topSongs.value = topResponse.data.data || []
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard-layout {
  /* Local theme override (green–blue gradient) */
  --dash-green: #22c55e;
  --dash-cyan: #06b6d4;
  --dash-blue: #3b82f6;

  --primary: var(--dash-cyan);
  --primary-light: #22d3ee;
  --primary-dark: #0891b2;
  --secondary: var(--dash-green);
  --accent: var(--dash-blue);

  --bg-dark: #061319;
  --bg-darker: #040c10;
  --bg-card: rgba(10, 22, 28, 0.72);
  --bg-card-hover: rgba(14, 30, 37, 0.82);
  --border-color: rgba(94, 234, 212, 0.14);
  --border-color-light: rgba(94, 234, 212, 0.28);

  --gradient-primary: linear-gradient(135deg, #22c55e 0%, #06b6d4 55%, #3b82f6 100%);
  --gradient-glow: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.32) 0%,
    rgba(6, 182, 212, 0.34) 55%,
    rgba(59, 130, 246, 0.26) 100%
  );
  --shadow-glow: 0 0 36px rgba(6, 182, 212, 0.35);

  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  overflow-x: hidden;
  position: relative;
  background: var(--bg-dark);
}

/* Background */
.dashboard-bg {
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

/* Sidebar */
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

.nav-item > * {
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
  opacity: 0.22;
  transform: translateX(0);
}

.nav-item.active {
  color: white;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.18) 0%,
    rgba(6, 182, 212, 0.12) 55%,
    rgba(59, 130, 246, 0.16) 100%
  );
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

.nav-item i {
  font-size: 1.125rem;
  width: 24px;
  text-align: center;
}

.nav-divider {
  height: 1px;
  background: var(--border-color);
  margin: 1rem 0;
}

.nav-item-admin {
  color: var(--warning);
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(180deg, rgba(4, 12, 16, 0) 0%, rgba(4, 12, 16, 0.55) 100%);
}

.user-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-glow);
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  font-size: 0.875rem;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.btn-logout {
  width: 36px;
  height: 36px;
  background: rgba(239, 68, 68, 0.1);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--danger);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-logout:hover {
  background: var(--danger);
  color: white;
  transform: translateY(-1px);
}

/* Main Content */
.dashboard-main {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
  background: transparent;
  position: relative;
  z-index: 1;
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

/* Mobile topbar (only visible when sidebar hidden) */
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
}

.brand--compact {
  font-size: 1.1rem;
}

.btn-logout--mobile {
  width: 42px;
  height: 42px;
  border-radius: 14px;
}

/* Hero */
.hero {
  display: grid;
  grid-template-columns: 1.3fr 0.9fr;
  gap: 1.25rem;
  padding: 1.4rem;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: linear-gradient(180deg, rgba(10, 22, 28, 0.72) 0%, rgba(4, 12, 16, 0.7) 100%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  overflow: hidden;
  position: relative;
  margin-bottom: 1.75rem;
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
.hero__panel {
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
  font-size: 1.9rem;
  letter-spacing: -0.02em;
}

.hero__sub {
  margin: 0 0 1.25rem 0;
  max-width: 56ch;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.hero__panel {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.9rem;
}

.hero__panel-card {
  padding: 1rem 1rem 0.9rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.25);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.hero__panel-card--soft {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.1) 0%,
    rgba(6, 182, 212, 0.08) 55%,
    rgba(59, 130, 246, 0.1) 100%
  );
}

.panel-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.35rem;
}

.panel-value {
  font-size: 1.35rem;
  font-weight: 750;
  letter-spacing: -0.01em;
  margin-bottom: 0.55rem;
}

.panel-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.panel-meta i {
  color: var(--primary-light);
  margin-right: 0.35rem;
}

.panel-meta--single {
  opacity: 0.9;
}

.panel-skeleton {
  height: 1.35rem;
  width: 60%;
  border-radius: 10px;
}

.panel-pill {
  height: 0.9rem;
  width: 92px;
  border-radius: 999px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid rgba(94, 234, 212, 0.14);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  transition: transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(94, 234, 212, 0.28);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background: rgba(94, 234, 212, 0.1);
  color: var(--primary-light);
  box-shadow: 0 0 0 1px rgba(94, 234, 212, 0.18) inset;
}

.stat-icon--plays {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(6, 182, 212, 0.12));
  color: #4ade80;
}

.stat-icon--score {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.14), rgba(59, 130, 246, 0.16));
  color: #60a5fa;
}

.stat-icon--time {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(6, 182, 212, 0.16));
  color: #22d3ee;
}

.stat-icon--level {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.16), rgba(59, 130, 246, 0.12));
  color: #34d399;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-skeleton {
  display: inline-block;
  height: 1.5rem;
  width: 72px;
  border-radius: 10px;
}

.stat-skeleton--text {
  width: 110px;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.content-card {
  background: var(--bg-card);
  border: 1px solid rgba(94, 234, 212, 0.14);
  border-radius: var(--radius-lg);
  overflow: hidden;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.4);
  transition: transform var(--transition-normal), border-color var(--transition-normal);
}

.content-card:hover {
  transform: translateY(-3px);
  border-color: rgba(94, 234, 212, 0.26);
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0) 100%);
}

.card-header h3 {
  font-size: 1rem;
  margin: 0;
  display: flex;
  align-items: center;
}

.card-body {
  padding: 1rem;
}

.song-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.song-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  transition: transform var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
  border: 1px solid transparent;
  background: rgba(0, 0, 0, 0.14);
}

.song-row.clickable {
  cursor: pointer;
}

.song-row:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(94, 234, 212, 0.16);
  transform: translateY(-1px);
}

.song-rank {
  width: 24px;
  height: 24px;
  background: var(--gradient-primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex: 0 0 auto;
  box-shadow: 0 0 18px rgba(6, 182, 212, 0.35);
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-info h4 {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-info p {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

.song-score,
.song-plays {
  font-size: 0.8rem;
  color: var(--primary-light);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(94, 234, 212, 0.16);
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

/* Skeleton helpers */
.skeleton-line {
  height: 0.95rem;
  width: 100%;
  border-radius: 10px;
}

.skeleton-line--sm {
  height: 0.75rem;
  width: 70%;
  margin-top: 0.35rem;
  opacity: 0.9;
}

.skeleton-pill {
  height: 0.95rem;
  width: 74px;
  border-radius: 999px;
}

.song-row--skeleton {
  background: rgba(0, 0, 0, 0.1);
  border-color: rgba(94, 234, 212, 0.08);
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

  .stat-card,
  .content-card,
  .nav-item,
  .btn {
    transition: none !important;
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .hero {
    grid-template-columns: 1fr;
  }

  .hero__panel {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .dashboard-sidebar {
    width: 70px;
  }

  .sidebar-header .brand span,
  .nav-item span,
  .user-details {
    display: none;
  }

  .dashboard-main {
    margin-left: 70px;
  }

  .sidebar-nav {
    padding: 0.5rem;
  }

  .nav-item {
    justify-content: center;
    padding: 0.75rem;
  }

  .sidebar-footer {
    justify-content: center;
  }

  .user-info {
    justify-content: center;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .main-content {
    padding: 1.25rem;
  }

  .mobile-topbar {
    display: flex;
  }

  .hero {
    padding: 1.15rem;
  }

  .hero h1 {
    font-size: 1.55rem;
  }

  .hero__actions .btn {
    flex: 1 1 auto;
    min-width: 160px;
  }

  .hero__panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 425px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .hero__actions .btn {
    width: 100%;
  }
}
</style>
