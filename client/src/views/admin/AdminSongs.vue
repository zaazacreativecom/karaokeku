<template>
  <div class="admin-songs">
    <header class="page-header reveal" style="--d: 0ms">
      <div class="page-header__copy">
        <div class="page-badge">
          <i class="bi bi-music-note-list" aria-hidden="true"></i>
          <span>Manajemen Lagu</span>
        </div>
        <h1>Kelola Lagu dengan cepat & rapi</h1>
        <p class="text-muted">
          Cari, filter, edit metadata, dan upload thumbnail. Semua konsisten dengan tema green–blue gradient.
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
        <button class="btn btn-primary" type="button" @click="openCreateModal">
          <i class="bi bi-plus-lg" aria-hidden="true"></i>
          Tambah Lagu
        </button>
      </div>
    </header>

    <div v-if="errorMessage && !loadingAny" class="alert-card alert-card--danger reveal" style="--d: 60ms" role="status">
      <div class="alert-icon" aria-hidden="true">
        <i class="bi bi-exclamation-triangle-fill"></i>
      </div>
      <div class="alert-body">
        <div class="alert-title">Gagal memuat data lagu</div>
        <div class="alert-text text-muted">{{ errorMessage }}</div>
      </div>
      <button class="btn btn-ghost btn-sm" type="button" @click="refreshAll">
        <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
        Coba lagi
      </button>
    </div>

    <!-- Stats -->
    <section class="stats-grid reveal" style="--d: 90ms" aria-label="Ringkasan lagu">
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
          <button
            v-if="card.statusFilter !== undefined"
            class="stat-link"
            type="button"
            @click="applyStatusFilter(card.statusFilter)"
          >
            <span>{{ card.linkLabel }}</span>
            <i class="bi bi-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </template>
    </section>

    <!-- Filters -->
    <section class="panel filters-panel reveal" style="--d: 120ms" aria-label="Filter lagu">
      <div class="panel-header panel-header--compact">
        <div class="panel-title">
          <div class="panel-icon panel-icon--soft" aria-hidden="true">
            <i class="bi bi-funnel-fill"></i>
          </div>
          <div class="panel-title__copy">
            <h2>Filter</h2>
            <p class="text-muted">Cari berdasarkan judul/artis, dan filter status/genre/bahasa.</p>
          </div>
        </div>
      </div>

      <div class="panel-body">
        <div class="filters-row">
          <div class="field field--small">
            <label class="field-label" for="song-status">Status</label>
            <select id="song-status" v-model="filterStatus" class="form-select" :disabled="loadingSongs">
              <option value="">Semua</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div class="field field--small">
            <label class="field-label" for="song-genre">Genre</label>
            <select id="song-genre" v-model="filterGenre" class="form-select" :disabled="loadingSongs || loadingFilterLists">
              <option value="">Semua</option>
              <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>

          <div class="field field--small">
            <label class="field-label" for="song-language">Bahasa</label>
            <select id="song-language" v-model="filterLanguage" class="form-select" :disabled="loadingSongs || loadingFilterLists">
              <option value="">Semua</option>
              <option v-for="l in languages" :key="l" :value="l">{{ l }}</option>
            </select>
          </div>

          <div class="field field--grow">
            <label class="field-label" for="song-search">Cari</label>
            <div class="search-control">
              <i class="bi bi-search" aria-hidden="true"></i>
              <input id="song-search" v-model="searchQuery" type="text" class="form-control" placeholder="Cari judul, artis…" />
              <button
                v-if="searchQuery"
                class="icon-clear"
                type="button"
                @click="searchQuery = ''"
                aria-label="Hapus pencarian"
              >
                <i class="bi bi-x-circle-fill" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <div class="field field--xs">
            <label class="field-label" for="song-limit">Per halaman</label>
            <select id="song-limit" v-model.number="limit" class="form-select" :disabled="loadingSongs">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- List -->
    <section class="panel songs-panel reveal" style="--d: 150ms" aria-label="Daftar lagu">
      <div class="panel-header">
        <div class="panel-title">
          <div class="panel-icon" aria-hidden="true">
            <i class="bi bi-collection-play"></i>
          </div>
          <div class="panel-title__copy">
            <h2>Daftar Lagu</h2>
            <p class="text-muted">
              Menampilkan <strong>{{ formatNumber(songs.length) }}</strong> dari <strong>{{ formatNumber(meta.total) }}</strong> data.
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
        <div class="table-wrap" aria-label="Tabel lagu">
          <table class="songs-table">
            <thead>
              <tr>
                <th>Lagu</th>
                <th>Genre</th>
                <th>Bahasa</th>
                <th>Play</th>
                <th>Status</th>
                <th class="th-actions">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="loadingSongs">
                <tr v-for="n in 8" :key="n" class="tr-skeleton">
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                  <td><div class="skeleton-cell loading-skeleton"></div></td>
                </tr>
              </template>

              <template v-else>
                <tr v-for="song in songs" :key="song.id">
                  <td class="td-song">
                    <div class="song-cell">
                      <div class="song-thumb" aria-hidden="true">
                        <img v-if="song.thumbnail_url" :src="resolveMediaUrl(song.thumbnail_url)" alt="" loading="lazy" />
                        <div v-else class="thumb-fallback">
                          <i class="bi bi-music-note" aria-hidden="true"></i>
                        </div>
                      </div>
                      <div class="song-info">
                        <div class="song-title" :title="song.title">{{ song.title }}</div>
                        <div class="song-sub text-muted">
                          <span class="song-artist" :title="song.artist">{{ song.artist }}</span>
                          <span class="song-id text-muted">#{{ song.id }}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="pill pill--soft">
                      <i class="bi bi-tag" aria-hidden="true"></i>
                      {{ song.genre || '-' }}
                    </span>
                  </td>
                  <td>
                    <span class="pill pill--soft">
                      <i class="bi bi-translate" aria-hidden="true"></i>
                      {{ song.language || '-' }}
                    </span>
                  </td>
                  <td class="td-play">
                    <span class="pill">
                      <i class="bi bi-play-fill" aria-hidden="true"></i>
                      {{ formatNumber(song.play_count) }}
                    </span>
                  </td>
                  <td>
                    <span class="pill" :class="statusTone(song.status)">
                      <i :class="statusIcon(song.status)" aria-hidden="true"></i>
                      {{ statusLabel(song.status) }}
                    </span>
                  </td>
                  <td class="td-actions">
                    <div class="row-actions">
                      <button class="btn btn-ghost btn-sm btn-icon" type="button" @click="openEditModal(song)" aria-label="Edit">
                        <i class="bi bi-pencil" aria-hidden="true"></i>
                      </button>
                      <button
                        class="btn btn-ghost btn-sm btn-icon btn-icon--danger"
                        type="button"
                        @click="openConfirmDelete(song)"
                        aria-label="Hapus"
                      >
                        <i class="bi bi-trash" aria-hidden="true"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="!songs.length" class="tr-empty">
                  <td colspan="6">
                    <div class="empty-state">
                      <div class="empty-icon" aria-hidden="true"><i class="bi bi-music-note-beamed"></i></div>
                      <h3>Tidak ada lagu ditemukan</h3>
                      <p class="text-muted">Coba ubah filter atau kata kunci pencarian.</p>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <div class="song-cards" aria-label="Daftar lagu (mobile)">
          <template v-if="loadingSongs">
            <div v-for="n in 6" :key="n" class="song-card song-card--skeleton">
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
            <div v-for="song in songs" :key="song.id" class="song-card">
              <div class="song-card__top">
                <div class="song-card__left">
                  <div class="song-thumb song-thumb--sm" aria-hidden="true">
                    <img v-if="song.thumbnail_url" :src="resolveMediaUrl(song.thumbnail_url)" alt="" loading="lazy" />
                    <div v-else class="thumb-fallback">
                      <i class="bi bi-music-note" aria-hidden="true"></i>
                    </div>
                  </div>
                  <div class="song-card__copy">
                    <div class="song-title" :title="song.title">{{ song.title }}</div>
                    <div class="song-sub text-muted">
                      <span :title="song.artist">{{ song.artist }}</span>
                      <span class="song-id text-muted">#{{ song.id }}</span>
                    </div>
                  </div>
                </div>
                <span class="pill" :class="statusTone(song.status)">
                  <i :class="statusIcon(song.status)" aria-hidden="true"></i>
                  {{ statusLabel(song.status) }}
                </span>
              </div>

              <div class="song-card__meta">
                <span class="pill pill--soft">
                  <i class="bi bi-tag" aria-hidden="true"></i>
                  {{ song.genre || '-' }}
                </span>
                <span class="pill pill--soft">
                  <i class="bi bi-translate" aria-hidden="true"></i>
                  {{ song.language || '-' }}
                </span>
                <span class="pill">
                  <i class="bi bi-play-fill" aria-hidden="true"></i>
                  {{ formatNumber(song.play_count) }}
                </span>
              </div>

              <div class="song-card__actions">
                <button class="btn btn-ghost btn-sm" type="button" @click="openEditModal(song)">
                  <i class="bi bi-pencil" aria-hidden="true"></i>
                  Edit
                </button>
                <button class="btn btn-ghost btn-sm btn-icon btn-icon--danger" type="button" @click="openConfirmDelete(song)" aria-label="Hapus">
                  <i class="bi bi-trash" aria-hidden="true"></i>
                </button>
              </div>
            </div>

            <div v-if="!songs.length" class="empty-state">
              <div class="empty-icon" aria-hidden="true"><i class="bi bi-music-note-beamed"></i></div>
              <h3>Tidak ada lagu ditemukan</h3>
              <p class="text-muted">Coba ubah filter atau kata kunci pencarian.</p>
            </div>
          </template>
        </div>

        <!-- Pagination -->
        <div v-if="meta.totalPages > 1" class="pagination-row">
          <button class="btn btn-ghost btn-sm" type="button" @click="goToPage(meta.page - 1)" :disabled="loadingSongs || meta.page <= 1">
            <i class="bi bi-chevron-left" aria-hidden="true"></i>
            Sebelumnya
          </button>
          <div class="page-indicator text-muted">
            Halaman <strong>{{ meta.page }}</strong> / {{ meta.totalPages }}
          </div>
          <button class="btn btn-ghost btn-sm" type="button" @click="goToPage(meta.page + 1)" :disabled="loadingSongs || meta.page >= meta.totalPages">
            Berikutnya
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- Create/Edit Modal -->
    <transition name="ad-modal">
      <div v-if="showModal" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Form lagu" @click.self="closeModal">
        <div class="modal-content modal-content--wide">
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon" aria-hidden="true"><i class="bi bi-music-note"></i></div>
              <div class="modal-title__copy">
                <h3>{{ editingId ? 'Edit Lagu' : 'Tambah Lagu Baru' }}</h3>
                <p class="text-muted">Pastikan judul dan artis diisi, serta URL video benar.</p>
              </div>
            </div>
            <button class="icon-close" type="button" @click="closeModal" aria-label="Tutup modal">
              <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </div>

          <form @submit.prevent="saveSong">
            <div class="modal-body">
              <div class="form-grid form-grid--2">
                <div class="field">
                  <label class="field-label" for="song-title">Judul *</label>
                  <input id="song-title" type="text" class="form-control" v-model="form.title" required />
                </div>
                <div class="field">
                  <label class="field-label" for="song-artist">Artis *</label>
                  <input id="song-artist" type="text" class="form-control" v-model="form.artist" required />
                </div>
              </div>

              <div class="form-grid form-grid--3">
                <div class="field">
                  <label class="field-label" for="song-genre-input">Genre</label>
                  <input id="song-genre-input" type="text" class="form-control" v-model="form.genre" placeholder="Pop, Rock, Dangdut…" />
                </div>
                <div class="field">
                  <label class="field-label" for="song-language-input">Bahasa</label>
                  <input id="song-language-input" type="text" class="form-control" v-model="form.language" placeholder="Indonesia, English…" />
                </div>
                <div class="field">
                  <label class="field-label" for="song-status-input">Status</label>
                  <select id="song-status-input" class="form-select" v-model="form.status">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div class="section-card">
                <div class="section-head">
                  <div class="section-title">Video</div>
                  <div class="section-sub text-muted">Gunakan URL yang bisa diakses publik, contoh: <code>/videos/lagu.mp4</code></div>
                </div>
                <div class="form-grid form-grid--2">
                  <div class="field">
                    <label class="field-label" for="song-video-full">URL Video Full (Vocal)</label>
                    <input id="song-video-full" type="text" class="form-control" v-model="form.video_url_full" placeholder="/videos/nama-file.mp4" />
                  </div>
                  <div class="field">
                    <label class="field-label" for="song-video-ins">URL Video Instrumental</label>
                    <input id="song-video-ins" type="text" class="form-control" v-model="form.video_url_instrumental" placeholder="/videos/nama-file.mp4" />
                  </div>
                </div>
              </div>

              <div class="section-card">
                <div class="section-head">
                  <div class="section-title">Thumbnail</div>
                  <div class="section-sub text-muted">Upload gambar atau biarkan kosong untuk auto-generate.</div>
                </div>
                <div class="thumb-row">
                  <div class="thumb-uploader">
                    <input
                      :key="thumbInputKey"
                      type="file"
                      class="form-control"
                      @change="handleThumbSelect"
                      accept="image/*"
                      aria-label="Upload thumbnail"
                    />
                  </div>
                  <div class="thumb-preview" aria-label="Preview thumbnail">
                    <img v-if="thumbnailPreviewUrl" :src="thumbnailPreviewUrl" alt="Preview thumbnail" />
                    <div v-else class="thumb-empty">
                      <i class="bi bi-image" aria-hidden="true"></i>
                      <span class="text-muted">Belum ada thumbnail</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" @click="closeModal" :disabled="saving">Batal</button>

              <button
                v-if="editingId"
                type="button"
                class="btn btn-ghost btn-icon btn-icon--danger"
                @click="openConfirmDelete({ ...form, id: editingId })"
                aria-label="Hapus lagu"
                :disabled="saving"
              >
                <i class="bi bi-trash" aria-hidden="true"></i>
              </button>

              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner" aria-hidden="true"></span>
                <i v-else class="bi bi-check-lg" aria-hidden="true"></i>
                {{ saving ? 'Menyimpan…' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Confirm Delete -->
    <transition name="ad-modal">
      <div v-if="confirmState.open" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Konfirmasi hapus lagu" @click.self="closeConfirm">
        <div class="modal-content modal-content--confirm">
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon" aria-hidden="true">
                <i class="bi bi-trash"></i>
              </div>
              <div class="modal-title__copy">
                <h3>Hapus lagu ini?</h3>
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
                <div class="confirm-label text-muted">Judul</div>
                <div class="confirm-value">{{ confirmState.song?.title || '-' }}</div>
              </div>
              <div class="confirm-item">
                <div class="confirm-label text-muted">Artis</div>
                <div class="confirm-value">{{ confirmState.song?.artist || '-' }}</div>
              </div>
              <div class="confirm-item">
                <div class="confirm-label text-muted">ID</div>
                <div class="confirm-value">#{{ confirmState.song?.id || '-' }}</div>
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { adminAPI, songsAPI } from '@/services/api'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const songs = ref([])
const meta = ref({ total: 0, page: 1, limit: 20, totalPages: 1 })
const stats = ref({ totalSongs: 0, activeSongs: 0, inactiveSongs: 0, totalPlays: 0, playsToday: 0 })

const genres = ref([])
const languages = ref([])
const loadingFilterLists = ref(true)

const loadingSongs = ref(true)
const loadingStats = ref(true)
const errorMessage = ref('')
const lastUpdatedAt = ref(Date.now())

const filterStatus = ref('')
const filterGenre = ref('')
const filterLanguage = ref('')
const searchQuery = ref('')

const showModal = ref(false)
const editingId = ref(null)
const saving = ref(false)
const form = ref({
  title: '',
  artist: '',
  genre: '',
  language: '',
  status: 'active',
  video_url_full: '',
  video_url_instrumental: '',
  thumbnail_url: ''
})

const thumbInputKey = ref(0)
const thumbFile = ref(null)
const thumbPreview = ref(null)

const confirmLoading = ref(false)
const confirmState = ref({ open: false, song: null })

const showToast = ref(false)
const toastMessage = ref('')
const toastTone = ref('success')
let toastTimeout = null
let searchTimeout = null

const loadingAny = computed(() => loadingSongs.value || loadingStats.value)

const limit = computed({
  get: () => meta.value.limit || 20,
  set: (value) => {
    meta.value.page = 1
    meta.value.limit = Number(value) || 20
  }
})

const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(Number(value) || 0)

const lastUpdatedLabel = computed(() => {
  const date = new Date(lastUpdatedAt.value || Date.now())
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date)
})

const statusLabel = (status) => {
  const labels = { active: 'Active', inactive: 'Inactive' }
  return labels[status] || status || '-'
}

const statusTone = (status) => {
  if (status === 'active') return 'pill--success'
  if (status === 'inactive') return 'pill--danger'
  return 'pill--soft'
}

const statusIcon = (status) => {
  if (status === 'active') return 'bi bi-check-circle-fill'
  if (status === 'inactive') return 'bi bi-slash-circle-fill'
  return 'bi bi-dot'
}

const resolveMediaUrl = (url) => {
  if (!url) return ''

  let cleaned = String(url).trim()
  if (cleaned.includes('localhost')) cleaned = cleaned.replace(/^http(s)?:\/\/localhost(:\d+)?/, '')
  if (cleaned.startsWith('http')) return cleaned

  const baseUrl = API_URL.endsWith('/api') ? API_URL.replace('/api', '') : API_URL
  if (baseUrl.includes('localhost')) return cleaned.startsWith('/') ? cleaned : `/${cleaned}`
  return `${baseUrl}${cleaned.startsWith('/') ? '' : '/'}${cleaned}`
}

const thumbnailPreviewUrl = computed(() => {
  if (thumbPreview.value) return thumbPreview.value
  if (form.value.thumbnail_url) return resolveMediaUrl(form.value.thumbnail_url)
  return ''
})

const statCards = computed(() => [
  {
    key: 'totalSongs',
    label: 'Total Lagu',
    value: stats.value.totalSongs || 0,
    icon: 'bi bi-collection',
    tone: 'tone-cyan',
    statusFilter: '',
    linkLabel: 'Lihat'
  },
  {
    key: 'activeSongs',
    label: 'Active',
    value: stats.value.activeSongs || 0,
    icon: 'bi bi-check-circle-fill',
    tone: 'tone-green',
    statusFilter: 'active',
    linkLabel: 'Filter'
  },
  {
    key: 'inactiveSongs',
    label: 'Inactive',
    value: stats.value.inactiveSongs || 0,
    icon: 'bi bi-slash-circle-fill',
    tone: 'tone-blue',
    statusFilter: 'inactive',
    linkLabel: 'Filter'
  },
  {
    key: 'totalPlays',
    label: 'Total Play',
    value: stats.value.totalPlays || 0,
    icon: 'bi bi-play-circle-fill',
    tone: 'tone-cyan'
  },
  {
    key: 'playsToday',
    label: 'Play Hari Ini',
    value: stats.value.playsToday || 0,
    icon: 'bi bi-calendar2-check-fill',
    tone: 'tone-blue',
    hint: 'Dari semua lagu'
  }
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

const revokeThumbPreview = () => {
  const url = thumbPreview.value
  if (typeof url === 'string' && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url)
    } catch (_) {
      // ignore
    }
  }
  thumbPreview.value = null
}

const resetForm = () => {
  form.value = {
    title: '',
    artist: '',
    genre: '',
    language: '',
    status: 'active',
    video_url_full: '',
    video_url_instrumental: '',
    thumbnail_url: ''
  }
}

const fetchFilterLists = async () => {
  loadingFilterLists.value = true
  try {
    const [genresRes, languagesRes] = await Promise.all([songsAPI.getGenres(), songsAPI.getLanguages()])
    genres.value = genresRes.data.data || []
    languages.value = languagesRes.data.data || []
  } catch (error) {
    console.error('Error fetching genres/languages:', error)
    genres.value = []
    languages.value = []
  } finally {
    loadingFilterLists.value = false
  }
}

const fetchStats = async () => {
  loadingStats.value = true
  errorMessage.value = ''
  try {
    const response = await adminAPI.getDashboard()
    const data = response.data.data || {}
    const totalSongs = Number(data.totalSongs) || 0
    const activeSongs = Number(data.activeSongs) || 0
    stats.value = {
      totalSongs,
      activeSongs,
      inactiveSongs: Math.max(0, totalSongs - activeSongs),
      totalPlays: Number(data.totalPlays) || 0,
      playsToday: Number(data.playsToday) || 0
    }
    lastUpdatedAt.value = Date.now()
  } catch (error) {
    console.error('Error fetching stats:', error)
    errorMessage.value = error.response?.data?.message || 'Gagal memuat ringkasan lagu'
  } finally {
    loadingStats.value = false
  }
}

const fetchSongs = async () => {
  loadingSongs.value = true
  errorMessage.value = ''
  try {
    const params = {
      search: searchQuery.value || undefined,
      status: filterStatus.value || undefined,
      genre: filterGenre.value || undefined,
      language: filterLanguage.value || undefined,
      page: meta.value.page || 1,
      limit: meta.value.limit || 20
    }
    const response = await adminAPI.getSongs(params)
    songs.value = response.data.data || []

    const responseMeta = response.data.meta || {}
    meta.value = {
      total: Number(responseMeta.total) || 0,
      page: Number(responseMeta.page) || 1,
      limit: Number(responseMeta.limit) || (meta.value.limit || 20),
      totalPages: Number(responseMeta.totalPages) || 1
    }

    lastUpdatedAt.value = Date.now()
  } catch (error) {
    console.error('Error fetching songs:', error)
    errorMessage.value = error.response?.data?.message || 'Gagal memuat daftar lagu'
    songs.value = []
  } finally {
    loadingSongs.value = false
  }
}

const refreshAll = async () => {
  await Promise.all([fetchStats(), fetchSongs()])
}

const applyStatusFilter = (value) => {
  filterStatus.value = value
}

watch(filterStatus, () => {
  meta.value.page = 1
  fetchSongs()
})

watch(filterGenre, () => {
  meta.value.page = 1
  fetchSongs()
})

watch(filterLanguage, () => {
  meta.value.page = 1
  fetchSongs()
})

watch(
  () => meta.value.limit,
  () => {
    meta.value.page = 1
    fetchSongs()
  }
)

watch(searchQuery, () => {
  meta.value.page = 1
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchSongs, 300)
})

const goToPage = (page) => {
  const next = Math.max(1, Math.min(Number(page) || 1, meta.value.totalPages || 1))
  if (next === meta.value.page) return
  meta.value.page = next
  fetchSongs()
}

const openCreateModal = () => {
  editingId.value = null
  resetForm()
  thumbFile.value = null
  revokeThumbPreview()
  thumbInputKey.value += 1
  showModal.value = true
}

const openEditModal = (song) => {
  editingId.value = song?.id || null
  form.value = {
    title: song?.title || '',
    artist: song?.artist || '',
    genre: song?.genre || '',
    language: song?.language || '',
    status: song?.status || 'active',
    video_url_full: song?.video_url_full || '',
    video_url_instrumental: song?.video_url_instrumental || '',
    thumbnail_url: song?.thumbnail_url || ''
  }
  thumbFile.value = null
  revokeThumbPreview()
  thumbInputKey.value += 1
  showModal.value = true
}

const handleThumbSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  revokeThumbPreview()
  thumbFile.value = file
  thumbPreview.value = URL.createObjectURL(file)
}

const closeModal = () => {
  if (saving.value) return
  showModal.value = false
  editingId.value = null
  thumbFile.value = null
  revokeThumbPreview()
  thumbInputKey.value += 1
}

const saveSong = async () => {
  saving.value = true
  try {
    const payload = {
      title: String(form.value.title || '').trim(),
      artist: String(form.value.artist || '').trim(),
      genre: String(form.value.genre || '').trim() || null,
      language: String(form.value.language || '').trim() || null,
      status: form.value.status || 'active',
      video_url_full: String(form.value.video_url_full || '').trim() || null,
      video_url_instrumental: String(form.value.video_url_instrumental || '').trim() || null,
      thumbnail_url: String(form.value.thumbnail_url || '').trim() || null
    }

    let songId = editingId.value

    if (editingId.value) {
      await adminAPI.updateSong(editingId.value, payload)
      triggerToast('Lagu berhasil diupdate', 'success')
    } else {
      const res = await adminAPI.createSong(payload)
      songId = res.data.data?.id
      triggerToast('Lagu berhasil ditambahkan', 'success')
    }

    if (thumbFile.value && songId) {
      const formData = new FormData()
      formData.append('thumbnail', thumbFile.value)
      await adminAPI.uploadThumbnail(songId, formData)
      triggerToast('Thumbnail berhasil diupload', 'info')
    }

    closeModal()
    await refreshAll()
  } catch (error) {
    console.error('Error saving song:', error)
    triggerToast(error.response?.data?.message || 'Gagal menyimpan lagu', 'danger')
  } finally {
    saving.value = false
  }
}

const openConfirmDelete = (song) => {
  if (!song?.id) return
  confirmState.value = { open: true, song }
}

const closeConfirm = () => {
  if (confirmLoading.value) return
  confirmState.value.open = false
}

const runConfirmDelete = async () => {
  if (!confirmState.value.open || confirmLoading.value) return
  const song = confirmState.value.song
  if (!song?.id) return

  confirmLoading.value = true
  try {
    await adminAPI.deleteSong(song.id)
    triggerToast('Lagu berhasil dihapus', 'success')
    if (editingId.value === song.id) {
      closeModal()
    }
    await refreshAll()
  } catch (error) {
    console.error('Error deleting song:', error)
    triggerToast(error.response?.data?.message || 'Gagal menghapus lagu', 'danger')
  } finally {
    confirmLoading.value = false
    confirmState.value.open = false
  }
}

const onKeydown = (event) => {
  if (event.key !== 'Escape') return
  if (confirmState.value.open) return closeConfirm()
  if (showModal.value) return closeModal()
}

onMounted(async () => {
  await Promise.all([fetchFilterLists(), refreshAll()])
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (toastTimeout) clearTimeout(toastTimeout)
  if (searchTimeout) clearTimeout(searchTimeout)
  revokeThumbPreview()
})
</script>

<style scoped>
.admin-songs {
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
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  align-items: end;
}

.field {
  min-width: 0;
}

.field--small {
  flex: 0 0 190px;
}

.field--xs {
  flex: 0 0 160px;
}

.field--grow {
  flex: 1 1 320px;
  min-width: 240px;
}

.field-label {
  display: inline-flex;
  margin-bottom: 0.45rem;
  color: var(--text-secondary);
  font-weight: 650;
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

/* Songs */
.songs-panel {
  margin-bottom: 1.25rem;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.12);
  background: rgba(0, 0, 0, 0.14);
}

.songs-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 980px;
}

.songs-table th,
.songs-table td {
  padding: 0.85rem 0.95rem;
  border-bottom: 1px solid rgba(94, 234, 212, 0.12);
  vertical-align: middle;
}

.songs-table th {
  /* NOTE: sticky header + backdrop-filter bisa membuat layer transparan yang nge-block klik pada tbody di beberapa browser */
  position: static;
  background: rgba(4, 12, 16, 0.78);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  font-size: 0.82rem;
  color: var(--text-muted);
  font-weight: 750;
  text-align: left;
  pointer-events: none;
}

.songs-table tbody tr:hover td {
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

.td-play {
  white-space: nowrap;
}

.song-cell {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-width: 0;
}

.song-thumb {
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

.song-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.song-thumb--sm {
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

.song-info {
  min-width: 0;
}

.song-title {
  font-weight: 900;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 52ch;
}

.song-sub {
  margin-top: 0.15rem;
  font-size: 0.85rem;
  display: inline-flex;
  gap: 0.6rem;
  align-items: center;
}

.song-id {
  opacity: 0.85;
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
.song-cards {
  display: none;
  margin-top: 0.85rem;
  gap: 0.85rem;
}

.song-card {
  border-radius: 22px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.16);
  padding: 0.9rem;
  display: grid;
  gap: 0.75rem;
}

.song-card__top {
  display: flex;
  justify-content: space-between;
  gap: 0.9rem;
  align-items: flex-start;
}

.song-card__left {
  display: flex;
  gap: 0.8rem;
  min-width: 0;
}

.song-card__copy {
  min-width: 0;
}

.song-card__meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.song-card__actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: center;
}

.song-card--skeleton {
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
  width: min(820px, 100%);
  border-radius: 26px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(10, 22, 28, 0.82);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 22px 110px rgba(0, 0, 0, 0.65);
  overflow: hidden;
}

.modal-content--wide {
  width: min(980px, 100%);
}

.modal-content--confirm {
  width: min(640px, 100%);
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

/* Form */
.form-grid {
  display: grid;
  gap: 0.9rem;
}

.form-grid--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-grid--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.section-card {
  border-radius: 22px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.16);
  padding: 0.95rem;
  display: grid;
  gap: 0.85rem;
}

.section-head {
  display: grid;
  gap: 0.2rem;
}

.section-title {
  font-weight: 900;
  letter-spacing: -0.01em;
}

.section-sub code {
  color: rgba(165, 243, 252, 0.98);
}

.thumb-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 0.9rem;
  align-items: start;
}

.thumb-preview {
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
  width: 100%;
  height: 128px;
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
  display: grid;
  gap: 0.35rem;
  justify-items: center;
  color: rgba(165, 243, 252, 0.9);
}

.thumb-empty i {
  font-size: 1.4rem;
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

/* Buttons */
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
  .btn,
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

  .field--small {
    flex: 1 1 200px;
  }

  .field--xs {
    flex: 1 1 160px;
  }

  .form-grid--3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .thumb-row {
    grid-template-columns: 1fr;
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

  .table-wrap {
    display: none;
  }

  .song-cards {
    display: grid;
  }

  .form-grid--2,
  .form-grid--3 {
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
