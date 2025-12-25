<template>
  <div class="admin-dashboard">
    <h1 class="page-title">Dashboard Admin</h1>
    
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon users"><i class="bi bi-people-fill"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalUsers || 0 }}</span>
          <span class="stat-label">Total Users</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon songs"><i class="bi bi-music-note-list"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalSongs || 0 }}</span>
          <span class="stat-label">Total Lagu</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon plays"><i class="bi bi-play-circle-fill"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalPlays || 0 }}</span>
          <span class="stat-label">Total Play</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon today"><i class="bi bi-graph-up"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.playsToday || 0 }}</span>
          <span class="stat-label">Play Hari Ini</span>
        </div>
      </div>
      
      <div class="stat-card warning">
        <div class="stat-icon pending"><i class="bi bi-clock-fill"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.pendingUploads || 0 }}</span>
          <span class="stat-label">Pending Upload</span>
        </div>
        <router-link to="/admin/uploads" class="stat-link">Review →</router-link>
      </div>
    </div>
    
    <div class="content-grid">
      <!-- Top Songs -->
      <div class="content-card">
        <div class="card-header">
          <h3><i class="bi bi-fire me-2"></i>Lagu Terpopuler</h3>
        </div>
        <div class="card-body">
          <div v-for="(song, i) in stats.topSongs" :key="song.id" class="list-item">
            <span class="item-rank">{{ i + 1 }}</span>
            <div class="item-info">
              <h4>{{ song.title }}</h4>
              <p>{{ song.artist }}</p>
            </div>
            <span class="item-value">{{ song.play_count }} plays</span>
          </div>
          <div v-if="!stats.topSongs?.length" class="empty-state">Belum ada data</div>
        </div>
      </div>
      
      <!-- Recent Users -->
      <div class="content-card">
        <div class="card-header">
          <h3><i class="bi bi-person-plus me-2"></i>User Terbaru</h3>
        </div>
        <div class="card-body">
          <div v-for="user in stats.recentUsers" :key="user.id" class="list-item">
            <div class="item-avatar"><i class="bi bi-person-circle"></i></div>
            <div class="item-info">
              <h4>{{ user.name }}</h4>
              <p>{{ user.email }}</p>
            </div>
            <span class="item-date">{{ formatDate(user.created_at) }}</span>
          </div>
          <div v-if="!stats.recentUsers?.length" class="empty-state">Belum ada data</div>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="quick-actions">
      <h3>Quick Actions</h3>
      <div class="actions-grid">
        <button class="action-btn" @click="scanSongs">
          <i class="bi bi-folder-plus"></i>
          <span>Scan Lagu Baru</span>
        </button>
        <router-link to="/admin/songs" class="action-btn">
          <i class="bi bi-plus-circle"></i>
          <span>Tambah Lagu</span>
        </router-link>
        <router-link to="/admin/uploads" class="action-btn">
          <i class="bi bi-check-circle"></i>
          <span>Review Upload</span>
        </router-link>
      </div>
    </div>
    
    <!-- Scan Modal -->
    <div v-if="showScanModal" class="modal-overlay" @click.self="showScanModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Scan Lagu dari Folder</h3>
          <button @click="showScanModal = false"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-body">
          <p class="text-muted mb-3">
            Scan folder <code>./uploads/videos</code> untuk file dengan format:<br>
            <code>JUDUL LAGU#NAMA ARTIS#NEGARA.mp4 / .mpg</code>
          </p>
          <div class="form-check mb-3">
            <input type="checkbox" class="form-check-input" id="dryRun" v-model="scanDryRun">
            <label class="form-check-label" for="dryRun">Dry Run (preview tanpa menambah ke database)</label>
          </div>
          <div v-if="scanResult" class="alert" :class="scanResult.success ? 'alert-success' : 'alert-info'">
            <p class="mb-1"><strong>Hasil Scan:</strong></p>
            <p class="mb-0">Total: {{ scanResult.total }}, Ditambahkan: {{ scanResult.added }}, Dilewati: {{ scanResult.skipped }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showScanModal = false">Tutup</button>
          <button class="btn btn-primary" @click="doScan" :disabled="scanning">
            {{ scanning ? 'Scanning...' : 'Mulai Scan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/services/api'

const stats = ref({})
const loading = ref(true)
const showScanModal = ref(false)
const scanning = ref(false)
const scanDryRun = ref(true)
const scanResult = ref(null)

const fetchDashboard = async () => {
  loading.value = true
  try {
    const response = await adminAPI.getDashboard()
    stats.value = response.data.data || {}
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const scanSongs = () => {
  scanResult.value = null
  showScanModal.value = true
}

const doScan = async () => {
  scanning.value = true
  scanResult.value = null
  
  try {
    const response = await adminAPI.scanSongs(null, scanDryRun.value)
    scanResult.value = response.data.data
    
    if (!scanDryRun.value && scanResult.value.added > 0) {
      fetchDashboard()
    }
  } catch (err) {
    console.error(err)
  } finally {
    scanning.value = false
  }
}

onMounted(fetchDashboard)
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
}

.page-title {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-card.warning {
  border-color: var(--warning);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-icon.users { background: rgba(59, 130, 246, 0.2); color: var(--info); }
.stat-icon.songs { background: rgba(139, 92, 246, 0.2); color: var(--primary); }
.stat-icon.plays { background: rgba(34, 197, 94, 0.2); color: var(--success); }
.stat-icon.today { background: rgba(6, 182, 212, 0.2); color: var(--accent); }
.stat-icon.pending { background: rgba(245, 158, 11, 0.2); color: var(--warning); }

.stat-value { font-size: 1.75rem; font-weight: 700; }
.stat-label { font-size: 0.875rem; color: var(--text-muted); }
.stat-link { font-size: 0.8rem; color: var(--warning); margin-top: auto; }

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.content-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.card-header h3 { margin: 0; font-size: 1rem; }

.card-body { padding: 0.5rem; }

.list-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
}

.list-item:hover { background: rgba(255,255,255,0.03); }

.item-rank {
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

.item-avatar { font-size: 1.5rem; color: var(--primary); }

.item-info { flex: 1; min-width: 0; }
.item-info h4 { margin: 0; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-info p { margin: 0; font-size: 0.8rem; color: var(--text-muted); }

.item-value, .item-date { font-size: 0.8rem; color: var(--text-muted); }

.empty-state { text-align: center; padding: 1.5rem; color: var(--text-muted); }

.quick-actions h3 { margin-bottom: 1rem; }

.actions-grid {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 2rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.action-btn:hover {
  border-color: var(--primary);
  background: var(--bg-card-hover);
}

.action-btn i { font-size: 1.5rem; color: var(--primary); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 200; display: flex; align-items: center; justify-content: center; }
.modal-content { background: var(--bg-card); border-radius: var(--radius-lg); width: 90%; max-width: 500px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.modal-header h3 { margin: 0; }
.modal-header button { background: none; border: none; color: var(--text-muted); cursor: pointer; }
.modal-body { padding: 1.5rem; }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 0.5rem; }

@media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .content-grid { grid-template-columns: 1fr; } }
</style>
