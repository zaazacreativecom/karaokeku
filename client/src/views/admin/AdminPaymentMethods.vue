<template>
    <div class="admin-payment-methods">
        <div class="page-header">
            <h1>Pengaturan Metode Pembayaran</h1>
            <button class="btn btn-primary" @click="openAddModal">
                <i class="bi bi-plus-lg"></i> Tambah Metode
            </button>
        </div>

        <!-- QRIS Section -->
        <div class="section">
            <h3><i class="bi bi-qr-code"></i> QRIS</h3>
            <div class="methods-grid">
                <div v-for="method in qrisMethods" :key="method.id" class="method-card">
                    <div class="method-qr" v-if="method.qr_code_url">
                        <img :src="getImageUrl(method.qr_code_url)" alt="QR Code" />
                    </div>
                    <div class="method-info">
                        <h4>{{ method.name }}</h4>
                        <span class="status-badge" :class="{ active: method.is_active }">
                            {{ method.is_active ? 'Aktif' : 'Nonaktif' }}
                        </span>
                    </div>
                    <div class="method-actions">
                        <button class="btn btn-sm btn-ghost" @click="openEditModal(method)">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-ghost" @click="uploadQR(method)">
                            <i class="bi bi-upload"></i>
                        </button>
                        <button class="btn btn-sm btn-ghost" @click="toggleActive(method)">
                            <i class="bi" :class="method.is_active ? 'bi-eye-slash' : 'bi-eye'"></i>
                        </button>
                        <button class="btn btn-sm btn-ghost text-danger" @click="confirmDelete(method)">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- E-Wallet Section -->
        <div class="section">
            <h3><i class="bi bi-wallet2"></i> E-Wallet</h3>
            <div class="methods-grid">
                <div v-for="method in ewalletMethods" :key="method.id" class="method-card">
                    <div class="method-icon">
                        <i :class="method.icon || 'bi bi-wallet2'"></i>
                    </div>
                    <div class="method-info">
                        <h4>{{ method.name }}</h4>
                        <p class="account-number">{{ method.account_number }}</p>
                        <span class="status-badge" :class="{ active: method.is_active }">
                            {{ method.is_active ? 'Aktif' : 'Nonaktif' }}
                        </span>
                    </div>
                    <div class="method-actions">
                        <button class="btn btn-sm btn-ghost" @click="openEditModal(method)">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-ghost" @click="toggleActive(method)">
                            <i class="bi" :class="method.is_active ? 'bi-eye-slash' : 'bi-eye'"></i>
                        </button>
                        <button class="btn btn-sm btn-ghost text-danger" @click="confirmDelete(method)">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bank Transfer Section -->
        <div class="section">
            <h3><i class="bi bi-bank"></i> Transfer Bank</h3>
            <div class="methods-grid">
                <div v-for="method in bankMethods" :key="method.id" class="method-card">
                    <div class="method-icon">
                        <i :class="method.icon || 'bi bi-bank'"></i>
                    </div>
                    <div class="method-info">
                        <h4>{{ method.name }}</h4>
                        <p class="account-number">{{ method.account_number }}</p>
                        <p class="account-name">a.n. {{ method.account_name }}</p>
                        <span class="status-badge" :class="{ active: method.is_active }">
                            {{ method.is_active ? 'Aktif' : 'Nonaktif' }}
                        </span>
                    </div>
                    <div class="method-actions">
                        <button class="btn btn-sm btn-ghost" @click="openEditModal(method)">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-ghost" @click="toggleActive(method)">
                            <i class="bi" :class="method.is_active ? 'bi-eye-slash' : 'bi-eye'"></i>
                        </button>
                        <button class="btn btn-sm btn-ghost text-danger" @click="confirmDelete(method)">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add/Edit Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>{{ editingMethod ? 'Edit' : 'Tambah' }} Metode Pembayaran</h3>
                    <button @click="showModal = false"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Tipe</label>
                        <select v-model="form.type" class="form-control">
                            <option value="qris">QRIS</option>
                            <option value="ewallet">E-Wallet</option>
                            <option value="bank">Transfer Bank</option>
                        </select>
                    </div>
                    <div class="form-group" v-if="form.type === 'qris'">
                        <label>Upload QR Code Image</label>
                        <div class="qr-input-container">
                            <input type="file" ref="qrModalInput" @change="handleQRModalSelect" accept="image/*"
                                class="form-control" />
                            <div v-if="qrPreview || (editingMethod && editingMethod.type === 'qris' && editingMethod.qr_code_url)"
                                class="qr-preview mt-2 text-center">
                                <img :src="qrPreview || getImageUrl(editingMethod.qr_code_url)" alt="QR Preview"
                                    style="max-width: 150px; border-radius: 8px;" />
                                <div class="mt-1" v-if="qrPreview">
                                    <button class="btn btn-sm text-danger" @click="clearQRSelection">
                                        <i class="bi bi-x"></i> Hapus yang dipilih
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Nama</label>
                        <input v-model="form.name" class="form-control" placeholder="Contoh: GoPay, BCA" />
                    </div>
                    <div class="form-group">
                        <label>Icon (Bootstrap Icons class)</label>
                        <input v-model="form.icon" class="form-control" placeholder="bi bi-wallet2" />
                    </div>
                    <div class="form-group" v-if="form.type !== 'qris'">
                        <label>Nomor {{ form.type === 'ewallet' ? 'E-Wallet' : 'Rekening' }}</label>
                        <input v-model="form.account_number" class="form-control" />
                    </div>
                    <div class="form-group" v-if="form.type === 'bank'">
                        <label>Atas Nama</label>
                        <input v-model="form.account_name" class="form-control" />
                    </div>
                    <div class="form-group">
                        <label>Urutan</label>
                        <input v-model.number="form.sort_order" type="number" class="form-control" />
                    </div>
                    <div class="form-check">
                        <input type="checkbox" v-model="form.is_active" id="isActive" />
                        <label for="isActive">Aktif</label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" @click="showModal = false">Batal</button>
                    <button class="btn btn-primary" @click="saveMethod" :disabled="saving">
                        {{ saving ? 'Menyimpan...' : 'Simpan' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- QR Upload Input (hidden) -->
        <input type="file" ref="qrInput" @change="handleQRUpload" accept="image/*" style="display: none" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const methods = ref([])
const showModal = ref(false)
const saving = ref(false)
const editingMethod = ref(null)
const qrInput = ref(null)
const qrModalInput = ref(null)
const qrFileInModal = ref(null)
const qrPreview = ref(null)
const uploadingMethodId = ref(null)

const form = ref({
    type: 'ewallet',
    name: '',
    icon: '',
    account_number: '',
    account_name: '',
    sort_order: 0,
    is_active: true
})

const API_URL = import.meta.env.VITE_API_URL || '/api'

const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const getImageUrl = (url) => {
    if (!url) return ''
    if (url.includes('localhost')) {
        url = url.replace(/^http(s)?:\/\/localhost(:\d+)?/, '');
    }
    if (url.startsWith('http')) return url
    const baseUrl = API_URL.endsWith('/api') ? API_URL.replace('/api', '') : API_URL;

    if (baseUrl.includes('localhost')) {
        return url.startsWith('/') ? url : `/${url}`
    }

    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

const qrisMethods = computed(() => methods.value.filter(m => m.type === 'qris'))
const ewalletMethods = computed(() => methods.value.filter(m => m.type === 'ewallet'))
const bankMethods = computed(() => methods.value.filter(m => m.type === 'bank'))

const fetchMethods = async () => {
    try {
        const response = await axios.get(`${API_URL}/payment-methods/admin`, getAuthHeader())
        methods.value = response.data.data || []
    } catch (error) {
        console.error('Error fetching methods:', error)
    }
}

const openAddModal = () => {
    editingMethod.value = null
    form.value = { type: 'qris', name: '', icon: '', account_number: '', account_name: '', sort_order: 0, is_active: true }
    clearQRSelection()
    showModal.value = true
}

const openEditModal = (method) => {
    editingMethod.value = method
    form.value = { ...method }
    clearQRSelection()
    showModal.value = true
}

const handleQRModalSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
        qrFileInModal.value = file
        qrPreview.value = URL.createObjectURL(file)
    }
}

const clearQRSelection = () => {
    qrFileInModal.value = null
    qrPreview.value = null
    if (qrModalInput.value) qrModalInput.value.value = ''
}

const saveMethod = async () => {
    saving.value = true
    try {
        let methodId
        if (editingMethod.value) {
            await axios.put(`${API_URL}/payment-methods/${editingMethod.value.id}`, form.value, getAuthHeader())
            methodId = editingMethod.value.id
        } else {
            const res = await axios.post(`${API_URL}/payment-methods`, form.value, getAuthHeader())
            methodId = res.data.data.id
        }

        // Upload QR if selected in modal
        if (qrFileInModal.value) {
            const formData = new FormData()
            formData.append('qr_code', qrFileInModal.value)
            await axios.post(`${API_URL}/payment-methods/${methodId}/qr`, formData, {
                ...getAuthHeader(),
                headers: { ...getAuthHeader().headers, 'Content-Type': 'multipart/form-data' }
            })
        }

        showModal.value = false
        fetchMethods()
    } catch (error) {
        console.error('Error saving:', error)
        alert('Gagal menyimpan')
    } finally {
        saving.value = false
    }
}

const toggleActive = async (method) => {
    try {
        await axios.put(`${API_URL}/payment-methods/${method.id}/toggle`, {}, getAuthHeader())
        fetchMethods()
    } catch (error) {
        console.error('Error toggling:', error)
    }
}

const confirmDelete = async (method) => {
    if (!confirm(`Hapus ${method.name}?`)) return
    try {
        await axios.delete(`${API_URL}/payment-methods/${method.id}`, getAuthHeader())
        fetchMethods()
    } catch (error) {
        console.error('Error deleting:', error)
    }
}

const uploadQR = (method) => {
    uploadingMethodId.value = method.id
    qrInput.value.click()
}

const handleQRUpload = async (event) => {
    const file = event.target.files[0]
    if (!file || !uploadingMethodId.value) return

    const formData = new FormData()
    formData.append('qr_code', file)

    try {
        await axios.post(`${API_URL}/payment-methods/${uploadingMethodId.value}/qr`, formData, {
            ...getAuthHeader(),
            headers: { ...getAuthHeader().headers, 'Content-Type': 'multipart/form-data' }
        })
        fetchMethods()
    } catch (error) {
        console.error('Error uploading QR:', error)
        alert('Gagal upload QR Code')
    }

    uploadingMethodId.value = null
    event.target.value = ''
}

onMounted(fetchMethods)
</script>

<style scoped>
.admin-payment-methods {
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

.section {
    margin-bottom: 2rem;
}

.section h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-size: 1.125rem;
    color: var(--text-secondary);
}

.methods-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
}

.method-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.method-qr {
    text-align: center;
}

.method-qr img {
    max-width: 150px;
    border-radius: var(--radius-md);
}

.method-icon {
    font-size: 2rem;
    color: var(--primary-light);
    text-align: center;
}

.method-info {
    text-align: center;
}

.method-info h4 {
    margin: 0 0 0.25rem;
}

.method-info .account-number {
    color: var(--text-primary);
    font-family: monospace;
    font-size: 1rem;
    margin: 0;
}

.method-info .account-name {
    color: var(--text-muted);
    font-size: 0.875rem;
    margin: 0;
}

.status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    background: rgba(239, 68, 68, 0.2);
    color: var(--danger);
}

.status-badge.active {
    background: rgba(34, 197, 94, 0.2);
    color: var(--success);
}

.method-actions {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: auto;
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
    font-size: 1.25rem;
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

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
    color: var(--text-muted);
}

.form-check {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
</style>
