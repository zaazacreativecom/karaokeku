<template>
    <div class="admin-requests">
        <div class="page-header">
            <h1>Kelola Request Lagu</h1>
            <div class="header-stats">
                <span class="stat pending">{{ stats.pending }} Pending</span>
                <span class="stat approved">{{ stats.approved }} Disetujui</span>
                <span class="stat rejected">{{ stats.rejected }} Ditolak</span>
            </div>
        </div>

        <!-- Filters -->
        <div class="filters-bar">
            <select v-model="filterStatus" @change="fetchRequests" class="form-select">
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
                <option value="completed">Selesai</option>
            </select>
        </div>

        <!-- Requests Table -->
        <div class="table-card">
            <table class="table">
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>User</th>
                        <th>Judul</th>
                        <th>Artis</th>
                        <th>Genre</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="req in requests" :key="req.id">
                        <td>{{ formatDate(req.created_at) }}</td>
                        <td>{{ req.requester?.name || 'Unknown' }}</td>
                        <td>
                            <strong>{{ req.title }}</strong>
                            <a v-if="req.link" :href="req.link" target="_blank" class="link-icon">
                                <i class="bi bi-box-arrow-up-right"></i>
                            </a>
                        </td>
                        <td>{{ req.artist }}</td>
                        <td>{{ req.genre || '-' }}</td>
                        <td>
                            <span class="status-badge" :class="req.status">{{ statusLabel(req.status) }}</span>
                        </td>
                        <td>
                            <button v-if="req.status === 'pending'" class="btn btn-sm btn-success"
                                @click="updateStatus(req, 'approved')" title="Setujui">
                                <i class="bi bi-check-lg"></i>
                            </button>
                            <button v-if="req.status === 'pending'" class="btn btn-sm btn-danger"
                                @click="updateStatus(req, 'rejected')" title="Tolak">
                                <i class="bi bi-x-lg"></i>
                            </button>
                            <button class="btn btn-sm btn-ghost" @click="viewDetail(req)" title="Detail">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-ghost text-danger" @click="confirmDelete(req)" title="Hapus">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="loading" class="loading-state">
                <div class="spinner-border text-primary"></div>
            </div>
            <div v-if="!loading && requests.length === 0" class="empty-state">Tidak ada request</div>
        </div>

        <!-- Detail Modal -->
        <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detail Request</h3>
                    <button @click="showDetailModal = false"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="modal-body">
                    <div class="detail-item">
                        <label>Judul:</label>
                        <span>{{ selectedRequest?.title }}</span>
                    </div>
                    <div class="detail-item">
                        <label>Artis:</label>
                        <span>{{ selectedRequest?.artist }}</span>
                    </div>
                    <div class="detail-item">
                        <label>Genre:</label>
                        <span>{{ selectedRequest?.genre || '-' }}</span>
                    </div>
                    <div class="detail-item">
                        <label>Bahasa:</label>
                        <span>{{ selectedRequest?.language || '-' }}</span>
                    </div>
                    <div class="detail-item" v-if="selectedRequest?.link">
                        <label>Link:</label>
                        <a :href="selectedRequest.link" target="_blank">{{ selectedRequest.link }}</a>
                    </div>
                    <div class="detail-item" v-if="selectedRequest?.notes">
                        <label>Catatan User:</label>
                        <p>{{ selectedRequest.notes }}</p>
                    </div>
                    <div class="detail-item">
                        <label>Admin Notes:</label>
                        <textarea v-model="adminNotes" class="form-control" rows="2"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" @click="showDetailModal = false">Tutup</button>
                    <button v-if="selectedRequest?.status === 'pending'" class="btn btn-danger"
                        @click="updateStatus(selectedRequest, 'rejected')">Tolak</button>
                    <button v-if="selectedRequest?.status === 'pending'" class="btn btn-success"
                        @click="updateStatus(selectedRequest, 'approved')">Setujui</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const requests = ref([])
const stats = ref({ pending: 0, approved: 0, rejected: 0 })
const loading = ref(false)
const filterStatus = ref('')
const showDetailModal = ref(false)
const selectedRequest = ref(null)
const adminNotes = ref('')

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const fetchRequests = async () => {
    loading.value = true
    try {
        const params = filterStatus.value ? `?status=${filterStatus.value}` : ''
        const response = await axios.get(`${API_URL}/requests${params}`, getAuthHeader())
        requests.value = response.data.data || []
    } catch (error) {
        console.error('Error fetching requests:', error)
    } finally {
        loading.value = false
    }
}

const fetchStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/requests/stats`, getAuthHeader())
        stats.value = response.data.data || {}
    } catch (error) {
        console.error('Error fetching stats:', error)
    }
}

const updateStatus = async (req, status) => {
    try {
        await axios.put(`${API_URL}/requests/${req.id}/status`, {
            status,
            admin_notes: adminNotes.value
        }, getAuthHeader())

        showDetailModal.value = false
        fetchRequests()
        fetchStats()
    } catch (error) {
        console.error('Error updating status:', error)
    }
}

const viewDetail = (req) => {
    selectedRequest.value = req
    adminNotes.value = req.admin_notes || ''
    showDetailModal.value = true
}

const confirmDelete = async (req) => {
    if (!confirm('Hapus request ini?')) return

    try {
        await axios.delete(`${API_URL}/requests/${req.id}`, getAuthHeader())
        fetchRequests()
        fetchStats()
    } catch (error) {
        console.error('Error deleting:', error)
    }
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
    })
}

const statusLabel = (status) => {
    const labels = {
        pending: 'Pending',
        approved: 'Disetujui',
        rejected: 'Ditolak',
        completed: 'Selesai'
    }
    return labels[status] || status
}

onMounted(() => {
    fetchRequests()
    fetchStats()
})
</script>

<style scoped>
.admin-requests {
    max-width: 1200px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.page-header h1 {
    margin: 0;
}

.header-stats {
    display: flex;
    gap: 1rem;
}

.stat {
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
}

.stat.pending {
    background: rgba(245, 158, 11, 0.2);
    color: var(--warning);
}

.stat.approved {
    background: rgba(34, 197, 94, 0.2);
    color: var(--success);
}

.stat.rejected {
    background: rgba(239, 68, 68, 0.2);
    color: var(--danger);
}

.filters-bar {
    margin-bottom: 1.5rem;
}

.filters-bar select {
    max-width: 200px;
}

.table-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.table {
    width: 100%;
    margin: 0;
    color: var(--text-primary);
}

.table th,
.table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border-color);
}

.table th {
    background: var(--bg-darker);
    font-weight: 500;
    font-size: 0.875rem;
    color: var(--text-muted);
    text-align: left;
}

.table tbody tr:hover {
    background: rgba(255, 255, 255, 0.02);
}

.status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
}

.status-badge.pending {
    background: rgba(245, 158, 11, 0.2);
    color: var(--warning);
}

.status-badge.approved {
    background: rgba(34, 197, 94, 0.2);
    color: var(--success);
}

.status-badge.rejected {
    background: rgba(239, 68, 68, 0.2);
    color: var(--danger);
}

.status-badge.completed {
    background: rgba(59, 130, 246, 0.2);
    color: var(--info);
}

.link-icon {
    margin-left: 0.5rem;
    font-size: 0.75rem;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--text-muted);
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
    max-width: 500px;
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

.detail-item {
    margin-bottom: 1rem;
}

.detail-item label {
    display: block;
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-bottom: 0.25rem;
}

.detail-item span,
.detail-item p {
    margin: 0;
}

.btn-success {
    background: var(--success);
    border: none;
    color: white;
}

.btn-success:hover {
    background: #1da34a;
}
</style>
