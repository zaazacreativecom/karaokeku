<template>
  <div class="admin-payment-methods">
    <header class="page-header reveal" style="--d: 0ms">
      <div class="page-header__copy">
        <div class="page-badge">
          <i class="bi bi-credit-card-2-front-fill" aria-hidden="true"></i>
          <span>Metode Pembayaran</span>
        </div>
        <h1>Kelola metode pembayaran dengan rapi</h1>
        <p class="text-muted">Atur QRIS, E-Wallet, dan transfer bank untuk donasi. Desain konsisten di desktop & mobile.</p>
        <div class="page-meta text-muted">
          <i class="bi bi-clock" aria-hidden="true"></i>
          <span>Terakhir update: {{ lastUpdatedLabel }}</span>
        </div>
      </div>

      <div class="page-header__actions">
        <button class="btn btn-ghost" type="button" @click="refreshAll" :disabled="loadingAny">
          <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
          {{ loadingAny ? 'Memuat…' : 'Refresh' }}
        </button>
        <button class="btn btn-primary" type="button" @click="openAddModal">
          <i class="bi bi-plus-lg" aria-hidden="true"></i>
          Tambah Metode
        </button>
      </div>
    </header>

    <div v-if="errorMessage && !loadingAny" class="alert-card alert-card--danger reveal" style="--d: 60ms" role="status">
      <div class="alert-icon" aria-hidden="true">
        <i class="bi bi-exclamation-triangle-fill"></i>
      </div>
      <div class="alert-body">
        <div class="alert-title">Gagal memuat metode pembayaran</div>
        <div class="alert-text text-muted">{{ errorMessage }}</div>
      </div>
      <button class="btn btn-ghost btn-sm" type="button" @click="refreshAll">
        <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
        Coba lagi
      </button>
    </div>

    <!-- Stats -->
    <section class="stats-grid reveal" style="--d: 90ms" aria-label="Ringkasan metode pembayaran">
      <template v-if="loadingMethods">
        <div v-for="n in 5" :key="n" class="stat-card stat-card--skeleton">
          <div class="stat-icon loading-skeleton" aria-hidden="true"></div>
          <div class="stat-body">
            <div class="skeleton-line loading-skeleton"></div>
            <div class="skeleton-line skeleton-line--lg loading-skeleton"></div>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-for="card in statCards" :key="card.key" class="stat-card" :class="card.tone">
          <div class="stat-icon" aria-hidden="true">
            <i :class="card.icon"></i>
          </div>
          <div class="stat-body">
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">{{ formatNumber(card.value) }}</div>
            <div v-if="card.hint" class="stat-hint text-muted">{{ card.hint }}</div>
          </div>
          <button v-if="card.typeFilter" class="stat-link" type="button" @click="filterType = card.typeFilter">
            <span>Filter</span>
            <i class="bi bi-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </template>
    </section>

    <!-- Filters -->
    <section class="panel filters-panel reveal" style="--d: 120ms" aria-label="Filter metode pembayaran">
      <div class="panel-header panel-header--compact">
        <div class="panel-title">
          <div class="panel-icon panel-icon--soft" aria-hidden="true">
            <i class="bi bi-funnel-fill"></i>
          </div>
          <div class="panel-title__copy">
            <h2>Filter</h2>
            <p class="text-muted">Cari cepat berdasarkan nama atau nomor akun.</p>
          </div>
        </div>
      </div>

      <div class="panel-body">
        <div class="filters-row">
          <div class="field field--grow">
            <label class="field-label" for="method-search">Cari</label>
            <div class="search-control">
              <i class="bi bi-search" aria-hidden="true"></i>
              <input
                id="method-search"
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Cari nama, nomor akun, atas nama…"
              />
              <button v-if="searchQuery" class="icon-clear" type="button" @click="searchQuery = ''" aria-label="Hapus pencarian">
                <i class="bi bi-x-circle-fill" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <div class="field field--switch">
            <label class="field-label">Nonaktif</label>
            <label class="switch" :class="{ on: hideInactive }">
              <input v-model="hideInactive" type="checkbox" />
              <span class="switch-track" aria-hidden="true"></span>
              <span class="switch-label">{{ hideInactive ? 'Sembunyikan' : 'Tampilkan' }}</span>
            </label>
          </div>
        </div>

        <div class="chips-row" aria-label="Shortcut kategori metode">
          <button class="chip" type="button" :class="{ on: filterType === 'all' }" @click="filterType = 'all'">
            <span>Semua</span>
            <span class="chip-count">{{ formatNumber(methods.length) }}</span>
          </button>
          <button class="chip" type="button" :class="{ on: filterType === 'qris' }" @click="filterType = 'qris'">
            <span>QRIS</span>
            <span class="chip-count">{{ formatNumber(countByType.qris) }}</span>
          </button>
          <button class="chip" type="button" :class="{ on: filterType === 'ewallet' }" @click="filterType = 'ewallet'">
            <span>E-Wallet</span>
            <span class="chip-count">{{ formatNumber(countByType.ewallet) }}</span>
          </button>
          <button class="chip" type="button" :class="{ on: filterType === 'bank' }" @click="filterType = 'bank'">
            <span>Bank</span>
            <span class="chip-count">{{ formatNumber(countByType.bank) }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- List -->
    <section class="panel methods-panel reveal" style="--d: 150ms" aria-label="Daftar metode pembayaran">
      <div class="panel-header">
        <div class="panel-title">
          <div class="panel-icon" aria-hidden="true">
            <i class="bi bi-wallet2"></i>
          </div>
          <div class="panel-title__copy">
            <h2>Daftar Metode</h2>
            <p class="text-muted">
              Menampilkan <strong>{{ formatNumber(filteredMethods.length) }}</strong> dari <strong>{{ formatNumber(methods.length) }}</strong> metode.
            </p>
          </div>
        </div>

        <div class="panel-actions">
          <button class="btn btn-ghost btn-sm" type="button" @click="openAddModal">
            <i class="bi bi-plus-lg" aria-hidden="true"></i>
            Tambah
          </button>
        </div>
      </div>

      <div class="panel-body">
        <div class="methods-grid" aria-label="Kartu metode pembayaran">
          <template v-if="loadingMethods">
            <div v-for="n in 8" :key="n" class="method-card method-card--skeleton">
              <div class="method-skeleton-top">
                <div class="loading-skeleton method-skeleton-icon"></div>
                <div class="method-skeleton-lines">
                  <div class="loading-skeleton skeleton-line"></div>
                  <div class="loading-skeleton skeleton-line skeleton-line--sm"></div>
                </div>
              </div>
              <div class="loading-skeleton skeleton-line"></div>
              <div class="loading-skeleton skeleton-line skeleton-line--sm"></div>
              <div class="method-skeleton-actions">
                <div class="loading-skeleton method-skeleton-btn"></div>
                <div class="loading-skeleton method-skeleton-btn"></div>
              </div>
            </div>
          </template>

          <template v-else>
            <div v-for="method in filteredMethods" :key="method.id" class="method-card" :class="{ inactive: !method.is_active }">
              <div class="method-top">
                <div class="method-media" :class="`method-media--${method.type}`">
                  <img
                    v-if="method.type === 'qris' && method.qr_code_url"
                    class="method-qr"
                    :src="getImageUrl(method.qr_code_url)"
                    :alt="`QR ${method.name}`"
                    loading="lazy"
                  />
                  <div v-else class="method-icon" aria-hidden="true">
                    <i :class="methodIcon(method)"></i>
                  </div>
                </div>

                <div class="method-copy">
                  <div class="method-title" :title="method.name">{{ method.name }}</div>
                  <div class="method-sub text-muted">
                    <span class="pill pill--soft" :class="typeTone(method.type)">
                      <i :class="typeIcon(method.type)" aria-hidden="true"></i>
                      {{ typeLabel(method.type) }}
                    </span>
                    <span class="dot">•</span>
                    <span class="pill" :class="method.is_active ? 'pill--active' : 'pill--inactive'">
                      <i :class="method.is_active ? 'bi bi-check-circle-fill' : 'bi bi-slash-circle'" aria-hidden="true"></i>
                      {{ method.is_active ? 'Aktif' : 'Nonaktif' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="method-details">
                <template v-if="method.type === 'qris'">
                  <div class="detail-row">
                    <div class="detail-label text-muted">QR Code</div>
                    <div class="detail-value">{{ method.qr_code_url ? 'Tersedia' : 'Belum diupload' }}</div>
                  </div>
                </template>

                <template v-else>
                  <div class="detail-row">
                    <div class="detail-label text-muted">Nomor</div>
                    <div class="detail-value mono">
                      <span>{{ method.account_number || '-' }}</span>
                      <button
                        class="btn btn-ghost btn-sm btn-icon"
                        type="button"
                        @click="copyText(method.account_number)"
                        :disabled="!method.account_number"
                        aria-label="Copy nomor"
                      >
                        <i class="bi bi-copy" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                  <div v-if="method.account_name" class="detail-row">
                    <div class="detail-label text-muted">Atas nama</div>
                    <div class="detail-value">{{ method.account_name }}</div>
                  </div>
                </template>
              </div>

              <div class="method-actions">
                <button class="btn btn-ghost btn-sm" type="button" @click="openEditModal(method)">
                  <i class="bi bi-pencil" aria-hidden="true"></i>
                  Edit
                </button>

                <button
                  v-if="method.type === 'qris'"
                  class="btn btn-ghost btn-sm"
                  type="button"
                  @click="uploadQR(method)"
                  :disabled="uploadingMethodId === method.id"
                >
                  <span v-if="uploadingMethodId === method.id" class="spinner" aria-hidden="true"></span>
                  <i v-else class="bi bi-upload" aria-hidden="true"></i>
                  QR
                </button>

                <button
                  class="btn btn-ghost btn-sm"
                  type="button"
                  @click="toggleActive(method)"
                  :disabled="togglingId === method.id"
                >
                  <span v-if="togglingId === method.id" class="spinner" aria-hidden="true"></span>
                  <i v-else class="bi" :class="method.is_active ? 'bi-eye-slash' : 'bi-eye'" aria-hidden="true"></i>
                  {{ method.is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                </button>

                <button class="btn btn-ghost btn-sm btn-danger" type="button" @click="openConfirmDelete(method)">
                  <i class="bi bi-trash" aria-hidden="true"></i>
                  Hapus
                </button>
              </div>

              <div class="method-footer text-muted">
                <span>Urutan: <strong>{{ formatNumber(method.sort_order || 0) }}</strong></span>
              </div>
            </div>

            <div v-if="!filteredMethods.length" class="empty-state">
              <div class="empty-icon" aria-hidden="true"><i class="bi bi-credit-card"></i></div>
              <h3>Tidak ada metode ditemukan</h3>
              <p class="text-muted">Coba ubah filter kategori atau kata kunci pencarian.</p>
              <button class="btn btn-ghost" type="button" @click="openAddModal">
                <i class="bi bi-plus-lg" aria-hidden="true"></i>
                Tambah Metode
              </button>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- Add/Edit Modal -->
    <transition name="ad-modal">
      <div v-if="showModal" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Form metode pembayaran" @click.self="closeModal">
        <form class="modal-content" @submit.prevent="saveMethod">
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon" aria-hidden="true">
                <i :class="editingMethod ? 'bi bi-pencil-square' : 'bi bi-plus-circle'"></i>
              </div>
              <div class="modal-title__copy">
                <h3>{{ editingMethod ? 'Edit Metode' : 'Tambah Metode' }}</h3>
                <p class="text-muted">Lengkapi data dan simpan perubahan.</p>
              </div>
            </div>
            <button class="icon-close" type="button" @click="closeModal" aria-label="Tutup form">
              <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-grid">
              <div class="field">
                <label class="field-label" for="pm-type">Tipe</label>
                <select id="pm-type" v-model="form.type" class="form-select" :disabled="saving">
                  <option value="qris">QRIS</option>
                  <option value="ewallet">E-Wallet</option>
                  <option value="bank">Bank</option>
                </select>
              </div>

              <div class="field field--grow">
                <label class="field-label" for="pm-name">Nama</label>
                <input id="pm-name" v-model="form.name" class="form-control" :disabled="saving" placeholder="Contoh: QRIS BCA / OVO / BRI" />
              </div>
            </div>

            <div v-if="form.type === 'qris'" class="qr-block">
              <div class="qr-block__head">
                <div>
                  <div class="field-label">QR Code</div>
                  <div class="text-muted small">Upload QR untuk metode QRIS (opsional).</div>
                </div>
                <div class="qr-head-actions">
                  <button class="btn btn-ghost btn-sm" type="button" @click="openQrPicker" :disabled="saving">
                    <i class="bi bi-upload" aria-hidden="true"></i>
                    Pilih
                  </button>
                  <button v-if="qrPreview" class="btn btn-ghost btn-sm" type="button" @click="clearQRSelection" :disabled="saving">
                    <i class="bi bi-x-circle" aria-hidden="true"></i>
                    Hapus
                  </button>
                </div>
              </div>

              <div class="qr-preview-card" :class="{ 'has-preview': qrPreview || editingMethod?.qr_code_url }">
                <img
                  v-if="qrPreview || editingMethod?.qr_code_url"
                  class="qr-preview-img"
                  :src="qrPreview || getImageUrl(editingMethod?.qr_code_url)"
                  :alt="editingMethod ? `QR ${editingMethod.name}` : 'QR Preview'"
                />
                <div v-else class="qr-placeholder" aria-hidden="true">
                  <i class="bi bi-qr-code"></i>
                  <span>Belum ada QR</span>
                </div>
              </div>

              <input ref="qrModalInput" type="file" class="sr-only" accept="image/*" @change="handleQRModalSelect" />
            </div>

            <div class="form-grid">
              <div class="field">
                <label class="field-label" for="pm-icon">Icon (Bootstrap Icons)</label>
                <input id="pm-icon" v-model="form.icon" class="form-control" :disabled="saving" placeholder="Contoh: bi bi-wallet2" />
              </div>

              <div v-if="form.type !== 'qris'" class="field field--grow">
                <label class="field-label" for="pm-number">Nomor {{ form.type === 'ewallet' ? 'E-Wallet' : 'Rekening' }}</label>
                <input id="pm-number" v-model="form.account_number" class="form-control" :disabled="saving" placeholder="Contoh: 0812xxxx / 1234567890" />
              </div>

              <div v-if="form.type === 'bank'" class="field field--grow">
                <label class="field-label" for="pm-owner">Atas Nama</label>
                <input id="pm-owner" v-model="form.account_name" class="form-control" :disabled="saving" placeholder="Contoh: PT KaraokeKu" />
              </div>
            </div>

            <div class="form-grid">
              <div class="field">
                <label class="field-label" for="pm-sort">Urutan</label>
                <input id="pm-sort" v-model.number="form.sort_order" type="number" class="form-control" :disabled="saving" />
              </div>

              <div class="field field--switch">
                <label class="field-label">Status</label>
                <label class="switch" :class="{ on: form.is_active }">
                  <input v-model="form.is_active" type="checkbox" :disabled="saving" />
                  <span class="switch-track" aria-hidden="true"></span>
                  <span class="switch-label">{{ form.is_active ? 'Aktif' : 'Nonaktif' }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-ghost" type="button" @click="closeModal" :disabled="saving">Batal</button>
            <button class="btn btn-primary" type="submit" :disabled="saving">
              <span v-if="saving" class="spinner" aria-hidden="true"></span>
              <i v-else class="bi bi-check-lg" aria-hidden="true"></i>
              {{ saving ? 'Menyimpan…' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </transition>

    <!-- Confirm Delete -->
    <transition name="ad-modal">
      <div
        v-if="confirmState.open"
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Konfirmasi hapus metode pembayaran"
        @click.self="closeConfirm"
      >
        <div class="modal-content modal-content--confirm">
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon" aria-hidden="true">
                <i class="bi bi-trash"></i>
              </div>
              <div class="modal-title__copy">
                <h3>Hapus metode ini?</h3>
                <p class="text-muted">Tindakan ini tidak bisa dibatalkan.</p>
              </div>
            </div>
            <button class="icon-close" type="button" @click="closeConfirm" aria-label="Tutup konfirmasi">
              <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="confirm-summary">
              <div class="confirm-item">
                <div class="confirm-label text-muted">Nama</div>
                <div class="confirm-value">{{ confirmState.method?.name || '-' }}</div>
              </div>
              <div class="confirm-item">
                <div class="confirm-label text-muted">Tipe</div>
                <div class="confirm-value">{{ typeLabel(confirmState.method?.type) }}</div>
              </div>
              <div class="confirm-item">
                <div class="confirm-label text-muted">Status</div>
                <div class="confirm-value">{{ confirmState.method?.is_active ? 'Aktif' : 'Nonaktif' }}</div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-ghost" type="button" @click="closeConfirm" :disabled="confirmLoading">Batal</button>
            <button class="btn btn-danger" type="button" @click="runConfirmDelete" :disabled="confirmLoading">
              <span v-if="confirmLoading" class="spinner" aria-hidden="true"></span>
              <i v-else class="bi bi-trash" aria-hidden="true"></i>
              {{ confirmLoading ? 'Menghapus…' : 'Hapus' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- QR Upload Input (hidden) -->
    <input ref="qrInput" type="file" class="sr-only" @change="handleQRUpload" accept="image/*" />

    <!-- Toast -->
    <transition name="ad-toast">
      <div v-if="showToast" class="toast" :class="`toast--${toastTone}`" role="status" aria-live="polite">
        <i
          :class="
            toastTone === 'success'
              ? 'bi bi-check-circle-fill'
              : toastTone === 'danger'
                ? 'bi bi-x-circle-fill'
                : 'bi bi-info-circle-fill'
          "
          aria-hidden="true"
        ></i>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import api from '@/services/api'

const methods = ref([])
const loadingMethods = ref(true)
const methodsError = ref('')
const lastUpdatedAt = ref(Date.now())

const filterType = ref('all')
const searchQuery = ref('')
const hideInactive = ref(false)

const showModal = ref(false)
const saving = ref(false)
const editingMethod = ref(null)

const qrInput = ref(null)
const uploadingMethodId = ref(null)

const qrModalInput = ref(null)
const qrFileInModal = ref(null)
const qrPreview = ref(null)
let qrPreviewObjectUrl = null

const togglingId = ref(null)
const confirmLoading = ref(false)
const confirmState = ref({ open: false, method: null })

const showToast = ref(false)
const toastMessage = ref('')
const toastTone = ref('success')
let toastTimeout = null

const blankForm = () => ({
  type: 'qris',
  name: '',
  icon: '',
  account_number: '',
  account_name: '',
  sort_order: 0,
  is_active: true
})

const form = ref(blankForm())

const errorMessage = computed(() => methodsError.value || '')
const loadingAny = computed(() => loadingMethods.value || saving.value)

const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(Number(value) || 0)

const lastUpdatedLabel = computed(() => {
  const date = new Date(lastUpdatedAt.value || Date.now())
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date)
})

const getImageUrl = (url) => {
  if (!url) return ''
  const cleaned = String(url).replace(/^http(s)?:\/\/localhost(:\d+)?/, '')
  if (cleaned.startsWith('http')) return cleaned
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`
}

const typeLabel = (type) => {
  if (type === 'qris') return 'QRIS'
  if (type === 'ewallet') return 'E-Wallet'
  if (type === 'bank') return 'Bank'
  return 'Lainnya'
}

const typeIcon = (type) => {
  if (type === 'qris') return 'bi bi-qr-code'
  if (type === 'ewallet') return 'bi bi-wallet2'
  if (type === 'bank') return 'bi bi-bank'
  return 'bi bi-credit-card'
}

const typeTone = (type) => {
  if (type === 'qris') return 'pill--cyan'
  if (type === 'ewallet') return 'pill--blue'
  if (type === 'bank') return 'pill--green'
  return 'pill--soft'
}

const methodIcon = (method) => {
  if (method?.icon) return method.icon
  return typeIcon(method?.type)
}

const countByType = computed(() => {
  const base = { qris: 0, ewallet: 0, bank: 0 }
  for (const method of methods.value) {
    if (method?.type === 'qris') base.qris += 1
    if (method?.type === 'ewallet') base.ewallet += 1
    if (method?.type === 'bank') base.bank += 1
  }
  return base
})

const activeCount = computed(() => methods.value.filter((m) => m?.is_active).length)

const filteredMethods = computed(() => {
  const keyword = String(searchQuery.value || '').trim().toLowerCase()
  return methods.value
    .filter((method) => {
      if (filterType.value !== 'all' && method?.type !== filterType.value) return false
      if (hideInactive.value && !method?.is_active) return false
      if (!keyword) return true
      const haystack = [method?.name, method?.account_number, method?.account_name]
        .map((v) => String(v || '').toLowerCase())
        .join(' ')
      return haystack.includes(keyword)
    })
    .slice()
    .sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0))
})

const statCards = computed(() => [
  { key: 'total', label: 'Total Metode', value: methods.value.length, icon: 'bi bi-wallet2', tone: 'tone-cyan' },
  { key: 'active', label: 'Aktif', value: activeCount.value, icon: 'bi bi-check2-circle', tone: 'tone-green' },
  { key: 'qris', label: 'QRIS', value: countByType.value.qris, icon: 'bi bi-qr-code', tone: 'tone-cyan', typeFilter: 'qris' },
  { key: 'ewallet', label: 'E-Wallet', value: countByType.value.ewallet, icon: 'bi bi-phone', tone: 'tone-blue', typeFilter: 'ewallet' },
  { key: 'bank', label: 'Bank', value: countByType.value.bank, icon: 'bi bi-bank', tone: 'tone-blue', typeFilter: 'bank' }
])

const triggerToast = (message, tone = 'success') => {
  toastMessage.value = message
  toastTone.value = tone
  showToast.value = true
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    showToast.value = false
  }, 2500)
}

const fetchMethods = async () => {
  loadingMethods.value = true
  methodsError.value = ''
  try {
    const response = await api.get('/payment-methods/admin')
    methods.value = response.data.data || []
    lastUpdatedAt.value = Date.now()
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    methodsError.value = error.response?.data?.message || 'Gagal memuat metode pembayaran'
    methods.value = []
  } finally {
    loadingMethods.value = false
  }
}

const refreshAll = async () => {
  await fetchMethods()
}

const openAddModal = () => {
  editingMethod.value = null
  form.value = blankForm()
  clearQRSelection()
  showModal.value = true
}

const openEditModal = (method) => {
  editingMethod.value = method
  form.value = {
    ...blankForm(),
    type: method?.type || 'qris',
    name: method?.name || '',
    icon: method?.icon || '',
    account_number: method?.account_number || '',
    account_name: method?.account_name || '',
    sort_order: Number(method?.sort_order || 0),
    is_active: Boolean(method?.is_active)
  }
  clearQRSelection()
  showModal.value = true
}

const closeModal = () => {
  if (saving.value) return
  showModal.value = false
}

const openQrPicker = () => {
  qrModalInput.value?.click()
}

const handleQRModalSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  qrFileInModal.value = file
  if (qrPreviewObjectUrl) URL.revokeObjectURL(qrPreviewObjectUrl)
  qrPreviewObjectUrl = URL.createObjectURL(file)
  qrPreview.value = qrPreviewObjectUrl
}

const clearQRSelection = () => {
  qrFileInModal.value = null
  if (qrPreviewObjectUrl) URL.revokeObjectURL(qrPreviewObjectUrl)
  qrPreviewObjectUrl = null
  qrPreview.value = null
  if (qrModalInput.value) qrModalInput.value.value = ''
}

const validateForm = () => {
  const name = String(form.value.name || '').trim()
  if (!name) {
    triggerToast('Nama metode wajib diisi', 'danger')
    return false
  }
  if (form.value.type !== 'qris') {
    const account = String(form.value.account_number || '').trim()
    if (!account) {
      triggerToast('Nomor akun wajib diisi', 'danger')
      return false
    }
  }
  if (form.value.type === 'bank') {
    const owner = String(form.value.account_name || '').trim()
    if (!owner) {
      triggerToast('Atas nama wajib diisi untuk bank', 'danger')
      return false
    }
  }
  return true
}

const saveMethod = async () => {
  if (!validateForm()) return
  saving.value = true
  try {
    let methodId
    if (editingMethod.value?.id) {
      await api.put(`/payment-methods/${editingMethod.value.id}`, form.value)
      methodId = editingMethod.value.id
    } else {
      const res = await api.post('/payment-methods', form.value)
      methodId = res.data.data?.id
    }

    if (form.value.type === 'qris' && qrFileInModal.value && methodId) {
      const formData = new FormData()
      formData.append('qr_code', qrFileInModal.value)
      await api.post(`/payment-methods/${methodId}/qr`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }

    triggerToast(editingMethod.value ? 'Metode berhasil diupdate' : 'Metode berhasil ditambahkan', 'success')
    showModal.value = false
    clearQRSelection()
    await fetchMethods()
  } catch (error) {
    console.error('Error saving payment method:', error)
    triggerToast(error.response?.data?.message || 'Gagal menyimpan metode', 'danger')
  } finally {
    saving.value = false
  }
}

const toggleActive = async (method) => {
  if (!method?.id) return
  togglingId.value = method.id
  try {
    await api.put(`/payment-methods/${method.id}/toggle`)
    triggerToast(`Metode ${method.is_active ? 'dinonaktifkan' : 'diaktifkan'}`, 'success')
    await fetchMethods()
  } catch (error) {
    console.error('Error toggling payment method:', error)
    triggerToast(error.response?.data?.message || 'Gagal mengubah status', 'danger')
  } finally {
    togglingId.value = null
  }
}

const openConfirmDelete = (method) => {
  confirmState.value = { open: true, method }
}

const closeConfirm = () => {
  if (confirmLoading.value) return
  confirmState.value.open = false
}

const runConfirmDelete = async () => {
  if (!confirmState.value.open || confirmLoading.value) return
  const method = confirmState.value.method
  if (!method?.id) return
  confirmLoading.value = true
  try {
    await api.delete(`/payment-methods/${method.id}`)
    triggerToast('Metode berhasil dihapus', 'success')
    await fetchMethods()
  } catch (error) {
    console.error('Error deleting payment method:', error)
    triggerToast(error.response?.data?.message || 'Gagal menghapus metode', 'danger')
  } finally {
    confirmLoading.value = false
    confirmState.value.open = false
  }
}

const uploadQR = (method) => {
  if (!method?.id) return
  uploadingMethodId.value = method.id
  qrInput.value?.click()
}

const handleQRUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file || !uploadingMethodId.value) return

  const formData = new FormData()
  formData.append('qr_code', file)

  try {
    await api.post(`/payment-methods/${uploadingMethodId.value}/qr`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    triggerToast('QR Code berhasil diupload', 'success')
    await fetchMethods()
  } catch (error) {
    console.error('Error uploading QR:', error)
    triggerToast(error.response?.data?.message || 'Gagal upload QR Code', 'danger')
  } finally {
    uploadingMethodId.value = null
    event.target.value = ''
  }
}

const copyText = async (text) => {
  const value = String(text || '').trim()
  if (!value) return
  try {
    await navigator.clipboard.writeText(value)
    triggerToast('Tersalin ke clipboard', 'success')
  } catch (error) {
    console.error('Clipboard error:', error)
    triggerToast('Gagal menyalin', 'danger')
  }
}

onMounted(fetchMethods)

onBeforeUnmount(() => {
  if (toastTimeout) clearTimeout(toastTimeout)
  clearQRSelection()
})
</script>

<style scoped>
.admin-payment-methods {
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1.25rem 1.25rem 1.15rem;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: linear-gradient(180deg, rgba(10, 22, 28, 0.72) 0%, rgba(4, 12, 16, 0.68) 100%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 18px 80px rgba(0, 0, 0, 0.45);
  position: relative;
  overflow: hidden;
  margin-bottom: 1.25rem;
}

.page-header::before {
  content: '';
  position: absolute;
  inset: -1px;
  background:
    radial-gradient(540px 240px at 18% 10%, rgba(34, 197, 94, 0.16) 0%, transparent 62%),
    radial-gradient(540px 240px at 85% 42%, rgba(6, 182, 212, 0.14) 0%, transparent 62%),
    radial-gradient(560px 260px at 60% 120%, rgba(59, 130, 246, 0.12) 0%, transparent 64%);
  pointer-events: none;
}

.page-header__copy,
.page-header__actions {
  position: relative;
  z-index: 1;
}

.page-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.22);
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.85rem;
  margin-bottom: 0.85rem;
}

.page-badge i {
  color: var(--primary-light);
}

.page-header h1 {
  margin: 0 0 0.35rem;
  font-weight: 750;
  letter-spacing: -0.02em;
}

.page-header p {
  margin: 0;
  max-width: 52rem;
}

.page-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.85rem;
  font-size: 0.92rem;
  opacity: 0.9;
}

.page-header__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
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
  margin-bottom: 1.15rem;
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
  font-size: 0.95rem;
}

/* Stats */
.stats-grid {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin-bottom: 1.2rem;
}

.stat-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  padding: 1rem 1rem 0.95rem;
  border: 1px solid rgba(94, 234, 212, 0.12);
  background: rgba(10, 22, 28, 0.6);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.9rem;
  min-height: 92px;
}

.stat-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  background: radial-gradient(500px 220px at 25% -10%, rgba(6, 182, 212, 0.22) 0%, transparent 60%);
  pointer-events: none;
}

.stat-card.tone-cyan::before {
  background: radial-gradient(500px 220px at 25% -10%, rgba(6, 182, 212, 0.26) 0%, transparent 62%);
}

.stat-card.tone-green::before {
  background: radial-gradient(500px 220px at 25% -10%, rgba(34, 197, 94, 0.24) 0%, transparent 62%);
}

.stat-card.tone-blue::before {
  background: radial-gradient(500px 220px at 25% -10%, rgba(59, 130, 246, 0.22) 0%, transparent 62%);
}

.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(94, 234, 212, 0.12);
  position: relative;
  z-index: 1;
}

.tone-green .stat-icon {
  border-color: rgba(34, 197, 94, 0.22);
}

.tone-blue .stat-icon {
  border-color: rgba(59, 130, 246, 0.22);
}

.stat-icon i {
  font-size: 1.25rem;
  color: var(--primary-light);
}

.tone-green .stat-icon i {
  color: rgba(34, 197, 94, 0.95);
}

.tone-blue .stat-icon i {
  color: rgba(59, 130, 246, 0.95);
}

.stat-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.2rem;
}

.stat-label {
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  opacity: 0.85;
}

.stat-value {
  font-size: 1.55rem;
  font-weight: 750;
  letter-spacing: -0.02em;
}

.stat-link {
  position: absolute;
  inset: auto 0.85rem 0.8rem auto;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.stat-link:hover {
  background: rgba(255, 255, 255, 0.08);
}

.stat-card--skeleton {
  grid-template-columns: auto 1fr;
}

/* Panels */
.panel {
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(10, 22, 28, 0.62);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 18px 70px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  margin-bottom: 1.2rem;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-bottom: 1px solid rgba(94, 234, 212, 0.12);
}

.panel-header--compact {
  border-bottom: 0;
  padding-bottom: 0.65rem;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.panel-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(94, 234, 212, 0.16);
}

.panel-icon--soft {
  background: rgba(6, 182, 212, 0.08);
  border-color: rgba(6, 182, 212, 0.18);
}

.panel-icon i {
  color: var(--primary-light);
}

.panel-title__copy h2 {
  margin: 0;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
}

.panel-title__copy p {
  margin: 0.15rem 0 0;
  font-size: 0.95rem;
}

.panel-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.panel-body {
  padding: 1rem 1.1rem 1.15rem;
}

/* Filters */
.filters-row {
  display: flex;
  gap: 0.9rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 220px;
}

.field--grow {
  flex: 1 1 320px;
  min-width: 260px;
}

.field--switch {
  min-width: 170px;
}

.field-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.search-control {
  position: relative;
}

.search-control i.bi-search {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-control input {
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}

.icon-clear {
  position: absolute;
  right: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: var(--text-muted);
}

.icon-clear:hover {
  color: var(--primary-light);
}

.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 0.9rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  padding: 0.45rem 0.85rem;
  font-size: 0.9rem;
}

.chip:hover {
  background: rgba(255, 255, 255, 0.07);
}

.chip.on {
  border-color: rgba(6, 182, 212, 0.42);
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.14);
}

.chip-count {
  font-weight: 650;
  padding: 0.12rem 0.55rem;
  border-radius: 999px;
  background: rgba(6, 182, 212, 0.12);
  border: 1px solid rgba(6, 182, 212, 0.18);
  color: var(--primary-light);
}

/* Switch */
.switch {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.7rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  user-select: none;
}

.switch input {
  display: none;
}

.switch-track {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.22);
  position: relative;
  transition: all 180ms ease;
}

.switch-track::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 3px;
  width: 18px;
  height: 18px;
  transform: translateY(-50%);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 180ms ease;
}

.switch.on .switch-track {
  background: rgba(6, 182, 212, 0.38);
}

.switch.on .switch-track::after {
  left: 23px;
  background: rgba(255, 255, 255, 0.95);
}

.switch-label {
  font-size: 0.9rem;
  color: var(--text-primary);
  opacity: 0.92;
}

/* Methods grid */
.methods-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.method-card {
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(6, 19, 25, 0.5);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  position: relative;
  overflow: hidden;
}

.method-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  background: radial-gradient(560px 240px at 20% 0%, rgba(6, 182, 212, 0.14) 0%, transparent 60%);
  pointer-events: none;
}

.method-card.inactive {
  opacity: 0.82;
}

.method-top {
  display: flex;
  gap: 0.9rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.method-media {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.04);
  display: grid;
  place-items: center;
  overflow: hidden;
}

.method-media--qris {
  background: rgba(6, 182, 212, 0.08);
  border-color: rgba(6, 182, 212, 0.18);
}

.method-media--bank {
  background: rgba(34, 197, 94, 0.06);
  border-color: rgba(34, 197, 94, 0.18);
}

.method-media--ewallet {
  background: rgba(59, 130, 246, 0.06);
  border-color: rgba(59, 130, 246, 0.18);
}

.method-qr {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.method-icon i {
  font-size: 1.7rem;
  color: var(--primary-light);
}

.method-copy {
  flex: 1;
  min-width: 0;
}

.method-title {
  font-weight: 750;
  letter-spacing: -0.02em;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.method-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.9rem;
}

.dot {
  opacity: 0.4;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  font-size: 0.85rem;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(255, 255, 255, 0.04);
}

.pill--soft {
  background: rgba(255, 255, 255, 0.03);
}

.pill--cyan {
  border-color: rgba(6, 182, 212, 0.22);
}

.pill--blue {
  border-color: rgba(59, 130, 246, 0.22);
}

.pill--green {
  border-color: rgba(34, 197, 94, 0.22);
}

.pill--active {
  border-color: rgba(34, 197, 94, 0.28);
  background: rgba(34, 197, 94, 0.08);
}

.pill--inactive {
  border-color: rgba(248, 113, 113, 0.26);
  background: rgba(248, 113, 113, 0.07);
}

.method-details {
  position: relative;
  z-index: 1;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(94, 234, 212, 0.12);
  background: rgba(255, 255, 255, 0.03);
  padding: 0.85rem 0.9rem;
  display: grid;
  gap: 0.6rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 0.75rem;
  align-items: center;
}

.detail-label {
  font-size: 0.88rem;
}

.detail-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  min-width: 0;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}

.detail-value span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-icon {
  padding: 0.45rem 0.6rem;
}

.method-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  position: relative;
  z-index: 1;
}

.btn-danger {
  border: 1px solid rgba(248, 113, 113, 0.25);
  background: rgba(248, 113, 113, 0.08);
}

.btn-danger:hover {
  background: rgba(248, 113, 113, 0.14);
}

.method-footer {
  font-size: 0.85rem;
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
}

/* Empty */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2.2rem 1rem;
  border-radius: var(--radius-xl);
  border: 1px dashed rgba(94, 234, 212, 0.25);
  background: rgba(255, 255, 255, 0.03);
}

.empty-icon {
  width: 66px;
  height: 66px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.18);
  margin: 0 auto 0.9rem;
}

.empty-icon i {
  font-size: 1.6rem;
  color: var(--primary-light);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.82);
  z-index: 2200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.1rem;
}

.modal-content {
  width: 100%;
  max-width: 720px;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(10, 22, 28, 0.86);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 22px 80px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}

.modal-content--confirm {
  max-width: 520px;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-bottom: 1px solid rgba(94, 234, 212, 0.12);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.modal-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.18);
}

.modal-icon i {
  color: var(--primary-light);
}

.modal-title__copy h3 {
  margin: 0;
  font-size: 1.1rem;
}

.modal-title__copy p {
  margin: 0.2rem 0 0;
  font-size: 0.92rem;
}

.icon-close {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  padding: 0.4rem;
  border-radius: 12px;
}

.icon-close:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.05rem 1.1rem 1.15rem;
}

.modal-footer {
  padding: 1rem 1.1rem;
  border-top: 1px solid rgba(94, 234, 212, 0.12);
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.form-grid {
  display: flex;
  gap: 0.9rem;
  flex-wrap: wrap;
  margin-bottom: 0.9rem;
}

.qr-block {
  margin: 0.25rem 0 0.9rem;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(255, 255, 255, 0.03);
  padding: 0.9rem;
}

.qr-block__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.qr-head-actions {
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.small {
  font-size: 0.88rem;
}

.qr-preview-card {
  border-radius: var(--radius-xl);
  border: 1px dashed rgba(94, 234, 212, 0.22);
  background: rgba(4, 12, 16, 0.55);
  min-height: 180px;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.qr-preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1rem;
}

.qr-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  color: var(--text-muted);
}

.qr-placeholder i {
  font-size: 2rem;
  color: var(--primary-light);
}

.confirm-summary {
  display: grid;
  gap: 0.75rem;
}

.confirm-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0.9rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(94, 234, 212, 0.12);
  background: rgba(255, 255, 255, 0.03);
}

.confirm-label {
  font-size: 0.9rem;
}

.confirm-value {
  font-weight: 650;
  text-align: right;
  max-width: 60%;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2300;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(10, 22, 28, 0.92);
  box-shadow: 0 18px 70px rgba(0, 0, 0, 0.55);
}

.toast--success {
  border-color: rgba(34, 197, 94, 0.28);
}

.toast--danger {
  border-color: rgba(248, 113, 113, 0.28);
}

.toast--info {
  border-color: rgba(6, 182, 212, 0.28);
}

.toast i {
  font-size: 1.1rem;
}

/* Transitions */
.ad-modal-enter-active,
.ad-modal-leave-active {
  transition: opacity 180ms ease;
}

.ad-modal-enter-from,
.ad-modal-leave-to {
  opacity: 0;
}

.ad-modal-enter-active .modal-content,
.ad-modal-leave-active .modal-content {
  transition: transform 220ms ease, opacity 220ms ease;
}

.ad-modal-enter-from .modal-content,
.ad-modal-leave-to .modal-content {
  transform: translateY(10px) scale(0.98);
  opacity: 0;
}

.ad-toast-enter-active,
.ad-toast-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.ad-toast-enter-from,
.ad-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

/* Reveal */
.reveal {
  animation: fadeUp 520ms ease both;
  animation-delay: var(--d, 0ms);
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Skeleton */
.loading-skeleton {
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.12), rgba(148, 163, 184, 0.22), rgba(148, 163, 184, 0.12));
  background-size: 200% 100%;
  animation: shimmer 1.2s ease-in-out infinite;
  border-radius: 999px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-line {
  height: 12px;
  width: 100%;
  border-radius: 8px;
}

.skeleton-line--lg {
  height: 18px;
  width: 70%;
}

.skeleton-line--sm {
  width: 55%;
}

.method-card--skeleton {
  gap: 0.85rem;
}

.method-skeleton-top {
  display: flex;
  gap: 0.85rem;
  align-items: center;
}

.method-skeleton-icon {
  width: 64px;
  height: 64px;
  border-radius: 22px;
}

.method-skeleton-lines {
  flex: 1;
  display: grid;
  gap: 0.45rem;
}

.method-skeleton-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
}

.method-skeleton-btn {
  height: 38px;
  border-radius: 14px;
}

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: rgba(255, 255, 255, 0.95);
  display: inline-block;
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Responsive */
@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .methods-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header__actions {
    width: 100%;
    justify-content: flex-start;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .methods-grid {
    grid-template-columns: 1fr;
  }

  .detail-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .method-actions {
    grid-template-columns: 1fr;
  }
}
</style>
