<template>
  <div class="admin-dashboard">
    <header class="page-header reveal" style="--d: 0ms">
      <div class="page-header__copy">
        <div class="page-badge">
          <i class="bi bi-speedometer2" aria-hidden="true"></i>
          <span>Admin Dashboard</span>
        </div>
        <h1>Ringkasan admin yang cepat & jelas</h1>
        <p class="text-muted">
          Pantau statistik utama, cek aktivitas terbaru, dan jalankan aksi penting hanya dalam beberapa klik.
        </p>
        <div class="page-meta text-muted">
          <i class="bi bi-clock" aria-hidden="true"></i>
          <span>Terakhir update: {{ lastUpdatedLabel }}</span>
        </div>
      </div>

      <div class="page-header__actions">
        <button class="btn btn-ghost" type="button" @click="fetchDashboard" :disabled="loading">
          <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
          {{ loading ? 'Memuat…' : 'Refresh' }}
        </button>
        <button class="btn btn-primary" type="button" @click="openScanModal">
          <i class="bi bi-folder-plus" aria-hidden="true"></i>
          Scan Lagu Baru
        </button>
      </div>
    </header>

    <div v-if="errorMessage && !loading" class="alert-card alert-card--danger reveal" style="--d: 60ms" role="status">
      <div class="alert-icon" aria-hidden="true">
        <i class="bi bi-exclamation-triangle-fill"></i>
      </div>
      <div class="alert-body">
        <div class="alert-title">Gagal memuat dashboard</div>
        <div class="alert-text text-muted">{{ errorMessage }}</div>
      </div>
      <button class="btn btn-ghost btn-sm" type="button" @click="fetchDashboard">
        <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
        Coba lagi
      </button>
    </div>

    <!-- Stats -->
    <section class="stats-grid reveal" style="--d: 90ms" aria-label="Ringkasan statistik">
      <template v-if="loading">
        <div v-for="n in 5" :key="n" class="stat-card stat-card--skeleton">
          <div class="stat-icon loading-skeleton" aria-hidden="true"></div>
          <div class="stat-body">
            <div class="skeleton-line loading-skeleton"></div>
            <div class="skeleton-line skeleton-line--lg loading-skeleton"></div>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-for="card in statCards" :key="card.key" class="stat-card" :class="card.tone">
          <div class="stat-icon" aria-hidden="true">
            <i :class="card.icon"></i>
          </div>
          <div class="stat-body">
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">{{ formatNumber(card.value) }}</div>
            <div v-if="card.hint" class="stat-hint text-muted">{{ card.hint }}</div>
          </div>
          <router-link v-if="card.to" :to="card.to" class="stat-link">
            <span>{{ card.linkLabel }}</span>
            <i class="bi bi-arrow-right" aria-hidden="true"></i>
          </router-link>
        </div>
      </template>
    </section>

    <section class="content-grid">
      <!-- Top Songs -->
      <div class="panel reveal" style="--d: 120ms">
        <div class="panel-header">
          <div class="panel-title">
            <div class="panel-icon" aria-hidden="true">
              <i class="bi bi-fire"></i>
            </div>
            <div class="panel-title__copy">
              <h2>Lagu Terpopuler</h2>
              <p class="text-muted">Top 5 berdasarkan jumlah play.</p>
            </div>
          </div>
          <router-link to="/admin/songs" class="btn btn-ghost btn-sm">
            <i class="bi bi-music-note-list" aria-hidden="true"></i>
            Kelola lagu
          </router-link>
        </div>

        <div class="panel-body">
          <div v-if="loading" class="list-skeleton" aria-hidden="true">
            <div v-for="n in 5" :key="n" class="list-row">
              <div class="rank-pill loading-skeleton"></div>
              <div class="list-main">
                <div class="skeleton-line loading-skeleton"></div>
                <div class="skeleton-line skeleton-line--sm loading-skeleton"></div>
              </div>
              <div class="value-pill loading-skeleton"></div>
            </div>
          </div>

          <div v-else class="list">
            <div v-for="(song, i) in topSongs" :key="song.id" class="list-item">
              <div class="rank-pill" aria-hidden="true">{{ i + 1 }}</div>
              <div class="item-info">
                <div class="item-title" :title="song.title">{{ song.title }}</div>
                <div class="item-sub text-muted" :title="song.artist">{{ song.artist }}</div>
              </div>
              <div class="item-metric">
                <span class="metric-pill">
                  <i class="bi bi-play-fill" aria-hidden="true"></i>
                  {{ formatNumber(song.play_count) }}
                </span>
              </div>
            </div>

            <div v-if="!topSongs.length" class="empty-state">
              <div class="empty-icon" aria-hidden="true"><i class="bi bi-emoji-neutral"></i></div>
              <h3>Belum ada data</h3>
              <p class="text-muted">Play count akan muncul setelah ada aktivitas pemutaran lagu.</p>
            </div>
          </div>
        </div>
      </div>

      <aside class="side-panel">
        <!-- Recent users -->
        <div class="panel reveal" style="--d: 150ms">
          <div class="panel-header">
            <div class="panel-title">
              <div class="panel-icon panel-icon--soft" aria-hidden="true">
                <i class="bi bi-person-plus"></i>
              </div>
              <div class="panel-title__copy">
                <h2>User Terbaru</h2>
                <p class="text-muted">5 user yang baru mendaftar.</p>
              </div>
            </div>
            <router-link to="/admin/users" class="btn btn-ghost btn-sm">
              <i class="bi bi-people-fill" aria-hidden="true"></i>
              Lihat semua
            </router-link>
          </div>

          <div class="panel-body">
            <div v-if="loading" class="list-skeleton" aria-hidden="true">
              <div v-for="n in 5" :key="n" class="list-row">
                <div class="avatar-skeleton loading-skeleton"></div>
                <div class="list-main">
                  <div class="skeleton-line loading-skeleton"></div>
                  <div class="skeleton-line skeleton-line--sm loading-skeleton"></div>
                </div>
                <div class="value-pill loading-skeleton"></div>
              </div>
            </div>

            <div v-else class="list">
              <div v-for="user in recentUsers" :key="user.id" class="list-item">
                <div class="avatar-pill" aria-hidden="true">
                  <i class="bi bi-person-circle"></i>
                </div>
                <div class="item-info">
                  <div class="item-title" :title="user.name">{{ user.name }}</div>
                  <div class="item-sub text-muted" :title="user.email">{{ user.email }}</div>
                </div>
                <div class="item-metric">
                  <span class="metric-pill metric-pill--soft">{{ formatDate(user.created_at) }}</span>
                </div>
              </div>

              <div v-if="!recentUsers.length" class="empty-state empty-state--compact">
                <div class="empty-icon" aria-hidden="true"><i class="bi bi-person"></i></div>
                <h3>Belum ada user</h3>
                <p class="text-muted">User baru akan muncul di sini.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="panel reveal" style="--d: 180ms">
          <div class="panel-header panel-header--compact">
            <div class="panel-title">
              <div class="panel-icon" aria-hidden="true">
                <i class="bi bi-lightning-charge-fill"></i>
              </div>
              <div class="panel-title__copy">
                <h2>Quick Actions</h2>
                <p class="text-muted">Aksi yang paling sering dipakai.</p>
              </div>
            </div>
          </div>

          <div class="panel-body">
            <div class="actions-grid">
              <button class="action-card" type="button" @click="openScanModal">
                <div class="action-icon" aria-hidden="true"><i class="bi bi-folder-plus"></i></div>
                <div class="action-copy">
                  <div class="action-title">Scan lagu</div>
                  <div class="action-sub text-muted">Ambil lagu baru dari folder (rekursif).</div>
                </div>
                <i class="bi bi-chevron-right action-arrow" aria-hidden="true"></i>
              </button>

              <router-link to="/admin/uploads" class="action-card action-card--link">
                <div class="action-icon" aria-hidden="true"><i class="bi bi-cloud-check-fill"></i></div>
                <div class="action-copy">
                  <div class="action-title">Review upload</div>
                  <div class="action-sub text-muted">Approve/Reject upload yang pending.</div>
                </div>
                <i class="bi bi-chevron-right action-arrow" aria-hidden="true"></i>
              </router-link>

              <router-link to="/admin/payment-methods" class="action-card action-card--link">
                <div class="action-icon" aria-hidden="true"><i class="bi bi-credit-card-2-front-fill"></i></div>
                <div class="action-copy">
                  <div class="action-title">Metode pembayaran</div>
                  <div class="action-sub text-muted">Kelola QRIS, e-wallet, dan bank.</div>
                </div>
                <i class="bi bi-chevron-right action-arrow" aria-hidden="true"></i>
              </router-link>
            </div>
          </div>
        </div>
      </aside>
    </section>

    <!-- Scan Modal -->
    <transition name="ad-modal">
      <div
        v-if="showScanModal"
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Scan lagu dari folder"
        @click.self="closeScanModal"
      >
        <div class="modal-content" :class="{ 'is-loading': scanning }">
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon" aria-hidden="true"><i class="bi bi-folder2-open"></i></div>
              <div class="modal-title__copy">
                <h3>Scan Lagu dari Folder</h3>
                <p class="text-muted">Mendeteksi lagu baru dari <code>./uploads/videos</code> (termasuk subfolder).</p>
              </div>
            </div>
            <button class="icon-close" type="button" @click="closeScanModal" aria-label="Tutup modal">
              <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="modal-note">
              <i class="bi bi-info-circle-fill" aria-hidden="true"></i>
              <div class="modal-note__copy">
                <div class="modal-note__title">Format file yang di-scan</div>
                <div class="modal-note__text text-muted">
                  <code>JUDUL LAGU#NAMA ARTIS#NEGARA.mp4</code> atau <code>.mpg</code>. File lain akan diabaikan.
                </div>
              </div>
            </div>

            <label class="toggle-row">
              <input class="toggle" type="checkbox" v-model="scanDryRun" :disabled="scanning" />
              <span class="toggle-ui" aria-hidden="true"></span>
              <span class="toggle-copy">
                <span class="toggle-title">Dry Run</span>
                <span class="toggle-sub text-muted">Preview dulu tanpa menambah ke database.</span>
              </span>
            </label>

            <div v-if="scanError" class="status-banner is-danger" role="status" aria-live="polite">
              <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
              <span>{{ scanError }}</span>
            </div>

            <div
              v-if="scanResult"
              class="status-banner"
              :class="scanResult.success ? 'is-success' : 'is-info'"
              role="status"
              aria-live="polite"
            >
              <i
                :class="scanResult.success ? 'bi bi-check-circle-fill' : 'bi bi-info-circle-fill'"
                aria-hidden="true"
              ></i>
              <div class="status-banner__copy">
                <div class="status-title">Hasil scan</div>
                <div class="status-text text-muted">
                  Total: {{ scanResult.total }} · Ditambahkan: {{ scanResult.added }} · Dilewati: {{ scanResult.skipped }} ·
                  Diabaikan: {{ scanResult.ignored || 0 }}
                </div>
              </div>
            </div>

            <div v-if="scanning" class="scan-loading" aria-live="polite">
              <span class="spinner" aria-hidden="true"></span>
              <span class="text-muted">Scanning… mohon tunggu</span>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-ghost" type="button" @click="closeScanModal" :disabled="scanning">
              Tutup
            </button>
            <button class="btn btn-primary" type="button" @click="doScan" :disabled="scanning">
              <i class="bi bi-search" aria-hidden="true"></i>
              {{ scanning ? 'Scanning…' : 'Mulai Scan' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { adminAPI } from '@/services/api'

const stats = ref({})
const loading = ref(true)
const errorMessage = ref('')
const lastUpdatedAt = ref(Date.now())

const showScanModal = ref(false)
const scanning = ref(false)
const scanDryRun = ref(true)
const scanResult = ref(null)
const scanError = ref('')

const formatNumber = (value) => {
  const n = Number(value) || 0
  return new Intl.NumberFormat('id-ID').format(n)
}

const lastUpdatedLabel = computed(() => {
  const date = new Date(lastUpdatedAt.value || Date.now())
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date)
})

const statCards = computed(() => [
  {
    key: 'users',
    label: 'Total Users',
    value: stats.value.totalUsers || 0,
    icon: 'bi bi-people-fill',
    tone: 'tone-blue'
  },
  {
    key: 'songs',
    label: 'Total Lagu',
    value: stats.value.totalSongs || 0,
    icon: 'bi bi-music-note-list',
    tone: 'tone-cyan',
    hint: `${formatNumber(stats.value.activeSongs || 0)} aktif`
  },
  {
    key: 'plays',
    label: 'Total Play',
    value: stats.value.totalPlays || 0,
    icon: 'bi bi-play-circle-fill',
    tone: 'tone-green'
  },
  {
    key: 'today',
    label: 'Play Hari Ini',
    value: stats.value.playsToday || 0,
    icon: 'bi bi-graph-up-arrow',
    tone: 'tone-cyan'
  },
  {
    key: 'pending',
    label: 'Pending Upload',
    value: stats.value.pendingUploads || 0,
    icon: 'bi bi-clock-fill',
    tone: 'tone-blue',
    to: '/admin/uploads',
    linkLabel: 'Review'
  }
])

const topSongs = computed(() => (Array.isArray(stats.value.topSongs) ? stats.value.topSongs : []))
const recentUsers = computed(() => (Array.isArray(stats.value.recentUsers) ? stats.value.recentUsers : []))

const fetchDashboard = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await adminAPI.getDashboard()
    stats.value = response.data.data || {}
    lastUpdatedAt.value = Date.now()
  } catch (err) {
    console.error(err)
    errorMessage.value = err.response?.data?.message || 'Terjadi kesalahan saat mengambil data.'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const openScanModal = () => {
  scanResult.value = null
  scanError.value = ''
  showScanModal.value = true
}

const closeScanModal = () => {
  if (scanning.value) return
  showScanModal.value = false
}

const doScan = async () => {
  scanning.value = true
  scanResult.value = null
  scanError.value = ''

  try {
    const response = await adminAPI.scanSongs(null, scanDryRun.value)
    scanResult.value = response.data.data

    if (!scanDryRun.value && scanResult.value.added > 0) {
      fetchDashboard()
    }
  } catch (err) {
    console.error(err)
    scanError.value = err.response?.data?.message || 'Gagal melakukan scan lagu.'
  } finally {
    scanning.value = false
  }
}

const onKeydown = (event) => {
  if (event.key !== 'Escape') return
  if (!showScanModal.value) return
  closeScanModal()
}

onMounted(() => {
  fetchDashboard()
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1.25rem 1.25rem 1.15rem;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: linear-gradient(180deg, rgba(10, 22, 28, 0.72) 0%, rgba(4, 12, 16, 0.68) 100%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 18px 80px rgba(0, 0, 0, 0.45);
  position: relative;
  overflow: hidden;
  margin-bottom: 1.25rem;
}

.page-header::before {
  content: '';
  position: absolute;
  inset: -1px;
  background:
    radial-gradient(540px 240px at 18% 10%, rgba(34, 197, 94, 0.16) 0%, transparent 62%),
    radial-gradient(540px 240px at 85% 42%, rgba(6, 182, 212, 0.14) 0%, transparent 62%),
    radial-gradient(560px 260px at 60% 120%, rgba(59, 130, 246, 0.12) 0%, transparent 64%);
  pointer-events: none;
}

.page-header__copy,
.page-header__actions {
  position: relative;
  z-index: 1;
}

.page-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.22);
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.85rem;
  margin-bottom: 0.85rem;
}

.page-badge i {
  color: rgba(187, 247, 208, 0.98);
}

.page-header h1 {
  margin: 0 0 0.35rem 0;
  font-size: 1.85rem;
  letter-spacing: -0.02em;
}

.page-header p {
  margin: 0;
  max-width: 72ch;
}

.page-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.7rem;
  font-size: 0.9rem;
}

.page-header__actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.stat-card {
  border-radius: 22px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.85rem;
  align-items: center;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 14px 55px rgba(0, 0, 0, 0.4);
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
}

.stat-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  background: var(--gradient-glow);
  opacity: 0;
  transform: translateX(-8%);
  transition: opacity var(--transition-normal), transform var(--transition-normal);
}

.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  place-items: center;
  position: relative;
  z-index: 1;
}

.stat-icon i {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.95);
}

.stat-body {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.82rem;
}

.stat-value {
  font-size: 1.65rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  margin-top: 0.12rem;
}

.stat-hint {
  font-size: 0.85rem;
  margin-top: 0.12rem;
}

.stat-link {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 0.35rem;
  padding: 0.85rem;
  color: rgba(165, 243, 252, 0.95);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 750;
  z-index: 2;
  opacity: 0.85;
}

.stat-card:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.24);
  background: rgba(0, 0, 0, 0.26);
}

.stat-card:hover::before {
  opacity: 0.14;
  transform: translateX(0);
}

.stat-card.tone-green .stat-icon {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.26), rgba(6, 182, 212, 0.12));
  border-color: rgba(34, 197, 94, 0.22);
}

.stat-card.tone-cyan .stat-icon {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.24), rgba(59, 130, 246, 0.12));
  border-color: rgba(94, 234, 212, 0.22);
}

.stat-card.tone-blue .stat-icon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.22), rgba(6, 182, 212, 0.12));
  border-color: rgba(59, 130, 246, 0.22);
}

.stat-card--skeleton {
  pointer-events: none;
}

.skeleton-line {
  height: 0.95rem;
  width: 100%;
  border-radius: 10px;
}

.skeleton-line--lg {
  height: 1.25rem;
  width: 65%;
  margin-top: 0.45rem;
}

/* Alert */
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

.alert-title {
  font-weight: 850;
}

.alert-body {
  min-width: 0;
  flex: 1;
}

.alert-text {
  font-size: 0.92rem;
}

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

.panel {
  background: rgba(10, 22, 28, 0.72);
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
  padding: 1.05rem 1.1rem 1rem;
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
  font-size: 1.12rem;
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
  color: rgba(165, 243, 252, 0.98);
  flex: 0 0 auto;
}

.panel-icon--soft {
  background: rgba(6, 182, 212, 0.08);
}

.panel-body {
  padding: 0.85rem 1.1rem 1.1rem;
}

.list {
  display: grid;
  gap: 0.55rem;
}

.list-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem 0.75rem;
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.12);
  background: rgba(0, 0, 0, 0.16);
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
}

.list-item:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.22);
  background: rgba(0, 0, 0, 0.22);
}

.rank-pill {
  width: 30px;
  height: 30px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--gradient-primary);
  color: white;
  font-weight: 900;
  font-size: 0.85rem;
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.35);
}

.avatar-pill {
  width: 30px;
  height: 30px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(94, 234, 212, 0.18);
  color: rgba(165, 243, 252, 0.95);
}

.avatar-pill i {
  font-size: 1.25rem;
}

.item-info {
  min-width: 0;
}

.item-title {
  font-weight: 900;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-sub {
  font-size: 0.86rem;
  margin-top: 0.14rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.metric-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.18);
  color: rgba(203, 213, 225, 0.92);
  font-size: 0.82rem;
  white-space: nowrap;
}

.metric-pill--soft {
  background: rgba(6, 182, 212, 0.08);
}

.empty-state {
  text-align: center;
  padding: 1.75rem 0.75rem 1.25rem;
}

.empty-state--compact {
  padding: 1.25rem 0.75rem 0.95rem;
}

.empty-icon {
  width: 62px;
  height: 62px;
  border-radius: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.22);
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.45);
  margin-bottom: 0.75rem;
}

.empty-icon i {
  font-size: 1.8rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.empty-state h3 {
  font-weight: 900;
  margin: 0 0 0.25rem;
}

.empty-state p {
  margin: 0;
}

/* Skeleton list */
.list-skeleton {
  display: grid;
  gap: 0.65rem;
}

.list-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem;
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.1);
  background: rgba(255, 255, 255, 0.03);
}

.list-main {
  display: grid;
  gap: 0.4rem;
}

.avatar-skeleton {
  width: 30px;
  height: 30px;
  border-radius: 12px;
}

.value-pill {
  width: 70px;
  height: 18px;
  border-radius: 999px;
}

.skeleton-line--sm {
  height: 0.75rem;
  width: 70%;
}

/* Actions */
.actions-grid {
  display: grid;
  gap: 0.75rem;
}

.action-card {
  width: 100%;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.8rem;
  align-items: center;
  padding: 0.85rem 0.9rem;
  border-radius: 22px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.16);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
  text-decoration: none;
}

.action-card:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.24);
  background: rgba(0, 0, 0, 0.22);
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  place-items: center;
  color: rgba(165, 243, 252, 0.98);
}

.action-icon i {
  font-size: 1.2rem;
}

.action-title {
  font-weight: 900;
  letter-spacing: -0.01em;
}

.action-sub {
  font-size: 0.88rem;
  margin-top: 0.1rem;
}

.action-arrow {
  color: rgba(165, 243, 252, 0.9);
  opacity: 0.9;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.76);
  z-index: 3000;
  display: grid;
  place-items: center;
  padding: 1.25rem;
}

.modal-content {
  width: min(760px, 100%);
  border-radius: 26px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(10, 22, 28, 0.8);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 22px 110px rgba(0, 0, 0, 0.65);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.2rem 1rem;
  border-bottom: 1px solid rgba(94, 234, 212, 0.14);
}

.modal-title {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
  min-width: 0;
}

.modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 18px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  place-items: center;
  color: rgba(165, 243, 252, 0.98);
  flex: 0 0 auto;
}

.modal-title__copy {
  min-width: 0;
}

.modal-title h3 {
  margin: 0;
  font-weight: 900;
  letter-spacing: -0.01em;
}

.modal-title p {
  margin: 0.2rem 0 0;
  font-size: 0.92rem;
}

.icon-close {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
}

.icon-close:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.28);
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 1.05rem 1.2rem 1.2rem;
  display: grid;
  gap: 0.9rem;
}

.modal-note {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  padding: 0.9rem 0.95rem;
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.18);
}

.modal-note i {
  color: rgba(165, 243, 252, 0.95);
  margin-top: 0.1rem;
}

.modal-note__title {
  font-weight: 900;
  letter-spacing: -0.01em;
}

.modal-note__text {
  margin-top: 0.15rem;
  font-size: 0.92rem;
  line-height: 1.5;
}

.toggle-row {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  gap: 0.7rem;
  align-items: center;
  padding: 0.85rem 0.95rem;
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.14);
  cursor: pointer;
}

.toggle {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.toggle-ui {
  width: 42px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.22);
  background: rgba(255, 255, 255, 0.08);
  position: relative;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.toggle-ui::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.92);
  transition: transform var(--transition-fast);
}

.toggle:checked + .toggle-ui {
  background: var(--gradient-primary);
  border-color: rgba(94, 234, 212, 0.28);
}

.toggle:checked + .toggle-ui::after {
  transform: translate(18px, -50%);
}

.toggle-copy {
  min-width: 0;
  display: grid;
}

.toggle-title {
  font-weight: 900;
}

.toggle-sub {
  font-size: 0.9rem;
  margin-top: 0.05rem;
}

.status-banner {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
  padding: 0.85rem 0.95rem;
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(0, 0, 0, 0.2);
}

.status-banner__copy {
  min-width: 0;
}

.status-title {
  font-weight: 900;
  letter-spacing: -0.01em;
}

.status-text {
  margin-top: 0.1rem;
  font-size: 0.9rem;
}

.status-banner.is-success {
  border-color: rgba(34, 197, 94, 0.22);
  background: rgba(34, 197, 94, 0.1);
}

.status-banner.is-success i {
  color: rgba(187, 247, 208, 0.98);
}

.status-banner.is-danger {
  border-color: rgba(239, 68, 68, 0.26);
  background: rgba(239, 68, 68, 0.1);
}

.status-banner.is-danger i {
  color: rgba(254, 202, 202, 0.98);
}

.status-banner.is-info i {
  color: rgba(165, 243, 252, 0.95);
}

.scan-loading {
  display: inline-flex;
  gap: 0.6rem;
  align-items: center;
  justify-content: center;
  padding: 0.95rem;
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.14);
}

.spinner {
  width: 0.95rem;
  height: 0.95rem;
  border-radius: 999px;
  border: 2px solid rgba(165, 243, 252, 0.35);
  border-top-color: rgba(165, 243, 252, 0.9);
  animation: spin 800ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-footer {
  padding: 1rem 1.2rem;
  border-top: 1px solid rgba(94, 234, 212, 0.14);
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.ad-modal-enter-active,
.ad-modal-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.ad-modal-enter-from,
.ad-modal-leave-to {
  opacity: 0;
  transform: translateY(10px);
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
  .reveal {
    animation: none;
  }

  .stat-card,
  .list-item,
  .action-card,
  .btn,
  .icon-close {
    transition: none !important;
  }

  .ad-modal-enter-active,
  .ad-modal-leave-active {
    transition: none !important;
  }
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header__actions {
    justify-content: stretch;
  }

  .page-header__actions .btn {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-overlay {
    padding: 0.85rem;
    align-items: end;
  }

  .modal-content {
    border-radius: 26px 26px 16px 16px;
  }
}

@media (max-width: 425px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-link {
    padding: 0.65rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
