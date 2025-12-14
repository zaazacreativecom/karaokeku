<template>
  <div class="page-layout">
    <aside class="dashboard-sidebar">
      <div class="sidebar-header"><router-link to="/dashboard" class="brand"><i
            class="bi bi-music-note-beamed"></i><span>Karaoke<span class="text-gradient">Ku</span></span></router-link>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item"><i
            class="bi bi-grid-1x2-fill"></i><span>Dashboard</span></router-link>
        <router-link to="/karaoke" class="nav-item"><i class="bi bi-mic-fill"></i><span>Karaoke</span></router-link>
        <router-link to="/songs" class="nav-item"><i class="bi bi-music-note-list"></i><span>Pilih
            Lagu</span></router-link>
        <router-link to="/playlists" class="nav-item"><i class="bi bi-collection-play-fill"></i><span>Playlist
            Saya</span></router-link>
        <router-link to="/upload" class="nav-item"><i class="bi bi-cloud-upload-fill"></i><span>Upload
            Lagu</span></router-link>
        <router-link to="/history" class="nav-item active"><i class="bi bi-clock-history"></i><span>Riwayat &
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
        <div class="page-header">
          <h1><i class="bi bi-clock-history me-2"></i>Riwayat & Score</h1>
          <p class="text-muted">Lihat riwayat karaoke dan pencapaian Anda</p>
        </div>

        <!-- Stats Summary -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon"><i class="bi bi-music-note-list"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ summary.totalSongsPlayed || 0 }}</span>
              <span class="stat-label">Total Lagu</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon secondary"><i class="bi bi-trophy-fill"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ summary.averageScore || 0 }}</span>
              <span class="stat-label">Rata-rata Score</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon accent"><i class="bi bi-clock-fill"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ summary.totalDurationMinutes || 0 }}m</span>
              <span class="stat-label">Total Waktu</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success"><i class="bi bi-star-fill"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ summary.badge }} {{ summary.level }}</span>
              <span class="stat-label">Level Kamu</span>
            </div>
          </div>
        </div>

        <!-- High Scores -->
        <div class="section mt-4">
          <h3><i class="bi bi-trophy me-2"></i>High Scores</h3>
          <div v-if="summary.highScores?.length > 0" class="history-list">
            <div v-for="item in summary.highScores" :key="item.id" class="history-item">
              <div class="item-rank">🏆</div>
              <div class="item-thumb">
                <img v-if="getThumbnailUrl(item.song)" :src="getThumbnailUrl(item.song)" alt="" />
                <i v-else class="bi bi-music-note-beamed"></i>
              </div>
              <div class="item-info">
                <h4>{{ item.song?.title || 'Unknown' }}</h4>
                <p>{{ item.song?.artist || '-' }}</p>
              </div>
              <div class="item-score">{{ item.score }} pts</div>
            </div>
          </div>
          <div v-else class="empty-state text-muted">Belum ada high score</div>
        </div>

        <!-- Recent History -->
        <div class="section mt-4">
          <h3><i class="bi bi-clock-history me-2"></i>Riwayat Terakhir</h3>
          <div v-if="loading" class="loading-state">
            <div class="spinner-border text-primary"></div>
          </div>
          <div v-else-if="history.length > 0" class="history-list">
            <div v-for="item in history" :key="item.id" class="history-item">
              <div class="item-date">{{ formatDate(item.created_at) }}</div>
              <div class="item-thumb">
                <img v-if="getThumbnailUrl(item.song)" :src="getThumbnailUrl(item.song)" alt="" />
                <i v-else class="bi bi-music-note-beamed"></i>
              </div>
              <div class="item-info">
                <h4>{{ item.song?.title || 'Unknown' }}</h4>
                <p>{{ item.song?.artist || '-' }}</p>
              </div>
              <div class="item-score" v-if="item.score">{{ item.score }} pts</div>
            </div>
          </div>
          <div v-else class="empty-state text-muted">Belum ada riwayat</div>

          <div v-if="hasMore" class="load-more mt-3">
            <button class="btn btn-outline-primary" @click="loadMore">Muat Lebih Banyak</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { playbackAPI } from '@/services/api'
import { getThumbnailUrl } from '@/utils/media'

const summary = ref({})
const history = ref([])
const loading = ref(true)
const page = ref(1)
const hasMore = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const [summaryRes, historyRes] = await Promise.all([
      playbackAPI.getScores(),
      playbackAPI.getHistory({ page: page.value, limit: 20 })
    ])
    summary.value = summaryRes.data.data || {}
    history.value = historyRes.data.data || []
    hasMore.value = historyRes.data.meta?.hasNextPage || false
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  page.value++
  try {
    const response = await playbackAPI.getHistory({ page: page.value, limit: 20 })
    history.value.push(...(response.data.data || []))
    hasMore.value = response.data.meta?.hasNextPage || false
  } catch (err) {
    console.error(err)
  }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

onMounted(fetchData)
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
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
  display: flex;
  flex-direction: column;
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
  max-width: 1000px;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: rgba(139, 92, 246, 0.2);
  color: var(--primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-icon.secondary {
  background: rgba(236, 72, 153, 0.2);
  color: var(--secondary);
}

.stat-icon.accent {
  background: rgba(6, 182, 212, 0.2);
  color: var(--accent);
}

.stat-icon.success {
  background: rgba(34, 197, 94, 0.2);
  color: var(--success);
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

.section h3 {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.item-rank {
  font-size: 1.5rem;
}

.item-date {
  font-size: 0.8rem;
  color: var(--text-muted);
  min-width: 80px;
}

.item-thumb {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--bg-darker);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  color: var(--text-muted);
}

.item-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
}

.item-info p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.item-score {
  font-weight: 600;
  color: var(--primary-light);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
}

.load-more {
  text-align: center;
}

@media (max-width: 992px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
