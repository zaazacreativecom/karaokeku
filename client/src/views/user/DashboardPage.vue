<template>
  <div class="dashboard-layout">
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
        <!-- Quick Stats -->
        <div class="welcome-section">
          <div>
            <h1>Selamat Datang, {{ authStore.user?.name?.split(' ')[0] }}! 👋</h1>
            <p class="text-muted">Siap untuk karaoke hari ini?</p>
          </div>
          <router-link to="/karaoke" class="btn btn-primary btn-lg">
            <i class="bi bi-play-fill me-2"></i>
            Mulai Karaoke
          </router-link>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(139, 92, 246, 0.2); color: var(--primary);">
              <i class="bi bi-music-note-list"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalPlays || 0 }}</span>
              <span class="stat-label">Lagu Dimainkan</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(236, 72, 153, 0.2); color: var(--secondary);">
              <i class="bi bi-trophy-fill"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.avgScore || 0 }}</span>
              <span class="stat-label">Rata-rata Score</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(6, 182, 212, 0.2); color: var(--accent);">
              <i class="bi bi-clock-fill"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalMinutes || 0 }}m</span>
              <span class="stat-label">Total Waktu</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(34, 197, 94, 0.2); color: var(--success);">
              <i class="bi bi-star-fill"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.level || 'Pemula' }}</span>
              <span class="stat-label">Level</span>
            </div>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="content-grid">
          <!-- Recent Songs -->
          <div class="content-card">
            <div class="card-header">
              <h3><i class="bi bi-clock-history me-2"></i>Terakhir Dimainkan</h3>
              <router-link to="/history" class="btn btn-ghost btn-sm">Lihat Semua</router-link>
            </div>
            <div class="card-body">
              <div v-if="recentSongs.length > 0" class="song-list">
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
          <div class="content-card">
            <div class="card-header">
              <h3><i class="bi bi-fire me-2"></i>Lagu Populer</h3>
              <router-link to="/songs" class="btn btn-ghost btn-sm">Lihat Semua</router-link>
            </div>
            <div class="card-body">
              <div v-if="topSongs.length > 0" class="song-list">
                <div v-for="(song, index) in topSongs" :key="song.id" class="song-row clickable"
                  @click="goToSong(song.id)">
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
import { ref, onMounted } from 'vue'
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

// Methods
const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

const goToSong = (songId) => {
  router.push(`/karaoke/${songId}`)
}

const fetchDashboardData = async () => {
  try {
    // Fetch user scores/stats
    const scoresResponse = await playbackAPI.getScores()
    const data = scoresResponse.data.data

    stats.value = {
      totalPlays: data.totalSongsPlayed || 0,
      avgScore: data.averageScore || 0,
      totalMinutes: data.totalDurationMinutes || 0,
      level: data.level || 'Pemula'
    }

    recentSongs.value = data.recentPlays?.slice(0, 5) || []

    // Fetch top songs
    const topResponse = await songsAPI.getTop(5)
    topSongs.value = topResponse.data.data || []

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
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
}

/* Main Content */
.dashboard-main {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
  background: var(--bg-dark);
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.welcome-section h1 {
  margin: 0;
  font-size: 1.75rem;
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
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
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
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

.song-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.song-row.clickable {
  cursor: pointer;
}

.song-row:hover {
  background: rgba(255, 255, 255, 0.05);
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

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
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
  .welcome-section {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
