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
      <div class="sidebar-header">
        <router-link to="/dashboard" class="brand">
          <i class="bi bi-music-note-beamed"></i>
          <span>Karaoke<span class="text-gradient">Ku</span></span>
        </router-link>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item">
          <i class="bi bi-grid-1x2-fill"></i><span>Dashboard</span>
        </router-link>
        <router-link to="/karaoke" class="nav-item">
          <i class="bi bi-mic-fill"></i><span>Karaoke</span>
        </router-link>
        <router-link to="/songs" class="nav-item">
          <i class="bi bi-music-note-list"></i><span>Pilih Lagu</span>
        </router-link>
        <router-link to="/favorites" class="nav-item">
          <i class="bi bi-heart-fill"></i><span>Lagu Favorit</span>
        </router-link>
        <router-link to="/playlists" class="nav-item">
          <i class="bi bi-collection-play-fill"></i><span>Playlist Saya</span>
        </router-link>
        <router-link to="/upload" class="nav-item">
          <i class="bi bi-cloud-upload-fill"></i><span>Upload Lagu</span>
        </router-link>
        <router-link to="/history" class="nav-item active">
          <i class="bi bi-clock-history"></i><span>Riwayat & Score</span>
        </router-link>
        <router-link to="/request" class="nav-item">
          <i class="bi bi-plus-circle-fill"></i><span>Request Lagu</span>
        </router-link>
        <router-link to="/donation" class="nav-item">
          <i class="bi bi-heart-fill"></i><span>Donasi</span>
        </router-link>
        <div class="nav-divider"></div>
        <router-link to="/settings" class="nav-item">
          <i class="bi bi-gear-fill"></i><span>Pengaturan</span>
        </router-link>
      </nav>
    </aside>

    <main class="page-main">
      <div class="page-content">
        <!-- Mobile Topbar -->
        <div class="mobile-topbar">
          <router-link to="/dashboard" class="brand brand--compact">
            <i class="bi bi-music-note-beamed"></i>
            <span>Karaoke<span class="text-gradient">Ku</span></span>
          </router-link>
          <div class="mobile-topbar__actions">
            <button class="icon-btn" type="button" @click="fetchData" aria-label="Refresh">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
            <button class="icon-btn" type="button" @click="scrollToHistory" aria-label="Riwayat">
              <i class="bi bi-clock-history"></i>
            </button>
          </div>
        </div>

        <!-- Hero -->
        <section class="hero reveal" style="--d: 0ms">
          <div class="hero__content">
            <div class="hero__badge">
              <i class="bi bi-clock-history"></i>
              <span>Riwayat & Score</span>
            </div>
            <h1>Riwayat karaoke & <span class="text-gradient">pencapaian</span> kamu</h1>
            <p class="hero__sub text-muted">Pantau progress, lihat high score, dan mainkan ulang lagu favoritmu.</p>

            <div class="hero__stats">
              <div class="stat-pill">
                <i class="bi bi-music-note-list"></i>
                <span>{{ totalSongsPlayed }} lagu</span>
              </div>
              <div class="stat-pill stat-pill--soft">
                <i class="bi bi-star-fill"></i>
                <span>Avg {{ averageScore }}/100</span>
              </div>
              <div class="stat-pill stat-pill--soft">
                <i class="bi bi-hourglass-split"></i>
                <span>{{ totalDurationLabel }}</span>
              </div>
              <div class="stat-pill stat-pill--soft">
                <i class="bi bi-award-fill"></i>
                <span>{{ levelLabel }}</span>
              </div>

              <div v-if="loading" class="stat-pill stat-pill--soft" aria-live="polite">
                <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                <span>Memuat…</span>
              </div>

              <button class="btn btn-primary btn-sm" type="button" @click="fetchData" :disabled="loading">
                <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
                Refresh
              </button>
              <button class="btn btn-ghost btn-sm" type="button" @click="scrollToHistory">
                <i class="bi bi-list-check me-1" aria-hidden="true"></i>
                Lihat Riwayat
              </button>
            </div>
          </div>

          <div class="hero__art">
            <div class="hero-card hero-card--primary">
              <div class="hero-card__icon" aria-hidden="true">
                <i class="bi bi-trophy-fill"></i>
              </div>
              <div class="hero-card__title">Target hari ini</div>
              <div class="hero-card__text">Main 1 lagu dan coba raih score di atas 80 untuk naik level lebih cepat.</div>
              <router-link to="/songs" class="btn btn-primary btn-sm hero-card__btn">
                <i class="bi bi-play-circle-fill"></i>
                Pilih lagu
              </router-link>
            </div>

            <div class="hero-card hero-card--soft">
              <div class="hero-card__icon" aria-hidden="true">
                <i class="bi bi-lightning-charge-fill"></i>
              </div>
              <div class="hero-card__title">Tips</div>
              <div class="hero-card__text">Nyanyikan dengan tempo stabil dan artikulasi jelas untuk score lebih tinggi.</div>
              <router-link to="/karaoke" class="btn btn-ghost btn-sm hero-card__btn">
                <i class="bi bi-mic-fill"></i>
                Karaoke
              </router-link>
            </div>
          </div>
        </section>

        <div v-if="errorMessage && !loading" class="alert-card alert-card--danger reveal" style="--d: 70ms" role="status">
          <div class="alert-icon" aria-hidden="true">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div class="alert-body">
            <div class="alert-title">Gagal memuat data</div>
            <div class="alert-text text-muted">{{ errorMessage }}</div>
          </div>
          <button class="btn btn-ghost btn-sm" type="button" @click="fetchData">
            <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
            Coba lagi
          </button>
        </div>

        <section class="content-grid">
          <!-- History -->
          <div ref="historySectionRef" class="panel history-panel reveal" style="--d: 90ms">
            <div class="panel-header">
              <div class="panel-title">
                <div class="panel-icon" aria-hidden="true">
                  <i class="bi bi-clock-history"></i>
                </div>
                <div class="panel-title__copy">
                  <h2>Riwayat Terakhir</h2>
                  <p class="text-muted">Daftar lagu yang baru kamu mainkan.</p>
                </div>
              </div>
              <div class="panel-actions">
                <span class="pill pill--soft" aria-hidden="true">{{ history.length }} item</span>
                <button class="btn btn-ghost btn-sm" type="button" @click="fetchData" :disabled="loading">
                  <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
                  Refresh
                </button>
              </div>
            </div>

            <div v-if="loading" class="history-list history-list--skeleton" aria-hidden="true">
              <div v-for="n in 10" :key="n" class="history-item history-item--skeleton">
                <div class="history-thumb">
                  <div class="skeleton-thumb loading-skeleton"></div>
                </div>
                <div class="history-info">
                  <div class="skeleton-line loading-skeleton"></div>
                  <div class="skeleton-line skeleton-line--sm loading-skeleton"></div>
                  <div class="skeleton-row">
                    <div class="skeleton-pill loading-skeleton"></div>
                    <div class="skeleton-pill loading-skeleton"></div>
                  </div>
                </div>
                <div class="history-actions">
                  <div class="skeleton-btn loading-skeleton"></div>
                </div>
              </div>
            </div>

            <div v-else-if="history.length === 0" class="empty-state reveal" style="--d: 0ms">
              <div class="empty-icon" aria-hidden="true">
                <i class="bi bi-clock"></i>
              </div>
              <h3>Belum ada riwayat</h3>
              <p class="text-muted">Main karaoke dulu, nanti riwayat dan score akan muncul di sini.</p>
              <router-link to="/songs" class="btn btn-primary btn-sm">
                <i class="bi bi-play-circle-fill me-1" aria-hidden="true"></i>
                Pilih Lagu
              </router-link>
            </div>

            <div v-else class="history-list">
              <article
                v-for="item in history"
                :key="item.id"
                class="history-item"
                role="button"
                tabindex="0"
                @click="playSong(item.song)"
                @keydown.enter.prevent="playSong(item.song)"
                @keydown.space.prevent="playSong(item.song)"
              >
                <div class="history-thumb" aria-hidden="true">
                  <img v-if="getThumbnailUrl(item.song)" :src="getThumbnailUrl(item.song)" :alt="item.song?.title || ''" />
                  <div v-else class="thumb-placeholder">
                    <i class="bi bi-music-note-beamed"></i>
                  </div>
                </div>

                <div class="history-info">
                  <div class="history-top">
                    <h3 :title="item.song?.title || ''">{{ item.song?.title || 'Unknown' }}</h3>
                    <span class="history-date text-muted">{{ formatDate(item.created_at) }}</span>
                  </div>
                  <p class="text-muted">{{ item.song?.artist || '-' }}</p>

                  <div class="history-meta">
                    <span v-if="item.score !== null && item.score !== undefined" class="meta-pill">
                      <i class="bi bi-star-fill" aria-hidden="true"></i>
                      {{ item.score }}/100
                    </span>
                    <span v-if="item.duration_played" class="meta-pill meta-pill--soft">
                      <i class="bi bi-clock" aria-hidden="true"></i>
                      {{ formatSeconds(item.duration_played) }}
                    </span>
                  </div>
                </div>

                <div class="history-actions" @click.stop>
                  <button class="btn btn-primary btn-sm" type="button" @click="playSong(item.song)" :disabled="!item.song?.id">
                    <i class="bi bi-play-fill" aria-hidden="true"></i>
                    Play
                  </button>
                </div>
              </article>
            </div>

            <div v-if="!loading && hasMore" class="load-more">
              <button class="btn btn-ghost" type="button" @click="loadMore" :disabled="loadingMore">
                <span v-if="loadingMore" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                {{ loadingMore ? 'Memuat…' : 'Muat lebih banyak' }}
              </button>
            </div>
          </div>

          <!-- Side panels -->
          <aside class="side-panel">
            <div class="panel stats-panel reveal" style="--d: 120ms">
              <div class="panel-header panel-header--compact">
                <div class="panel-title">
                  <div class="panel-icon panel-icon--soft" aria-hidden="true">
                    <i class="bi bi-graph-up-arrow"></i>
                  </div>
                  <div class="panel-title__copy">
                    <h2>Ringkasan</h2>
                    <p class="text-muted">Progress karaoke kamu.</p>
                  </div>
                </div>
              </div>

              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon" aria-hidden="true"><i class="bi bi-music-note-list"></i></div>
                  <div class="stat-info">
                    <div class="stat-value">{{ totalSongsPlayed }}</div>
                    <div class="stat-label">Total lagu</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon stat-icon--soft" aria-hidden="true"><i class="bi bi-star-fill"></i></div>
                  <div class="stat-info">
                    <div class="stat-value">{{ averageScore }}</div>
                    <div class="stat-label">Rata-rata</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon stat-icon--soft" aria-hidden="true"><i class="bi bi-hourglass-split"></i></div>
                  <div class="stat-info">
                    <div class="stat-value">{{ totalDurationShort }}</div>
                    <div class="stat-label">Total waktu</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon stat-icon--accent" aria-hidden="true"><i class="bi bi-award-fill"></i></div>
                  <div class="stat-info">
                    <div class="stat-value">{{ levelLabel }}</div>
                    <div class="stat-label">Level kamu</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="panel highscores-panel reveal" style="--d: 150ms">
              <div class="panel-header panel-header--compact">
                <div class="panel-title">
                  <div class="panel-icon panel-icon--soft" aria-hidden="true">
                    <i class="bi bi-trophy-fill"></i>
                  </div>
                  <div class="panel-title__copy">
                    <h2>High Scores</h2>
                    <p class="text-muted">Top skor terbaikmu.</p>
                  </div>
                </div>
                <span class="pill pill--soft" aria-hidden="true">{{ highScores.length }}</span>
              </div>

              <div v-if="loading" class="highscores-list highscores-list--skeleton" aria-hidden="true">
                <div v-for="n in 6" :key="n" class="highscore-item highscore-item--skeleton">
                  <div class="rank-badge loading-skeleton"></div>
                  <div class="history-thumb">
                    <div class="skeleton-thumb loading-skeleton"></div>
                  </div>
                  <div class="history-info">
                    <div class="skeleton-line loading-skeleton"></div>
                    <div class="skeleton-line skeleton-line--sm loading-skeleton"></div>
                  </div>
                  <div class="score-pill loading-skeleton"></div>
                </div>
              </div>

              <div v-else-if="highScores.length === 0" class="empty-mini">
                <div class="empty-mini__icon" aria-hidden="true">
                  <i class="bi bi-trophy"></i>
                </div>
                <div class="empty-mini__title">Belum ada high score</div>
                <div class="empty-mini__text text-muted">Main karaoke dan raih skor terbaikmu.</div>
              </div>

              <div v-else class="highscores-list">
                <article
                  v-for="(item, idx) in highScores"
                  :key="item.id"
                  class="highscore-item"
                  role="button"
                  tabindex="0"
                  @click="playSong(item.song)"
                  @keydown.enter.prevent="playSong(item.song)"
                  @keydown.space.prevent="playSong(item.song)"
                >
                  <div class="rank-badge" :class="rankClass(idx)">
                    {{ idx + 1 }}
                  </div>

                  <div class="history-thumb" aria-hidden="true">
                    <img v-if="getThumbnailUrl(item.song)" :src="getThumbnailUrl(item.song)" :alt="item.song?.title || ''" />
                    <div v-else class="thumb-placeholder">
                      <i class="bi bi-music-note-beamed"></i>
                    </div>
                  </div>

                  <div class="history-info">
                    <h3 :title="item.song?.title || ''">{{ item.song?.title || 'Unknown' }}</h3>
                    <p class="text-muted">{{ item.song?.artist || '-' }}</p>
                  </div>

                  <div class="score-pill" aria-label="Score">
                    <i class="bi bi-star-fill" aria-hidden="true"></i>
                    {{ item.score }}
                  </div>
                </article>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>

    <MobileNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { playbackAPI } from '@/services/api'
import { getThumbnailUrl } from '@/utils/media'
import MobileNav from '@/components/MobileNav.vue'

const router = useRouter()

const summary = ref({})
const history = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const errorMessage = ref('')
const page = ref(1)
const hasMore = ref(false)

const historySectionRef = ref(null)

const safeSummary = computed(() => summary.value || {})
const highScores = computed(() => safeSummary.value.highScores || [])

const totalSongsPlayed = computed(() => Number(safeSummary.value.totalSongsPlayed) || 0)
const averageScore = computed(() => Number(safeSummary.value.averageScore) || 0)
const totalDurationMinutes = computed(() => Number(safeSummary.value.totalDurationMinutes) || 0)

const levelLabel = computed(() => {
  const badge = safeSummary.value.badge || '🎤'
  const level = safeSummary.value.level || 'Pemula'
  return `${badge} ${level}`
})

const totalDurationLabel = computed(() => {
  const minutes = totalDurationMinutes.value
  if (!minutes) return '0 menit'
  if (minutes < 60) return `${minutes} menit`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining ? `${hours} jam ${remaining} menit` : `${hours} jam`
})

const totalDurationShort = computed(() => {
  const minutes = totalDurationMinutes.value
  if (!minutes) return '0m'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining ? `${hours}j ${remaining}m` : `${hours}j`
})

const fetchData = async () => {
  loading.value = true
  errorMessage.value = ''
  page.value = 1

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
    errorMessage.value = err.response?.data?.message || 'Gagal memuat riwayat'
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loading.value || loadingMore.value || !hasMore.value) return

  loadingMore.value = true
  errorMessage.value = ''
  page.value += 1

  try {
    const response = await playbackAPI.getHistory({ page: page.value, limit: 20 })
    history.value.push(...(response.data.data || []))
    hasMore.value = response.data.meta?.hasNextPage || false
  } catch (err) {
    console.error(err)
    page.value -= 1
    errorMessage.value = err.response?.data?.message || 'Gagal memuat riwayat'
  } finally {
    loadingMore.value = false
  }
}

const playSong = (song) => {
  if (!song?.id) return
  router.push(`/karaoke/${song.id}`)
}

const scrollToHistory = () => {
  historySectionRef.value?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const formatSeconds = (seconds) => {
  const total = Number(seconds) || 0
  if (!total) return '0:00'
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const rankClass = (idx) => {
  if (idx === 0) return 'rank-badge--gold'
  if (idx === 1) return 'rank-badge--silver'
  if (idx === 2) return 'rank-badge--bronze'
  return 'rank-badge--default'
}

onMounted(fetchData)
</script>

<style scoped>
.page-layout {
  /* Local theme override (green–blue gradient) */
  --hp-green: #22c55e;
  --hp-cyan: #06b6d4;
  --hp-blue: #3b82f6;

  --primary: var(--hp-cyan);
  --primary-light: #22d3ee;
  --primary-dark: #0891b2;
  --secondary: var(--hp-green);
  --accent: var(--hp-blue);

  --bg-dark: #061319;
  --bg-darker: #040c10;
  --bg-card: rgba(10, 22, 28, 0.72);
  --bg-card-hover: rgba(14, 30, 37, 0.82);
  --border-color: rgba(94, 234, 212, 0.14);
  --border-color-light: rgba(94, 234, 212, 0.28);

  --gradient-primary: linear-gradient(135deg, #22c55e 0%, #06b6d4 55%, #3b82f6 100%);
  --gradient-glow: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.28) 0%,
    rgba(6, 182, 212, 0.32) 55%,
    rgba(59, 130, 246, 0.22) 100%
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
    radial-gradient(900px 600px at 8% 10%, rgba(34, 197, 94, 0.2) 0%, transparent 55%),
    radial-gradient(820px 560px at 92% 16%, rgba(6, 182, 212, 0.18) 0%, transparent 55%),
    radial-gradient(980px 680px at 70% 92%, rgba(59, 130, 246, 0.14) 0%, transparent 60%),
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
  opacity: 0.32;
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
  opacity: 0.18;
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
  max-width: 70ch;
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
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.12) 0%,
    rgba(6, 182, 212, 0.1) 55%,
    rgba(59, 130, 246, 0.12) 100%
  );
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

/* Alerts */
.alert-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(10, 22, 28, 0.62);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.4);
  margin-bottom: 1.25rem;
}

.alert-card--danger {
  border-color: rgba(239, 68, 68, 0.22);
  background: rgba(239, 68, 68, 0.08);
}

.alert-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  border: 1px solid rgba(239, 68, 68, 0.22);
  background: rgba(239, 68, 68, 0.12);
  display: grid;
  place-items: center;
  color: rgba(254, 202, 202, 0.98);
  flex: 0 0 auto;
}

.alert-body {
  min-width: 0;
  flex: 1;
}

.alert-title {
  font-weight: 800;
}

.alert-text {
  font-size: 0.92rem;
}

/* Content grid */
.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr);
  gap: 1.25rem;
  align-items: start;
}

.side-panel {
  display: grid;
  gap: 1.25rem;
}

/* Panels */
.panel {
  background: var(--bg-card);
  border: 1px solid rgba(94, 234, 212, 0.14);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 14px 60px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 1.2rem 1rem;
  border-bottom: 1px solid rgba(94, 234, 212, 0.14);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0) 100%);
}

.panel-header--compact {
  align-items: center;
}

.panel-title {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  min-width: 0;
}

.panel-title__copy {
  min-width: 0;
}

.panel-title h2 {
  margin: 0;
  font-weight: 850;
  letter-spacing: -0.01em;
  font-size: 1.15rem;
}

.panel-title p {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
}

.panel-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  place-items: center;
  color: var(--primary-light);
  flex: 0 0 auto;
}

.panel-icon--soft {
  background: rgba(6, 182, 212, 0.08);
}

.panel-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(94, 234, 212, 0.14);
  color: var(--text-secondary);
  font-size: 0.78rem;
}

.pill--soft {
  background: rgba(6, 182, 212, 0.08);
}

/* Stats panel */
.stats-panel .stats-grid {
  padding: 1rem 1.2rem 1.2rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.stat-card {
  border-radius: var(--radius-lg);
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.18);
  padding: 0.9rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  place-items: center;
  color: var(--primary-light);
  flex: 0 0 auto;
}

.stat-icon--soft {
  background: rgba(6, 182, 212, 0.08);
}

.stat-icon--accent {
  border-color: rgba(34, 197, 94, 0.18);
  background: rgba(34, 197, 94, 0.1);
  color: rgba(187, 247, 208, 0.98);
}

.stat-value {
  font-weight: 900;
  letter-spacing: -0.02em;
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* History */
.history-list {
  padding: 1rem 1.2rem 1.2rem;
  display: grid;
  gap: 0.85rem;
}

.history-item {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) auto;
  gap: 0.9rem;
  align-items: center;
  padding: 0.9rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.18);
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
  cursor: pointer;
  outline: none;
}

.history-item:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.26);
  background: rgba(255, 255, 255, 0.04);
}

.history-item:focus-visible {
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.16);
}

.history-thumb {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.22);
  overflow: hidden;
  display: grid;
  place-items: center;
  color: var(--text-muted);
}

.history-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-placeholder i {
  font-size: 1.35rem;
}

.history-info {
  min-width: 0;
}

.history-top {
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  align-items: baseline;
}

.history-info h3 {
  margin: 0 0 0.18rem;
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-info p {
  margin: 0;
  font-size: 0.88rem;
}

.history-date {
  font-size: 0.82rem;
  white-space: nowrap;
  flex: 0 0 auto;
}

.history-meta {
  margin-top: 0.6rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(94, 234, 212, 0.14);
  color: var(--text-secondary);
  font-size: 0.78rem;
}

.meta-pill i {
  color: var(--primary-light);
}

.meta-pill--soft {
  background: rgba(255, 255, 255, 0.06);
}

.history-actions {
  display: flex;
  align-items: center;
}

.load-more {
  padding: 0 1.2rem 1.2rem;
  display: flex;
  justify-content: center;
}

/* Highscores */
.highscores-list {
  padding: 1rem 1.2rem 1.2rem;
  display: grid;
  gap: 0.75rem;
}

.highscore-item {
  display: grid;
  grid-template-columns: auto 46px minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.8rem 0.85rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.18);
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
  cursor: pointer;
  outline: none;
}

.highscore-item:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.26);
  background: rgba(255, 255, 255, 0.04);
}

.rank-badge {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 0.85rem;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
}

.rank-badge--gold {
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.12);
  color: rgba(253, 230, 138, 0.98);
}

.rank-badge--silver {
  border-color: rgba(148, 163, 184, 0.26);
  background: rgba(148, 163, 184, 0.12);
  color: rgba(226, 232, 240, 0.98);
}

.rank-badge--bronze {
  border-color: rgba(249, 115, 22, 0.28);
  background: rgba(249, 115, 22, 0.12);
  color: rgba(254, 215, 170, 0.98);
}

.score-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(94, 234, 212, 0.18);
  color: rgba(165, 243, 252, 0.98);
  font-weight: 900;
  font-size: 0.85rem;
}

.score-pill i {
  color: var(--primary-light);
}

/* Empty states */
.empty-state {
  text-align: center;
  padding: 2.3rem 1rem 2.1rem;
}

.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.22);
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.45);
  margin-bottom: 0.9rem;
}

.empty-icon i {
  font-size: 2rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.empty-state h3 {
  font-weight: 900;
  margin: 0 0 0.25rem;
}

.empty-state p {
  margin: 0 0 0.85rem;
}

.empty-mini {
  padding: 1rem 1.2rem 1.2rem;
  text-align: center;
}

.empty-mini__icon {
  width: 56px;
  height: 56px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.22);
  margin-bottom: 0.7rem;
}

.empty-mini__icon i {
  font-size: 1.6rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.empty-mini__title {
  font-weight: 900;
}

.empty-mini__text {
  font-size: 0.9rem;
}

/* Skeleton */
.history-item--skeleton,
.highscore-item--skeleton {
  pointer-events: none;
}

.skeleton-thumb {
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
  width: 76px;
  border-radius: 999px;
}

.skeleton-btn {
  height: 38px;
  width: 88px;
  border-radius: 14px;
}

/* In-page button theme overrides */
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

  .history-item,
  .highscore-item,
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

  .content-grid {
    grid-template-columns: 1fr;
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

  .hero {
    padding: 1.15rem;
  }

  .hero h1 {
    font-size: 1.55rem;
  }

  .hero__art {
    grid-template-columns: 1fr;
  }

  .stats-panel .stats-grid {
    grid-template-columns: 1fr;
  }

  .history-item {
    grid-template-columns: 56px minmax(0, 1fr);
  }

  .history-actions {
    display: none;
  }

  .highscore-item {
    grid-template-columns: auto 46px minmax(0, 1fr);
  }

  .score-pill {
    justify-self: start;
    margin-top: 0.55rem;
    grid-column: 3 / -1;
    width: fit-content;
  }
}

@media (max-width: 425px) {
  .page-content {
    padding: 1rem;
  }

  .panel-header {
    padding: 1rem;
  }

  .history-list,
  .highscores-list,
  .stats-panel .stats-grid {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
