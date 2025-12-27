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
      <!-- Sidebar sama seperti Dashboard -->
      <div class="sidebar-header">
        <router-link to="/dashboard" class="brand">
          <i class="bi bi-music-note-beamed"></i>
          <span>Karaoke<span class="text-gradient">Ku</span></span>
        </router-link>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item"><i
            class="bi bi-grid-1x2-fill"></i><span>Dashboard</span></router-link>
        <router-link to="/karaoke" class="nav-item"><i class="bi bi-mic-fill"></i><span>Karaoke</span></router-link>
        <router-link to="/songs" class="nav-item"><i class="bi bi-music-note-list"></i><span>Pilih
            Lagu</span></router-link>
        <router-link to="/favorites" class="nav-item"><i class="bi bi-heart-fill"></i><span>Lagu
            Favorit</span></router-link>
        <router-link to="/playlists" class="nav-item active"><i class="bi bi-collection-play-fill"></i><span>Playlist
            Saya</span></router-link>
        <router-link to="/upload" class="nav-item"><i class="bi bi-cloud-upload-fill"></i><span>Upload
            Lagu</span></router-link>
        <router-link to="/history" class="nav-item"><i class="bi bi-clock-history"></i><span>Riwayat &
            Score</span></router-link>
        <router-link to="/request" class="nav-item"><i class="bi bi-plus-circle-fill"></i><span>Request
            Lagu</span></router-link>
        <router-link to="/donation" class="nav-item"><i class="bi bi-heart-fill"></i><span>Donasi</span></router-link>
        <div class="nav-divider"></div>
        <router-link to="/settings" class="nav-item"><i
            class="bi bi-gear-fill"></i><span>Pengaturan</span></router-link>
      </nav>
    </aside>

    <main class="page-main">
      <div class="page-content">
        <!-- Mobile Topbar (sidebar hidden by CSS on small screens) -->
        <div class="mobile-topbar">
          <router-link to="/dashboard" class="brand brand--compact">
            <i class="bi bi-music-note-beamed"></i>
            <span>Karaoke<span class="text-gradient">Ku</span></span>
          </router-link>
          <div class="mobile-topbar__actions">
            <button class="icon-btn" type="button" @click="openCreateModal" aria-label="Buat playlist">
              <i class="bi bi-plus-lg"></i>
            </button>
            <button class="icon-btn" type="button" @click="goToSongs" aria-label="Tambah lagu">
              <i class="bi bi-music-note-list"></i>
            </button>
          </div>
        </div>

        <!-- Hero -->
        <section class="hero reveal" style="--d: 0ms">
          <div class="hero__content">
            <div class="hero__badge">
              <i class="bi bi-collection-play-fill"></i>
              <span>Playlist Saya</span>
            </div>
            <h1>
              Kelola playlist <span class="text-gradient">karaoke</span> kamu
            </h1>
            <p class="hero__sub text-muted">
              Buat playlist untuk mengelompokkan lagu favorit. Play langsung atau rapikan koleksimu kapan saja.
            </p>

            <div class="hero__stats">
              <div class="stat-pill">
                <i class="bi bi-collection-play"></i>
                <span>{{ playlistCount }} playlist</span>
              </div>
              <div class="stat-pill stat-pill--soft">
                <i class="bi bi-music-note"></i>
                <span>{{ totalSongCount }} lagu</span>
              </div>

              <div v-if="loading" class="stat-pill stat-pill--soft" aria-live="polite">
                <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                <span>Memuat...</span>
              </div>

              <button class="btn btn-primary btn-sm" type="button" @click="openCreateModal">
                <i class="bi bi-plus-lg me-1"></i>
                Buat Playlist
              </button>
              <button class="btn btn-ghost btn-sm" type="button" @click="goToSongs">
                <i class="bi bi-music-note-list me-1"></i>
                Tambah Lagu
              </button>
            </div>
          </div>

          <div class="hero__art">
            <div class="hero-card hero-card--primary">
              <div class="hero-card__icon">
                <i class="bi bi-stars"></i>
              </div>
              <div class="hero-card__title">Tips cepat</div>
              <div class="hero-card__text">Buat playlist berdasarkan mood, genre, atau acara.</div>
              <button class="btn btn-primary btn-sm hero-card__btn" type="button" @click="openCreateModal">
                <i class="bi bi-plus-lg"></i>
                Buat sekarang
              </button>
            </div>

            <div class="hero-card hero-card--soft">
              <div class="hero-card__icon">
                <i class="bi bi-play-circle-fill"></i>
              </div>
              <div class="hero-card__title">Siap karaoke</div>
              <div class="hero-card__text">Klik Play pada playlist untuk mulai karaoke lebih cepat.</div>
              <router-link to="/karaoke" class="btn btn-ghost btn-sm hero-card__btn">
                <i class="bi bi-mic-fill"></i>
                Karaoke
              </router-link>
            </div>
          </div>
        </section>

        <!-- Error -->
        <div v-if="errorMessage && playlists.length > 0" class="alert-card reveal" style="--d: 90ms" role="status">
          <div class="alert-icon" aria-hidden="true">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div class="alert-body">
            <div class="alert-title">Gagal memuat playlist</div>
            <div class="alert-text text-muted">{{ errorMessage }}</div>
          </div>
          <button class="btn btn-ghost btn-sm" type="button" @click="fetchPlaylists">
            <i class="bi bi-arrow-clockwise me-1"></i>
            Coba lagi
          </button>
        </div>

        <!-- Skeleton -->
        <div v-if="loading && playlists.length === 0" class="playlists-grid playlists-grid--skeleton" aria-hidden="true">
          <div v-for="n in 10" :key="n" class="playlist-card playlist-card--skeleton">
            <div class="playlist-cover">
              <div class="skeleton-cover loading-skeleton"></div>
            </div>
            <div class="playlist-info">
              <div class="skeleton-line loading-skeleton"></div>
              <div class="skeleton-line skeleton-line--sm loading-skeleton"></div>
              <div class="skeleton-row">
                <div class="skeleton-pill loading-skeleton"></div>
                <div class="skeleton-pill loading-skeleton"></div>
              </div>
            </div>
            <div class="playlist-actions">
              <div class="skeleton-btn loading-skeleton"></div>
              <div class="skeleton-btn skeleton-btn--icon loading-skeleton"></div>
              <div class="skeleton-btn skeleton-btn--icon loading-skeleton"></div>
            </div>
          </div>
        </div>

        <!-- Error Empty -->
        <div v-else-if="!loading && errorMessage && playlists.length === 0" class="empty-state empty-state--error reveal"
          style="--d: 120ms">
          <div class="empty-icon" aria-hidden="true">
            <i class="bi bi-cloud-slash"></i>
          </div>
          <h2>Playlist tidak bisa dimuat</h2>
          <p class="text-muted">{{ errorMessage }}</p>
          <div class="empty-actions">
            <button class="btn btn-primary" type="button" @click="fetchPlaylists">
              <i class="bi bi-arrow-clockwise me-1"></i>
              Coba lagi
            </button>
            <router-link to="/dashboard" class="btn btn-ghost">
              <i class="bi bi-grid-1x2-fill me-1"></i>
              Dashboard
            </router-link>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="!loading && !errorMessage && playlists.length === 0" class="empty-state reveal" style="--d: 120ms">
          <div class="empty-icon">
            <i class="bi bi-collection-play"></i>
          </div>
          <h2>Belum ada playlist</h2>
          <p class="text-muted">Buat playlist untuk mengelompokkan lagu dan mulai karaoke lebih cepat.</p>
          <div class="empty-actions">
            <button class="btn btn-primary" type="button" @click="openCreateModal">
              <i class="bi bi-plus-lg me-1"></i>
              Buat Playlist Pertama
            </button>
            <button class="btn btn-ghost" type="button" @click="goToSongs">
              <i class="bi bi-music-note-list me-1"></i>
              Cari Lagu
            </button>
          </div>
        </div>

        <!-- Grid -->
        <div v-else class="playlists-grid">
          <article v-for="(playlist, idx) in playlists" :key="playlist.id" class="playlist-card reveal"
            :style="{ '--d': `${Math.min(idx * 35, 280)}ms` }"
            role="button" tabindex="0"
            @click="viewPlaylist(playlist)"
            @keydown.enter.prevent="viewPlaylist(playlist)"
            @keydown.space.prevent="viewPlaylist(playlist)">
            <div class="playlist-cover" aria-hidden="true">
              <div class="playlist-cover__inner">
                <div class="playlist-cover__icon">
                  <i class="bi bi-collection-play-fill"></i>
                </div>
                <div class="playlist-cover__letter">{{ getPlaylistLetter(playlist) }}</div>
              </div>
            </div>

            <div class="playlist-info">
              <h3 :title="playlist.name">{{ playlist.name }}</h3>
              <p class="playlist-desc" :title="playlist.description || ''">
                {{ playlist.description || 'Tanpa deskripsi' }}
              </p>
              <div class="playlist-meta">
                <span class="meta-pill">
                  <i class="bi bi-music-note-list"></i>
                  {{ playlist.songCount || 0 }} lagu
                </span>
              </div>
            </div>

            <div class="playlist-actions" @click.stop>
              <button class="btn btn-primary btn-sm" type="button" @click="viewPlaylist(playlist)">
                <i class="bi bi-play-fill"></i> Play
              </button>
              <button class="btn btn-ghost btn-sm btn-icon" type="button" @click="editPlaylist(playlist)"
                aria-label="Edit playlist">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-ghost btn-sm btn-icon btn-danger-soft" type="button" @click="confirmDelete(playlist)"
                aria-label="Hapus playlist">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </article>
        </div>
      </div>
    </main>

    <!-- Create/Edit Modal -->
    <transition name="pp-modal">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModal" role="dialog" aria-modal="true"
        aria-label="Buat atau edit playlist">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon" aria-hidden="true">
                <i class="bi bi-collection-play-fill"></i>
              </div>
              <div class="modal-title__copy">
                <h3>{{ editingPlaylist ? 'Edit Playlist' : 'Buat Playlist Baru' }}</h3>
                <p class="text-muted">
                  {{ editingPlaylist ? 'Perbarui nama dan deskripsi playlist.' : 'Buat playlist untuk menyimpan lagu favoritmu.' }}
                </p>
              </div>
            </div>
            <button class="btn-close-modal" type="button" @click="closeModal" aria-label="Tutup">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <form @submit.prevent="savePlaylist">
            <div class="modal-body">
              <div v-if="formError" class="form-alert" role="status">
                <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
                <span>{{ formError }}</span>
              </div>

              <div class="mb-3">
                <label class="form-label">Nama Playlist</label>
                <input type="text" class="form-control" v-model="formData.name" required placeholder="Contoh: Lagu Favorit">
              </div>
              <div class="mb-3">
                <label class="form-label">Deskripsi (opsional)</label>
                <textarea class="form-control" v-model="formData.description" rows="3"
                  placeholder="Deskripsi playlist..."></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                {{ saving ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Delete Confirmation -->
    <transition name="pp-modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal" role="dialog"
        aria-modal="true" aria-label="Konfirmasi hapus playlist">
        <div class="modal-content modal-sm">
          <div class="modal-body modal-body--center">
            <div class="danger-icon" aria-hidden="true">
              <i class="bi bi-exclamation-triangle-fill"></i>
            </div>
            <h3>Hapus Playlist?</h3>
            <p class="text-muted">
              Playlist "<strong>{{ deletingPlaylist?.name }}</strong>" akan dihapus permanen.
            </p>
            <div v-if="deleteError" class="form-alert form-alert--center" role="status">
              <i class="bi bi-x-octagon-fill" aria-hidden="true"></i>
              <span>{{ deleteError }}</span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" type="button" @click="closeDeleteModal">Batal</button>
            <button class="btn btn-danger" type="button" @click="deletePlaylist">Hapus</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Mobile Navigation -->
    <MobileNav />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaylistStore } from '@/stores/playlist'
import MobileNav from '@/components/MobileNav.vue'

const router = useRouter()
const playlistStore = usePlaylistStore()

const playlists = ref([])
const loading = ref(true)
const errorMessage = ref('')

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingPlaylist = ref(null)
const deletingPlaylist = ref(null)
const saving = ref(false)
const formData = ref({ name: '', description: '' })
const formError = ref('')
const deleteError = ref('')

const playlistCount = computed(() => playlists.value.length)
const totalSongCount = computed(() =>
  playlists.value.reduce((acc, playlist) => acc + (Number(playlist.songCount) || 0), 0)
)

const getStoreError = () => {
  const err = playlistStore.error
  if (err && typeof err === 'object' && 'value' in err) return err.value
  return err
}

const fetchPlaylists = async () => {
  loading.value = true
  errorMessage.value = ''

  await playlistStore.fetchPlaylists()
  playlists.value = playlistStore.playlists || []
  errorMessage.value = getStoreError() || ''

  loading.value = false
}

const getPlaylistLetter = (playlist) => {
  const name = String(playlist?.name || '').trim()
  return name ? name.charAt(0).toUpperCase() : 'P'
}

const goToSongs = () => {
  router.push('/songs')
}

const viewPlaylist = (playlist) => {
  // TODO: Navigate to playlist detail or start playing
  router.push('/karaoke')
}

const openCreateModal = () => {
  formError.value = ''
  editingPlaylist.value = null
  formData.value = { name: '', description: '' }
  showCreateModal.value = true
}

const editPlaylist = (playlist) => {
  formError.value = ''
  editingPlaylist.value = playlist
  formData.value = { name: playlist.name, description: playlist.description || '' }
  showCreateModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  editingPlaylist.value = null
  formData.value = { name: '', description: '' }
  formError.value = ''
}

const savePlaylist = async () => {
  saving.value = true
  formError.value = ''

  const result = editingPlaylist.value
    ? await playlistStore.updatePlaylist(editingPlaylist.value.id, formData.value)
    : await playlistStore.createPlaylist(formData.value)

  saving.value = false

  if (!result?.success) {
    formError.value = result?.error || 'Gagal menyimpan playlist'
    return
  }

  await fetchPlaylists()
  closeModal()
}

const confirmDelete = (playlist) => {
  deleteError.value = ''
  deletingPlaylist.value = playlist
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingPlaylist.value = null
  deleteError.value = ''
}

const deletePlaylist = async () => {
  if (!deletingPlaylist.value) return

  const result = await playlistStore.deletePlaylist(deletingPlaylist.value.id)
  if (!result?.success) {
    deleteError.value = result?.error || 'Gagal hapus playlist'
    return
  }

  playlists.value = playlists.value.filter((p) => p.id !== deletingPlaylist.value?.id)
  await fetchPlaylists()
  closeDeleteModal()
}

onMounted(fetchPlaylists)
</script>

<style scoped>
.page-layout {
  /* Local theme override (green–blue gradient) */
  --pp-green: #22c55e;
  --pp-cyan: #06b6d4;
  --pp-blue: #3b82f6;

  --primary: var(--pp-cyan);
  --primary-light: #22d3ee;
  --primary-dark: #0891b2;
  --secondary: var(--pp-green);
  --accent: var(--pp-blue);

  --bg-dark: #061319;
  --bg-darker: #040c10;
  --bg-card: rgba(10, 22, 28, 0.72);
  --bg-card-hover: rgba(14, 30, 37, 0.82);
  --border-color: rgba(94, 234, 212, 0.14);
  --border-color-light: rgba(94, 234, 212, 0.28);

  --gradient-primary: linear-gradient(135deg, #22c55e 0%, #06b6d4 55%, #3b82f6 100%);
  --gradient-glow: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.28) 0%,
    rgba(6, 182, 212, 0.32) 55%,
    rgba(59, 130, 246, 0.22) 100%
  );
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
    radial-gradient(900px 600px at 8% 10%, rgba(34, 197, 94, 0.22) 0%, transparent 55%),
    radial-gradient(820px 560px at 92% 16%, rgba(6, 182, 212, 0.2) 0%, transparent 55%),
    radial-gradient(980px 680px at 70% 92%, rgba(59, 130, 246, 0.15) 0%, transparent 60%),
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
  opacity: 0.34;
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

.nav-item > * {
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
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.18) 0%,
    rgba(6, 182, 212, 0.12) 55%,
    rgba(59, 130, 246, 0.16) 100%
  );
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
  max-width: 62ch;
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
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.12) 0%,
    rgba(6, 182, 212, 0.1) 55%,
    rgba(59, 130, 246, 0.12) 100%
  );
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

.alert-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(6, 182, 212, 0.12);
  display: grid;
  place-items: center;
  color: var(--primary-light);
  flex: 0 0 auto;
}

.alert-title {
  font-weight: 800;
}

.alert-body {
  min-width: 0;
  flex: 1;
}

.alert-text {
  font-size: 0.92rem;
}

/* Grid */
.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}

.playlist-card {
  background: var(--bg-card);
  border: 1px solid rgba(94, 234, 212, 0.14);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal);
  box-shadow: 0 14px 60px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  position: relative;
  cursor: pointer;
  outline: none;
}

.playlist-card:hover {
  border-color: rgba(94, 234, 212, 0.28);
  transform: translateY(-6px);
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5);
}

.playlist-card:focus-visible {
  box-shadow:
    0 0 0 4px rgba(6, 182, 212, 0.18),
    0 18px 70px rgba(0, 0, 0, 0.55);
}

.playlist-cover {
  position: relative;
  height: 140px;
  background: var(--gradient-primary);
  overflow: hidden;
}

.playlist-cover::after {
  content: '';
  position: absolute;
  inset: -45%;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.22) 0%, transparent 56%),
    radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.18) 0%, transparent 58%);
  transform: translate3d(-12%, -10%, 0) rotate(18deg);
  opacity: 0.65;
  mix-blend-mode: screen;
  pointer-events: none;
  animation: kpLiquidSheen 4.6s ease-in-out infinite;
}

.playlist-cover__inner {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.1rem;
}

.playlist-cover__icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.95);
}

.playlist-cover__letter {
  font-size: 3.1rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 20px 70px rgba(0, 0, 0, 0.55);
}

.playlist-info {
  padding: 1rem 1rem 0.85rem;
}

.playlist-info h3 {
  font-size: 1.05rem;
  margin: 0 0 0.2rem;
  font-weight: 850;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-desc {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.playlist-meta {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(94, 234, 212, 0.14);
  color: var(--text-secondary);
  font-size: 0.78rem;
}

.meta-pill i {
  color: var(--primary-light);
}

.playlist-actions {
  padding: 0 1rem 1rem;
  display: flex;
  gap: 0.5rem;
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

.btn-danger-soft {
  border-color: rgba(239, 68, 68, 0.28) !important;
  color: rgba(248, 113, 113, 0.95) !important;
}

.btn-danger-soft:hover {
  background: rgba(239, 68, 68, 0.12) !important;
  border-color: rgba(239, 68, 68, 0.38) !important;
  color: rgba(254, 202, 202, 0.98) !important;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 2.75rem 1rem;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(10, 22, 28, 0.6);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.4);
}

.empty-icon {
  width: 78px;
  height: 78px;
  border-radius: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.22);
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.45);
  margin-bottom: 1rem;
}

.empty-icon i {
  font-size: 2.2rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.empty-state h2 {
  font-weight: 800;
  font-size: 1.3rem;
  margin: 0 0 0.35rem;
}

.empty-state p {
  margin: 0 0 1.1rem;
}

.empty-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 3600;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 1rem;
}

.modal-content {
  background: rgba(10, 22, 28, 0.78);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 520px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  box-shadow: 0 24px 90px rgba(0, 0, 0, 0.65);
  overflow: hidden;
}

.modal-sm {
  max-width: 420px;
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

.modal-icon {
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

.modal-header h3 {
  margin: 0;
  font-weight: 850;
  letter-spacing: -0.01em;
}

.modal-header p {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
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
  padding: 1rem 1.2rem 0.9rem;
}

.modal-body--center {
  text-align: center;
  padding: 1.4rem 1.2rem 0.9rem;
}

.form-alert {
  display: flex;
  gap: 0.55rem;
  align-items: center;
  padding: 0.65rem 0.75rem;
  border-radius: 16px;
  border: 1px solid rgba(239, 68, 68, 0.22);
  background: rgba(239, 68, 68, 0.1);
  color: rgba(254, 202, 202, 0.98);
  margin-bottom: 0.9rem;
}

.form-alert--center {
  justify-content: center;
  margin: 0.9rem 0 0;
}

.modal-content .form-control {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(94, 234, 212, 0.14);
  border-radius: 16px;
  color: var(--text-primary);
}

.modal-content .form-control:focus {
  border-color: rgba(94, 234, 212, 0.28);
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.16);
}

.modal-footer {
  padding: 1rem 1.2rem;
  border-top: 1px solid rgba(94, 234, 212, 0.14);
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  background: rgba(0, 0, 0, 0.12);
}

.danger-icon {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(239, 68, 68, 0.24);
  background: rgba(239, 68, 68, 0.12);
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.45);
  margin: 0 auto 1rem;
  color: rgba(248, 113, 113, 0.95);
  font-size: 1.6rem;
}

/* In-page button theme overrides (avoid purple hover shadow from global styles) */
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

/* Skeleton */
.playlist-card--skeleton {
  cursor: default;
  transform: none !important;
}

.playlist-card--skeleton:hover {
  transform: none !important;
}

.skeleton-cover {
  width: 100%;
  height: 140px;
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

.skeleton-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.65rem;
}

.skeleton-pill {
  height: 0.9rem;
  width: 78px;
  border-radius: 999px;
}

.skeleton-btn {
  height: 42px;
  border-radius: 14px;
  width: 120px;
}

.skeleton-btn--icon {
  width: 42px;
}

/* Entrance animation */
.reveal {
  animation: reveal 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: var(--d, 0ms);
  will-change: transform, opacity;
}

/* Modal transitions */
.pp-modal-enter-active,
.pp-modal-leave-active {
  transition: opacity 180ms ease;
}

.pp-modal-enter-from,
.pp-modal-leave-to {
  opacity: 0;
}

.pp-modal-enter-active .modal-content,
.pp-modal-leave-active .modal-content {
  transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform, opacity;
}

.pp-modal-enter-from .modal-content,
.pp-modal-leave-to .modal-content {
  transform: translate3d(0, 10px, 0) scale(0.98);
  opacity: 0;
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

@keyframes kpLiquidSheen {
  0%,
  100% {
    transform: translate3d(-12%, -10%, 0) rotate(18deg);
    opacity: 0.56;
  }
  50% {
    transform: translate3d(10%, 12%, 0) rotate(8deg);
    opacity: 0.78;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bg-orb {
    animation: none;
  }

  .reveal {
    animation: none;
  }

  .playlist-cover::after {
    animation: none;
  }

  .pp-modal-enter-active,
  .pp-modal-leave-active,
  .pp-modal-enter-active .modal-content,
  .pp-modal-leave-active .modal-content {
    transition: none !important;
  }

  .playlist-card,
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

  .playlists-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
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

  .modal-overlay {
    align-items: flex-end;
    padding: 0;
    inset: 0 0 80px 0;
    inset: 0 0 calc(80px + env(safe-area-inset-bottom)) 0;
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
  .playlists-grid {
    grid-template-columns: 1fr;
  }

  .playlist-actions .btn-primary {
    flex: 1;
  }
}
</style>
