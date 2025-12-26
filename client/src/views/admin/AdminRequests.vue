<template>
  <div class="admin-requests">
    <header class="page-header reveal" style="--d: 0ms">
      <div class="page-header__copy">
        <div class="page-badge">
          <i class="bi bi-plus-circle-fill" aria-hidden="true"></i>
          <span>Request Lagu</span>
        </div>
        <h1>Kelola Request Lagu</h1>
        <p class="text-muted">
          Review request dari user, cek link referensi, dan simpan catatan admin sebelum approve / reject.
        </p>
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
        <router-link to="/admin/songs" class="btn btn-primary">
          <i class="bi bi-music-note-list" aria-hidden="true"></i>
          Manajemen Lagu
        </router-link>
      </div>
    </header>

    <div v-if="errorMessage && !loadingAny" class="alert-card alert-card--danger reveal" style="--d: 60ms" role="status">
      <div class="alert-icon" aria-hidden="true">
        <i class="bi bi-exclamation-triangle-fill"></i>
      </div>
      <div class="alert-body">
        <div class="alert-title">Gagal memuat request</div>
        <div class="alert-text text-muted">{{ errorMessage }}</div>
      </div>
      <button class="btn btn-ghost btn-sm" type="button" @click="refreshAll">
        <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
        Coba lagi
      </button>
    </div>

    <!-- Stats -->
    <section class="stats-grid reveal" style="--d: 90ms" aria-label="Ringkasan request lagu">
      <template v-if="loadingStats">
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
          <button v-if="card.statusFilter !== undefined" class="stat-link" type="button" @click="applyStatusFilter(card.statusFilter)">
            <span>{{ card.linkLabel }}</span>
            <i class="bi bi-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </template>
    </section>

    <!-- Filters -->
    <section class="panel filters-panel reveal" style="--d: 120ms" aria-label="Filter request lagu">
      <div class="panel-header panel-header--compact">
        <div class="panel-title">
          <div class="panel-icon panel-icon--soft" aria-hidden="true">
            <i class="bi bi-funnel-fill"></i>
          </div>
          <div class="panel-title__copy">
            <h2>Filter</h2>
            <p class="text-muted">Cari cepat berdasarkan user, judul, artis, atau status.</p>
          </div>
        </div>
      </div>

      <div class="panel-body">
        <div class="filters-row">
          <div class="field">
            <label class="field-label" for="request-status">Status</label>
            <select id="request-status" v-model="filterStatus" class="form-select" :disabled="loadingRequests">
              <option value="">Semua</option>
              <option value="pending">Pending</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
              <option value="completed">Selesai</option>
            </select>
          </div>

          <div class="field field--grow">
            <label class="field-label" for="request-search">Cari</label>
            <div class="search-control">
              <i class="bi bi-search" aria-hidden="true"></i>
              <input
                id="request-search"
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Cari judul, artis, genre, user, email…"
              />
              <button v-if="searchQuery" class="icon-clear" type="button" @click="searchQuery = ''" aria-label="Hapus pencarian">
                <i class="bi bi-x-circle-fill" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="request-limit">Per halaman</label>
            <select id="request-limit" v-model.number="limit" class="form-select" :disabled="loadingRequests">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>

        <div class="chips-row" aria-label="Shortcut filter">
          <button class="chip" type="button" :class="{ on: filterStatus === '' }" @click="applyStatusFilter('')">
            <span>Semua</span>
            <span class="chip-count">{{ formatNumber(stats.total || 0) }}</span>
          </button>
          <button class="chip" type="button" :class="{ on: filterStatus === 'pending' }" @click="applyStatusFilter('pending')">
            <span>Pending</span>
            <span class="chip-count">{{ formatNumber(stats.pending || 0) }}</span>
          </button>
          <button class="chip" type="button" :class="{ on: filterStatus === 'approved' }" @click="applyStatusFilter('approved')">
            <span>Disetujui</span>
            <span class="chip-count">{{ formatNumber(stats.approved || 0) }}</span>
          </button>
          <button class="chip" type="button" :class="{ on: filterStatus === 'rejected' }" @click="applyStatusFilter('rejected')">
            <span>Ditolak</span>
            <span class="chip-count">{{ formatNumber(stats.rejected || 0) }}</span>
          </button>
          <button class="chip" type="button" :class="{ on: filterStatus === 'completed' }" @click="applyStatusFilter('completed')">
            <span>Selesai</span>
            <span class="chip-count">{{ formatNumber(completedCount) }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- List -->
    <section class="panel requests-panel reveal" style="--d: 150ms" aria-label="Daftar request lagu">
      <div class="panel-header">
        <div class="panel-title">
          <div class="panel-icon" aria-hidden="true">
            <i class="bi bi-inbox"></i>
          </div>
          <div class="panel-title__copy">
            <h2>Daftar Request</h2>
            <p class="text-muted">
              Menampilkan <strong>{{ formatNumber(displayedRequests.length) }}</strong> dari <strong>{{ formatNumber(meta.total) }}</strong> data.
            </p>
          </div>
        </div>

        <div class="panel-actions">
          <button class="btn btn-ghost btn-sm" type="button" @click="refreshAll" :disabled="loadingAny">
            <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
            Refresh
          </button>
        </div>
      </div>

      <div class="panel-body">
        <!-- Desktop table -->
        <div class="table-wrap" aria-label="Tabel request lagu">
          <table class="requests-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>User</th>
                <th>Judul</th>
                <th>Artis</th>
                <th>Genre</th>
                <th>Status</th>
                <th class="th-actions">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="loadingRequests">
                <tr v-for="n in 6" :key="n" class="tr-skeleton">
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                </tr>
              </template>

              <template v-else>
                <tr v-for="req in displayedRequests" :key="req.id">
                  <td class="td-date">{{ formatDate(req.created_at) }}</td>
                  <td>
                    <div class="user-name" :title="requesterName(req)">{{ requesterName(req) }}</div>
                    <div class="user-email text-muted" :title="requesterEmail(req)">{{ requesterEmail(req) }}</div>
                  </td>
                  <td>
                    <div class="song-title" :title="req.title">{{ req.title }}</div>
                    <div class="song-sub text-muted">
                      <span :title="req.language || '-'">{{ req.language || '-' }}</span>
                      <span v-if="req.link" class="song-link">
                        <a :href="req.link" target="_blank" rel="noreferrer" class="link-chip" aria-label="Buka link referensi">
                          <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>
                          Link
                        </a>
                      </span>
                    </div>
                  </td>
                  <td class="td-artist" :title="req.artist">{{ req.artist }}</td>
                  <td class="td-genre" :title="req.genre || '-'">{{ req.genre || '-' }}</td>
                  <td>
                    <span class="pill" :class="statusTone(req.status)">
                      <i :class="statusIcon(req.status)" aria-hidden="true"></i>
                      {{ statusLabel(req.status) }}
                    </span>
                  </td>
                  <td class="td-actions">
                    <div class="row-actions">
                      <button class="btn btn-ghost btn-sm btn-icon" type="button" @click="openDetail(req)" aria-label="Detail">
                        <i class="bi bi-eye" aria-hidden="true"></i>
                      </button>

                      <button
                        v-if="req.status === 'pending'"
                        class="btn btn-success btn-sm btn-icon"
                        type="button"
                        @click="openConfirmStatus(req, 'approved', false)"
                        aria-label="Setujui"
                      >
                        <i class="bi bi-check-lg" aria-hidden="true"></i>
                      </button>
                      <button
                        v-if="req.status === 'pending'"
                        class="btn btn-danger btn-sm btn-icon"
                        type="button"
                        @click="openConfirmStatus(req, 'rejected', false)"
                        aria-label="Tolak"
                      >
                        <i class="bi bi-x-lg" aria-hidden="true"></i>
                      </button>

                      <button class="btn btn-ghost btn-sm btn-icon btn-icon--danger" type="button" @click="openConfirmDelete(req)" aria-label="Hapus">
                        <i class="bi bi-trash" aria-hidden="true"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="!displayedRequests.length" class="tr-empty">
                  <td colspan="7">
                    <div class="empty-state">
                      <div class="empty-icon" aria-hidden="true"><i class="bi bi-inbox"></i></div>
                      <h3>Tidak ada request</h3>
                      <p class="text-muted">Coba ubah filter status atau kata kunci pencarian.</p>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <div class="request-cards" aria-label="Daftar request lagu (mobile)">
          <template v-if="loadingRequests">
            <div v-for="n in 6" :key="n" class="request-card request-card--skeleton">
              <div class="skeleton-line loading-skeleton"></div>
              <div class="skeleton-line skeleton-line--sm loading-skeleton"></div>
              <div class="skeleton-chip-row">
                <div class="skeleton-chip loading-skeleton"></div>
                <div class="skeleton-chip loading-skeleton"></div>
                <div class="skeleton-chip loading-skeleton"></div>
              </div>
              <div class="skeleton-btn-row">
                <div class="skeleton-btn loading-skeleton"></div>
                <div class="skeleton-btn loading-skeleton"></div>
              </div>
            </div>
          </template>

          <template v-else>
            <div v-for="req in displayedRequests" :key="req.id" class="request-card">
              <div class="request-card__top">
                <div class="request-card__song">
                  <div class="song-title" :title="req.title">{{ req.title }}</div>
                  <div class="song-sub text-muted" :title="req.artist">{{ req.artist }}</div>
                </div>
                <span class="pill" :class="statusTone(req.status)">
                  <i :class="statusIcon(req.status)" aria-hidden="true"></i>
                  {{ statusLabel(req.status) }}
                </span>
              </div>

              <div class="request-card__meta">
                <span class="pill pill--soft">
                  <i class="bi bi-person" aria-hidden="true"></i>
                  {{ requesterName(req) }}
                </span>
                <span class="pill pill--soft">
                  <i class="bi bi-calendar2" aria-hidden="true"></i>
                  {{ formatDate(req.created_at) }}
                </span>
                <span class="pill pill--soft">
                  <i class="bi bi-tag" aria-hidden="true"></i>
                  {{ req.genre || '-' }}
                </span>
              </div>

              <div v-if="req.link" class="request-card__link">
                <a :href="req.link" target="_blank" rel="noreferrer" class="btn btn-ghost btn-sm">
                  <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>
                  Buka Link
                </a>
              </div>

              <div class="request-card__actions">
                <button class="btn btn-ghost btn-sm" type="button" @click="openDetail(req)">
                  <i class="bi bi-eye" aria-hidden="true"></i>
                  Detail
                </button>
                <button class="btn btn-ghost btn-sm btn-icon btn-icon--danger" type="button" @click="openConfirmDelete(req)" aria-label="Hapus">
                  <i class="bi bi-trash" aria-hidden="true"></i>
                </button>

                <button
                  v-if="req.status === 'pending'"
                  class="btn btn-success btn-sm"
                  type="button"
                  @click="openConfirmStatus(req, 'approved', false)"
                >
                  <i class="bi bi-check-lg" aria-hidden="true"></i>
                  Setujui
                </button>
                <button
                  v-if="req.status === 'pending'"
                  class="btn btn-danger btn-sm"
                  type="button"
                  @click="openConfirmStatus(req, 'rejected', false)"
                >
                  <i class="bi bi-x-lg" aria-hidden="true"></i>
                  Tolak
                </button>
              </div>
            </div>

            <div v-if="!displayedRequests.length" class="empty-state">
              <div class="empty-icon" aria-hidden="true"><i class="bi bi-inbox"></i></div>
              <h3>Tidak ada request</h3>
              <p class="text-muted">Coba ubah filter status atau kata kunci pencarian.</p>
            </div>
          </template>
        </div>

        <!-- Pagination -->
        <div v-if="meta.totalPages > 1" class="pagination-row">
          <button class="btn btn-ghost btn-sm" type="button" @click="goToPage(meta.page - 1)" :disabled="loadingRequests || meta.page <= 1">
            <i class="bi bi-chevron-left" aria-hidden="true"></i>
            Sebelumnya
          </button>
          <div class="page-indicator text-muted">
            Halaman <strong>{{ meta.page }}</strong> / {{ meta.totalPages }}
          </div>
          <button class="btn btn-ghost btn-sm" type="button" @click="goToPage(meta.page + 1)" :disabled="loadingRequests || meta.page >= meta.totalPages">
            Berikutnya
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- Detail Modal -->
    <transition name="ad-modal">
      <div v-if="showDetailModal" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Detail request lagu" @click.self="closeDetail">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon" aria-hidden="true"><i class="bi bi-music-note"></i></div>
              <div class="modal-title__copy">
                <h3>Detail Request</h3>
                <p class="text-muted">Cek informasi, link referensi, dan catatan user sebelum mengambil keputusan.</p>
              </div>
            </div>
            <button class="icon-close" type="button" @click="closeDetail" aria-label="Tutup modal">
              <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="detail-grid">
              <div class="detail-card detail-card--song">
                <div class="detail-label">Lagu</div>
                <div class="detail-value" :title="selectedRequest?.title">{{ selectedRequest?.title || '-' }}</div>
                <div class="detail-sub text-muted" :title="selectedRequest?.artist">{{ selectedRequest?.artist || '-' }}</div>
              </div>

              <div class="detail-card">
                <div class="detail-label">User</div>
                <div class="detail-value" :title="requesterName(selectedRequest)">{{ requesterName(selectedRequest) }}</div>
                <div class="detail-sub text-muted" :title="requesterEmail(selectedRequest)">{{ requesterEmail(selectedRequest) }}</div>
              </div>

              <div class="detail-card">
                <div class="detail-label">Status</div>
                <div class="detail-value">
                  <span class="pill" :class="statusTone(selectedRequest?.status)">
                    <i :class="statusIcon(selectedRequest?.status)" aria-hidden="true"></i>
                    {{ statusLabel(selectedRequest?.status) }}
                  </span>
                </div>
                <div class="detail-sub text-muted">{{ formatDate(selectedRequest?.created_at) }}</div>
              </div>
            </div>

            <div class="detail-grid detail-grid--secondary">
              <div class="detail-card">
                <div class="detail-label">Genre</div>
                <div class="detail-value">{{ selectedRequest?.genre || '-' }}</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">Bahasa</div>
                <div class="detail-value">{{ selectedRequest?.language || '-' }}</div>
              </div>
              <div class="detail-card detail-card--link" v-if="selectedRequest?.link">
                <div class="detail-label">Link</div>
                <a :href="selectedRequest.link" target="_blank" rel="noreferrer" class="btn btn-ghost btn-sm">
                  <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>
                  Buka Link
                </a>
                <div class="detail-sub text-muted truncate" :title="selectedRequest.link">{{ selectedRequest.link }}</div>
              </div>
              <div class="detail-card" v-else>
                <div class="detail-label">Link</div>
                <div class="detail-value">-</div>
              </div>
            </div>

            <div v-if="selectedRequest?.notes" class="detail-section">
              <div class="section-title">Catatan User</div>
              <div class="message-box">{{ selectedRequest.notes }}</div>
            </div>

            <div class="detail-section">
              <div class="section-title">Catatan Admin</div>
              <textarea v-model="adminNotes" class="form-control" rows="3" placeholder="Tambahkan catatan (opsional)…"></textarea>
              <div class="text-muted hint">Catatan akan tersimpan saat kamu approve / reject request.</div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-ghost" type="button" @click="closeDetail">Tutup</button>
            <button class="btn btn-ghost btn-icon btn-icon--danger" type="button" @click="openConfirmDelete(selectedRequest)" aria-label="Hapus request">
              <i class="bi bi-trash" aria-hidden="true"></i>
            </button>

            <button
              v-if="selectedRequest?.status === 'pending'"
              class="btn btn-danger"
              type="button"
              @click="openConfirmStatus(selectedRequest, 'rejected', true)"
            >
              <i class="bi bi-x-lg" aria-hidden="true"></i>
              Tolak
            </button>
            <button
              v-if="selectedRequest?.status === 'pending'"
              class="btn btn-success"
              type="button"
              @click="openConfirmStatus(selectedRequest, 'approved', true)"
            >
              <i class="bi bi-check-lg" aria-hidden="true"></i>
              Setujui
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Confirm Modal -->
    <transition name="ad-modal">
      <div v-if="confirmState.open" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Konfirmasi aksi" @click.self="closeConfirm">
        <div class="modal-content modal-content--confirm">
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon" aria-hidden="true">
                <i :class="confirmState.icon"></i>
              </div>
              <div class="modal-title__copy">
                <h3>{{ confirmState.title }}</h3>
                <p class="text-muted">{{ confirmState.message }}</p>
              </div>
            </div>
            <button class="icon-close" type="button" @click="closeConfirm" aria-label="Tutup konfirmasi">
              <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="confirm-summary">
              <div class="confirm-item">
                <div class="confirm-label text-muted">Judul</div>
                <div class="confirm-value">{{ confirmState.request?.title || '-' }}</div>
              </div>
              <div class="confirm-item">
                <div class="confirm-label text-muted">Artis</div>
                <div class="confirm-value">{{ confirmState.request?.artist || '-' }}</div>
              </div>
              <div class="confirm-item">
                <div class="confirm-label text-muted">User</div>
                <div class="confirm-value">{{ requesterName(confirmState.request) }}</div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-ghost" type="button" @click="closeConfirm" :disabled="confirmLoading">Batal</button>
            <button class="btn" :class="confirmState.variant" type="button" @click="runConfirmAction" :disabled="confirmLoading">
              <span v-if="confirmLoading" class="spinner" aria-hidden="true"></span>
              <i v-else :class="confirmState.icon" aria-hidden="true"></i>
              {{ confirmLoading ? 'Memproses…' : confirmState.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <transition name="ad-toast">
      <div v-if="showToast" class="toast" :class="`toast--${toastTone}`" role="status" aria-live="polite">
        <i :class="toastTone === 'success' ? 'bi bi-check-circle-fill' : toastTone === 'danger' ? 'bi bi-x-circle-fill' : 'bi bi-info-circle-fill'" aria-hidden="true"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const requests = ref([])
const meta = ref({ total: 0, page: 1, limit: 20, totalPages: 1 })
const stats = ref({ total: 0, pending: 0, approved: 0, rejected: 0 })

const loadingRequests = ref(true)
const loadingStats = ref(true)
const errorMessage = ref('')
const lastUpdatedAt = ref(Date.now())

const filterStatus = ref('')
const searchQuery = ref('')

const showDetailModal = ref(false)
const selectedRequest = ref(null)
const adminNotes = ref('')

const confirmLoading = ref(false)
const confirmState = ref({
  open: false,
  action: '',
  status: '',
  request: null,
  title: '',
  message: '',
  confirmLabel: '',
  icon: 'bi bi-exclamation-triangle-fill',
  variant: 'btn-primary',
  useNotes: false
})

const showToast = ref(false)
const toastMessage = ref('')
const toastTone = ref('success')
let toastTimeout = null

const limit = computed({
  get: () => meta.value.limit || 20,
  set: (value) => {
    meta.value.page = 1
    meta.value.limit = Number(value) || 20
  }
})

const loadingAny = computed(() => loadingRequests.value || loadingStats.value)

const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(Number(value) || 0)

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const lastUpdatedLabel = computed(() => {
  const date = new Date(lastUpdatedAt.value || Date.now())
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date)
})

const statusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    completed: 'Selesai'
  }
  return labels[status] || status || '-'
}

const statusTone = (status) => {
  if (status === 'approved') return 'pill--success'
  if (status === 'rejected') return 'pill--danger'
  if (status === 'completed') return 'pill--cyan'
  return 'pill--warning'
}

const statusIcon = (status) => {
  if (status === 'approved') return 'bi bi-check-circle-fill'
  if (status === 'rejected') return 'bi bi-x-circle-fill'
  if (status === 'completed') return 'bi bi-stars'
  return 'bi bi-hourglass-split'
}

const requesterName = (req) => req?.requester?.name || 'Unknown'
const requesterEmail = (req) => req?.requester?.email || '-'

const completedCount = computed(() => {
  const total = Number(stats.value.total) || 0
  const pending = Number(stats.value.pending) || 0
  const approved = Number(stats.value.approved) || 0
  const rejected = Number(stats.value.rejected) || 0
  return Math.max(0, total - pending - approved - rejected)
})

const statCards = computed(() => [
  {
    key: 'total',
    label: 'Total Request',
    value: stats.value.total || 0,
    icon: 'bi bi-collection',
    tone: 'tone-cyan',
    statusFilter: '',
    linkLabel: 'Lihat'
  },
  {
    key: 'pending',
    label: 'Pending',
    value: stats.value.pending || 0,
    icon: 'bi bi-hourglass-split',
    tone: 'tone-blue',
    statusFilter: 'pending',
    linkLabel: 'Review'
  },
  {
    key: 'approved',
    label: 'Disetujui',
    value: stats.value.approved || 0,
    icon: 'bi bi-check-circle-fill',
    tone: 'tone-green',
    statusFilter: 'approved',
    linkLabel: 'Lihat'
  },
  {
    key: 'rejected',
    label: 'Ditolak',
    value: stats.value.rejected || 0,
    icon: 'bi bi-x-circle-fill',
    tone: 'tone-blue',
    statusFilter: 'rejected',
    linkLabel: 'Lihat'
  },
  {
    key: 'completed',
    label: 'Selesai',
    value: completedCount.value,
    icon: 'bi bi-stars',
    tone: 'tone-cyan',
    statusFilter: 'completed',
    linkLabel: 'Lihat',
    hint: 'Perkiraan dari total'
  }
])

const displayedRequests = computed(() => {
  const list = Array.isArray(requests.value) ? requests.value : []
  const q = String(searchQuery.value || '').trim().toLowerCase()
  if (!q) return list

  return list.filter((r) => {
    const hay = [
      requesterName(r),
      requesterEmail(r),
      r?.title,
      r?.artist,
      r?.genre,
      r?.language,
      statusLabel(r?.status),
      r?.notes,
      r?.admin_notes
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
})

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const fetchRequests = async () => {
  loadingRequests.value = true
  errorMessage.value = ''

  try {
    const params = {
      status: filterStatus.value || undefined,
      page: meta.value.page || 1,
      limit: meta.value.limit || 20
    }
    const response = await axios.get(`${API_URL}/requests`, { ...getAuthHeader(), params })
    requests.value = response.data.data || []

    const responseMeta = response.data.meta || {}
    meta.value = {
      total: Number(responseMeta.total) || 0,
      page: Number(responseMeta.page) || 1,
      limit: Number(responseMeta.limit) || (meta.value.limit || 20),
      totalPages: Number(responseMeta.totalPages) || 1
    }

    lastUpdatedAt.value = Date.now()
  } catch (error) {
    console.error('Error fetching requests:', error)
    errorMessage.value = error.response?.data?.message || 'Gagal memuat daftar request'
    requests.value = []
  } finally {
    loadingRequests.value = false
  }
}

const fetchStats = async () => {
  loadingStats.value = true
  errorMessage.value = ''

  try {
    const response = await axios.get(`${API_URL}/requests/stats`, getAuthHeader())
    stats.value = response.data.data || { total: 0, pending: 0, approved: 0, rejected: 0 }
    lastUpdatedAt.value = Date.now()
  } catch (error) {
    console.error('Error fetching stats:', error)
    errorMessage.value = error.response?.data?.message || 'Gagal memuat statistik request'
  } finally {
    loadingStats.value = false
  }
}

const refreshAll = async () => {
  await Promise.all([fetchStats(), fetchRequests()])
}

const applyStatusFilter = (value) => {
  filterStatus.value = value
}

watch(filterStatus, () => {
  meta.value.page = 1
  fetchRequests()
})

watch(
  () => meta.value.limit,
  () => {
    meta.value.page = 1
    fetchRequests()
  }
)

const goToPage = (page) => {
  const next = Math.max(1, Math.min(Number(page) || 1, meta.value.totalPages || 1))
  if (next === meta.value.page) return
  meta.value.page = next
  fetchRequests()
}

const triggerToast = (message, tone = 'success') => {
  toastMessage.value = message
  toastTone.value = tone
  showToast.value = true
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    showToast.value = false
  }, 2500)
}

const openDetail = (req) => {
  selectedRequest.value = req
  adminNotes.value = req?.admin_notes || ''
  showDetailModal.value = true
}

const closeDetail = () => {
  showDetailModal.value = false
}

const updateRequestStatus = async (req, status, notes) => {
  if (!req?.id) return

  try {
    await axios.put(`${API_URL}/requests/${req.id}/status`, { status, admin_notes: notes || '' }, getAuthHeader())
    triggerToast(status === 'approved' ? 'Request disetujui' : 'Request ditolak', 'success')
    showDetailModal.value = false
    await refreshAll()
  } catch (error) {
    console.error('Error updating status:', error)
    triggerToast(error.response?.data?.message || 'Gagal memproses request', 'danger')
  }
}

const deleteRequest = async (req) => {
  if (!req?.id) return

  try {
    await axios.delete(`${API_URL}/requests/${req.id}`, getAuthHeader())
    triggerToast('Request berhasil dihapus', 'success')
    if (selectedRequest.value?.id === req.id) {
      showDetailModal.value = false
    }
    await refreshAll()
  } catch (error) {
    console.error('Error deleting request:', error)
    triggerToast(error.response?.data?.message || 'Gagal menghapus request', 'danger')
  }
}

const openConfirmDelete = (req) => {
  if (!req) return
  confirmState.value = {
    open: true,
    action: 'delete',
    status: '',
    request: req,
    title: 'Hapus request ini?',
    message: 'Tindakan ini tidak bisa dibatalkan.',
    confirmLabel: 'Hapus',
    icon: 'bi bi-trash',
    variant: 'btn-danger',
    useNotes: false
  }
}

const openConfirmStatus = (req, status, useNotes) => {
  if (!req) return
  const isApprove = status === 'approved'
  confirmState.value = {
    open: true,
    action: 'status',
    status,
    request: req,
    title: isApprove ? 'Setujui request ini?' : 'Tolak request ini?',
    message: isApprove
      ? 'Pastikan request valid sebelum menyetujui.'
      : 'Request akan ditandai sebagai ditolak.',
    confirmLabel: isApprove ? 'Setujui' : 'Tolak',
    icon: isApprove ? 'bi bi-check-lg' : 'bi bi-x-lg',
    variant: isApprove ? 'btn-success' : 'btn-danger',
    useNotes: Boolean(useNotes)
  }
}

const closeConfirm = () => {
  if (confirmLoading.value) return
  confirmState.value.open = false
}

const runConfirmAction = async () => {
  if (!confirmState.value.open || confirmLoading.value) return

  confirmLoading.value = true
  try {
    if (confirmState.value.action === 'delete') {
      await deleteRequest(confirmState.value.request)
    } else if (confirmState.value.action === 'status') {
      const notes = confirmState.value.useNotes ? adminNotes.value : ''
      await updateRequestStatus(confirmState.value.request, confirmState.value.status, notes)
    }
  } finally {
    confirmLoading.value = false
    confirmState.value.open = false
  }
}

const onKeydown = (event) => {
  if (event.key !== 'Escape') return
  if (confirmState.value.open) return closeConfirm()
  if (showDetailModal.value) return closeDetail()
}

onMounted(() => {
  refreshAll()
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (toastTimeout) clearTimeout(toastTimeout)
})
</script>

<style scoped>
.admin-requests {
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
  color: rgba(187, 247, 208, 0.98);
}

.page-header h1 {
  margin: 0 0 0.35rem 0;
  font-size: 1.85rem;
  letter-spacing: -0.02em;
}

.page-header p {
  margin: 0;
  max-width: 72ch;
}

.page-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.7rem;
  font-size: 0.9rem;
}

.page-header__actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
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

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.stat-card {
  border-radius: 22px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.85rem;
  align-items: center;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 14px 55px rgba(0, 0, 0, 0.4);
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
}

.stat-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  background: var(--gradient-glow);
  opacity: 0;
  transform: translateX(-8%);
  transition: opacity var(--transition-normal), transform var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.24);
  background: rgba(0, 0, 0, 0.26);
}

.stat-card:hover::before {
  opacity: 0.14;
  transform: translateX(0);
}

.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  place-items: center;
  position: relative;
  z-index: 1;
}

.stat-icon i {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.95);
}

.stat-body {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.82rem;
}

.stat-value {
  font-size: 1.45rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  margin-top: 0.12rem;
}

.stat-hint {
  font-size: 0.85rem;
  margin-top: 0.12rem;
}

.stat-link {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 0.35rem;
  padding: 0.85rem;
  color: rgba(165, 243, 252, 0.95);
  font-size: 0.85rem;
  font-weight: 750;
  z-index: 2;
  opacity: 0.85;
  background: transparent;
  border: none;
  cursor: pointer;
}

.stat-card.tone-green .stat-icon {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.26), rgba(6, 182, 212, 0.12));
  border-color: rgba(34, 197, 94, 0.22);
}

.stat-card.tone-cyan .stat-icon {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.24), rgba(59, 130, 246, 0.12));
  border-color: rgba(94, 234, 212, 0.22);
}

.stat-card.tone-blue .stat-icon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.22), rgba(6, 182, 212, 0.12));
  border-color: rgba(59, 130, 246, 0.22);
}

.stat-card--skeleton {
  pointer-events: none;
}

.skeleton-line {
  height: 0.95rem;
  width: 100%;
  border-radius: 10px;
}

.skeleton-line--lg {
  height: 1.25rem;
  width: 65%;
  margin-top: 0.45rem;
}

/* Panels */
.panel {
  background: rgba(10, 22, 28, 0.72);
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
  padding: 1.05rem 1.1rem 1rem;
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
  font-size: 1.12rem;
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
  color: rgba(165, 243, 252, 0.98);
  flex: 0 0 auto;
}

.panel-icon--soft {
  background: rgba(6, 182, 212, 0.08);
}

.panel-body {
  padding: 0.95rem 1.1rem 1.1rem;
}

.panel-actions {
  display: inline-flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
}

/* Filters */
.filters-panel {
  margin-bottom: 1.25rem;
}

.filters-row {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 170px;
  gap: 0.9rem;
  align-items: end;
}

.field-label {
  display: inline-flex;
  margin-bottom: 0.45rem;
  color: var(--text-secondary);
  font-weight: 650;
}

.field--grow {
  min-width: 0;
}

.search-control {
  position: relative;
}

.search-control i.bi-search {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(165, 243, 252, 0.85);
}

.search-control .form-control {
  padding-left: 2.65rem;
  padding-right: 2.8rem;
}

.icon-clear {
  position: absolute;
  right: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  border-radius: 14px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(165, 243, 252, 0.95);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
}

.icon-clear:hover {
  transform: translateY(-50%) scale(1.02);
  border-color: rgba(94, 234, 212, 0.28);
  background: rgba(255, 255, 255, 0.1);
}

.chips-row {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-top: 0.95rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.18);
  color: var(--text-primary);
  cursor: pointer;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
}

.chip:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.24);
  background: rgba(0, 0, 0, 0.22);
}

.chip.on {
  border-color: rgba(94, 234, 212, 0.28);
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.18) 0%,
    rgba(6, 182, 212, 0.12) 55%,
    rgba(59, 130, 246, 0.16) 100%
  );
}

.chip-count {
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.16);
  color: rgba(203, 213, 225, 0.92);
  font-size: 0.78rem;
}

/* Requests */
.requests-panel {
  margin-bottom: 1.25rem;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.12);
  background: rgba(0, 0, 0, 0.14);
}

.requests-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 980px;
}

.requests-table th,
.requests-table td {
  padding: 0.85rem 0.95rem;
  border-bottom: 1px solid rgba(94, 234, 212, 0.12);
  vertical-align: middle;
}

.requests-table th {
  /* NOTE: sticky header di beberapa browser bisa membuat layer transparan yang nge-block klik pada tbody */
  position: static;
  background: rgba(4, 12, 16, 0.78);
  /* NOTE: hindari backdrop-filter pada sticky header karena bisa nge-block click di beberapa browser */
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  font-size: 0.82rem;
  color: var(--text-muted);
  font-weight: 750;
  text-align: left;
  pointer-events: none;
}

.requests-table tbody tr:hover td {
  background: rgba(255, 255, 255, 0.03);
}

.th-actions,
.td-actions {
  text-align: right;
}

.td-actions,
.row-actions {
  position: relative;
  z-index: 1;
}

.td-date {
  white-space: nowrap;
  color: var(--text-secondary);
}

.td-artist,
.td-genre {
  max-width: 32ch;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-name {
  font-weight: 900;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 34ch;
}

.user-email {
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 34ch;
}

.song-title {
  font-weight: 900;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 40ch;
}

.song-sub {
  margin-top: 0.2rem;
  font-size: 0.85rem;
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
}

.link-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(255, 255, 255, 0.05);
  text-decoration: none;
  color: rgba(165, 243, 252, 0.98);
  font-weight: 700;
  font-size: 0.78rem;
}

.row-actions {
  display: inline-flex;
  gap: 0.45rem;
  justify-content: flex-end;
  align-items: center;
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

.btn-icon--danger {
  color: rgba(254, 202, 202, 0.95);
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.18);
  color: rgba(203, 213, 225, 0.92);
  font-size: 0.78rem;
  white-space: nowrap;
}

.pill--soft {
  background: rgba(6, 182, 212, 0.08);
}

.pill--warning {
  border-color: rgba(245, 158, 11, 0.24);
  background: rgba(245, 158, 11, 0.1);
  color: rgba(254, 215, 170, 0.98);
}

.pill--success {
  border-color: rgba(34, 197, 94, 0.22);
  background: rgba(34, 197, 94, 0.1);
  color: rgba(187, 247, 208, 0.98);
}

.pill--danger {
  border-color: rgba(239, 68, 68, 0.26);
  background: rgba(239, 68, 68, 0.1);
  color: rgba(254, 202, 202, 0.98);
}

.pill--cyan {
  border-color: rgba(94, 234, 212, 0.22);
  background: rgba(6, 182, 212, 0.1);
  color: rgba(165, 243, 252, 0.98);
}

.tr-skeleton td {
  background: rgba(255, 255, 255, 0.02);
}

.skeleton-cell {
  height: 18px;
  border-radius: 999px;
  width: 100%;
}

.tr-empty td {
  background: transparent;
  border-bottom: none;
}

.empty-state {
  text-align: center;
  padding: 1.75rem 0.75rem 1.25rem;
}

.empty-icon {
  width: 62px;
  height: 62px;
  border-radius: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.22);
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.45);
  margin-bottom: 0.75rem;
}

.empty-icon i {
  font-size: 1.8rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.empty-state h3 {
  font-weight: 900;
  margin: 0 0 0.25rem;
}

.empty-state p {
  margin: 0;
}

/* Mobile cards */
.request-cards {
  display: none;
  margin-top: 0.85rem;
  gap: 0.85rem;
}

.request-card {
  border-radius: 22px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.16);
  padding: 0.9rem;
  display: grid;
  gap: 0.75rem;
}

.request-card__top {
  display: flex;
  justify-content: space-between;
  gap: 0.9rem;
  align-items: flex-start;
}

.request-card__song {
  min-width: 0;
}

.request-card__meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.request-card__actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: center;
}

.request-card--skeleton {
  pointer-events: none;
}

.skeleton-chip-row {
  display: flex;
  gap: 0.5rem;
}

.skeleton-chip {
  width: 88px;
  height: 20px;
  border-radius: 999px;
}

.skeleton-btn-row {
  display: flex;
  gap: 0.6rem;
}

.skeleton-btn {
  width: 110px;
  height: 38px;
  border-radius: 14px;
}

/* Pagination */
.pagination-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(94, 234, 212, 0.12);
}

.page-indicator {
  font-size: 0.95rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.76);
  z-index: 3000;
  display: grid;
  place-items: center;
  padding: 1.25rem;
}

.modal-content {
  width: min(920px, 100%);
  border-radius: 26px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(10, 22, 28, 0.82);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 22px 110px rgba(0, 0, 0, 0.65);
  overflow: hidden;
}

.modal-content--confirm {
  width: min(660px, 100%);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.2rem 1rem;
  border-bottom: 1px solid rgba(94, 234, 212, 0.14);
}

.modal-title {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
  min-width: 0;
}

.modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 18px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  place-items: center;
  color: rgba(165, 243, 252, 0.98);
  flex: 0 0 auto;
}

.modal-title__copy {
  min-width: 0;
}

.modal-title h3 {
  margin: 0;
  font-weight: 900;
  letter-spacing: -0.01em;
}

.modal-title p {
  margin: 0.2rem 0 0;
  font-size: 0.92rem;
}

.icon-close {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
}

.icon-close:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.28);
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 1.05rem 1.2rem 1.2rem;
  display: grid;
  gap: 1rem;
}

.modal-footer {
  padding: 1rem 1.2rem;
  border-top: 1px solid rgba(94, 234, 212, 0.14);
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: center;
}

/* Detail content */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}

.detail-grid--secondary {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.detail-card {
  border-radius: 22px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.16);
  padding: 0.9rem;
  display: grid;
  gap: 0.35rem;
}

.detail-card--song {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.12) 0%,
    rgba(6, 182, 212, 0.1) 55%,
    rgba(59, 130, 246, 0.12) 100%
  );
}

.detail-card--link .btn {
  justify-content: center;
}

.detail-label {
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 700;
}

.detail-value {
  font-weight: 900;
  letter-spacing: -0.01em;
}

.detail-sub {
  font-size: 0.9rem;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-section {
  display: grid;
  gap: 0.5rem;
}

.section-title {
  font-weight: 900;
  letter-spacing: -0.01em;
}

.message-box {
  padding: 0.85rem 0.9rem;
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.16);
  line-height: 1.55;
}

.hint {
  font-size: 0.88rem;
}

/* Confirm summary */
.confirm-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.confirm-item {
  border-radius: 18px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.16);
  padding: 0.85rem 0.9rem;
}

.confirm-value {
  margin-top: 0.3rem;
  font-weight: 900;
}

/* Button variants */
.btn-success {
  background: rgba(34, 197, 94, 0.92);
  border: none;
  color: white;
  box-shadow: 0 0 26px rgba(34, 197, 94, 0.18);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 38px rgba(34, 197, 94, 0.26);
  color: white;
}

.btn-danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.92), rgba(245, 158, 11, 0.9));
  border: none;
  color: white;
  box-shadow: 0 0 26px rgba(239, 68, 68, 0.18);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 38px rgba(239, 68, 68, 0.26);
  color: white;
}

.spinner {
  width: 0.95rem;
  height: 0.95rem;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: rgba(255, 255, 255, 0.95);
  animation: spin 800ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Toast */
.toast {
  position: fixed;
  left: 50%;
  bottom: 1.6rem;
  transform: translateX(-50%);
  z-index: 3200;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border-radius: 18px;
  color: white;
  box-shadow: 0 18px 70px rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.toast--success {
  background: rgba(34, 197, 94, 0.95);
}

.toast--danger {
  background: rgba(239, 68, 68, 0.92);
}

.toast--info {
  background: rgba(6, 182, 212, 0.92);
}

.ad-toast-enter-active,
.ad-toast-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.ad-toast-enter-from,
.ad-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

.ad-modal-enter-active,
.ad-modal-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.ad-modal-enter-from,
.ad-modal-leave-to {
  opacity: 0;
  transform: translateY(10px);
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
  .reveal {
    animation: none;
  }

  .stat-card,
  .chip,
  .btn,
  .btn-success,
  .btn-danger,
  .icon-close,
  .icon-clear {
    transition: none !important;
  }

  .ad-modal-enter-active,
  .ad-modal-leave-active,
  .ad-toast-enter-active,
  .ad-toast-leave-active {
    transition: none !important;
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .filters-row {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .detail-grid--secondary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header__actions {
    justify-content: stretch;
  }

  .page-header__actions .btn {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-row {
    grid-template-columns: 1fr;
  }

  .table-wrap {
    display: none;
  }

  .request-cards {
    display: grid;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid--secondary {
    grid-template-columns: 1fr;
  }

  .confirm-summary {
    grid-template-columns: 1fr;
  }

  .modal-overlay {
    padding: 0.85rem;
    align-items: end;
  }

  .modal-content {
    border-radius: 26px 26px 16px 16px;
  }

  .pagination-row {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-row .btn {
    justify-content: center;
  }
}

@media (max-width: 425px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .modal-footer .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
