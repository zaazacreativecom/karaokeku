<template>
  <div class="admin-songs">
    <div class="page-header">
      <h1>Manajemen Lagu</h1>
      <button class="btn btn-primary" @click="openCreateModal">
        <i class="bi bi-plus-lg me-2"></i>Tambah Lagu
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <input type="text" class="form-control" v-model="search" @input="debouncedFetch" placeholder="Cari lagu...">
      <select class="form-select" v-model="filterStatus" @change="fetchSongs">
        <option value="">Semua Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <!-- Songs Table -->
    <div class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Judul</th>
            <th>Artis</th>
            <th>Genre</th>
            <th>Bahasa</th>
            <th>Play Count</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="song in songs" :key="song.id">
            <td>{{ song.id }}</td>
            <td>{{ song.title }}</td>
            <td>{{ song.artist }}</td>
            <td>{{ song.genre || '-' }}</td>
            <td>{{ song.language || '-' }}</td>
            <td>{{ song.play_count }}</td>
            <td>
              <span class="status-badge" :class="song.status">{{ song.status }}</span>
            </td>
            <td>
              <button class="btn btn-sm btn-ghost" @click="editSong(song)"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-ghost text-danger" @click="confirmDelete(song)"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="loading" class="loading-state"><div class="spinner-border text-primary"></div></div>
      <div v-if="!loading && songs.length === 0" class="empty-state">Tidak ada lagu ditemukan</div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h3>{{ editingId ? 'Edit Lagu' : 'Tambah Lagu Baru' }}</h3>
          <button @click="closeModal"><i class="bi bi-x-lg"></i></button>
        </div>
        <form @submit.prevent="saveSong">
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Judul *</label>
                <input type="text" class="form-control" v-model="form.title" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Artis *</label>
                <input type="text" class="form-control" v-model="form.artist" required>
              </div>
            </div>
            <div class="row">
              <div class="col-md-4 mb-3">
                <label class="form-label">Genre</label>
                <input type="text" class="form-control" v-model="form.genre">
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Bahasa</label>
                <input type="text" class="form-control" v-model="form.language">
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Status</label>
                <select class="form-select" v-model="form.status">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">URL Video Full (dengan vocal)</label>
                <input type="text" class="form-control" v-model="form.video_url_full" placeholder="/videos/nama-file.mp4">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">URL Video Instrumental</label>
                <input type="text" class="form-control" v-model="form.video_url_instrumental" placeholder="/videos/nama-file.mp4">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-ghost" @click="closeModal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Menyimpan...' : 'Simpan' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content modal-sm">
        <div class="modal-body text-center">
          <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
          <h4 class="mt-3">Hapus Lagu?</h4>
          <p class="text-muted">"{{ deletingSong?.title }}" akan dihapus permanen.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showDeleteModal = false">Batal</button>
          <button class="btn btn-danger" @click="deleteSong">Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/services/api'

const songs = ref([])
const loading = ref(true)
const search = ref('')
const filterStatus = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingId = ref(null)
const deletingSong = ref(null)
const saving = ref(false)
const form = ref({ title: '', artist: '', genre: '', language: '', status: 'active', video_url_full: '', video_url_instrumental: '' })

let searchTimeout = null

const fetchSongs = async () => {
  loading.value = true
  try {
    const response = await adminAPI.getSongs({ search: search.value, status: filterStatus.value, limit: 100 })
    songs.value = response.data.data || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const debouncedFetch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchSongs, 300)
}

const openCreateModal = () => {
  editingId.value = null
  form.value = { title: '', artist: '', genre: '', language: '', status: 'active', video_url_full: '', video_url_instrumental: '' }
  showModal.value = true
}

const editSong = (song) => {
  editingId.value = song.id
  form.value = { ...song }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
}

const saveSong = async () => {
  saving.value = true
  try {
    if (editingId.value) {
      await adminAPI.updateSong(editingId.value, form.value)
    } else {
      await adminAPI.createSong(form.value)
    }
    closeModal()
    fetchSongs()
  } catch (err) {
    console.error(err)
  } finally {
    saving.value = false
  }
}

const confirmDelete = (song) => {
  deletingSong.value = song
  showDeleteModal.value = true
}

const deleteSong = async () => {
  try {
    await adminAPI.deleteSong(deletingSong.value.id)
    showDeleteModal.value = false
    fetchSongs()
  } catch (err) {
    console.error(err)
  }
}

onMounted(fetchSongs)
</script>

<style scoped>
.admin-songs { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-header h1 { margin: 0; }
.filters-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.filters-bar input { max-width: 300px; }
.filters-bar select { max-width: 180px; }
.table-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; }
.table { width: 100%; margin: 0; color: var(--text-primary); }
.table th, .table td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); }
.table th { background: var(--bg-darker); font-weight: 500; font-size: 0.875rem; color: var(--text-muted); text-align: left; }
.table tbody tr:hover { background: rgba(255,255,255,0.02); }
.status-badge { padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.75rem; }
.status-badge.active { background: rgba(34,197,94,0.2); color: var(--success); }
.status-badge.inactive { background: rgba(239,68,68,0.2); color: var(--danger); }
.loading-state, .empty-state { text-align: center; padding: 2rem; color: var(--text-muted); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 200; display: flex; align-items: center; justify-content: center; }
.modal-content { background: var(--bg-card); border-radius: var(--radius-lg); width: 90%; max-width: 500px; }
.modal-lg { max-width: 700px; }
.modal-sm { max-width: 350px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.modal-header h3 { margin: 0; }
.modal-header button { background: none; border: none; color: var(--text-muted); cursor: pointer; }
.modal-body { padding: 1.5rem; }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 0.5rem; }
</style>
