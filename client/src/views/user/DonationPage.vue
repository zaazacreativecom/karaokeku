<template>
  <div class="page-layout">
    <!-- Background (decorative) -->
    <div class="page-bg" aria-hidden="true">
      <div class="bg-mesh"></div>
      <div class="bg-particles"></div>
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
    </div>

    <aside class="dashboard-sidebar">
      <div class="sidebar-header">
        <router-link to="/dashboard" class="brand">
          <i class="bi bi-music-note-beamed"></i>
          <span>Karaoke<span class="text-gradient">Ku</span></span>
        </router-link>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item">
          <i class="bi bi-grid-1x2-fill"></i><span>Dashboard</span>
        </router-link>
        <router-link to="/karaoke" class="nav-item">
          <i class="bi bi-mic-fill"></i><span>Karaoke</span>
        </router-link>
        <router-link to="/songs" class="nav-item">
          <i class="bi bi-music-note-list"></i><span>Pilih Lagu</span>
        </router-link>
        <router-link to="/favorites" class="nav-item">
          <i class="bi bi-heart-fill"></i><span>Lagu Favorit</span>
        </router-link>
        <router-link to="/playlists" class="nav-item">
          <i class="bi bi-collection-play-fill"></i><span>Playlist Saya</span>
        </router-link>
        <router-link to="/upload" class="nav-item">
          <i class="bi bi-cloud-upload-fill"></i><span>Upload Lagu</span>
        </router-link>
        <router-link to="/history" class="nav-item">
          <i class="bi bi-clock-history"></i><span>Riwayat & Score</span>
        </router-link>
        <router-link to="/request" class="nav-item">
          <i class="bi bi-plus-circle-fill"></i><span>Request Lagu</span>
        </router-link>
        <router-link to="/donation" class="nav-item active">
          <i class="bi bi-heart-fill"></i><span>Donasi</span>
        </router-link>
        <div class="nav-divider"></div>
        <router-link to="/settings" class="nav-item">
          <i class="bi bi-gear-fill"></i><span>Pengaturan</span>
        </router-link>
      </nav>
    </aside>

    <main class="page-main">
      <div class="page-content">
        <!-- Mobile Topbar -->
        <div class="mobile-topbar">
          <router-link to="/dashboard" class="brand brand--compact">
            <i class="bi bi-music-note-beamed"></i>
            <span>Karaoke<span class="text-gradient">Ku</span></span>
          </router-link>
          <div class="mobile-topbar__actions">
            <button class="icon-btn" type="button" @click="fetchPaymentMethods" aria-label="Refresh metode donasi">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
            <button class="icon-btn" type="button" @click="scrollToMethods" aria-label="Lihat metode">
              <i class="bi bi-credit-card-2-front-fill"></i>
            </button>
          </div>
        </div>

        <!-- Hero -->
        <section class="hero reveal" style="--d: 0ms">
          <div class="hero__content">
            <div class="hero__badge">
              <i class="bi bi-heart-fill"></i>
              <span>Donasi / Traktir</span>
            </div>

            <h1>Dukung <span class="text-gradient">KaraokeKu</span> tetap hidup</h1>
            <p class="hero__sub text-white">
              Donasi kamu membantu biaya server dan pengembangan fitur baru, agar KaraokeKu tetap bisa diakses oleh
              semua.
            </p>

            <div class="hero__stats">
              <div class="stat-pill">
                <i class="bi bi-collection"></i>
                <span>{{ totalMethods }} metode</span>
              </div>
              <div class="stat-pill stat-pill--soft">
                <i class="bi bi-qr-code-scan"></i>
                <span>{{ qrisMethods.length }} QRIS</span>
              </div>
              <div class="stat-pill stat-pill--soft">
                <i class="bi bi-wallet2"></i>
                <span>{{ ewalletMethods.length }} e-wallet</span>
              </div>
              <div class="stat-pill stat-pill--soft">
                <i class="bi bi-bank2"></i>
                <span>{{ bankMethods.length }} bank</span>
              </div>

              <div v-if="loading" class="stat-pill stat-pill--soft" aria-live="polite">
                <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                <span>Memuat…</span>
              </div>

              <button class="btn btn-primary btn-sm" type="button" @click="scrollToMethods">
                <i class="bi bi-arrow-down-circle me-1" aria-hidden="true"></i>
                Lihat Metode
              </button>
              <button class="btn btn-ghost btn-sm" type="button" @click="fetchPaymentMethods" :disabled="loading">
                <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
                Refresh
              </button>
            </div>
          </div>

          <div class="hero__art">
            <div class="hero-card hero-card--primary">
              <div class="hero-card__icon" aria-hidden="true">
                <i class="bi bi-hdd-network-fill"></i>
              </div>
              <div class="hero-card__title">Untuk biaya server</div>
              <div class="hero-card__text">Agar streaming tetap lancar dan website selalu online.</div>
              <button class="btn btn-primary btn-sm hero-card__btn" type="button" @click="scrollToMethods">
                <i class="bi bi-heart-fill"></i>
                Donasi sekarang
              </button>
            </div>

            <div class="hero-card hero-card--soft">
              <div class="hero-card__icon" aria-hidden="true">
                <i class="bi bi-music-note-list"></i>
              </div>
              <div class="hero-card__title">Prioritas request</div>
              <div class="hero-card__text">Request lagu dengan donasi akan diprioritaskan.</div>
              <router-link to="/request" class="btn btn-ghost btn-sm hero-card__btn">
                <i class="bi bi-plus-circle-fill"></i>
                Request lagu
              </router-link>
            </div>
          </div>
        </section>

        <div v-if="errorMessage && !loading" class="alert-card alert-card--danger reveal" style="--d: 70ms"
          role="status">
          <div class="alert-icon" aria-hidden="true">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div class="alert-body">
            <div class="alert-title">Gagal memuat metode donasi</div>
            <div class="alert-text text-muted">{{ errorMessage }}</div>
          </div>
          <button class="btn btn-ghost btn-sm" type="button" @click="fetchPaymentMethods">
            <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
            Coba lagi
          </button>
        </div>

        <section class="content-grid">
          <!-- Methods -->
          <div ref="methodsSectionRef" class="panel methods-panel reveal" style="--d: 90ms">
            <div class="panel-header">
              <div class="panel-title">
                <div class="panel-icon" aria-hidden="true">
                  <i class="bi bi-credit-card-2-front-fill"></i>
                </div>
                <div class="panel-title__copy">
                  <h2>Metode Donasi</h2>
                  <p class="text-white">Pilih metode yang paling nyaman. Klik tombol copy untuk menyalin nomor.</p>
                </div>
              </div>

              <div class="panel-actions">
                <span class="pill pill--soft" aria-hidden="true">{{ totalMethods }} metode</span>
                <button class="btn btn-ghost btn-sm" type="button" @click="fetchPaymentMethods" :disabled="loading">
                  <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
                  Refresh
                </button>
              </div>
            </div>

            <div v-if="loading" class="methods-skeleton" aria-hidden="true">
              <div class="skeleton-card loading-skeleton"></div>
              <div class="skeleton-row">
                <div class="skeleton-chip loading-skeleton"></div>
                <div class="skeleton-chip loading-skeleton"></div>
                <div class="skeleton-chip loading-skeleton"></div>
              </div>
              <div class="skeleton-list">
                <div v-for="n in 6" :key="n" class="method-item method-item--skeleton">
                  <div class="method-icon loading-skeleton"></div>
                  <div class="method-info">
                    <div class="skeleton-line loading-skeleton"></div>
                    <div class="skeleton-line skeleton-line--sm loading-skeleton"></div>
                  </div>
                  <div class="skeleton-btn loading-skeleton"></div>
                </div>
              </div>
            </div>

            <div v-else class="methods-body">
              <div v-if="qrisMethods.length > 0" class="methods-group">
                <div class="group-header">
                  <h3><i class="bi bi-qr-code-scan me-2" aria-hidden="true"></i>QRIS</h3>
                  <span class="pill pill--soft" aria-hidden="true">{{ qrisMethods.length }}</span>
                </div>

                <div class="qris-grid">
                  <div v-for="method in qrisMethods" :key="method.id" class="qris-card">
                    <div class="qris-head">
                      <div class="qris-title">
                        <i class="bi bi-qr-code" aria-hidden="true"></i>
                        <span>{{ method.name }}</span>
                      </div>
                      <span class="qris-badge">Scan</span>
                    </div>

                    <div class="qris-body">
                      <div v-if="method.qr_code_url" class="qris-frame">
                        <img :src="getImageUrl(method.qr_code_url)" :alt="method.name" class="qris-img"
                          loading="lazy" />
                      </div>
                      <div v-else class="qris-missing text-muted">
                        QR tidak tersedia untuk metode ini.
                      </div>

                      <div class="qris-hint text-secondary">
                        Scan QR di aplikasi e-wallet / mobile banking.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="ewalletMethods.length > 0" class="methods-group">
                <div class="group-header">
                  <h3><i class="bi bi-wallet2 me-2" aria-hidden="true"></i>E-Wallet</h3>
                  <span class="pill pill--soft" aria-hidden="true">{{ ewalletMethods.length }}</span>
                </div>

                <div class="methods-list">
                  <div v-for="method in ewalletMethods" :key="method.id" class="method-item">
                    <div class="method-icon" :class="toneClass(method.name)" aria-hidden="true">
                      <i :class="normalizeIconClass(method.icon) || 'bi bi-wallet2'"></i>
                    </div>
                    <div class="method-info">
                      <div class="method-name">{{ method.name }}</div>
                      <div class="method-number">{{ method.account_number }}</div>
                      <div v-if="method.account_name" class="method-holder text-muted">a.n. {{ method.account_name }}
                      </div>
                    </div>
                    <button class="btn btn-ghost btn-sm btn-icon" type="button"
                      @click="copyToClipboard(method.account_number, method.name)"
                      :aria-label="`Copy nomor ${method.name}`">
                      <i class="bi bi-copy" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="bankMethods.length > 0" class="methods-group">
                <div class="group-header">
                  <h3><i class="bi bi-bank2 me-2" aria-hidden="true"></i>Transfer Bank</h3>
                  <span class="pill pill--soft" aria-hidden="true">{{ bankMethods.length }}</span>
                </div>

                <div class="methods-list">
                  <div v-for="method in bankMethods" :key="method.id" class="method-item">
                    <div class="method-icon" :class="toneClass(method.name)" aria-hidden="true">
                      <span v-if="!method.icon" class="method-letter">{{ bankInitial(method.name) }}</span>
                      <i v-else :class="normalizeIconClass(method.icon) || 'bi bi-bank2'"></i>
                    </div>
                    <div class="method-info">
                      <div class="method-name">{{ method.name }}</div>
                      <div class="method-number">{{ method.account_number }}</div>
                      <div v-if="method.account_name" class="method-holder text-secondary">a.n. {{ method.account_name }}
                      </div>
                    </div>
                    <button class="btn btn-ghost btn-sm btn-icon" type="button"
                      @click="copyToClipboard(method.account_number, method.name)"
                      :aria-label="`Copy nomor ${method.name}`">
                      <i class="bi bi-copy" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="totalMethods === 0" class="empty-state">
                <div class="empty-icon" aria-hidden="true">
                  <i class="bi bi-emoji-frown"></i>
                </div>
                <h3>Metode donasi belum tersedia</h3>
                <p class="text-muted">Silakan coba lagi nanti.</p>
                <button class="btn btn-primary btn-sm" type="button" @click="fetchPaymentMethods">
                  <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <!-- Side -->
          <aside class="side-panel">
            <div class="panel tips-panel reveal" style="--d: 120ms">
              <div class="panel-header panel-header--compact">
                <div class="panel-title">
                  <div class="panel-icon panel-icon--soft" aria-hidden="true">
                    <i class="bi bi-lightbulb-fill"></i>
                  </div>
                  <div class="panel-title__copy">
                    <h2>Kenapa donasi?</h2>
                    <p class="text-white">Donasi kamu berdampak langsung.</p>
                  </div>
                </div>
              </div>

              <ul class="tips-list ms-3">
                <li><strong>Biaya server</strong> untuk streaming dan penyimpanan.</li>
                <li><strong>Pengembangan</strong> fitur baru dan perbaikan bug.</li>
                <li><strong>Prioritas request</strong> untuk lagu-lagu yang kamu minta.</li>
              </ul>

              <div class="tips-cta">
                <router-link to="/request" class="btn btn-ghost btn-sm">
                  <i class="bi bi-plus-circle-fill me-1" aria-hidden="true"></i>
                  Request lagu
                </router-link>
                <button class="btn btn-primary btn-sm" type="button" @click="scrollToMethods">
                  <i class="bi bi-heart-fill me-1" aria-hidden="true"></i>
                  Donasi
                </button>
              </div>
            </div>

            <div class="panel thanks-panel reveal" style="--d: 150ms">
              <div class="thanks-card">
                <div class="thanks-icon" aria-hidden="true">
                  <i class="bi bi-emoji-heart-eyes"></i>
                </div>
                <h2>Terima kasih!</h2>
                <p class="text-secondary">
                  Setiap donasi kamu sangat berarti untuk menjaga KaraokeKu tetap berjalan dan terus berkembang.
                </p>
                <button class="btn btn-primary btn-sm" type="button" @click="scrollToMethods">
                  <i class="bi bi-heart-fill me-1" aria-hidden="true"></i>
                  Pilih metode
                </button>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>

    <transition name="dp-toast">
      <div v-if="showToast" class="toast-notification" role="status" aria-live="polite">
        <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>

    <MobileNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import MobileNav from '@/components/MobileNav.vue'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const loading = ref(true)
const errorMessage = ref('')
const paymentMethods = ref([])

const showToast = ref(false)
const toastMessage = ref('')
let toastTimeout = null

const methodsSectionRef = ref(null)

const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return true
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? true
}

const scrollToSection = (element) => {
  element?.scrollIntoView?.({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
}

const scrollToMethods = () => {
  scrollToSection(methodsSectionRef.value)
}

const fetchPaymentMethods = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await axios.get(`${API_URL}/payment-methods`)
    paymentMethods.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    errorMessage.value = error.response?.data?.message || 'Gagal memuat metode donasi'
  } finally {
    loading.value = false
  }
}

const getImageUrl = (url) => {
  if (!url) return ''

  if (url.includes('localhost')) {
    url = url.replace(/^http(s)?:\/\/localhost(:\d+)?/, '')
  }
  if (url.startsWith('http')) return url

  const baseUrl = API_URL.endsWith('/api') ? API_URL.replace('/api', '') : API_URL
  if (baseUrl.includes('localhost')) {
    return url.startsWith('/') ? url : `/${url}`
  }

  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

const qrisMethods = computed(() => paymentMethods.value.filter((m) => m.type === 'qris'))
const ewalletMethods = computed(() => paymentMethods.value.filter((m) => m.type === 'ewallet'))
const bankMethods = computed(() => paymentMethods.value.filter((m) => m.type === 'bank'))
const totalMethods = computed(() => paymentMethods.value.length)

const bankInitial = (name) => {
  const n = String(name || '').trim()
  if (!n) return 'BANK'
  const parts = n.split(/\s+/).filter(Boolean)
  const first = parts[0] || n
  return first.slice(0, 4).toUpperCase()
}

const normalizeIconClass = (icon) => {
  if (!icon) return ''
  const v = String(icon).trim()
  if (!v) return ''
  if (v.includes('bi ')) return v
  if (v.startsWith('bi-')) return `bi ${v}`
  return v
}

const toneClass = (name) => {
  const n = String(name || '').toLowerCase()
  if (n.includes('bri') || n.includes('bca') || n.includes('shopee')) return 'tone-blue'
  if (n.includes('bni') || n.includes('mandiri') || n.includes('dana')) return 'tone-green'
  return 'tone-cyan'
}

const triggerToast = (message) => {
  toastMessage.value = message
  showToast.value = true
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    showToast.value = false
  }, 2500)
}

const copyToClipboard = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text)
    triggerToast(`Nomor ${label} berhasil disalin!`)
  } catch (err) {
    console.error('Failed to copy:', err)

    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      triggerToast(`Nomor ${label} berhasil disalin!`)
    } catch (fallbackErr) {
      console.error('Fallback copy failed', fallbackErr)
      triggerToast('Gagal menyalin nomor')
    }
    document.body.removeChild(textArea)
  }
}

onMounted(fetchPaymentMethods)
</script>

<style scoped>
.page-layout {
  /* Local theme override (green–blue gradient) */
  --dp-green: #22c55e;
  --dp-cyan: #06b6d4;
  --dp-blue: #3b82f6;

  --primary: var(--dp-cyan);
  --primary-light: #22d3ee;
  --primary-dark: #0891b2;
  --secondary: var(--dp-green);
  --accent: var(--dp-blue);

  --bg-dark: #061319;
  --bg-darker: #040c10;
  --bg-card: rgba(10, 22, 28, 0.72);
  --bg-card-hover: rgba(14, 30, 37, 0.82);
  --border-color: rgba(94, 234, 212, 0.14);
  --border-color-light: rgba(94, 234, 212, 0.28);

  --gradient-primary: linear-gradient(135deg, #22c55e 0%, #06b6d4 55%, #3b82f6 100%);
  --gradient-glow: linear-gradient(135deg,
      rgba(34, 197, 94, 0.28) 0%,
      rgba(6, 182, 212, 0.32) 55%,
      rgba(59, 130, 246, 0.22) 100%);
  --shadow-glow: 0 0 36px rgba(6, 182, 212, 0.35);

  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  overflow-x: hidden;
  position: relative;
  background: var(--bg-dark);
}

/* Background */
.page-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.bg-mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(900px 600px at 8% 10%, rgba(34, 197, 94, 0.2) 0%, transparent 55%),
    radial-gradient(820px 560px at 92% 16%, rgba(6, 182, 212, 0.18) 0%, transparent 55%),
    radial-gradient(980px 680px at 70% 92%, rgba(59, 130, 246, 0.14) 0%, transparent 60%),
    linear-gradient(180deg, rgba(2, 6, 23, 0.12) 0%, rgba(2, 6, 23, 0.92) 70%),
    var(--bg-dark);
}

.bg-particles {
  position: absolute;
  inset: 0;
  opacity: 0.85;
  background-image: url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306b6d4' fill-opacity='0.06'%3E%3Ccircle cx='10' cy='14' r='1.6'/%3E%3Ccircle cx='38' cy='30' r='1.4'/%3E%3Ccircle cx='54' cy='50' r='1.8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.bg-orb {
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  filter: blur(72px);
  opacity: 0.32;
  animation: orbFloat 16s ease-in-out infinite;
}

.orb-1 {
  background: rgba(34, 197, 94, 0.32);
  top: -180px;
  left: -180px;
}

.orb-2 {
  background: rgba(6, 182, 212, 0.34);
  bottom: -220px;
  right: -200px;
  animation-delay: -5s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: rgba(59, 130, 246, 0.2);
  top: 38%;
  right: 20%;
  animation-delay: -10s;
}

@keyframes orbFloat {

  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    transform: translate3d(18px, -14px, 0) scale(1.06);
  }
}

/* Sidebar */
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
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
}

.sidebar-header {
  padding: 1.25rem 1.25rem 1.1rem;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.sidebar-header::after {
  content: '';
  position: absolute;
  left: 1.25rem;
  right: 1.25rem;
  bottom: -1px;
  height: 1px;
  background: var(--gradient-glow);
  opacity: 0.7;
  pointer-events: none;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  transition: transform var(--transition-normal), opacity var(--transition-normal);
  text-decoration: none;
}

.brand:hover {
  transform: translateY(-1px);
  opacity: 0.95;
}

.brand i {
  font-size: 1.5rem;
  color: var(--primary-light);
  filter: drop-shadow(0 0 16px rgba(34, 197, 94, 0.18));
}

.sidebar-nav {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.nav-divider {
  height: 1px;
  background: rgba(94, 234, 212, 0.14);
  margin: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 0.25rem;
  transition: transform var(--transition-fast), background var(--transition-fast), color var(--transition-fast),
    border-color var(--transition-fast);
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
  text-decoration: none;
}

.nav-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-glow);
  opacity: 0;
  transform: translateX(-10%);
  transition: opacity var(--transition-normal), transform var(--transition-normal);
}

.nav-item>* {
  position: relative;
  z-index: 1;
}

.nav-item:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(94, 234, 212, 0.18);
  transform: translateY(-1px);
}

.nav-item:hover::before {
  opacity: 0.18;
  transform: translateX(0);
}

.nav-item.active {
  color: white;
  background: linear-gradient(135deg,
      rgba(34, 197, 94, 0.18) 0%,
      rgba(6, 182, 212, 0.12) 55%,
      rgba(59, 130, 246, 0.16) 100%);
  border-color: rgba(94, 234, 212, 0.28);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 4px;
  height: 22px;
  transform: translateY(-50%);
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  box-shadow: 0 0 18px rgba(6, 182, 212, 0.45);
}

.page-main {
  flex: 1;
  margin-left: 260px;
  position: relative;
  z-index: 1;
}

.page-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

/* Mobile topbar */
.mobile-topbar {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1rem;
  margin: -0.5rem -0.5rem 1rem;
  border: 1px solid rgba(94, 234, 212, 0.16);
  border-radius: var(--radius-xl);
  background: rgba(4, 12, 16, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  position: sticky;
  top: 0.75rem;
  z-index: 10;
}

.brand--compact {
  font-size: 1.1rem;
}

.mobile-topbar__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-btn {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
  text-decoration: none;
}

.icon-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.28);
  background: rgba(255, 255, 255, 0.1);
}

/* Hero */
.hero {
  display: grid;
  grid-template-columns: 1.35fr 0.9fr;
  gap: 1.25rem;
  padding: 1.4rem;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: linear-gradient(180deg, rgba(10, 22, 28, 0.72) 0%, rgba(4, 12, 16, 0.7) 100%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  overflow: hidden;
  position: relative;
  margin-bottom: 1.25rem;
  box-shadow: 0 16px 70px rgba(0, 0, 0, 0.45);
}

.hero::before {
  content: '';
  position: absolute;
  inset: -1px;
  background:
    radial-gradient(540px 220px at 25% 0%, rgba(34, 197, 94, 0.16) 0%, transparent 60%),
    radial-gradient(520px 200px at 85% 35%, rgba(6, 182, 212, 0.14) 0%, transparent 60%),
    radial-gradient(520px 220px at 70% 110%, rgba(59, 130, 246, 0.12) 0%, transparent 60%);
  pointer-events: none;
}

.hero__content,
.hero__art {
  position: relative;
  z-index: 1;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-full);
  border: 1px solid rgba(94, 234, 212, 0.22);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-size: 0.85rem;
  margin-bottom: 0.85rem;
}

.hero__badge i {
  color: rgba(187, 247, 208, 0.98);
}

.hero h1 {
  margin: 0 0 0.35rem 0;
  font-size: 2rem;
  letter-spacing: -0.02em;
}

.hero__sub {
  margin: 0 0 1.1rem 0;
  max-width: 72ch;
}

.hero__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.7rem;
  border-radius: var(--radius-full);
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(0, 0, 0, 0.22);
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.stat-pill i {
  color: var(--primary-light);
}

.stat-pill--soft {
  background: rgba(6, 182, 212, 0.08);
}

.stat-pill .spinner-border {
  width: 0.95rem;
  height: 0.95rem;
}

.hero__art {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.9rem;
}

.hero-card {
  padding: 1rem 1rem 0.9rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.25);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  display: grid;
  gap: 0.5rem;
}

.hero-card--primary {
  background: linear-gradient(135deg,
      rgba(34, 197, 94, 0.12) 0%,
      rgba(6, 182, 212, 0.1) 55%,
      rgba(59, 130, 246, 0.12) 100%);
}

.hero-card__icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(94, 234, 212, 0.18);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-light);
}

.hero-card__title {
  font-weight: 700;
  letter-spacing: -0.01em;
}

.hero-card__text {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.hero-card__btn {
  justify-self: start;
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

/* Content grid */
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

/* Panels */
.panel {
  background: var(--bg-card);
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
  padding: 1.15rem 1.2rem 1rem;
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
  font-size: 1.15rem;
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
  color: var(--primary-light);
  flex: 0 0 auto;
}

.panel-icon--soft {
  background: rgba(6, 182, 212, 0.08);
}

.panel-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(94, 234, 212, 0.14);
  color: var(--text-secondary);
  font-size: 0.78rem;
}

.pill--soft {
  background: rgba(6, 182, 212, 0.08);
}

/* Methods */
.methods-body {
  padding: 1rem 1.2rem 1.2rem;
  display: grid;
  gap: 1.25rem;
}

.methods-group {
  display: grid;
  gap: 0.75rem;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.group-header h3 {
  margin: 0;
  display: inline-flex;
  align-items: center;
  font-weight: 900;
  letter-spacing: -0.01em;
  font-size: 1.05rem;
}

.qris-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 0.85rem;
}

.qris-card {
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.18);
  padding: 0.9rem;
  display: grid;
  gap: 0.7rem;
}

.qris-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.qris-title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 900;
}

.qris-title i {
  color: var(--primary-light);
}

.qris-badge {
  font-size: 0.78rem;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(94, 234, 212, 0.18);
  color: rgba(165, 243, 252, 0.98);
  font-weight: 800;
}

.qris-frame {
  /* background: white; */
  padding: 0.6rem;
  border-radius: 16px;
  justify-self: center;
  /* box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45); */
}

.qris-img {
  width: min(220px, 100%);
  aspect-ratio: 1/1;
  object-fit: contain;
  display: block;
  margin: auto;
}

.qris-hint {
  font-size: 0.88rem;
  text-align: center;
}

.methods-list {
  display: grid;
  gap: 0.75rem;
}

.method-item {
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.18);
  padding: 0.8rem 0.85rem;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.8rem;
  align-items: center;
}

.method-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  place-items: center;
  color: var(--text-primary);
  flex: 0 0 auto;
}

.method-icon i {
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.95);
}

.method-icon.tone-green {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.28), rgba(6, 182, 212, 0.16));
  border-color: rgba(34, 197, 94, 0.22);
}

.method-icon.tone-cyan {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.26), rgba(59, 130, 246, 0.14));
  border-color: rgba(94, 234, 212, 0.22);
}

.method-icon.tone-blue {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.24), rgba(6, 182, 212, 0.14));
  border-color: rgba(59, 130, 246, 0.22);
}

.method-letter {
  font-weight: 900;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.95);
}

.method-info {
  min-width: 0;
}

.method-name {
  font-weight: 900;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.method-number {
  margin-top: 0.12rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.method-holder {
  margin-top: 0.12rem;
  font-size: 0.85rem;
}

.btn-icon {
  width: 42px;
  height: 42px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
}

/* Skeleton */
.methods-skeleton {
  padding: 1rem 1.2rem 1.2rem;
  display: grid;
  gap: 0.85rem;
}

.skeleton-card {
  height: 120px;
  border-radius: 24px;
}

.skeleton-row {
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.skeleton-chip {
  width: 90px;
  height: 22px;
  border-radius: 999px;
}

.skeleton-list {
  display: grid;
  gap: 0.75rem;
}

.method-item--skeleton {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(94, 234, 212, 0.1);
}

.method-item--skeleton .method-icon {
  border-radius: 16px;
}

.skeleton-line {
  height: 0.95rem;
  width: 100%;
  border-radius: 10px;
}

.skeleton-line--sm {
  height: 0.75rem;
  width: 70%;
  margin-top: 0.35rem;
}

.skeleton-btn {
  width: 42px;
  height: 42px;
  border-radius: 14px;
}

/* Tips */
.tips-list {
  padding: 0.9rem 1.2rem 0.75rem;
  margin: 0;
  display: grid;
  gap: 0.6rem;
  color: var(--text-secondary);
}

.tips-list li {
  line-height: 1.5;
}

.tips-list strong {
  color: var(--text-primary);
}

.tips-cta {
  padding: 0 1.2rem 1.2rem;
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}

/* Thanks */
.thanks-card {
  padding: 1.2rem 1.2rem 1.25rem;
  display: grid;
  gap: 0.65rem;
  text-align: center;
  position: relative;
}

.thanks-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(520px 240px at 18% 10%, rgba(34, 197, 94, 0.16) 0%, transparent 62%),
    radial-gradient(520px 240px at 85% 42%, rgba(6, 182, 212, 0.14) 0%, transparent 62%),
    radial-gradient(520px 260px at 55% 115%, rgba(59, 130, 246, 0.12) 0%, transparent 64%);
}

.thanks-card>* {
  position: relative;
  z-index: 1;
}

.thanks-icon {
  width: 78px;
  height: 78px;
  border-radius: 26px;
  margin: 0 auto 0.25rem;
  display: grid;
  place-items: center;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: linear-gradient(135deg,
      rgba(34, 197, 94, 0.16) 0%,
      rgba(6, 182, 212, 0.14) 55%,
      rgba(59, 130, 246, 0.16) 100%);
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.45);
}

.thanks-icon i {
  font-size: 2.2rem;
  color: rgba(255, 255, 255, 0.95);
}

.thanks-card h2 {
  margin: 0;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.thanks-card p {
  margin: 0 0 0.35rem;
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 2.25rem 1rem 2rem;
}

.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.22);
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.45);
  margin-bottom: 0.9rem;
}

.empty-icon i {
  font-size: 2rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.empty-state h3 {
  font-weight: 900;
  margin: 0 0 0.25rem;
}

.empty-state p {
  margin: 0 0 0.85rem;
}

/* Toast */
.toast-notification {
  position: fixed;
  left: 50%;
  bottom: 1.6rem;
  transform: translateX(-50%);
  z-index: 3000;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border-radius: 18px;
  background: rgba(34, 197, 94, 0.95);
  color: white;
  box-shadow: 0 18px 70px rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(187, 247, 208, 0.35);
}

.dp-toast-enter-active,
.dp-toast-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.dp-toast-enter-from,
.dp-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

/* In-page button theme overrides */
.btn-primary {
  box-shadow: var(--shadow-glow);
}

.btn-primary:hover {
  box-shadow: 0 0 52px rgba(6, 182, 212, 0.45);
  filter: saturate(1.08);
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.08);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.14);
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
  .bg-orb {
    animation: none;
  }

  .reveal {
    animation: none;
  }

  .icon-btn,
  .nav-item,
  .btn,
  .method-item {
    transition: none !important;
  }

  .dp-toast-enter-active,
  .dp-toast-leave-active {
    transition: none !important;
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero__art {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 992px) {
  .dashboard-sidebar {
    width: 70px;
  }

  .sidebar-header .brand span,
  .nav-item span {
    display: none;
  }

  .page-main {
    margin-left: 70px;
  }

  .nav-item {
    justify-content: center;
    padding: 0.75rem;
  }
}

@media (max-width: 768px) {
  .dashboard-sidebar {
    display: none;
  }

  .page-main {
    margin-left: 0;
  }

  .page-content {
    padding: 1.25rem;
  }

  .mobile-topbar {
    display: flex;
  }

  .hero {
    padding: 1.15rem;
  }

  .hero h1 {
    font-size: 1.55rem;
  }

  .hero__art {
    grid-template-columns: 1fr;
  }

  .toast-notification {
    bottom: 92px;
  }
}

@media (max-width: 425px) {
  .page-content {
    padding: 1rem;
  }

  .panel-header {
    padding: 1rem;
  }

  .methods-body,
  .methods-skeleton,
  .tips-list,
  .tips-cta,
  .thanks-card {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .method-item {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .btn-icon {
    grid-column: 2;
    justify-self: end;
    margin-top: 0.55rem;
  }

  .method-item--skeleton .skeleton-btn {
    grid-column: 2;
    justify-self: end;
  }

  .method-number {
    overflow-wrap: anywhere;
    word-break: break-word;
  }
}
</style>
