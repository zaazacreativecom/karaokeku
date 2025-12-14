<template>
    <div class="request-layout">
        <!-- Sidebar -->
        <aside class="dashboard-sidebar">
            <div class="sidebar-header">
                <router-link to="/dashboard" class="brand">
                    <i class="bi bi-music-note-beamed"></i>
                    <span>Karaoke<span class="text-gradient">Ku</span></span>
                </router-link>
            </div>

            <nav class="sidebar-nav">
                <router-link to="/dashboard" class="nav-item">
                    <i class="bi bi-grid-1x2-fill"></i>
                    <span>Dashboard</span>
                </router-link>

                <router-link to="/karaoke" class="nav-item">
                    <i class="bi bi-mic-fill"></i>
                    <span>Karaoke</span>
                </router-link>

                <router-link to="/songs" class="nav-item">
                    <i class="bi bi-music-note-list"></i>
                    <span>Pilih Lagu</span>
                </router-link>

                <router-link to="/playlists" class="nav-item">
                    <i class="bi bi-collection-play-fill"></i>
                    <span>Playlist Saya</span>
                </router-link>

                <router-link to="/upload" class="nav-item">
                    <i class="bi bi-cloud-upload-fill"></i>
                    <span>Upload Lagu</span>
                </router-link>

                <router-link to="/history" class="nav-item">
                    <i class="bi bi-clock-history"></i>
                    <span>Riwayat & Score</span>
                </router-link>

                <router-link to="/request" class="nav-item active">
                    <i class="bi bi-plus-circle-fill"></i>
                    <span>Request Lagu</span>
                </router-link>

                <router-link to="/donation" class="nav-item">
                    <i class="bi bi-heart-fill"></i>
                    <span>Donasi</span>
                </router-link>

                <div class="nav-divider"></div>

                <router-link to="/settings" class="nav-item">
                    <i class="bi bi-gear-fill"></i>
                    <span>Pengaturan</span>
                </router-link>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="request-main">
            <div class="request-container">
                <div class="page-header">
                    <h1><i class="bi bi-plus-circle-fill"></i> Request Lagu</h1>
                    <p class="lead">Mau lagu favorit kamu ditambahkan? Request sekarang!</p>
                </div>

                <!-- Request Form -->
                <div class="request-form-card">
                    <form @submit.prevent="submitRequest">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Judul Lagu <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" v-model="form.title"
                                    placeholder="Contoh: Laskar Pelangi" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Artis / Penyanyi <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" v-model="form.artist"
                                    placeholder="Contoh: Nidji" required>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Genre</label>
                                <select class="form-select" v-model="form.genre">
                                    <option value="">Pilih Genre</option>
                                    <option value="Pop">Pop</option>
                                    <option value="Rock">Rock</option>
                                    <option value="Dangdut">Dangdut</option>
                                    <option value="Jazz">Jazz</option>
                                    <option value="R&B">R&B</option>
                                    <option value="K-Pop">K-Pop</option>
                                    <option value="Indie">Indie</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Bahasa</label>
                                <select class="form-select" v-model="form.language">
                                    <option value="">Pilih Bahasa</option>
                                    <option value="Indonesia">Indonesia</option>
                                    <option value="English">English</option>
                                    <option value="Korea">Korea</option>
                                    <option value="Jepang">Jepang</option>
                                    <option value="Mandarin">Mandarin</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Link YouTube / Spotify (opsional)</label>
                            <input type="url" class="form-control" v-model="form.link"
                                placeholder="https://youtube.com/watch?v=...">
                            <small class="text-muted">Tambahkan link untuk mempermudah kami menemukan lagu</small>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Catatan Tambahan</label>
                            <textarea class="form-control" v-model="form.notes" rows="3"
                                placeholder="Ceritakan kenapa kamu ingin lagu ini ditambahkan..."></textarea>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary btn-lg"
                                :disabled="!form.title || !form.artist">
                                <i class="bi bi-send-fill me-2"></i>
                                Kirim Request
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Info Section -->
                <div class="info-section">
                    <div class="info-card">
                        <i class="bi bi-clock"></i>
                        <h4>Proses Request</h4>
                        <p>Request akan ditinjau dalam 1-3 hari kerja</p>
                    </div>
                    <div class="info-card">
                        <i class="bi bi-check-circle"></i>
                        <h4>Prioritas</h4>
                        <p>Request dengan donasi akan diprioritaskan</p>
                    </div>
                    <div class="info-card">
                        <i class="bi bi-bell"></i>
                        <h4>Notifikasi</h4>
                        <p>Kami akan memberitahu saat lagu sudah tersedia</p>
                    </div>
                </div>
            </div>
        </main>

        <!-- Donation Modal -->
        <div v-if="showDonationModal" class="modal-overlay" @click.self="closeDonationModal">
            <div class="modal-content modal-lg">
                <div class="modal-header">
                    <h3><i class="bi bi-check-circle-fill text-success me-2"></i>Request Terkirim!</h3>
                    <button @click="closeDonationModal"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="modal-body">
                    <div class="success-message">
                        <p>Request lagu <strong>"{{ submittedRequest.title }}"</strong> oleh <strong>{{
                            submittedRequest.artist
                                }}</strong> berhasil dikirim!</p>
                    </div>

                    <div class="donation-prompt">
                        <i class="bi bi-heart-fill"></i>
                        <h4>Dukung Kami!</h4>
                        <p>Dengan berdonasi, request Anda akan <strong>diprioritaskan</strong> dan membantu kami terus
                            menambahkan
                            lagu-lagu baru.</p>
                    </div>

                    <!-- Quick Donation Options -->
                    <!-- Quick Donation Options -->
                    <div class="donation-methods">
                        <div v-if="loadingMethods" class="text-center w-100 py-3">
                            <div class="spinner-border spinner-border-sm text-primary"></div>
                        </div>
                        <template v-else>
                            <div class="qr-section" v-if="qrisMethod">
                                <img :src="getImageUrl(qrisMethod.qr_code_url)" :alt="qrisMethod.name" class="qr-small">
                                <span>{{ qrisMethod.name }}</span>
                            </div>

                            <div class="wallet-section" v-if="ewalletMethods.length">
                                <h5>E-Wallet</h5>
                                <div class="wallet-quick">
                                    <span v-for="w in ewalletMethods.slice(0, 3)" :key="w.id" class="wallet-badge"
                                        :class="getMethodClass(w.name)">
                                        {{ w.name }}: {{ w.account_number }}
                                    </span>
                                </div>
                            </div>

                            <div class="bank-section" v-if="bankMethods.length">
                                <h5>Transfer Bank</h5>
                                <div class="bank-quick">
                                    <span v-for="b in bankMethods.slice(0, 3)" :key="b.id" class="bank-badge">
                                        {{ b.name }}: {{ b.account_number }}
                                    </span>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" @click="closeDonationModal">Nanti Saja</button>
                    <router-link to="/donation" class="btn btn-primary">
                        <i class="bi bi-heart-fill me-2"></i>
                        Lihat Semua Metode
                    </router-link>
                </div>
            </div>
        </div>

        <!-- Mobile Navigation -->
        <MobileNav />
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import MobileNav from '@/components/MobileNav.vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const form = reactive({
    title: '',
    artist: '',
    genre: '',
    language: '',
    link: '',
    notes: ''
})

const showDonationModal = ref(false)
const submittedRequest = ref({})
const isSubmitting = ref(false)
const paymentMethods = ref([])
const loadingMethods = ref(true)

const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const fetchPaymentMethods = async () => {
    try {
        const response = await axios.get(`${API_URL}/payment-methods`)
        paymentMethods.value = response.data.data || []
    } catch (error) {
        console.error('Error fetching payment methods:', error)
    } finally {
        loadingMethods.value = false
    }
}

const getImageUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `${API_URL.replace('/api', '')}${url}`
}

const getMethodClass = (name) => {
    const n = name.toLowerCase().replace(/\s/g, '')
    if (n.includes('bca')) return 'bca'
    if (n.includes('bni')) return 'bni'
    if (n.includes('mandiri')) return 'mandiri'
    if (n.includes('bri')) return 'bri'
    if (n.includes('cimb')) return 'cimb'
    if (n.includes('gopay')) return 'gopay'
    if (n.includes('ovo')) return 'ovo'
    if (n.includes('dana')) return 'dana'
    if (n.includes('shopee')) return 'shopee'
    return n
}

const qrisMethod = computed(() => paymentMethods.value.find(m => m.type === 'qris'))
const ewalletMethods = computed(() => paymentMethods.value.filter(m => m.type === 'ewallet'))
const bankMethods = computed(() => paymentMethods.value.filter(m => m.type === 'bank'))

const submitRequest = async () => {
    if (isSubmitting.value) return
    isSubmitting.value = true

    try {
        // Save to database via API
        await axios.post(`${API_URL}/requests`, {
            title: form.title,
            artist: form.artist,
            genre: form.genre,
            language: form.language,
            link: form.link,
            notes: form.notes
        }, getAuthHeader())

        // Save submitted data for modal
        submittedRequest.value = {
            title: form.title,
            artist: form.artist
        }

        // Show donation modal
        showDonationModal.value = true

        // Reset form
        form.title = ''
        form.artist = ''
        form.genre = ''
        form.language = ''
        form.link = ''
        form.notes = ''
    } catch (error) {
        console.error('Error submitting request:', error)
        alert('Gagal mengirim request. Silakan coba lagi.')
    } finally {
        isSubmitting.value = false
    }
}

const closeDonationModal = () => {
    showDonationModal.value = false
}

onMounted(() => {
    fetchPaymentMethods()
})
</script>

<style scoped>
.request-layout {
    display: flex;
    min-height: 100vh;
    background: var(--bg-dark);
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
    transition: all var(--transition-fast);
}

.nav-item:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
    color: white;
    background: var(--gradient-primary);
}

.request-main {
    flex: 1;
    margin-left: 260px;
    padding: 2rem;
}

.request-container {
    max-width: 800px;
    margin: 0 auto;
}

.page-header {
    text-align: center;
    margin-bottom: 2rem;
}

.page-header h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
}

.page-header .lead {
    color: var(--text-muted);
}

.request-form-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 2rem;
    margin-bottom: 2rem;
}

.form-actions {
    text-align: center;
    margin-top: 1.5rem;
}

.info-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}

.info-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    text-align: center;
}

.info-card i {
    font-size: 2rem;
    color: var(--primary);
    margin-bottom: 0.75rem;
    display: block;
}

.info-card h4 {
    font-size: 1rem;
    margin-bottom: 0.25rem;
}

.info-card p {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin: 0;
}

/* Modal */
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
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
    margin: 0;
    display: flex;
    align-items: center;
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
    gap: 0.75rem;
}

.success-message {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid var(--success);
    border-radius: var(--radius-md);
    padding: 1rem;
    margin-bottom: 1.5rem;
    text-align: center;
}

.donation-prompt {
    text-align: center;
    margin-bottom: 1.5rem;
}

.donation-prompt i {
    font-size: 2.5rem;
    color: var(--danger);
    margin-bottom: 0.5rem;
    display: block;
}

.donation-prompt h4 {
    margin-bottom: 0.5rem;
}

.donation-prompt p {
    color: var(--text-muted);
    margin: 0;
}

.donation-methods {
    display: grid;
    grid-template-columns: auto 1fr 1fr;
    gap: 1.5rem;
    align-items: start;
}

.qr-section {
    text-align: center;
}

.qr-small {
    width: 120px;
    height: 120px;
    background: white;
    padding: 0.5rem;
    border-radius: var(--radius-md);
}

.qr-section span {
    display: block;
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 0.5rem;
}

.wallet-section h5,
.bank-section h5 {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
}

.wallet-quick,
.bank-quick {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.wallet-badge {
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-family: monospace;
}

.wallet-badge.gopay {
    background: rgba(0, 174, 214, 0.1);
    color: #00aed6;
}

.wallet-badge.ovo {
    background: rgba(76, 52, 148, 0.1);
    color: #7b50c8;
}

.wallet-badge.dana {
    background: rgba(17, 142, 234, 0.1);
    color: #118eea;
}

.bank-badge {
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-family: monospace;
}

/* Responsive */
@media (max-width: 768px) {
    .dashboard-sidebar {
        display: none;
    }

    .request-main {
        margin-left: 0;
        padding: 1rem;
        padding-bottom: 80px;
    }

    .page-header h1 {
        font-size: 1.5rem;
    }

    .request-form-card {
        padding: 1rem;
    }

    .row {
        flex-direction: column;
    }

    .col-md-6 {
        width: 100%;
    }

    .info-section {
        grid-template-columns: 1fr;
    }

    .donation-methods {
        grid-template-columns: 1fr;
        text-align: center;
    }

    .modal-content {
        width: 95%;
        margin: 1rem;
    }

    .modal-footer {
        flex-direction: column;
    }

    .modal-footer .btn {
        width: 100%;
    }
}

@media (max-width: 425px) {
    .request-main {
        padding: 0.75rem;
        padding-bottom: 80px;
    }

    .info-card {
        padding: 1rem;
    }

    .info-card i {
        font-size: 1.5rem;
    }
}
</style>
