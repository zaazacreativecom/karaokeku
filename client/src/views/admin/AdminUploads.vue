<template>
  <div class="admin-uploads">
    <header class="page-header reveal" style="--d: 0ms">
      <div class="page-header__copy">
        <div class="page-badge">
          <i class="bi bi-cloud-check-fill" aria-hidden="true"></i>
          <span>Review Upload</span>
        </div>
        <h1>Review upload user dengan lebih cepat</h1>
        <p class="text-muted">
          Approve untuk menambahkan ke katalog lagu, atau reject dengan catatan agar user paham perbaikannya.
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
        <div class="alert-title">Gagal memuat upload</div>
        <div class="alert-text text-muted">{{ errorMessage }}</div>
      </div>
      <button class="btn btn-ghost btn-sm" type="button" @click="refreshAll">
        <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
        Coba lagi
      </button>
    </div>

    <!-- Stats -->
    <section class="stats-grid reveal" style="--d: 90ms" aria-label="Ringkasan upload">
      <template v-if="loadingStats">
        <div v-for="n in 4" :key="n" class="stat-card stat-card--skeleton">
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
    <section class="panel filters-panel reveal" style="--d: 120ms" aria-label="Filter upload">
      <div class="panel-header panel-header--compact">
        <div class="panel-title">
          <div class="panel-icon panel-icon--soft" aria-hidden="true">
            <i class="bi bi-funnel-fill"></i>
          </div>
          <div class="panel-title__copy">
            <h2>Filter</h2>
            <p class="text-muted">Cari cepat berdasarkan judul, artis, user, atau status.</p>
          </div>
        </div>
      </div>

      <div class="panel-body">
        <div class="filters-row">
          <div class="field">
            <label class="field-label" for="upload-status">Status</label>
            <select id="upload-status" v-model="filterStatus" class="form-select" :disabled="loadingUploads">
              <option value="">Semua</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div class="field field--grow">
            <label class="field-label" for="upload-search">Cari</label>
            <div class="search-control">
              <i class="bi bi-search" aria-hidden="true"></i>
              <input
                id="upload-search"
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
            <label class="field-label" for="upload-limit">Per halaman</label>
            <select id="upload-limit" v-model.number="limit" class="form-select" :disabled="loadingUploads">
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
            <span>Approved</span>
            <span class="chip-count">{{ formatNumber(stats.approved || 0) }}</span>
          </button>
          <button class="chip" type="button" :class="{ on: filterStatus === 'rejected' }" @click="applyStatusFilter('rejected')">
            <span>Rejected</span>
            <span class="chip-count">{{ formatNumber(stats.rejected || 0) }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- List -->
    <section class="panel uploads-panel reveal" style="--d: 150ms" aria-label="Daftar upload">
      <div class="panel-header">
        <div class="panel-title">
          <div class="panel-icon" aria-hidden="true">
            <i class="bi bi-inboxes"></i>
          </div>
          <div class="panel-title__copy">
            <h2>Daftar Upload</h2>
            <p class="text-muted">
              Menampilkan <strong>{{ formatNumber(displayedUploads.length) }}</strong> dari <strong>{{ formatNumber(meta.total) }}</strong> data.
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
        <div class="table-wrap" aria-label="Tabel upload">
          <table class="uploads-table">
            <thead>
              <tr>
                <th>Upload</th>
                <th>User</th>
                <th>Ukuran</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th class="th-actions">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="loadingUploads">
                <tr v-for="n in 7" :key="n" class="tr-skeleton">
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                </tr>
              </template>

              <template v-else>
                <tr v-for="upload in displayedUploads" :key="upload.id">
                  <td>
                    <div class="upload-cell">
                      <div class="upload-thumb" aria-hidden="true">
                        <img v-if="upload.thumbnail_url" :src="resolveMediaUrl(upload.thumbnail_url)" alt="" loading="lazy" />
                        <div v-else class="thumb-fallback">
                          <i class="bi bi-cloud-upload" aria-hidden="true"></i>
                        </div>
                      </div>
                      <div class="upload-info">
                        <div class="upload-title" :title="upload.title">{{ upload.title }}</div>
                        <div class="upload-sub text-muted">
                          <span class="upload-artist" :title="upload.artist || '-'">{{ upload.artist || '-' }}</span>
                          <span class="dot">•</span>
                          <span :title="upload.genre || '-'">{{ upload.genre || '-' }}</span>
                          <span class="dot">•</span>
                          <span :title="upload.language || '-'">{{ upload.language || '-' }}</span>
                        </div>
                        <div v-if="upload.admin_note" class="note-pill" :title="upload.admin_note">
                          <i class="bi bi-chat-left-text" aria-hidden="true"></i>
                          Ada catatan
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="user-name" :title="uploaderName(upload)">{{ uploaderName(upload) }}</div>
                    <div class="user-email text-muted" :title="uploaderEmail(upload)">{{ uploaderEmail(upload) }}</div>
                  </td>
                  <td class="td-size">{{ formatFileSize(upload.file_size) }}</td>
                  <td class="td-date">{{ formatDate(upload.created_at) }}</td>
                  <td>
                    <span class="pill" :class="statusTone(upload.status)">
                      <i :class="statusIcon(upload.status)" aria-hidden="true"></i>
                      {{ statusLabel(upload.status) }}
                    </span>
                  </td>
                  <td class="td-actions">
                    <div class="row-actions">
                      <button class="btn btn-ghost btn-sm btn-icon" type="button" @click="openDetail(upload)" aria-label="Detail">
                        <i class="bi bi-eye" aria-hidden="true"></i>
                      </button>

                      <button
                        v-if="upload.status === 'pending'"
                        class="btn btn-success btn-sm btn-icon"
                        type="button"
                        @click="openConfirmReview(upload, 'approved', '')"
                        aria-label="Approve"
                      >
                        <i class="bi bi-check-lg" aria-hidden="true"></i>
                      </button>
                      <button
                        v-if="upload.status === 'pending'"
                        class="btn btn-danger btn-sm btn-icon"
                        type="button"
                        @click="openConfirmReview(upload, 'rejected', '')"
                        aria-label="Reject"
                      >
                        <i class="bi bi-x-lg" aria-hidden="true"></i>
                      </button>

                      <button
                        v-if="upload.status !== 'approved'"
                        class="btn btn-ghost btn-sm btn-icon btn-icon--danger"
                        type="button"
                        @click="openConfirmDelete(upload)"
                        aria-label="Hapus"
                      >
                        <i class="bi bi-trash" aria-hidden="true"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="!displayedUploads.length" class="tr-empty">
                  <td colspan="6">
                    <div class="empty-state">
                      <div class="empty-icon" aria-hidden="true"><i class="bi bi-inbox"></i></div>
                      <h3>Tidak ada upload</h3>
                      <p class="text-muted">Coba ubah filter status atau kata kunci pencarian.</p>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <div class="upload-cards" aria-label="Daftar upload (mobile)">
          <template v-if="loadingUploads">
            <div v-for="n in 6" :key="n" class="upload-card upload-card--skeleton">
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
            <div v-for="upload in displayedUploads" :key="upload.id" class="upload-card">
              <div class="upload-card__top">
                <div class="upload-card__left">
                  <div class="upload-thumb upload-thumb--sm" aria-hidden="true">
                    <img v-if="upload.thumbnail_url" :src="resolveMediaUrl(upload.thumbnail_url)" alt="" loading="lazy" />
                    <div v-else class="thumb-fallback">
                      <i class="bi bi-cloud-upload" aria-hidden="true"></i>
                    </div>
                  </div>
                  <div class="upload-card__copy">
                    <div class="upload-title" :title="upload.title">{{ upload.title }}</div>
                    <div class="upload-sub text-muted" :title="upload.artist || '-'">{{ upload.artist || '-' }}</div>
                  </div>
                </div>
                <span class="pill" :class="statusTone(upload.status)">
                  <i :class="statusIcon(upload.status)" aria-hidden="true"></i>
                  {{ statusLabel(upload.status) }}
                </span>
              </div>

              <div class="upload-card__meta">
                <span class="pill pill--soft">
                  <i class="bi bi-person" aria-hidden="true"></i>
                  {{ uploaderName(upload) }}
                </span>
                <span class="pill pill--soft">
                  <i class="bi bi-calendar2" aria-hidden="true"></i>
                  {{ formatDate(upload.created_at) }}
                </span>
                <span class="pill">
                  <i class="bi bi-hdd" aria-hidden="true"></i>
                  {{ formatFileSize(upload.file_size) }}
                </span>
              </div>

              <div v-if="upload.admin_note" class="upload-card__note">
                <div class="note-label text-muted">Catatan</div>
                <div class="note-text">{{ upload.admin_note }}</div>
              </div>

              <div class="upload-card__actions">
                <button class="btn btn-ghost btn-sm" type="button" @click="openDetail(upload)">
                  <i class="bi bi-eye" aria-hidden="true"></i>
                  Detail
                </button>

                <button
                  v-if="upload.status !== 'approved'"
                  class="btn btn-ghost btn-sm btn-icon btn-icon--danger"
                  type="button"
                  @click="openConfirmDelete(upload)"
                  aria-label="Hapus"
                >
                  <i class="bi bi-trash" aria-hidden="true"></i>
                </button>

                <button
                  v-if="upload.status === 'pending'"
                  class="btn btn-success btn-sm"
                  type="button"
                  @click="openConfirmReview(upload, 'approved', '')"
                >
                  <i class="bi bi-check-lg" aria-hidden="true"></i>
                  Approve
                </button>
                <button
                  v-if="upload.status === 'pending'"
                  class="btn btn-danger btn-sm"
                  type="button"
                  @click="openConfirmReview(upload, 'rejected', '')"
                >
                  <i class="bi bi-x-lg" aria-hidden="true"></i>
                  Reject
                </button>
              </div>
            </div>

            <div v-if="!displayedUploads.length" class="empty-state">
              <div class="empty-icon" aria-hidden="true"><i class="bi bi-inbox"></i></div>
              <h3>Tidak ada upload</h3>
              <p class="text-muted">Coba ubah filter status atau kata kunci pencarian.</p>
            </div>
          </template>
        </div>

        <!-- Pagination -->
        <div v-if="meta.totalPages > 1" class="pagination-row">
          <button class="btn btn-ghost btn-sm" type="button" @click="goToPage(meta.page - 1)" :disabled="loadingUploads || meta.page <= 1">
            <i class="bi bi-chevron-left" aria-hidden="true"></i>
            Sebelumnya
          </button>
          <div class="page-indicator text-muted">
            Halaman <strong>{{ meta.page }}</strong> / {{ meta.totalPages }}
          </div>
          <button class="btn btn-ghost btn-sm" type="button" @click="goToPage(meta.page + 1)" :disabled="loadingUploads || meta.page >= meta.totalPages">
            Berikutnya
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- Detail Modal -->
    <transition name="ad-modal">
      <div
        v-if="showDetailModal"
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Detail upload"
        @click.self="closeDetail"
      >
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon" aria-hidden="true"><i class="bi bi-file-earmark-music"></i></div>
              <div class="modal-title__copy">
                <h3>Detail Upload</h3>
                <p class="text-muted">Periksa data dan lakukan review.</p>
              </div>
            </div>
            <button class="icon-close" type="button" @click="closeDetail" aria-label="Tutup modal">
              <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="detail-grid">
              <div class="detail-card detail-card--main">
                <div class="detail-label">Upload</div>
                <div class="detail-title">{{ selectedUpload?.title || '-' }}</div>
                <div class="detail-sub text-muted">{{ selectedUpload?.artist || '-' }}</div>
              </div>

              <div class="detail-card">
                <div class="detail-label">User</div>
                <div class="detail-value">{{ uploaderName(selectedUpload) }}</div>
                <div class="detail-sub text-muted">{{ uploaderEmail(selectedUpload) }}</div>
              </div>

              <div class="detail-card">
                <div class="detail-label">Status</div>
                <div class="detail-value">
                  <span class="pill" :class="statusTone(selectedUpload?.status)">
                    <i :class="statusIcon(selectedUpload?.status)" aria-hidden="true"></i>
                    {{ statusLabel(selectedUpload?.status) }}
                  </span>
                </div>
                <div class="detail-sub text-muted">{{ formatDate(selectedUpload?.created_at) }}</div>
              </div>
            </div>

            <div class="detail-grid detail-grid--secondary">
              <div class="detail-card">
                <div class="detail-label">Genre</div>
                <div class="detail-value">{{ selectedUpload?.genre || '-' }}</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">Bahasa</div>
                <div class="detail-value">{{ selectedUpload?.language || '-' }}</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">Ukuran</div>
                <div class="detail-value">{{ formatFileSize(selectedUpload?.file_size) }}</div>
              </div>
              <div class="detail-card detail-card--thumb">
                <div class="detail-label">Thumbnail</div>
                <div class="thumb-preview">
                  <img v-if="selectedUpload?.thumbnail_url" :src="resolveMediaUrl(selectedUpload.thumbnail_url)" alt="Thumbnail upload" loading="lazy" />
                  <div v-else class="thumb-empty text-muted">-</div>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <div class="section-title">Catatan Admin</div>
              <textarea
                v-model="adminNote"
                class="form-control"
                rows="3"
                placeholder="Tambahkan catatan (opsional)…"
                :disabled="selectedUpload?.status !== 'pending'"
              ></textarea>
              <div v-if="selectedUpload?.status !== 'pending'" class="text-muted hint">Catatan hanya bisa diubah saat status masih pending.</div>
              <div v-else class="text-muted hint">Catatan ini akan tersimpan saat kamu approve/reject.</div>
            </div>

            <div v-if="selectedUpload?.reviewer || selectedUpload?.reviewed_at" class="detail-section">
              <div class="section-title">Info Review</div>
              <div class="review-grid">
                <div class="review-item">
                  <div class="review-label text-muted">Reviewer</div>
                  <div class="review-value">{{ selectedUpload?.reviewer?.name || '-' }}</div>
                </div>
                <div class="review-item">
                  <div class="review-label text-muted">Waktu</div>
                  <div class="review-value">{{ formatDate(selectedUpload?.reviewed_at) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-ghost" type="button" @click="closeDetail">Tutup</button>

            <button
              v-if="selectedUpload?.status !== 'approved'"
              class="btn btn-ghost btn-icon btn-icon--danger"
              type="button"
              @click="openConfirmDelete(selectedUpload)"
              aria-label="Hapus upload"
            >
              <i class="bi bi-trash" aria-hidden="true"></i>
            </button>

            <button
              v-if="selectedUpload?.status === 'pending'"
              class="btn btn-danger"
              type="button"
              @click="openConfirmReview(selectedUpload, 'rejected', adminNote)"
            >
              <i class="bi bi-x-lg" aria-hidden="true"></i>
              Reject
            </button>
            <button
              v-if="selectedUpload?.status === 'pending'"
              class="btn btn-success"
              type="button"
              @click="openConfirmReview(selectedUpload, 'approved', adminNote)"
            >
              <i class="bi bi-check-lg" aria-hidden="true"></i>
              Approve
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
                <div class="confirm-value">{{ confirmState.upload?.title || '-' }}</div>
              </div>
              <div class="confirm-item">
                <div class="confirm-label text-muted">Artis</div>
                <div class="confirm-value">{{ confirmState.upload?.artist || '-' }}</div>
              </div>
              <div class="confirm-item">
                <div class="confirm-label text-muted">User</div>
                <div class="confirm-value">{{ uploaderName(confirmState.upload) }}</div>
              </div>
            </div>

            <div v-if="confirmState.action === 'review'" class="confirm-note">
              <div class="confirm-note__title">Catatan Admin (opsional)</div>
              <textarea v-model="confirmState.note" class="form-control" rows="3" placeholder="Tambahkan catatan untuk user…"></textarea>
              <div class="text-muted hint">Catatan akan tersimpan pada upload yang direview.</div>
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
import { adminAPI } from '@/services/api'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const uploads = ref([])
const meta = ref({ total: 0, page: 1, limit: 20, totalPages: 1 })
const stats = ref({ total: 0, pending: 0, approved: 0, rejected: 0 })

const loadingUploads = ref(true)
const loadingStats = ref(true)
const uploadsError = ref('')
const statsError = ref('')
const lastUpdatedAt = ref(Date.now())

const filterStatus = ref('pending')
const searchQuery = ref('')

const showDetailModal = ref(false)
const selectedUpload = ref(null)
const adminNote = ref('')

const confirmLoading = ref(false)
const confirmState = ref({
  open: false,
  action: '',
  status: '',
  upload: null,
  title: '',
  message: '',
  confirmLabel: '',
  icon: 'bi bi-exclamation-triangle-fill',
  variant: 'btn-primary',
  note: ''
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

const errorMessage = computed(() => uploadsError.value || statsError.value || '')

const loadingAny = computed(() => loadingUploads.value || loadingStats.value)

const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(Number(value) || 0)

const lastUpdatedLabel = computed(() => {
  const date = new Date(lastUpdatedAt.value || Date.now())
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date)
})

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatFileSize = (bytes) => {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n <= 0) return '-'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)))
  const value = n / Math.pow(1024, i)
  const fixed = i === 0 ? 0 : value >= 10 ? 1 : 2
  return `${value.toFixed(fixed)} ${units[i]}`
}

const statusLabel = (status) => {
  const labels = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }
  return labels[status] || status || '-'
}

const statusTone = (status) => {
  if (status === 'approved') return 'pill--success'
  if (status === 'rejected') return 'pill--danger'
  return 'pill--warning'
}

const statusIcon = (status) => {
  if (status === 'approved') return 'bi bi-check-circle-fill'
  if (status === 'rejected') return 'bi bi-x-circle-fill'
  return 'bi bi-hourglass-split'
}

const uploaderName = (upload) => upload?.uploader?.name || upload?.uploader?.username || 'Unknown'
const uploaderEmail = (upload) => upload?.uploader?.email || '-'

const statCards = computed(() => [
  {
    key: 'total',
    label: 'Total Upload',
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
    label: 'Approved',
    value: stats.value.approved || 0,
    icon: 'bi bi-check-circle-fill',
    tone: 'tone-green',
    statusFilter: 'approved',
    linkLabel: 'Lihat'
  },
  {
    key: 'rejected',
    label: 'Rejected',
    value: stats.value.rejected || 0,
    icon: 'bi bi-x-circle-fill',
    tone: 'tone-blue',
    statusFilter: 'rejected',
    linkLabel: 'Lihat'
  }
])

const displayedUploads = computed(() => {
  const list = Array.isArray(uploads.value) ? uploads.value : []
  const q = String(searchQuery.value || '').trim().toLowerCase()
  if (!q) return list

  return list.filter((u) => {
    const hay = [
      u?.title,
      u?.artist,
      u?.genre,
      u?.language,
      uploaderName(u),
      uploaderEmail(u),
      statusLabel(u?.status),
      u?.admin_note
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
})

const resolveMediaUrl = (url) => {
  if (!url) return ''

  let cleaned = String(url).trim()
  if (cleaned.includes('localhost')) cleaned = cleaned.replace(/^http(s)?:\/\/localhost(:\d+)?/, '')
  if (cleaned.startsWith('http')) return cleaned

  const baseUrl = API_URL.endsWith('/api') ? API_URL.replace('/api', '') : API_URL
  if (baseUrl.includes('localhost')) return cleaned.startsWith('/') ? cleaned : `/${cleaned}`

  return `${baseUrl}${cleaned.startsWith('/') ? '' : '/'}${cleaned}`
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

const fetchUploads = async () => {
  loadingUploads.value = true
  uploadsError.value = ''

  try {
    const params = {
      status: filterStatus.value || undefined,
      page: meta.value.page || 1,
      limit: meta.value.limit || 20
    }
    const response = await adminAPI.getUploads(params)

    uploads.value = response.data.data || []
    const responseMeta = response.data.meta || {}
    meta.value = {
      total: Number(responseMeta.total) || 0,
      page: Number(responseMeta.page) || 1,
      limit: Number(responseMeta.limit) || (meta.value.limit || 20),
      totalPages: Number(responseMeta.totalPages) || 1
    }

    lastUpdatedAt.value = Date.now()
  } catch (error) {
    console.error('Error fetching uploads:', error)
    uploadsError.value = error.response?.data?.message || 'Gagal memuat daftar upload'
    uploads.value = []
  } finally {
    loadingUploads.value = false
  }
}

const getTotalForStatus = async (status) => {
  const response = await adminAPI.getUploads({
    status: status || undefined,
    page: 1,
    limit: 1
  })
  return Number(response.data.meta?.total) || 0
}

const fetchStats = async () => {
  loadingStats.value = true
  statsError.value = ''

  try {
    const [total, pending, approved, rejected] = await Promise.all([
      getTotalForStatus(''),
      getTotalForStatus('pending'),
      getTotalForStatus('approved'),
      getTotalForStatus('rejected')
    ])
    stats.value = { total, pending, approved, rejected }
    lastUpdatedAt.value = Date.now()
  } catch (error) {
    console.error('Error fetching upload stats:', error)
    statsError.value = error.response?.data?.message || 'Gagal memuat statistik upload'
    stats.value = { total: 0, pending: 0, approved: 0, rejected: 0 }
  } finally {
    loadingStats.value = false
  }
}

const refreshAll = async () => {
  await Promise.all([fetchStats(), fetchUploads()])
}

const applyStatusFilter = (value) => {
  filterStatus.value = value
}

watch(filterStatus, () => {
  meta.value.page = 1
  fetchUploads()
})

watch(
  () => meta.value.limit,
  () => {
    meta.value.page = 1
    fetchUploads()
  }
)

const goToPage = (page) => {
  const next = Math.max(1, Math.min(Number(page) || 1, meta.value.totalPages || 1))
  if (next === meta.value.page) return
  meta.value.page = next
  fetchUploads()
}

const openDetail = (upload) => {
  selectedUpload.value = upload
  adminNote.value = upload?.admin_note || ''
  showDetailModal.value = true
}

const closeDetail = () => {
  showDetailModal.value = false
}

const openConfirmDelete = (upload) => {
  if (!upload) return
  confirmState.value = {
    open: true,
    action: 'delete',
    status: '',
    upload,
    title: 'Hapus upload ini?',
    message: 'Upload yang sudah approved tidak bisa dihapus.',
    confirmLabel: 'Hapus',
    icon: 'bi bi-trash',
    variant: 'btn-danger',
    note: ''
  }
}

const openConfirmReview = (upload, status, notePrefill) => {
  if (!upload) return
  const isApprove = status === 'approved'
  confirmState.value = {
    open: true,
    action: 'review',
    status,
    upload,
    title: isApprove ? 'Approve upload ini?' : 'Reject upload ini?',
    message: isApprove
      ? 'Upload akan diproses dan dibuatkan lagu baru di katalog.'
      : 'Upload akan ditolak dan file akan dihapus dari server.',
    confirmLabel: isApprove ? 'Approve' : 'Reject',
    icon: isApprove ? 'bi bi-check-lg' : 'bi bi-x-lg',
    variant: isApprove ? 'btn-success' : 'btn-danger',
    note: String(notePrefill || '')
  }
}

const closeConfirm = () => {
  if (confirmLoading.value) return
  confirmState.value.open = false
}

const reviewUpload = async (upload, status, note) => {
  if (!upload?.id) return

  try {
    await adminAPI.reviewUpload(upload.id, status, note || '')
    triggerToast(status === 'approved' ? 'Upload berhasil di-approve' : 'Upload berhasil di-reject', 'success')
    if (selectedUpload.value?.id === upload.id) {
      showDetailModal.value = false
    }
    await refreshAll()
  } catch (error) {
    console.error('Error reviewing upload:', error)
    triggerToast(error.response?.data?.message || 'Gagal memproses upload', 'danger')
  }
}

const deleteUpload = async (upload) => {
  if (!upload?.id) return

  try {
    await adminAPI.deleteUpload(upload.id)
    triggerToast('Upload berhasil dihapus', 'success')
    if (selectedUpload.value?.id === upload.id) {
      showDetailModal.value = false
    }
    await refreshAll()
  } catch (error) {
    console.error('Error deleting upload:', error)
    triggerToast(error.response?.data?.message || 'Gagal menghapus upload', 'danger')
  }
}

const runConfirmAction = async () => {
  if (!confirmState.value.open || confirmLoading.value) return

  confirmLoading.value = true
  try {
    if (confirmState.value.action === 'delete') {
      await deleteUpload(confirmState.value.upload)
    } else if (confirmState.value.action === 'review') {
      await reviewUpload(confirmState.value.upload, confirmState.value.status, confirmState.value.note)
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
.admin-uploads {
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

/* Uploads */
.uploads-panel {
  margin-bottom: 1.25rem;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.12);
  background: rgba(0, 0, 0, 0.14);
}

.uploads-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1020px;
}

.uploads-table th,
.uploads-table td {
  padding: 0.85rem 0.95rem;
  border-bottom: 1px solid rgba(94, 234, 212, 0.12);
  vertical-align: middle;
}

.uploads-table th {
  position: sticky;
  top: 0;
  background: rgba(4, 12, 16, 0.78);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  font-size: 0.82rem;
  color: var(--text-muted);
  font-weight: 750;
  text-align: left;
}

.uploads-table tbody tr:hover td {
  background: rgba(255, 255, 255, 0.03);
}

.th-actions,
.td-actions {
  text-align: right;
}

.td-date,
.td-size {
  white-space: nowrap;
  color: var(--text-secondary);
}

.upload-cell {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-width: 0;
}

.upload-thumb {
  width: 72px;
  height: 44px;
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.04);
  overflow: hidden;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
}

.upload-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.upload-thumb--sm {
  width: 64px;
  height: 40px;
}

.thumb-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: rgba(165, 243, 252, 0.92);
}

.upload-info {
  min-width: 0;
}

.upload-title {
  font-weight: 900;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 52ch;
}

.upload-sub {
  margin-top: 0.15rem;
  font-size: 0.85rem;
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
}

.dot {
  opacity: 0.6;
}

.note-pill {
  margin-top: 0.35rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(165, 243, 252, 0.98);
  font-weight: 700;
  font-size: 0.78rem;
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
.upload-cards {
  display: none;
  margin-top: 0.85rem;
  gap: 0.85rem;
}

.upload-card {
  border-radius: 22px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.16);
  padding: 0.9rem;
  display: grid;
  gap: 0.75rem;
}

.upload-card__top {
  display: flex;
  justify-content: space-between;
  gap: 0.9rem;
  align-items: flex-start;
}

.upload-card__left {
  display: flex;
  gap: 0.8rem;
  min-width: 0;
}

.upload-card__copy {
  min-width: 0;
}

.upload-card__meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.upload-card__note {
  padding: 0.75rem;
  border-radius: 18px;
  border: 1px solid rgba(94, 234, 212, 0.12);
  background: rgba(0, 0, 0, 0.14);
}

.note-label {
  font-size: 0.8rem;
  font-weight: 700;
}

.note-text {
  margin-top: 0.35rem;
  line-height: 1.5;
}

.upload-card__actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: center;
}

.upload-card--skeleton {
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

/* Detail */
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
}

.detail-card--main {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.12) 0%,
    rgba(6, 182, 212, 0.1) 55%,
    rgba(59, 130, 246, 0.12) 100%
  );
}

.detail-card--thumb {
  display: grid;
  gap: 0.45rem;
}

.detail-label {
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 700;
}

.detail-title {
  font-weight: 900;
  letter-spacing: -0.01em;
  margin-top: 0.35rem;
}

.detail-value {
  font-weight: 900;
  margin-top: 0.35rem;
}

.detail-sub {
  margin-top: 0.25rem;
  font-size: 0.9rem;
}

.thumb-preview {
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
  width: 100%;
  height: 92px;
  display: grid;
  place-items: center;
}

.thumb-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-empty {
  padding: 0 0.75rem;
}

.detail-section {
  display: grid;
  gap: 0.5rem;
}

.section-title {
  font-weight: 900;
  letter-spacing: -0.01em;
}

.hint {
  font-size: 0.88rem;
}

.review-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.review-item {
  border-radius: 18px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.16);
  padding: 0.85rem 0.9rem;
}

.review-value {
  margin-top: 0.3rem;
  font-weight: 900;
}

/* Confirm */
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

.confirm-note {
  margin-top: 0.85rem;
  display: grid;
  gap: 0.35rem;
}

.confirm-note__title {
  font-weight: 900;
  letter-spacing: -0.01em;
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
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
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

  .filters-row {
    grid-template-columns: 1fr;
  }

  .table-wrap {
    display: none;
  }

  .upload-cards {
    display: grid;
  }

  .detail-grid,
  .detail-grid--secondary {
    grid-template-columns: 1fr;
  }

  .review-grid {
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
