<template>
  <div class="admin-uploads">
    <div class="page-header">
      <h1>Review Upload</h1>
      <div class="filter-tabs">
        <button :class="{ active: filterStatus === '' }" @click="filterStatus = ''; fetchUploads()">Semua</button>
        <button :class="{ active: filterStatus === 'pending' }" @click="filterStatus = 'pending'; fetchUploads()">
          Pending <span v-if="pendingCount > 0" class="badge">{{ pendingCount }}</span>
        </button>
        <button :class="{ active: filterStatus === 'approved' }" @click="filterStatus = 'approved'; fetchUploads()">Approved</button>
        <button :class="{ active: filterStatus === 'rejected' }" @click="filterStatus = 'rejected'; fetchUploads()">Rejected</button>
      </div>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner-border text-primary"></div></div>

    <div v-else-if="uploads.length === 0" class="empty-state">
      <i class="bi bi-inbox"></i>
      <p>Tidak ada upload untuk direview</p>
    </div>

    <div v-else class="uploads-list">
      <div v-for="upload in uploads" :key="upload.id" class="upload-card">
        <div class="upload-info">
          <h4>{{ upload.title }}</h4>
          <p>{{ upload.artist || '-' }} • {{ upload.genre || '-' }} • {{ upload.language || '-' }}</p>
          <div class="upload-meta">
            <span><i class="bi bi-person"></i> {{ upload.uploader?.name || 'Unknown' }}</span>
            <span><i class="bi bi-calendar"></i> {{ formatDate(upload.created_at) }}</span>
          </div>
        </div>
        
        <div class="upload-status">
          <span class="status-badge" :class="upload.status">{{ upload.status }}</span>
        </div>
        
        <div class="upload-actions" v-if="upload.status === 'pending'">
          <button class="btn btn-sm btn-success" @click="approve(upload)">
            <i class="bi bi-check-lg"></i> Approve
          </button>
          <button class="btn btn-sm btn-danger" @click="showRejectModal(upload)">
            <i class="bi bi-x-lg"></i> Reject
          </button>
        </div>
        
        <div v-else-if="upload.admin_note" class="upload-note">
          <small class="text-muted">{{ upload.admin_note }}</small>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Tolak Upload</h3>
          <button @click="showModal = false"><i class="bi bi-x-lg"></i></button>
        </div>
        <form @submit.prevent="reject">
          <div class="modal-body">
            <p>Tolak upload "{{ rejectingUpload?.title }}"?</p>
            <div class="mb-3">
              <label class="form-label">Alasan (opsional)</label>
              <textarea class="form-control" v-model="rejectNote" rows="3" placeholder="Berikan alasan penolakan..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-ghost" @click="showModal = false">Batal</button>
            <button type="submit" class="btn btn-danger">Tolak Upload</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { adminAPI } from '@/services/api'

const uploads = ref([])
const loading = ref(true)
const filterStatus = ref('pending')
const showModal = ref(false)
const rejectingUpload = ref(null)
const rejectNote = ref('')

const pendingCount = computed(() => uploads.value.filter(u => u.status === 'pending').length)

const fetchUploads = async () => {
  loading.value = true
  try {
    const response = await adminAPI.getUploads({ status: filterStatus.value, limit: 100 })
    uploads.value = response.data.data || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const approve = async (upload) => {
  try {
    await adminAPI.reviewUpload(upload.id, 'approved', '')
    fetchUploads()
  } catch (err) {
    console.error(err)
  }
}

const showRejectModal = (upload) => {
  rejectingUpload.value = upload
  rejectNote.value = ''
  showModal.value = true
}

const reject = async () => {
  try {
    await adminAPI.reviewUpload(rejectingUpload.value.id, 'rejected', rejectNote.value)
    showModal.value = false
    fetchUploads()
  } catch (err) {
    console.error(err)
  }
}

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

onMounted(fetchUploads)
</script>

<style scoped>
.admin-uploads { max-width: 900px; }
.page-header { margin-bottom: 2rem; }
.page-header h1 { margin: 0 0 1rem; }
.filter-tabs { display: flex; gap: 0.5rem; }
.filter-tabs button { padding: 0.5rem 1rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
.filter-tabs button.active { background: var(--primary); border-color: var(--primary); color: white; }
.filter-tabs .badge { background: var(--danger); color: white; padding: 0.15rem 0.4rem; border-radius: var(--radius-full); font-size: 0.7rem; }
.loading-state, .empty-state { text-align: center; padding: 4rem; color: var(--text-muted); }
.empty-state i { font-size: 4rem; display: block; margin-bottom: 1rem; }
.uploads-list { display: flex; flex-direction: column; gap: 1rem; }
.upload-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.25rem; display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
.upload-info { flex: 1; min-width: 200px; }
.upload-info h4 { margin: 0 0 0.25rem; }
.upload-info p { margin: 0 0 0.5rem; color: var(--text-muted); font-size: 0.9rem; }
.upload-meta { display: flex; gap: 1rem; font-size: 0.8rem; color: var(--text-muted); }
.upload-meta i { margin-right: 0.25rem; }
.status-badge { padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 500; }
.status-badge.pending { background: rgba(245,158,11,0.2); color: var(--warning); }
.status-badge.approved { background: rgba(34,197,94,0.2); color: var(--success); }
.status-badge.rejected { background: rgba(239,68,68,0.2); color: var(--danger); }
.upload-actions { display: flex; gap: 0.5rem; }
.upload-note { max-width: 200px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 200; display: flex; align-items: center; justify-content: center; }
.modal-content { background: var(--bg-card); border-radius: var(--radius-lg); width: 90%; max-width: 450px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.modal-header h3 { margin: 0; }
.modal-header button { background: none; border: none; color: var(--text-muted); cursor: pointer; }
.modal-body { padding: 1.5rem; }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 0.5rem; }
</style>
