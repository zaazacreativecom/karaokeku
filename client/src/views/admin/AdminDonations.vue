<template>
    <div class="admin-donations">
        <div class="page-header">
            <h1>Kelola Donasi</h1>
            <div class="header-stats">
                <span class="stat pending">{{ stats.pending }} Pending</span>
                <span class="stat verified">{{ stats.verified }} Terverifikasi</span>
                <span class="stat total">Rp {{ formatCurrency(stats.totalAmount) }}</span>
            </div>
        </div>

        <!-- Filters -->
        <div class="filters-bar">
            <select v-model="filterStatus" @change="fetchDonations" class="form-select">
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Terverifikasi</option>
                <option value="rejected">Ditolak</option>
            </select>
        </div>

        <!-- Donations Table -->
        <div class="table-card">
            <table class="table">
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>User</th>
                        <th>Jumlah</th>
                        <th>Metode</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="donation in donations" :key="donation.id">
                        <td>{{ formatDate(donation.created_at) }}</td>
                        <td>
                            <div>{{ donation.donor?.name || donation.donor_name || 'Anonim' }}</div>
                            <small class="text-muted">{{ donation.donor?.email || '-' }}</small>
                        </td>
                        <td>
                            <strong>Rp {{ formatCurrency(donation.amount) }}</strong>
                        </td>
                        <td>
                            <span class="method-badge" :class="donation.method">{{ methodLabel(donation.method)
                            }}</span>
                        </td>
                        <td>
                            <span class="status-badge" :class="donation.status">{{ statusLabel(donation.status)
                            }}</span>
                        </td>
                        <td>
                            <button v-if="donation.status === 'pending'" class="btn btn-sm btn-success"
                                @click="verifyDonation(donation, 'verified')" title="Verifikasi">
                                <i class="bi bi-check-lg"></i>
                            </button>
                            <button v-if="donation.status === 'pending'" class="btn btn-sm btn-danger"
                                @click="verifyDonation(donation, 'rejected')" title="Tolak">
                                <i class="bi bi-x-lg"></i>
                            </button>
                            <button class="btn btn-sm btn-ghost" @click="viewDetail(donation)" title="Detail">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-ghost text-danger" @click="confirmDelete(donation)"
                                title="Hapus">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="loading" class="loading-state">
                <div class="spinner-border text-primary"></div>
            </div>
            <div v-if="!loading && donations.length === 0" class="empty-state">Tidak ada donasi</div>
        </div>

        <!-- Detail Modal -->
        <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detail Donasi</h3>
                    <button @click="showDetailModal = false"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="modal-body">
                    <div class="detail-item">
                        <label>Donatur:</label>
                        <span>{{ selectedDonation?.donor?.name || selectedDonation?.donor_name || 'Anonim' }}</span>
                    </div>
                    <div class="detail-item">
                        <label>Jumlah:</label>
                        <span class="amount">Rp {{ formatCurrency(selectedDonation?.amount) }}</span>
                    </div>
                    <div class="detail-item">
                        <label>Metode:</label>
                        <span>{{ methodLabel(selectedDonation?.method) }}</span>
                    </div>
                    <div class="detail-item" v-if="selectedDonation?.message">
                        <label>Pesan:</label>
                        <p>{{ selectedDonation.message }}</p>
                    </div>
                    <div class="detail-item" v-if="selectedDonation?.proof_url">
                        <label>Bukti Transfer:</label>
                        <a :href="selectedDonation.proof_url" target="_blank" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-image"></i> Lihat Bukti
                        </a>
                    </div>
                    <div class="detail-item">
                        <label>Admin Notes:</label>
                        <textarea v-model="adminNotes" class="form-control" rows="2"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" @click="showDetailModal = false">Tutup</button>
                    <button v-if="selectedDonation?.status === 'pending'" class="btn btn-danger"
                        @click="verifyDonation(selectedDonation, 'rejected')">Tolak</button>
                    <button v-if="selectedDonation?.status === 'pending'" class="btn btn-success"
                        @click="verifyDonation(selectedDonation, 'verified')">Verifikasi</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const donations = ref([])
const stats = ref({ pending: 0, verified: 0, totalAmount: 0 })
const loading = ref(false)
const filterStatus = ref('')
const showDetailModal = ref(false)
const selectedDonation = ref(null)
const adminNotes = ref('')

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const fetchDonations = async () => {
    loading.value = true
    try {
        const params = filterStatus.value ? `?status=${filterStatus.value}` : ''
        const response = await axios.get(`${API_URL}/donations${params}`, getAuthHeader())
        donations.value = response.data.data || []
    } catch (error) {
        console.error('Error fetching donations:', error)
    } finally {
        loading.value = false
    }
}

const fetchStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/donations/stats`, getAuthHeader())
        stats.value = response.data.data || {}
    } catch (error) {
        console.error('Error fetching stats:', error)
    }
}

const verifyDonation = async (donation, status) => {
    try {
        await axios.put(`${API_URL}/donations/${donation.id}/verify`, {
            status,
            admin_notes: adminNotes.value
        }, getAuthHeader())

        showDetailModal.value = false
        fetchDonations()
        fetchStats()
    } catch (error) {
        console.error('Error verifying:', error)
    }
}

const viewDetail = (donation) => {
    selectedDonation.value = donation
    adminNotes.value = donation.admin_notes || ''
    showDetailModal.value = true
}

const confirmDelete = async (donation) => {
    if (!confirm('Hapus donasi ini?')) return

    try {
        await axios.delete(`${API_URL}/donations/${donation.id}`, getAuthHeader())
        fetchDonations()
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

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount || 0)
}

const statusLabel = (status) => {
    const labels = { pending: 'Pending', verified: 'Terverifikasi', rejected: 'Ditolak' }
    return labels[status] || status
}

const methodLabel = (method) => {
    const labels = {
        qris: 'QRIS', gopay: 'GoPay', ovo: 'OVO', dana: 'DANA',
        shopeepay: 'ShopeePay', bca: 'BCA', bni: 'BNI', mandiri: 'Mandiri', other: 'Lainnya'
    }
    return labels[method] || method
}

onMounted(() => {
    fetchDonations()
    fetchStats()
})
</script>

<style scoped>
.admin-donations {
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

.stat.verified {
    background: rgba(34, 197, 94, 0.2);
    color: var(--success);
}

.stat.total {
    background: rgba(139, 92, 246, 0.2);
    color: var(--primary-light);
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

.status-badge.verified {
    background: rgba(34, 197, 94, 0.2);
    color: var(--success);
}

.status-badge.rejected {
    background: rgba(239, 68, 68, 0.2);
    color: var(--danger);
}

.method-badge {
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    background: rgba(59, 130, 246, 0.2);
    color: var(--info);
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

.detail-item .amount {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--success);
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
