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
        <router-link to="/request" class="nav-item active">
          <i class="bi bi-plus-circle-fill"></i><span>Request Lagu</span>
        </router-link>
        <router-link to="/donation" class="nav-item">
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
            <button class="icon-btn" type="button" @click="scrollToForm" aria-label="Isi form request">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="icon-btn" type="button" @click="scrollToTips" aria-label="Lihat panduan request">
              <i class="bi bi-lightbulb-fill"></i>
            </button>
          </div>
        </div>

        <!-- Hero -->
        <section class="hero reveal" style="--d: 0ms">
          <div class="hero__content">
            <div class="hero__badge">
              <i class="bi bi-plus-circle-fill"></i>
              <span>Request Lagu</span>
            </div>
            <h1>Request lagu <span class="text-gradient">favorit</span> kamu</h1>
            <p class="hero__sub text-white">
              Mau lagu tertentu ditambahkan? Isi form request di bawah. Admin akan meninjau request kamu secara berkala.
            </p>

            <div class="hero__stats">
              <div class="stat-pill">
                <i class="bi bi-lightning-charge-fill"></i>
                <span>Review 1–3 hari</span>
              </div>
              <div class="stat-pill stat-pill--soft">
                <i class="bi bi-shield-check"></i>
                <span>Dipantau admin</span>
              </div>
              <div class="stat-pill stat-pill--soft">
                <i class="bi bi-heart-fill"></i>
                <span>{{ methodCount }} metode donasi</span>
              </div>

              <div v-if="isSubmitting || loadingMethods" class="stat-pill stat-pill--soft" aria-live="polite">
                <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                <span>{{ isSubmitting ? 'Mengirim…' : 'Memuat…' }}</span>
              </div>

              <button class="btn btn-primary btn-sm" type="button" @click="scrollToForm">
                <i class="bi bi-pencil-square me-1"></i>
                Isi Form
              </button>
              <button class="btn btn-ghost btn-sm" type="button" @click="scrollToDonationPreview">
                <i class="bi bi-heart-fill me-1"></i>
                Metode Donasi
              </button>
            </div>
          </div>

          <div class="hero__art">
            <div class="hero-card hero-card--primary">
              <div class="hero-card__icon" aria-hidden="true">
                <i class="bi bi-stars"></i>
              </div>
              <div class="hero-card__title">Tips cepat</div>
              <div class="hero-card__text">Isi judul + artis dengan jelas, tambah link referensi jika ada.</div>
              <button class="btn btn-primary btn-sm hero-card__btn" type="button" @click="scrollToTips">
                <i class="bi bi-lightbulb-fill"></i>
                Lihat panduan
              </button>
            </div>

            <div class="hero-card hero-card--soft">
              <div class="hero-card__icon" aria-hidden="true">
                <i class="bi bi-heart-pulse-fill"></i>
              </div>
              <div class="hero-card__title">Prioritas donasi</div>
              <div class="hero-card__text">Request dengan donasi akan diprioritaskan untuk diproses.</div>
              <router-link to="/donation" class="btn btn-ghost btn-sm hero-card__btn">
                <i class="bi bi-arrow-right"></i>
                Donasi
              </router-link>
            </div>
          </div>
        </section>

        <section class="content-grid">
          <!-- Form -->
          <div ref="formSectionRef" class="panel request-panel reveal" style="--d: 60ms">
            <div class="panel-header">
              <div class="panel-title">
                <div class="panel-icon" aria-hidden="true">
                  <i class="bi bi-pencil-square"></i>
                </div>
                <div class="panel-title__copy">
                  <h2>Form Request</h2>
                  <p class="text-white">Lengkapi detail lagu. Minimal: judul dan artis.</p>
                </div>
              </div>
              <div class="panel-steps" aria-hidden="true">
                <span class="step-pill">1. Isi</span>
                <span class="step-pill">2. Kirim</span>
                <span class="step-pill">3. Review</span>
              </div>
            </div>

            <form class="request-form" @submit.prevent="submitRequest">
              <div class="request-tabs-wrap">
                <div class="request-tabs__meta">
                  <div class="request-tabs__title">
                    <span>Multi request</span>
                    <span class="request-tabs__count text-secondary">{{ completedTabsCount }}/{{ maxRequests }}
                      siap</span>
                  </div>
                  <div class="request-tabs__hint text-secondary">
                    Pilih Tab 1–{{ maxRequests }} untuk isi hingga 10 lagu (tab kosong tidak akan dikirim).
                  </div>
                </div>

                <div class="request-tabs" role="tablist" aria-label="Pilih slot request lagu"
                  @keydown="handleTabKeydown">
                  <button v-for="i in maxRequests" :key="i" class="request-tab" type="button" role="tab"
                    :id="getTabId(i - 1)" :aria-controls="getPanelId(i - 1)" :aria-selected="activeTab === i - 1"
                    :tabindex="activeTab === i - 1 ? 0 : -1" :class="getTabClass(i - 1)" @click="setActiveTab(i - 1)">
                    <span class="request-tab__num">{{ i }}</span>
                    <span class="request-tab__state" aria-hidden="true"></span>
                  </button>
                </div>
              </div>

              <div class="request-tabpanel" role="tabpanel" :id="getPanelId(activeTab)"
                :aria-labelledby="getTabId(activeTab)">
                <div class="form-grid">
                  <div class="field">
                    <label class="form-label">Judul Lagu *</label>
                    <input ref="titleInputRef" type="text" class="form-control" v-model="activeRequest.title"
                      placeholder="Contoh: Laskar Pelangi" :disabled="isSubmitting" />
                  </div>
                  <div class="field">
                    <label class="form-label">Artis / Penyanyi *</label>
                    <input type="text" class="form-control" v-model="activeRequest.artist" placeholder="Contoh: Nidji"
                      :disabled="isSubmitting" />
                  </div>

                  <div class="field">
                    <label class="form-label">Genre</label>
                    <select class="form-select" v-model="activeRequest.genre" :disabled="isSubmitting">
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
                  <div class="field">
                    <label class="form-label">Bahasa/Negara</label>
                    <select class="form-select" v-model="activeRequest.language" :disabled="isSubmitting">
                      <option value="">Pilih Bahasa</option>
                      <option value="Indonesia">Indonesia</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="English">English</option>
                      <option value="Korean">Korean</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Mandarin">Mandarin</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div class="field field--full">
                    <label class="form-label">Link Referensi (opsional)</label>
                    <input type="url" class="form-control" v-model="activeRequest.link"
                      placeholder="Contoh: https://youtube.com/…" :disabled="isSubmitting" />
                    <div class="help-text">Bantu admin menemukan versi yang tepat (YouTube/Spotify/Link resmi).</div>
                  </div>

                  <div class="field field--full">
                    <label class="form-label">Catatan (opsional)</label>
                    <textarea class="form-control" rows="4" v-model="activeRequest.notes"
                      placeholder="Contoh: versi karaoke / versi original / bahasa / request khusus…"
                      :disabled="isSubmitting"></textarea>
                  </div>
                </div>
              </div>

              <div v-if="errorMessage" class="alert-card alert-card--danger" role="status">
                <div class="alert-icon" aria-hidden="true">
                  <i class="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div class="alert-body">
                  <div class="alert-title">Gagal mengirim request</div>
                  <div class="alert-text text-muted">{{ errorMessage }}</div>
                </div>
              </div>

              <div class="form-actions">
                <div class="form-actions__left">
                  <button type="button" class="btn btn-ghost" @click="resetActiveTab" :disabled="isSubmitting">
                    <i class="bi bi-arrow-counterclockwise me-1"></i>
                    Reset Tab
                  </button>
                  <button type="button" class="btn btn-ghost" @click="resetAllTabs" :disabled="isSubmitting">
                    <i class="bi bi-trash3 me-1"></i>
                    Reset Semua
                  </button>
                </div>
                <button type="submit" class="btn btn-primary btn-lg"
                  :disabled="isSubmitting || completedTabsCount === 0">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                  {{ submitButtonLabel }}
                </button>
              </div>
            </form>
          </div>

          <!-- Side -->
          <aside class="side-panel">
            <div ref="tipsSectionRef" class="panel tips-panel reveal" style="--d: 90ms">
              <div class="panel-header panel-header--compact">
                <div class="panel-title">
                  <div class="panel-icon panel-icon--soft" aria-hidden="true">
                    <i class="bi bi-lightbulb-fill"></i>
                  </div>
                  <div class="panel-title__copy">
                    <h2>Panduan cepat</h2>
                    <p class="text-white">Agar request kamu lebih cepat diproses.</p>
                  </div>
                </div>
              </div>

              <ul class="tips-list ms-3">
                <li>Tulis judul dan artis <strong>tanpa singkatan</strong>.</li>
                <li>Jika ada, sertakan link referensi agar versi lagu tepat.</li>
                <li>Request dengan donasi akan <strong>diprioritaskan</strong>.</li>
                <li>Estimasi review 1–3 hari kerja (tergantung antrean).</li>
              </ul>
            </div>

            <div ref="donationSectionRef" class="panel donation-panel reveal" style="--d: 120ms">
              <div class="panel-header panel-header--compact">
                <div class="panel-title">
                  <div class="panel-icon panel-icon--soft" aria-hidden="true">
                    <i class="bi bi-heart-fill"></i>
                  </div>
                  <div class="panel-title__copy">
                    <h2>Metode donasi</h2>
                    <p class="text-white">Preview cepat (detail lengkap di halaman Donasi).</p>
                  </div>
                </div>
                <router-link to="/donation" class="btn btn-ghost btn-sm">
                  <i class="bi bi-arrow-right me-1"></i>
                  Detail
                </router-link>
              </div>

              <div v-if="loadingMethods" class="methods-skeleton" aria-hidden="true">
                <div class="skeleton-block loading-skeleton"></div>
                <div class="skeleton-line loading-skeleton"></div>
                <div class="skeleton-line skeleton-line--sm loading-skeleton"></div>
                <div class="skeleton-line loading-skeleton"></div>
                <div class="skeleton-line skeleton-line--sm loading-skeleton"></div>
              </div>

              <div v-else class="methods-body">
                <div v-if="qrisMethod" class="qr-card">
                  <div class="qr-card__head">
                    <i class="bi bi-qr-code-scan" aria-hidden="true"></i>
                    <span>{{ qrisMethod.name }}</span>
                  </div>
                  <img :src="getImageUrl(qrisMethod.qr_code_url)" :alt="qrisMethod.name" class="qr-img" />
                  <div class="qr-note text-muted">Scan QR untuk donasi cepat.</div>
                </div>

                <div v-if="ewalletMethods.length" class="methods-group">
                  <div class="methods-title">E-Wallet</div>
                  <div class="methods-chips">
                    <span v-for="w in ewalletMethods.slice(0, 4)" :key="w.id" class="method-chip"
                      :class="getMethodClass(w.name)">
                      <i class="bi bi-wallet2" aria-hidden="true"></i>
                      <span class="method-chip__name">{{ w.name }}</span>
                      <span class="method-chip__number">{{ w.account_number }}</span>
                    </span>
                  </div>
                </div>

                <div v-if="bankMethods.length" class="methods-group">
                  <div class="methods-title">Transfer Bank</div>
                  <div class="methods-chips">
                    <span v-for="b in bankMethods.slice(0, 4)" :key="b.id" class="method-chip method-chip--bank">
                      <i class="bi bi-bank2" aria-hidden="true"></i>
                      <span class="method-chip__name">{{ b.name }}</span>
                      <span class="method-chip__number">{{ b.account_number }}</span>
                    </span>
                  </div>
                </div>

                <div v-if="!qrisMethod && !ewalletMethods.length && !bankMethods.length" class="empty-mini">
                  <div class="empty-mini__icon" aria-hidden="true">
                    <i class="bi bi-emoji-frown"></i>
                  </div>
                  <div class="empty-mini__title">Metode donasi belum tersedia</div>
                  <div class="empty-mini__text text-muted">Coba lagi nanti atau buka halaman Donasi.</div>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>

    <!-- Donation Modal -->
    <transition name="rp-modal">
      <div v-if="showDonationModal" class="modal-overlay" @click.self="closeDonationModal" role="dialog"
        aria-modal="true">
        <div class="modal-content" role="document">
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon" aria-hidden="true">
                <i class="bi bi-check-circle-fill"></i>
              </div>
              <div class="modal-title__copy">
                <h3>Request terkirim!</h3>
                <p class="text-muted">Terima kasih, request kamu sudah masuk antrean review.</p>
              </div>
            </div>
            <button class="btn-close-modal" type="button" @click="closeDonationModal" aria-label="Tutup">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="success-banner">
              <div class="success-banner__title">
                <i class="bi bi-music-note-beamed" aria-hidden="true"></i>
                <span v-if="submittedRequests.length === 1" class="success-banner__text">
                  "{{ submittedRequests[0].title }}" — {{ submittedRequests[0].artist }}
                </span>
                <span v-else class="success-banner__text">{{ submittedRequests.length }} request lagu terkirim</span>
              </div>
              <div v-if="submittedRequests.length > 1" class="success-banner__list">
                <ol class="success-list">
                  <li v-for="(r, idx) in submittedRequests" :key="`${r.title}-${r.artist}-${idx}`">
                    "{{ r.title }}" — {{ r.artist }}
                  </li>
                </ol>
              </div>
              <div v-if="failedTabs.length" class="success-banner__warn" role="status">
                <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
                <span>Beberapa request gagal dikirim (Tab: {{ failedTabs.join(', ') }}). Tutup modal untuk
                  memperbaiki.</span>
              </div>
              <div class="success-banner__sub text-muted">Admin akan meninjau request kamu secepatnya.</div>
            </div>

            <div class="donation-prompt">
              <div class="donation-prompt__icon" aria-hidden="true">
                <i class="bi bi-heart-fill"></i>
              </div>
              <div class="donation-prompt__copy">
                <h4>Dukung kami</h4>
                <p class="text-muted">
                  Dengan berdonasi, request kamu akan <strong>diprioritaskan</strong> dan membantu kami menambah lagu
                  baru.
                </p>
              </div>
            </div>

            <div class="donation-methods">
              <div v-if="loadingMethods" class="text-center w-100 py-3">
                <div class="spinner-border spinner-border-sm text-primary"></div>
              </div>

              <template v-else>
                <div v-if="qrisMethod" class="modal-qr">
                  <div class="modal-qr__head">
                    <i class="bi bi-qr-code-scan" aria-hidden="true"></i>
                    <span>{{ qrisMethod.name }}</span>
                  </div>
                  <img :src="getImageUrl(qrisMethod.qr_code_url)" :alt="qrisMethod.name" class="modal-qr__img" />
                  <div class="modal-qr__hint text-muted">Scan QR untuk donasi cepat.</div>
                </div>

                <div class="modal-methods">
                  <div v-if="ewalletMethods.length" class="modal-methods__group">
                    <div class="modal-methods__title">E-Wallet</div>
                    <div class="modal-methods__list">
                      <div v-for="w in ewalletMethods.slice(0, 3)" :key="w.id" class="modal-method">
                        <div class="modal-method__name">{{ w.name }}</div>
                        <div class="modal-method__number">{{ w.account_number }}</div>
                      </div>
                    </div>
                  </div>

                  <div v-if="bankMethods.length" class="modal-methods__group">
                    <div class="modal-methods__title">Transfer Bank</div>
                    <div class="modal-methods__list">
                      <div v-for="b in bankMethods.slice(0, 3)" :key="b.id" class="modal-method">
                        <div class="modal-method__name">{{ b.name }}</div>
                        <div class="modal-method__number">{{ b.account_number }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-ghost" type="button" @click="closeDonationModal">Nanti Saja</button>
            <router-link to="/donation" class="btn btn-primary">
              <i class="bi bi-heart-fill me-2"></i>
              Lihat Semua Metode
            </router-link>
          </div>
        </div>
      </div>
    </transition>

    <MobileNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import axios from 'axios'
import MobileNav from '@/components/MobileNav.vue'

const API_URL = import.meta.env.VITE_API_URL || '/api'
const maxRequests = 10

const formSectionRef = ref(null)
const tipsSectionRef = ref(null)
const donationSectionRef = ref(null)
const titleInputRef = ref(null)

const activeTab = ref(0)

const createEmptyRequest = () => ({
  title: '',
  artist: '',
  genre: '',
  language: '',
  link: '',
  notes: ''
})

const requestForms = ref(Array.from({ length: maxRequests }, createEmptyRequest))
const activeRequest = computed(() => requestForms.value[activeTab.value])

const showDonationModal = ref(false)
const submittedRequests = ref([])
const failedTabs = ref([])
const isSubmitting = ref(false)
const errorMessage = ref('')

const paymentMethods = ref([])
const loadingMethods = ref(true)

const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return true
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? true
}

const scrollToSection = (element) => {
  element?.scrollIntoView?.({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
}

const scrollToForm = async () => {
  scrollToSection(formSectionRef.value)
  await nextTick()
  setTimeout(
    () => titleInputRef.value?.focus?.(),
    prefersReducedMotion() ? 0 : 220
  )
}

const scrollToTips = () => {
  scrollToSection(tipsSectionRef.value)
}

const scrollToDonationPreview = () => {
  scrollToSection(donationSectionRef.value)
}

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const fetchPaymentMethods = async () => {
  loadingMethods.value = true
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

const getMethodClass = (name) => {
  const n = String(name || '').toLowerCase().replace(/\s/g, '')
  if (n.includes('bca')) return 'bca'
  if (n.includes('bni')) return 'bni'
  if (n.includes('mandiri')) return 'mandiri'
  if (n.includes('bri')) return 'bri'
  if (n.includes('cimb')) return 'cimb'
  if (n.includes('gopay')) return 'gopay'
  if (n.includes('ovo')) return 'ovo'
  if (n.includes('dana')) return 'dana'
  if (n.includes('shopee')) return 'shopee'
  return 'generic'
}

const qrisMethod = computed(() => paymentMethods.value.find((m) => m.type === 'qris'))
const ewalletMethods = computed(() => paymentMethods.value.filter((m) => m.type === 'ewallet'))
const bankMethods = computed(() => paymentMethods.value.filter((m) => m.type === 'bank'))

const methodCount = computed(() => {
  const count = (qrisMethod.value ? 1 : 0) + ewalletMethods.value.length + bankMethods.value.length
  return count || 0
})

const normalize = (value) => String(value ?? '').trim()

const toPayload = (req) => ({
  title: normalize(req.title),
  artist: normalize(req.artist),
  genre: normalize(req.genre),
  language: normalize(req.language),
  link: normalize(req.link),
  notes: normalize(req.notes)
})

const isPayloadEmpty = (payload) =>
  !payload.title && !payload.artist && !payload.genre && !payload.language && !payload.link && !payload.notes

const isPayloadComplete = (payload) => Boolean(payload.title) && Boolean(payload.artist)

const completedTabsCount = computed(() =>
  requestForms.value.reduce((count, req) => count + (isPayloadComplete(toPayload(req)) ? 1 : 0), 0)
)

const submitButtonLabel = computed(() => {
  if (isSubmitting.value) return 'Mengirim…'
  const count = completedTabsCount.value
  return count > 1 ? `Kirim ${count} Request` : 'Kirim Request'
})

const getTabId = (index) => `request-tab-${index + 1}`
const getPanelId = (index) => `request-panel-${index + 1}`

const getTabClass = (index) => {
  const payload = toPayload(requestForms.value[index])
  return {
    'is-active': activeTab.value === index,
    'is-complete': isPayloadComplete(payload),
    'is-partial': !isPayloadEmpty(payload) && !isPayloadComplete(payload)
  }
}

const setActiveTab = async (index) => {
  const nextIndex = Math.max(0, Math.min(maxRequests - 1, index))
  activeTab.value = nextIndex

  if (typeof document === 'undefined') return
  await nextTick()
  document.getElementById(getTabId(nextIndex))?.focus?.()
}

const handleTabKeydown = (event) => {
  if (isSubmitting.value) return

  const { key } = event

  if (key === 'ArrowRight') {
    event.preventDefault()
    setActiveTab((activeTab.value + 1) % maxRequests)
    return
  }

  if (key === 'ArrowLeft') {
    event.preventDefault()
    setActiveTab((activeTab.value - 1 + maxRequests) % maxRequests)
    return
  }

  if (/^[1-9]$/.test(key)) {
    event.preventDefault()
    setActiveTab(parseInt(key, 10) - 1)
    return
  }

  if (key === '0') {
    event.preventDefault()
    setActiveTab(9)
  }
}

const resetTab = (index) => {
  requestForms.value[index] = createEmptyRequest()
}

const resetActiveTab = () => {
  errorMessage.value = ''
  resetTab(activeTab.value)
}

const resetAllTabs = () => {
  errorMessage.value = ''
  requestForms.value = Array.from({ length: maxRequests }, createEmptyRequest)
  activeTab.value = 0
}

const submitRequest = async () => {
  if (isSubmitting.value) return

  errorMessage.value = ''
  failedTabs.value = []
  submittedRequests.value = []
  isSubmitting.value = true

  try {
    const ready = []
    const incompleteTabs = []

    requestForms.value.forEach((req, index) => {
      const payload = toPayload(req)
      if (isPayloadEmpty(payload)) return

      if (!isPayloadComplete(payload)) {
        incompleteTabs.push(index)
        return
      }

      ready.push({ index, payload })
    })

    if (incompleteTabs.length) {
      const first = incompleteTabs[0]
      errorMessage.value = `Lengkapi Judul + Artis di Tab ${first + 1} (atau kosongkan tab jika tidak dipakai).`
      await setActiveTab(first)
      await nextTick()
      titleInputRef.value?.focus?.()
      return
    }

    if (!ready.length) {
      errorMessage.value = 'Isi minimal 1 request (Judul + Artis).'
      await nextTick()
      titleInputRef.value?.focus?.()
      return
    }

    const results = await Promise.allSettled(
      ready.map(({ payload }) => axios.post(`${API_URL}/requests`, payload, getAuthHeader()))
    )

    const successes = []
    const failures = []

    results.forEach((result, idx) => {
      const { index, payload } = ready[idx]
      if (result.status === 'fulfilled') {
        successes.push({ index, payload })
      } else {
        failures.push({ index, error: result.reason })
      }
    })

    if (successes.length) {
      submittedRequests.value = successes.map(({ payload }) => ({ title: payload.title, artist: payload.artist }))
      showDonationModal.value = true
      successes.forEach(({ index }) => resetTab(index))
    }

    if (failures.length) {
      const firstFailure = failures[0]
      failedTabs.value = failures.map((f) => f.index + 1)
      const serverMessage = firstFailure.error?.response?.data?.message
      errorMessage.value = serverMessage
        ? `Gagal mengirim beberapa request (contoh: Tab ${firstFailure.index + 1}): ${serverMessage}`
        : `Gagal mengirim beberapa request (contoh: Tab ${firstFailure.index + 1}). Silakan coba lagi.`
      await setActiveTab(firstFailure.index)
      return
    }

    await setActiveTab(0)
  } catch (error) {
    console.error('Error submitting request:', error)
    errorMessage.value = error.response?.data?.message || 'Gagal mengirim request. Silakan coba lagi.'
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
.page-layout {
  /* Local theme override (green–blue gradient) */
  --rp-green: #22c55e;
  --rp-cyan: #06b6d4;
  --rp-blue: #3b82f6;

  --primary: var(--rp-cyan);
  --primary-light: #22d3ee;
  --primary-dark: #0891b2;
  --secondary: var(--rp-green);
  --accent: var(--rp-blue);

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
  color: var(--primary-light);
}

.hero h1 {
  margin: 0 0 0.35rem 0;
  font-size: 2rem;
  letter-spacing: -0.02em;
}

.hero__sub {
  margin: 0 0 1.1rem 0;
  max-width: 70ch;
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

/* Content grid */
.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
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

.panel-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  justify-content: flex-end;
}

.step-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(94, 234, 212, 0.14);
  color: var(--text-secondary);
  font-size: 0.78rem;
}

/* Multi request tabs */
.request-tabs-wrap {
  display: grid;
  gap: 0.65rem;
}

.request-tabs__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.6rem 1rem;
}

.request-tabs__title {
  display: flex;
  align-items: baseline;
  gap: 0.55rem;
  font-weight: 850;
  letter-spacing: -0.01em;
  color: var(--text-secondary);
}

.request-tabs__count {
  font-size: 0.85rem;
  font-weight: 700;
}

.request-tabs__hint {
  font-size: 0.85rem;
}

.request-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.request-tab {
  width: 44px;
  height: 40px;
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
  position: relative;
}

.request-tab:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.26);
  background: rgba(255, 255, 255, 0.06);
}

.request-tab:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.16);
}

.request-tab.is-active {
  border-color: rgba(94, 234, 212, 0.34);
  background: rgba(6, 182, 212, 0.12);
  color: var(--text-primary);
}

.request-tab__num {
  font-weight: 850;
  font-variant-numeric: tabular-nums;
}

.request-tab__state {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(148, 163, 184, 0.65);
}

.request-tab.is-partial .request-tab__state {
  background: rgba(251, 191, 36, 0.95);
}

.request-tab.is-complete .request-tab__state {
  background: rgba(34, 197, 94, 0.95);
}

.request-tabpanel {
  padding-top: 0.25rem;
}

/* Form */
.request-form {
  padding: 1rem 1.2rem 1.2rem;
  display: grid;
  gap: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem 1rem;
}

.field {
  min-width: 0;
}

.field--full {
  grid-column: 1 / -1;
}

.form-label {
  display: block;
  margin: 0 0 0.45rem;
  font-weight: 650;
  color: var(--text-secondary);
}

.form-control,
.form-select {
  width: 100%;
  /* background: rgba(255, 255, 255, 0.04); */
  border: 1px solid rgba(94, 234, 212, 0.14);
  border-radius: 16px;
  color: var(--text-primary);
  padding: 0.75rem 0.9rem;
}

.form-control::placeholder {
  color: rgba(148, 163, 184, 0.85);
}

.form-control:focus,
.form-select:focus {
  outline: none;
  border-color: rgba(94, 234, 212, 0.28);
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.16);
}

.help-text {
  margin-top: 0.45rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Alerts */
.alert-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(10, 22, 28, 0.62);
}

.alert-card--danger {
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.08);
}

.alert-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  border: 1px solid rgba(239, 68, 68, 0.28);
  background: rgba(239, 68, 68, 0.12);
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: rgba(254, 202, 202, 0.98);
}

.alert-body {
  min-width: 0;
  flex: 1;
}

.alert-title {
  font-weight: 850;
  letter-spacing: -0.01em;
}

.alert-text {
  font-size: 0.92rem;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.form-actions__left {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

/* Tips */
.tips-list {
  padding: 0.9rem 1.2rem 1.2rem;
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

/* Donation preview */
.methods-skeleton {
  padding: 1rem 1.2rem 1.2rem;
  display: grid;
  gap: 0.65rem;
}

.skeleton-block {
  height: 120px;
  border-radius: 18px;
}

.skeleton-line {
  height: 0.95rem;
  width: 100%;
  border-radius: 10px;
}

.skeleton-line--sm {
  height: 0.75rem;
  width: 70%;
}

.methods-body {
  padding: 1rem 1.2rem 1.2rem;
  display: grid;
  gap: 1rem;
}

.qr-card {
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.18);
  padding: 0.9rem;
  display: grid;
  gap: 0.65rem;
}

.qr-card__head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 800;
}

.qr-card__head i {
  color: var(--primary-light);
}

.qr-img {
  width: 100%;
  max-width: 260px;
  justify-self: center;
  aspect-ratio: 1/1;
  object-fit: contain;
  background: white;
  border-radius: 16px;
  padding: 0.5rem;
}

.qr-note {
  font-size: 0.85rem;
  text-align: center;
}

.methods-group {
  display: grid;
  gap: 0.55rem;
}

.methods-title {
  font-weight: 850;
  letter-spacing: -0.01em;
}

.methods-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.method-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(6, 182, 212, 0.08);
  color: rgba(165, 243, 252, 0.98);
  font-size: 0.78rem;
  max-width: 100%;
}

.method-chip i {
  color: var(--primary-light);
}

.method-chip__name {
  font-weight: 850;
}

.method-chip__number {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  opacity: 0.95;
}

.method-chip--bank {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
}

.method-chip.bca {
  border-color: rgba(59, 130, 246, 0.22);
}

.method-chip.bni {
  border-color: rgba(34, 197, 94, 0.22);
}

.method-chip.mandiri {
  border-color: rgba(6, 182, 212, 0.22);
}

.method-chip.bri {
  border-color: rgba(59, 130, 246, 0.22);
}

.method-chip.cimb {
  border-color: rgba(239, 68, 68, 0.22);
}

.method-chip.gopay {
  border-color: rgba(0, 174, 214, 0.25);
}

.method-chip.ovo {
  border-color: rgba(123, 80, 200, 0.25);
}

.method-chip.dana {
  border-color: rgba(17, 142, 234, 0.25);
}

.method-chip.shopee {
  border-color: rgba(249, 115, 22, 0.25);
}

.empty-mini {
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.18);
  padding: 1rem;
  text-align: center;
}

.empty-mini__icon {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.22);
  margin: 0 auto 0.75rem;
}

.empty-mini__icon i {
  font-size: 1.5rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.empty-mini__title {
  font-weight: 850;
  margin-bottom: 0.25rem;
}

.empty-mini__text {
  font-size: 0.9rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.82);
  z-index: 3600;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 720px;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(10, 22, 28, 0.82);
  box-shadow: 0 24px 90px rgba(0, 0, 0, 0.7);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.15rem 1.2rem 1rem;
  border-bottom: 1px solid rgba(94, 234, 212, 0.14);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0) 100%);
}

.modal-title {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  min-width: 0;
}

.modal-title__copy {
  min-width: 0;
}

.modal-title h3 {
  margin: 0;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.modal-title p {
  margin: 0.25rem 0 0;
}

.modal-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  border: 1px solid rgba(34, 197, 94, 0.24);
  background: rgba(34, 197, 94, 0.12);
  display: grid;
  place-items: center;
  color: rgba(187, 247, 208, 0.98);
  flex: 0 0 auto;
}

.btn-close-modal {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(94, 234, 212, 0.12);
  color: var(--text-secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
}

.btn-close-modal:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.22);
  background: rgba(255, 255, 255, 0.08);
}

.modal-body {
  padding: 1rem 1.2rem 1.1rem;
}

.success-banner {
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: linear-gradient(135deg,
      rgba(34, 197, 94, 0.12) 0%,
      rgba(6, 182, 212, 0.1) 55%,
      rgba(59, 130, 246, 0.12) 100%);
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
}

.success-banner__title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 900;
}

.success-banner__title i {
  color: var(--primary-light);
}

.success-banner__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.success-banner__sub {
  margin-top: 0.35rem;
  font-size: 0.9rem;
}

.success-banner__list {
  margin-top: 0.65rem;
}

.success-list {
  margin: 0;
  padding-left: 1.15rem;
  display: grid;
  gap: 0.35rem;
  color: var(--text-secondary);
}

.success-list li {
  line-height: 1.4;
}

.success-banner__warn {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  padding: 0.55rem 0.7rem;
  border-radius: 16px;
  border: 1px solid rgba(239, 68, 68, 0.24);
  background: rgba(239, 68, 68, 0.1);
  color: rgba(254, 202, 202, 0.98);
  font-size: 0.9rem;
}

.success-banner__warn i {
  margin-top: 0.1rem;
  color: rgba(252, 165, 165, 0.98);
}

.donation-prompt {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  padding: 0.85rem 1rem;
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.18);
  margin-bottom: 1rem;
}

.donation-prompt__icon {
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

.donation-prompt__copy h4 {
  margin: 0 0 0.25rem;
  font-weight: 900;
}

.donation-prompt__copy p {
  margin: 0;
  line-height: 1.5;
}

.donation-methods {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 1rem;
  align-items: start;
}

.modal-qr {
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.18);
  padding: 0.9rem;
  display: grid;
  gap: 0.65rem;
  justify-items: center;
}

.modal-qr__head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 900;
}

.modal-qr__head i {
  color: var(--primary-light);
}

.modal-qr__img {
  width: min(240px, 100%);
  aspect-ratio: 1/1;
  object-fit: contain;
  background: white;
  border-radius: 16px;
  padding: 0.55rem;
}

.modal-qr__hint {
  font-size: 0.85rem;
  text-align: center;
}

.modal-methods {
  display: grid;
  gap: 0.9rem;
}

.modal-methods__title {
  font-weight: 900;
  letter-spacing: -0.01em;
  margin-bottom: 0.45rem;
}

.modal-methods__list {
  display: grid;
  gap: 0.55rem;
}

.modal-method {
  border-radius: 18px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.7rem 0.85rem;
  display: grid;
  gap: 0.15rem;
}

.modal-method__name {
  font-weight: 900;
}

.modal-method__number {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.modal-footer {
  padding: 1rem 1.2rem;
  border-top: 1px solid rgba(94, 234, 212, 0.14);
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  background: rgba(0, 0, 0, 0.12);
}

/* Modal transitions */
.rp-modal-enter-active,
.rp-modal-leave-active {
  transition: opacity 180ms ease;
}

.rp-modal-enter-from,
.rp-modal-leave-to {
  opacity: 0;
}

.rp-modal-enter-active .modal-content,
.rp-modal-leave-active .modal-content {
  transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform, opacity;
}

.rp-modal-enter-from .modal-content,
.rp-modal-leave-to .modal-content {
  transform: translate3d(0, 10px, 0) scale(0.98);
  opacity: 0;
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

  .rp-modal-enter-active,
  .rp-modal-leave-active,
  .rp-modal-enter-active .modal-content,
  .rp-modal-leave-active .modal-content {
    transition: none !important;
  }

  .panel,
  .btn,
  .nav-item,
  .icon-btn {
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

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .donation-methods {
    grid-template-columns: 1fr;
  }

  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .modal-content {
    border-radius: 24px 24px 0 0;
    max-width: none;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 425px) {
  .page-content {
    padding: 1rem;
  }

  .panel-header {
    padding: 1rem;
  }

  .request-form,
  .tips-list,
  .methods-body,
  .methods-skeleton {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
