<template>
    <div class="donation-layout">
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

                <router-link to="/request" class="nav-item">
                    <i class="bi bi-plus-circle-fill"></i>
                    <span>Request Lagu</span>
                </router-link>

                <router-link to="/donation" class="nav-item active">
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
        <main class="donation-main">
            <div class="donation-container">
                <div class="page-header">
                    <h1><i class="bi bi-heart-fill text-danger"></i> Donasi / Traktir</h1>
                    <p class="lead">Dukung kami untuk terus mempertahankan KaraokeKu agar tetap bisa diakses oleh semua,
                        karena biaya sewa server terlalu mahal.</p>
                </div>

                <!-- Payment Methods -->
                <!-- Payment Methods -->
                <div v-if="loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>

                <div v-else class="payment-methods">
                    <!-- QRIS Section -->
                    <div v-if="qrisMethods.length > 0" class="payment-card qr-card">
                        <div class="card-header">
                            <i class="bi bi-qr-code"></i>
                            <h3>QRIS / Scan Payment</h3>
                        </div>
                        <div class="card-body">
                            <div v-for="method in qrisMethods" :key="method.id" class="qr-item mb-4">
                                <h4 class="mb-3">{{ method.name }}</h4>
                                <div class="qr-wrapper" v-if="method.qr_code_url">
                                    <img :src="getImageUrl(method.qr_code_url)" :alt="method.name" class="qr-image" />
                                </div>
                                <p class="qr-desc">Scan QR code di atas menggunakan aplikasi e-wallet atau mobile
                                    banking</p>
                            </div>
                        </div>
                    </div>

                    <!-- E-Wallet Section -->
                    <div v-if="ewalletMethods.length > 0" class="payment-card wallet-card">
                        <div class="card-header">
                            <i class="bi bi-wallet2"></i>
                            <h3>E-Wallet</h3>
                        </div>
                        <div class="card-body">
                            <div class="wallet-list">
                                <div v-for="method in ewalletMethods" :key="method.id" class="wallet-item">
                                    <div class="wallet-icon" :class="getMethodClass(method.name)">
                                        <i class="bi" :class="method.icon || 'bi-phone'"></i>
                                    </div>
                                    <div class="wallet-info">
                                        <span class="wallet-name">{{ method.name }}</span>
                                        <span class="wallet-number">{{ method.account_number }}</span>
                                    </div>
                                    <button class="btn btn-sm btn-ghost"
                                        @click="copyToClipboard(method.account_number, method.name)">
                                        <i class="bi bi-copy"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Bank Transfer Section -->
                    <div v-if="bankMethods.length > 0" class="payment-card bank-card">
                        <div class="card-header">
                            <i class="bi bi-bank"></i>
                            <h3>Transfer Bank</h3>
                        </div>
                        <div class="card-body">
                            <div class="bank-list">
                                <div v-for="method in bankMethods" :key="method.id" class="bank-item">
                                    <div class="bank-icon" :class="getMethodClass(method.name)">
                                        <span v-if="!method.icon">{{ method.name.substring(0, 4) }}</span>
                                        <i v-else :class="method.icon"></i>
                                    </div>
                                    <div class="bank-info">
                                        <span class="bank-name">{{ method.name }}</span>
                                        <span class="bank-number">{{ method.account_number }}</span>
                                        <span class="bank-holder" v-if="method.account_name">a.n. {{ method.account_name
                                            }}</span>
                                    </div>
                                    <button class="btn btn-sm btn-ghost"
                                        @click="copyToClipboard(method.account_number, method.name)">
                                        <i class="bi bi-copy"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Thank You Message -->
                <div class="thank-you-section">
                    <i class="bi bi-emoji-heart-eyes"></i>
                    <h3>Terima Kasih!</h3>
                    <p>Setiap donasi Anda sangat berarti bagi kami untuk terus mengembangkan dan memperbaiki KaraokeKu.
                    </p>
                </div>

                <!-- Toast Notification -->
                <div v-if="showToast" class="toast-notification">
                    <i class="bi bi-check-circle-fill"></i>
                    {{ toastMessage }}
                </div>
            </div>
        </main>

        <!-- Mobile Navigation -->
        <MobileNav />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import MobileNav from '@/components/MobileNav.vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const loading = ref(true)
const paymentMethods = ref([])
const showToast = ref(false)
const toastMessage = ref('')

const fetchPaymentMethods = async () => {
    try {
        const response = await axios.get(`${API_URL}/payment-methods`)
        paymentMethods.value = response.data.data || []
    } catch (error) {
        console.error('Error fetching payment methods:', error)
    } finally {
        loading.value = false
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

const qrisMethods = computed(() => paymentMethods.value.filter(m => m.type === 'qris'))
const ewalletMethods = computed(() => paymentMethods.value.filter(m => m.type === 'ewallet'))
const bankMethods = computed(() => paymentMethods.value.filter(m => m.type === 'bank'))

const copyToClipboard = async (text, label) => {
    try {
        await navigator.clipboard.writeText(text)
        toastMessage.value = `Nomor ${label} berhasil disalin!`
        showToast.value = true
        setTimeout(() => {
            showToast.value = false
        }, 2500)
    } catch (err) {
        console.error('Failed to copy:', err)
        // Fallback for unconnected environments or non-secure contexts
        const textArea = document.createElement("textarea")
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        try {
            document.execCommand('copy')
            toastMessage.value = `Nomor ${label} berhasil disalin!`
            showToast.value = true
        } catch (err) {
            console.error('Fallback copy failed', err)
        }
        document.body.removeChild(textArea)
        setTimeout(() => { showToast.value = false }, 2500)
    }
}

onMounted(fetchPaymentMethods)
</script>

<style scoped>
.donation-layout {
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

.donation-main {
    flex: 1;
    margin-left: 260px;
    padding: 2rem;
}

.donation-container {
    max-width: 1000px;
    margin: 0 auto;
}

.page-header {
    text-align: center;
    margin-bottom: 3rem;
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
    font-size: 1.1rem;
}

.payment-methods {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.payment-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.payment-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
}

.card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem;
    background: var(--bg-darker);
    border-bottom: 1px solid var(--border-color);
}

.card-header i {
    font-size: 1.5rem;
    color: var(--primary);
}

.card-header h3 {
    margin: 0;
    font-size: 1.1rem;
}

.card-body {
    padding: 1.5rem;
}

/* QR Code Styles */
.qr-wrapper {
    background: white;
    padding: 1rem;
    border-radius: var(--radius-md);
    display: inline-block;
    margin-bottom: 1rem;
}

.qr-image {
    width: 200px;
    height: 200px;
    object-fit: contain;
}

.qr-card .card-body {
    text-align: center;
}

.qr-desc {
    color: var(--text-muted);
    font-size: 0.875rem;
    margin-bottom: 1rem;
}

.supported-apps {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
}

.app-badge {
    padding: 0.25rem 0.75rem;
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid var(--primary);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    color: var(--primary-light);
}

/* Wallet Styles */
.wallet-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.wallet-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-darker);
    border-radius: var(--radius-md);
}

.wallet-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    color: white;
}

.wallet-icon.gopay {
    background: linear-gradient(135deg, #00aed6, #00d4aa);
}

.wallet-icon.ovo {
    background: linear-gradient(135deg, #4c3494, #7b50c8);
}

.wallet-icon.dana {
    background: linear-gradient(135deg, #118eea, #1cbdff);
}

.wallet-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.wallet-name {
    font-weight: 600;
    font-size: 0.875rem;
}

.wallet-number {
    color: var(--text-muted);
    font-family: monospace;
    font-size: 1rem;
}

/* Bank Styles */
.bank-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.bank-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-darker);
    border-radius: var(--radius-md);
}

.bank-icon {
    width: 56px;
    height: 40px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.75rem;
    color: white;
}

.bank-icon.bca {
    background: #0066ae;
}

.bank-icon.bni {
    background: #f15a22;
}

.bank-icon.mandiri {
    background: #003d79;
}

.bank-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.bank-name {
    font-size: 0.75rem;
    color: var(--text-muted);
}

.bank-number {
    font-family: monospace;
    font-size: 1.1rem;
    font-weight: 600;
}

.bank-holder {
    font-size: 0.75rem;
    color: var(--text-muted);
}

/* Thank You Section */
.thank-you-section {
    text-align: center;
    padding: 3rem;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
}

.thank-you-section i {
    font-size: 3rem;
    color: var(--secondary);
    margin-bottom: 1rem;
    display: block;
}

.thank-you-section h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.thank-you-section p {
    color: var(--text-muted);
    max-width: 500px;
    margin: 0 auto;
}

/* Toast */
.toast-notification {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--success);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: var(--shadow-lg);
    animation: slideUp 0.3s ease;
    z-index: 1000;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateX(-50%) translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
}

/* Responsive */
@media (max-width: 768px) {
    .dashboard-sidebar {
        display: none;
    }

    .donation-main {
        margin-left: 0;
        padding: 1rem;
        padding-bottom: 80px;
    }

    .page-header {
        margin-bottom: 1.5rem;
    }

    .page-header h1 {
        font-size: 1.5rem;
    }

    .payment-methods {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .qr-image {
        width: 160px;
        height: 160px;
    }

    .thank-you-section {
        padding: 1.5rem;
    }

    .thank-you-section i {
        font-size: 2rem;
    }

    .toast-notification {
        bottom: 90px;
    }
}

@media (max-width: 425px) {
    .donation-main {
        padding: 0.75rem;
        padding-bottom: 80px;
    }

    .card-body {
        padding: 1rem;
    }

    .wallet-item,
    .bank-item {
        padding: 0.75rem;
    }
}
</style>
