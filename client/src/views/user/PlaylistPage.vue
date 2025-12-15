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
        <router-link to="/favorites" class="nav-item"><i class="bi bi-heart-fill"></i><span>Lagu
            Favorit</span></router-link>
        <router-link to="/playlists" class="nav-item active"><i class="bi bi-collection-play-fill"></i><span>Playlist
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
        <div class="page-header">
          <div>
            <h1><i class="bi bi-collection-play-fill me-2"></i>Playlist Saya</h1>
            <p class="text-muted">Kelola playlist karaoke Anda</p>
          </div>
          <button class="btn btn-primary" @click="showCreateModal = true">
            <i class="bi bi-plus-lg me-2"></i>Buat Playlist
          </button>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner-border text-primary"></div>
        </div>

        <div v-else-if="playlists.length === 0" class="empty-state">
          <i class="bi bi-collection-play"></i>
          <p>Belum ada playlist</p>
          <button class="btn btn-primary" @click="showCreateModal = true">Buat Playlist Pertama</button>
        </div>

        <div v-else class="playlists-grid">
          <div v-for="playlist in playlists" :key="playlist.id" class="playlist-card">
            <div class="playlist-cover">
              <i class="bi bi-music-note-list"></i>
            </div>
            <div class="playlist-info">
              <h4>{{ playlist.name }}</h4>
              <p>{{ playlist.songCount || 0 }} lagu</p>
            </div>
            <div class="playlist-actions">
              <button class="btn btn-primary btn-sm" @click="viewPlaylist(playlist)">
                <i class="bi bi-play-fill"></i> Play
              </button>
              <button class="btn btn-ghost btn-sm" @click="editPlaylist(playlist)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-ghost btn-sm text-danger" @click="confirmDelete(playlist)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingPlaylist ? 'Edit Playlist' : 'Buat Playlist Baru' }}</h3>
          <button @click="closeModal"><i class="bi bi-x-lg"></i></button>
        </div>
        <form @submit.prevent="savePlaylist">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nama Playlist</label>
              <input type="text" class="form-control" v-model="formData.name" required
                placeholder="Contoh: Lagu Favorit">
            </div>
            <div class="mb-3">
              <label class="form-label">Deskripsi (opsional)</label>
              <textarea class="form-control" v-model="formData.description" rows="3"
                placeholder="Deskripsi playlist..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-ghost" @click="closeModal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content modal-sm">
        <div class="modal-body text-center">
          <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
          <h4 class="mt-3">Hapus Playlist?</h4>
          <p class="text-muted">Playlist "{{ deletingPlaylist?.name }}" akan dihapus permanen.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showDeleteModal = false">Batal</button>
          <button class="btn btn-danger" @click="deletePlaylist">Hapus</button>
        </div>
      </div>
    </div>
    <!-- Mobile Navigation -->
    <MobileNav />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaylistStore } from '@/stores/playlist'
import MobileNav from '@/components/MobileNav.vue'

const router = useRouter()
const playlistStore = usePlaylistStore()

const playlists = ref([])
const loading = ref(true)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingPlaylist = ref(null)
const deletingPlaylist = ref(null)
const saving = ref(false)
const formData = ref({ name: '', description: '' })

const fetchPlaylists = async () => {
  loading.value = true
  await playlistStore.fetchPlaylists()
  playlists.value = playlistStore.playlists
  loading.value = false
}

const viewPlaylist = (playlist) => {
  // TODO: Navigate to playlist detail or start playing
  router.push('/karaoke')
}

const editPlaylist = (playlist) => {
  editingPlaylist.value = playlist
  formData.value = { name: playlist.name, description: playlist.description || '' }
  showCreateModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  editingPlaylist.value = null
  formData.value = { name: '', description: '' }
}

const savePlaylist = async () => {
  saving.value = true

  if (editingPlaylist.value) {
    await playlistStore.updatePlaylist(editingPlaylist.value.id, formData.value)
  } else {
    await playlistStore.createPlaylist(formData.value)
  }

  await fetchPlaylists()
  closeModal()
  saving.value = false
}

const confirmDelete = (playlist) => {
  deletingPlaylist.value = playlist
  showDeleteModal.value = true
}

const deletePlaylist = async () => {
  if (deletingPlaylist.value) {
    await playlistStore.deletePlaylist(deletingPlaylist.value.id)
    await fetchPlaylists()
  }
  showDeleteModal.value = false
  deletingPlaylist.value = null
}

onMounted(fetchPlaylists)
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
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.playlist-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.playlist-card:hover {
  border-color: var(--primary);
}

.playlist-cover {
  height: 120px;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}

.playlist-info {
  padding: 1rem;
}

.playlist-info h4 {
  margin: 0 0 0.25rem;
}

.playlist-info p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.playlist-actions {
  padding: 0 1rem 1rem;
  display: flex;
  gap: 0.5rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 450px;
}

.modal-sm {
  max-width: 350px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
}

.modal-header button {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
