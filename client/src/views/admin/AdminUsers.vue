<template>
  <div class="admin-users">
    <header class="page-header reveal" style="--d: 0ms">
      <div class="page-header__copy">
        <div class="page-badge">
          <i class="bi bi-people-fill" aria-hidden="true"></i>
          <span>Manajemen User</span>
        </div>
        <h1>Kelola user dengan aman & nyaman</h1>
        <p class="text-muted">
          Cari user, ubah role, dan pantau statistik singkat. Semua tampil rapi di desktop maupun mobile.
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
      </div>
    </header>

    <div v-if="errorMessage && !loadingAny" class="alert-card alert-card--danger reveal" style="--d: 60ms" role="status">
      <div class="alert-icon" aria-hidden="true">
        <i class="bi bi-exclamation-triangle-fill"></i>
      </div>
      <div class="alert-body">
        <div class="alert-title">Gagal memuat user</div>
        <div class="alert-text text-muted">{{ errorMessage }}</div>
      </div>
      <button class="btn btn-ghost btn-sm" type="button" @click="refreshAll">
        <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
        Coba lagi
      </button>
    </div>

    <!-- Stats -->
    <section class="stats-grid reveal" style="--d: 90ms" aria-label="Ringkasan user">
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
        </div>
      </template>
    </section>

    <!-- Filters -->
    <section class="panel filters-panel reveal" style="--d: 120ms" aria-label="Filter user">
      <div class="panel-header panel-header--compact">
        <div class="panel-title">
          <div class="panel-icon panel-icon--soft" aria-hidden="true">
            <i class="bi bi-funnel-fill"></i>
          </div>
          <div class="panel-title__copy">
            <h2>Filter</h2>
            <p class="text-muted">Cari berdasarkan nama, username, atau email.</p>
          </div>
        </div>
      </div>

      <div class="panel-body">
        <div class="filters-row">
          <div class="field">
            <label class="field-label" for="user-role">Role</label>
            <select id="user-role" v-model="filterRole" class="form-select" :disabled="loadingUsers">
              <option value="">Semua</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div class="field field--grow">
            <label class="field-label" for="user-search">Cari</label>
            <div class="search-control">
              <i class="bi bi-search" aria-hidden="true"></i>
              <input
                id="user-search"
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Cari nama, username, email…"
              />
              <button v-if="searchQuery" class="icon-clear" type="button" @click="searchQuery = ''" aria-label="Hapus pencarian">
                <i class="bi bi-x-circle-fill" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="user-limit">Per halaman</label>
            <select id="user-limit" v-model.number="limit" class="form-select" :disabled="loadingUsers">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>

        <div class="chips-row" aria-label="Shortcut filter">
          <button class="chip" type="button" :class="{ on: filterRole === '' }" @click="applyRoleFilter('')">
            <span>Semua</span>
            <span class="chip-count">{{ formatNumber(meta.total) }}</span>
          </button>
          <button class="chip" type="button" :class="{ on: filterRole === 'user' }" @click="applyRoleFilter('user')">
            <span>User</span>
            <span class="chip-count">{{ formatNumber(stats.totalUsers) }}</span>
          </button>
          <button class="chip" type="button" :class="{ on: filterRole === 'admin' }" @click="applyRoleFilter('admin')">
            <span>Admin</span>
            <span class="chip-count">{{ formatNumber(stats.totalAdmins) }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- List -->
    <section class="panel users-panel reveal" style="--d: 150ms" aria-label="Daftar user">
      <div class="panel-header">
        <div class="panel-title">
          <div class="panel-icon" aria-hidden="true">
            <i class="bi bi-person-lines-fill"></i>
          </div>
          <div class="panel-title__copy">
            <h2>Daftar User</h2>
            <p class="text-muted">
              Menampilkan <strong>{{ formatNumber(users.length) }}</strong> dari <strong>{{ formatNumber(meta.total) }}</strong> data.
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
        <div class="table-wrap" aria-label="Tabel user">
          <table class="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Lagu</th>
                <th>Score</th>
                <th>Bergabung</th>
                <th class="th-actions">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="loadingUsers">
                <tr v-for="n in 7" :key="n" class="tr-skeleton">
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
                <tr v-for="user in users" :key="user.id">
                  <td>
                    <div class="user-cell">
                      <div class="avatar-pill" aria-hidden="true">{{ initials(user.name) }}</div>
                      <div class="user-copy">
                        <div class="user-name" :title="user.name">{{ user.name }}</div>
                        <div class="user-sub text-muted">
                          <span class="user-username" :title="user.username">@{{ user.username }}</span>
                          <span class="dot">•</span>
                          <span class="user-id text-muted">#{{ user.id }}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="td-email" :title="user.email">{{ user.email }}</td>
                  <td>
                    <span class="pill" :class="roleTone(user.role)">
                      <i :class="roleIcon(user.role)" aria-hidden="true"></i>
                      {{ roleLabel(user.role) }}
                    </span>
                  </td>
                  <td class="td-metric">
                    <span class="pill pill--soft">
                      <i class="bi bi-music-note-beamed" aria-hidden="true"></i>
                      {{ formatNumber(user.total_songs_played || 0) }}
                    </span>
                  </td>
                  <td class="td-metric">
                    <span class="pill">
                      <i class="bi bi-trophy" aria-hidden="true"></i>
                      {{ formatNumber(user.total_score || 0) }}
                    </span>
                  </td>
                  <td class="td-date">{{ formatDate(user.created_at) }}</td>
                  <td class="td-actions">
                    <div class="row-actions">
                      <button class="btn btn-ghost btn-sm btn-icon" type="button" @click="openEdit(user)" aria-label="Edit">
                        <i class="bi bi-pencil" aria-hidden="true"></i>
                      </button>
                      <button
                        class="btn btn-ghost btn-sm btn-icon btn-icon--danger"
                        type="button"
                        :disabled="!canDeleteUser(user)"
                        :title="deleteDisabledReason(user)"
                        @click="openConfirmDelete(user)"
                        aria-label="Hapus"
                      >
                        <i class="bi bi-trash" aria-hidden="true"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="!users.length" class="tr-empty">
                  <td colspan="7">
                    <div class="empty-state">
                      <div class="empty-icon" aria-hidden="true"><i class="bi bi-people"></i></div>
                      <h3>Tidak ada user ditemukan</h3>
                      <p class="text-muted">Coba ubah filter role atau kata kunci pencarian.</p>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <div class="user-cards" aria-label="Daftar user (mobile)">
          <template v-if="loadingUsers">
            <div v-for="n in 6" :key="n" class="user-card user-card--skeleton">
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
            <div v-for="user in users" :key="user.id" class="user-card">
              <div class="user-card__top">
                <div class="user-card__left">
                  <div class="avatar-pill avatar-pill--sm" aria-hidden="true">{{ initials(user.name) }}</div>
                  <div class="user-card__copy">
                    <div class="user-name" :title="user.name">{{ user.name }}</div>
                    <div class="user-sub text-muted">
                      <span :title="user.username">@{{ user.username }}</span>
                      <span class="dot">•</span>
                      <span class="user-id text-muted">#{{ user.id }}</span>
                    </div>
                  </div>
                </div>

                <span class="pill" :class="roleTone(user.role)">
                  <i :class="roleIcon(user.role)" aria-hidden="true"></i>
                  {{ roleLabel(user.role) }}
                </span>
              </div>

              <div class="user-card__email text-muted" :title="user.email">{{ user.email }}</div>

              <div class="user-card__meta">
                <span class="pill pill--soft">
                  <i class="bi bi-music-note-beamed" aria-hidden="true"></i>
                  {{ formatNumber(user.total_songs_played || 0) }} lagu
                </span>
                <span class="pill">
                  <i class="bi bi-trophy" aria-hidden="true"></i>
                  {{ formatNumber(user.total_score || 0) }}
                </span>
                <span class="pill pill--soft">
                  <i class="bi bi-calendar2" aria-hidden="true"></i>
                  {{ formatDate(user.created_at) }}
                </span>
              </div>

              <div class="user-card__actions">
                <button class="btn btn-ghost btn-sm" type="button" @click="openEdit(user)">
                  <i class="bi bi-pencil" aria-hidden="true"></i>
                  Edit
                </button>

                <button
                  class="btn btn-ghost btn-sm btn-icon btn-icon--danger"
                  type="button"
                  :disabled="!canDeleteUser(user)"
                  :title="deleteDisabledReason(user)"
                  @click="openConfirmDelete(user)"
                  aria-label="Hapus"
                >
                  <i class="bi bi-trash" aria-hidden="true"></i>
                </button>
              </div>
            </div>

            <div v-if="!users.length" class="empty-state">
              <div class="empty-icon" aria-hidden="true"><i class="bi bi-people"></i></div>
              <h3>Tidak ada user ditemukan</h3>
              <p class="text-muted">Coba ubah filter role atau kata kunci pencarian.</p>
            </div>
          </template>
        </div>

        <!-- Pagination -->
        <div v-if="meta.totalPages > 1" class="pagination-row">
          <button class="btn btn-ghost btn-sm" type="button" @click="goToPage(meta.page - 1)" :disabled="loadingUsers || meta.page <= 1">
            <i class="bi bi-chevron-left" aria-hidden="true"></i>
            Sebelumnya
          </button>
          <div class="page-indicator text-muted">
            Halaman <strong>{{ meta.page }}</strong> / {{ meta.totalPages }}
          </div>
          <button class="btn btn-ghost btn-sm" type="button" @click="goToPage(meta.page + 1)" :disabled="loadingUsers || meta.page >= meta.totalPages">
            Berikutnya
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- Edit Modal -->
    <transition name="ad-modal">
      <div v-if="showEditModal" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Edit user" @click.self="closeEdit">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon" aria-hidden="true"><i class="bi bi-person-gear"></i></div>
              <div class="modal-title__copy">
                <h3>Edit User</h3>
                <p class="text-muted">Ubah nama dan role. Username & email hanya dibaca.</p>
              </div>
            </div>
            <button class="icon-close" type="button" @click="closeEdit" aria-label="Tutup modal">
              <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </div>

          <form @submit.prevent="saveUser">
            <div class="modal-body">
              <div class="edit-grid">
                <div class="edit-card edit-card--identity">
                  <div class="edit-label">User</div>
                  <div class="edit-identity">
                    <div class="avatar-pill avatar-pill--lg" aria-hidden="true">{{ initials(selectedUser?.name) }}</div>
                    <div class="identity-copy">
                      <div class="identity-username text-muted">@{{ selectedUser?.username || '-' }}</div>
                      <div class="identity-email text-muted">{{ selectedUser?.email || '-' }}</div>
                      <div class="identity-id text-muted">#{{ selectedUser?.id || '-' }}</div>
                    </div>
                  </div>

                  <div class="field">
                    <label class="field-label" for="edit-name">Nama</label>
                    <input id="edit-name" type="text" class="form-control" v-model="editForm.name" required />
                  </div>
                </div>

                <div class="edit-card">
                  <div class="edit-label">Role</div>
                  <div class="field">
                    <label class="field-label" for="edit-role">Role</label>
                    <select id="edit-role" class="form-select" v-model="editForm.role">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div class="edit-hint text-muted">
                    <i class="bi bi-shield-check" aria-hidden="true"></i>
                    Berhati-hati saat memberikan role admin.
                  </div>

                  <div class="metrics-row">
                    <div class="metric-card">
                      <div class="metric-label text-muted">Total lagu diputar</div>
                      <div class="metric-value">{{ formatNumber(selectedUser?.total_songs_played || 0) }}</div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label text-muted">Total score</div>
                      <div class="metric-value">{{ formatNumber(selectedUser?.total_score || 0) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" @click="closeEdit" :disabled="saving">Batal</button>

              <button
                type="button"
                class="btn btn-ghost btn-icon btn-icon--danger"
                aria-label="Hapus user"
                :disabled="saving || !canDeleteUser(selectedUser)"
                :title="deleteDisabledReason(selectedUser)"
                @click="openConfirmDelete(selectedUser)"
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

    <!-- Confirm Modal -->
    <transition name="ad-modal">
      <div v-if="confirmState.open" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Konfirmasi aksi" @click.self="closeConfirm">
        <div class="modal-content modal-content--confirm">
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon" aria-hidden="true">
                <i class="bi bi-trash"></i>
              </div>
              <div class="modal-title__copy">
                <h3>Hapus user ini?</h3>
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
                <div class="confirm-value">{{ confirmState.user?.name || '-' }}</div>
              </div>
              <div class="confirm-item">
                <div class="confirm-label text-muted">Username</div>
                <div class="confirm-value">@{{ confirmState.user?.username || '-' }}</div>
              </div>
              <div class="confirm-item">
                <div class="confirm-label text-muted">Email</div>
                <div class="confirm-value">{{ confirmState.user?.email || '-' }}</div>
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
        <i :class="toastTone === 'success' ? 'bi bi-check-circle-fill' : toastTone === 'danger' ? 'bi bi-x-circle-fill' : 'bi bi-info-circle-fill'" aria-hidden="true"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { adminAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const users = ref([])
const meta = ref({ total: 0, page: 1, limit: 20, totalPages: 1 })
const stats = ref({ totalAccounts: 0, totalUsers: 0, totalAdmins: 0, totalPlays: 0, playsToday: 0 })

const loadingUsers = ref(true)
const loadingStats = ref(true)
const usersError = ref('')
const statsError = ref('')
const lastUpdatedAt = ref(Date.now())

const filterRole = ref('')
const searchQuery = ref('')

const showEditModal = ref(false)
const selectedUser = ref(null)
const editForm = ref({ name: '', role: 'user' })
const saving = ref(false)

const confirmLoading = ref(false)
const confirmState = ref({ open: false, user: null })

const showToast = ref(false)
const toastMessage = ref('')
const toastTone = ref('success')
let toastTimeout = null
let searchTimeout = null

const limit = computed({
  get: () => meta.value.limit || 20,
  set: (value) => {
    meta.value.page = 1
    meta.value.limit = Number(value) || 20
  }
})

const errorMessage = computed(() => usersError.value || statsError.value || '')
const loadingAny = computed(() => loadingUsers.value || loadingStats.value)

const currentUserId = computed(() => authStore.user?.id || null)

const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(Number(value) || 0)

const lastUpdatedLabel = computed(() => {
  const date = new Date(lastUpdatedAt.value || Date.now())
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date)
})

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const initials = (name) => {
  const raw = String(name || '').trim()
  if (!raw) return '?'
  const parts = raw.split(/\s+/).filter(Boolean).slice(0, 2)
  return parts.map((p) => p[0]).join('').toUpperCase()
}

const roleLabel = (role) => (role === 'admin' ? 'Admin' : 'User')
const roleTone = (role) => (role === 'admin' ? 'pill--cyan' : 'pill--blue')
const roleIcon = (role) => (role === 'admin' ? 'bi bi-shield-lock-fill' : 'bi bi-person-fill')

const canDeleteUser = (user) => {
  if (!user?.id) return false
  if (user.role === 'admin') return false
  if (currentUserId.value && Number(user.id) === Number(currentUserId.value)) return false
  return true
}

const deleteDisabledReason = (user) => {
  if (!user) return ''
  if (user.role === 'admin') return 'Admin tidak bisa dihapus dari UI'
  if (currentUserId.value && Number(user.id) === Number(currentUserId.value)) return 'Tidak bisa menghapus akun sendiri'
  return 'Hapus user'
}

const statCards = computed(() => [
  { key: 'totalAccounts', label: 'Total Akun', value: stats.value.totalAccounts, icon: 'bi bi-people', tone: 'tone-cyan' },
  { key: 'totalUsers', label: 'User', value: stats.value.totalUsers, icon: 'bi bi-person-fill', tone: 'tone-blue' },
  { key: 'totalAdmins', label: 'Admin', value: stats.value.totalAdmins, icon: 'bi bi-shield-lock-fill', tone: 'tone-green' },
  { key: 'totalPlays', label: 'Total Play', value: stats.value.totalPlays, icon: 'bi bi-play-circle-fill', tone: 'tone-cyan' },
  { key: 'playsToday', label: 'Play Hari Ini', value: stats.value.playsToday, icon: 'bi bi-calendar2-check-fill', tone: 'tone-blue' }
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

const fetchUsers = async () => {
  loadingUsers.value = true
  usersError.value = ''

  try {
    const params = {
      search: searchQuery.value || undefined,
      role: filterRole.value || undefined,
      page: meta.value.page || 1,
      limit: meta.value.limit || 20
    }
    const response = await adminAPI.getUsers(params)
    users.value = response.data.data || []

    const responseMeta = response.data.meta || {}
    meta.value = {
      total: Number(responseMeta.total) || 0,
      page: Number(responseMeta.page) || 1,
      limit: Number(responseMeta.limit) || (meta.value.limit || 20),
      totalPages: Number(responseMeta.totalPages) || 1
    }

    lastUpdatedAt.value = Date.now()
  } catch (error) {
    console.error('Error fetching users:', error)
    usersError.value = error.response?.data?.message || 'Gagal memuat daftar user'
    users.value = []
  } finally {
    loadingUsers.value = false
  }
}

const getTotalAdmins = async () => {
  const response = await adminAPI.getUsers({ role: 'admin', page: 1, limit: 1 })
  return Number(response.data.meta?.total) || 0
}

const fetchStats = async () => {
  loadingStats.value = true
  statsError.value = ''

  try {
    const [dashboardRes, adminCount] = await Promise.all([adminAPI.getDashboard(), getTotalAdmins()])
    const data = dashboardRes.data.data || {}
    const totalUsers = Number(data.totalUsers) || 0
    const totalAdmins = Number(adminCount) || 0

    stats.value = {
      totalAccounts: totalUsers + totalAdmins,
      totalUsers,
      totalAdmins,
      totalPlays: Number(data.totalPlays) || 0,
      playsToday: Number(data.playsToday) || 0
    }

    lastUpdatedAt.value = Date.now()
  } catch (error) {
    console.error('Error fetching user stats:', error)
    statsError.value = error.response?.data?.message || 'Gagal memuat ringkasan user'
    stats.value = { totalAccounts: 0, totalUsers: 0, totalAdmins: 0, totalPlays: 0, playsToday: 0 }
  } finally {
    loadingStats.value = false
  }
}

const refreshAll = async () => {
  await Promise.all([fetchStats(), fetchUsers()])
}

const applyRoleFilter = (value) => {
  filterRole.value = value
}

watch(filterRole, () => {
  meta.value.page = 1
  fetchUsers()
})

watch(
  () => meta.value.limit,
  () => {
    meta.value.page = 1
    fetchUsers()
  }
)

watch(searchQuery, () => {
  meta.value.page = 1
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchUsers, 300)
})

const goToPage = (page) => {
  const next = Math.max(1, Math.min(Number(page) || 1, meta.value.totalPages || 1))
  if (next === meta.value.page) return
  meta.value.page = next
  fetchUsers()
}

const openEdit = (user) => {
  selectedUser.value = user
  editForm.value = { name: user?.name || '', role: user?.role || 'user' }
  showEditModal.value = true
}

const closeEdit = () => {
  if (saving.value) return
  showEditModal.value = false
}

const saveUser = async () => {
  if (!selectedUser.value?.id) return
  saving.value = true
  try {
    await adminAPI.updateUser(selectedUser.value.id, {
      name: String(editForm.value.name || '').trim(),
      role: editForm.value.role
    })
    triggerToast('User berhasil diupdate', 'success')
    showEditModal.value = false
    await refreshAll()
  } catch (error) {
    console.error('Error updating user:', error)
    triggerToast(error.response?.data?.message || 'Gagal update user', 'danger')
  } finally {
    saving.value = false
  }
}

const openConfirmDelete = (user) => {
  if (!user) return
  if (!canDeleteUser(user)) {
    triggerToast(deleteDisabledReason(user), 'info')
    return
  }
  confirmState.value = { open: true, user }
}

const closeConfirm = () => {
  if (confirmLoading.value) return
  confirmState.value.open = false
}

const runConfirmDelete = async () => {
  if (!confirmState.value.open || confirmLoading.value) return
  const user = confirmState.value.user
  if (!user?.id) return

  confirmLoading.value = true
  try {
    await adminAPI.deleteUser(user.id)
    triggerToast('User berhasil dihapus', 'success')
    if (selectedUser.value?.id === user.id) {
      showEditModal.value = false
    }
    await refreshAll()
  } catch (error) {
    console.error('Error deleting user:', error)
    triggerToast(error.response?.data?.message || 'Gagal menghapus user', 'danger')
  } finally {
    confirmLoading.value = false
    confirmState.value.open = false
  }
}

const onKeydown = (event) => {
  if (event.key !== 'Escape') return
  if (confirmState.value.open) return closeConfirm()
  if (showEditModal.value) return closeEdit()
}

onMounted(() => {
  refreshAll()
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (toastTimeout) clearTimeout(toastTimeout)
  if (searchTimeout) clearTimeout(searchTimeout)
})
</script>

<style scoped>
.admin-users {
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

/* Users */
.users-panel {
  margin-bottom: 1.25rem;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.12);
  background: rgba(0, 0, 0, 0.14);
}

.users-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1040px;
}

.users-table th,
.users-table td {
  padding: 0.85rem 0.95rem;
  border-bottom: 1px solid rgba(94, 234, 212, 0.12);
  vertical-align: middle;
}

.users-table th {
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

.users-table tbody tr:hover td {
  background: rgba(255, 255, 255, 0.03);
}

.th-actions,
.td-actions {
  text-align: right;
}

.td-date,
.td-metric {
  white-space: nowrap;
}

.td-email {
  max-width: 46ch;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.avatar-pill {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  place-items: center;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: rgba(165, 243, 252, 0.98);
  flex: 0 0 auto;
}

.avatar-pill--sm {
  width: 42px;
  height: 42px;
  border-radius: 14px;
}

.avatar-pill--lg {
  width: 62px;
  height: 62px;
  border-radius: 22px;
}

.user-copy {
  min-width: 0;
}

.user-name {
  font-weight: 900;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 46ch;
}

.user-sub {
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

.btn-icon:disabled {
  opacity: 0.45;
  cursor: not-allowed;
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

.pill--cyan {
  border-color: rgba(94, 234, 212, 0.22);
  background: rgba(6, 182, 212, 0.1);
  color: rgba(165, 243, 252, 0.98);
}

.pill--blue {
  border-color: rgba(59, 130, 246, 0.22);
  background: rgba(59, 130, 246, 0.1);
  color: rgba(191, 219, 254, 0.98);
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
.user-cards {
  display: none;
  margin-top: 0.85rem;
  gap: 0.85rem;
}

.user-card {
  border-radius: 22px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.16);
  padding: 0.9rem;
  display: grid;
  gap: 0.75rem;
}

.user-card__top {
  display: flex;
  justify-content: space-between;
  gap: 0.9rem;
  align-items: flex-start;
}

.user-card__left {
  display: flex;
  gap: 0.8rem;
  min-width: 0;
}

.user-card__copy {
  min-width: 0;
}

.user-card__email {
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-card__meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.user-card__actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: center;
}

.user-card--skeleton {
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

/* Edit */
.edit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.edit-card {
  border-radius: 22px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.16);
  padding: 0.95rem;
  display: grid;
  gap: 0.85rem;
}

.edit-card--identity {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.12) 0%,
    rgba(6, 182, 212, 0.1) 55%,
    rgba(59, 130, 246, 0.12) 100%
  );
}

.edit-label {
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 750;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.edit-identity {
  display: flex;
  gap: 0.85rem;
  align-items: center;
}

.identity-copy {
  display: grid;
  gap: 0.1rem;
  min-width: 0;
}

.identity-username {
  font-weight: 900;
  letter-spacing: -0.01em;
}

.identity-email,
.identity-id {
  font-size: 0.9rem;
}

.edit-hint {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.metric-card {
  border-radius: 18px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.16);
  padding: 0.85rem 0.9rem;
}

.metric-label {
  font-size: 0.78rem;
  font-weight: 700;
}

.metric-value {
  margin-top: 0.3rem;
  font-weight: 900;
  font-size: 1.1rem;
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
  .chip,
  .btn,
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

  .edit-grid {
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

  .filters-row {
    grid-template-columns: 1fr;
  }

  .table-wrap {
    display: none;
  }

  .user-cards {
    display: grid;
  }

  .confirm-summary {
    grid-template-columns: 1fr;
  }

  .metrics-row {
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
