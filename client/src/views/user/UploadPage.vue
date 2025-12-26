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
        <router-link to="/upload" class="nav-item active">
          <i class="bi bi-cloud-upload-fill"></i><span>Upload Lagu</span>
        </router-link>
        <router-link to="/history" class="nav-item">
          <i class="bi bi-clock-history"></i><span>Riwayat & Score</span>
        </router-link>
        <router-link to="/request" class="nav-item">
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
            <button class="icon-btn" type="button" @click="focusUpload(true)" aria-label="Pilih video">
              <i class="bi bi-cloud-upload"></i>
            </button>
            <button class="icon-btn" type="button" @click="scrollToMyUploads" aria-label="Upload saya">
              <i class="bi bi-list-check"></i>
            </button>
          </div>
        </div>

        <!-- Hero -->
        <section class="hero reveal" style="--d: 0ms">
          <div class="hero__content">
            <div class="hero__badge">
              <i class="bi bi-cloud-upload-fill"></i>
              <span>Upload Lagu</span>
            </div>
            <h1>Upload video <span class="text-gradient">karaoke</span> kamu</h1>
            <p class="hero__sub text-muted">
              Lengkapi detail lagu, upload video dan thumbnail (opsional). Admin akan melakukan review sebelum lagu tampil.
            </p>

            <div class="hero__stats">
              <div class="stat-pill">
                <i class="bi bi-collection"></i>
                <span>{{ totalUploads }} upload</span>
              </div>
              <div class="stat-pill stat-pill--soft">
                <i class="bi bi-hourglass-split"></i>
                <span>{{ pendingUploads }} pending</span>
              </div>
              <div class="stat-pill stat-pill--soft">
                <i class="bi bi-check-circle-fill"></i>
                <span>{{ approvedUploads }} approved</span>
              </div>
              <div v-if="loadingUploads || uploading" class="stat-pill stat-pill--soft" aria-live="polite">
                <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                <span>{{ uploading ? 'Mengupload…' : 'Memuat…' }}</span>
              </div>

              <button class="btn btn-primary btn-sm" type="button" @click="focusUpload(true)">
                <i class="bi bi-upload me-1"></i>
                Pilih Video
              </button>
              <button class="btn btn-ghost btn-sm" type="button" @click="scrollToMyUploads">
                <i class="bi bi-list-check me-1"></i>
                Upload Saya
              </button>
            </div>
          </div>

          <div class="hero__art">
            <div class="hero-card hero-card--primary">
              <div class="hero-card__icon" aria-hidden="true">
                <i class="bi bi-film"></i>
              </div>
              <div class="hero-card__title">Rekomendasi video</div>
              <div class="hero-card__text">Gunakan MP4, resolusi 720p/1080p, audio jelas, dan judul + artis lengkap.</div>
              <button class="btn btn-primary btn-sm hero-card__btn" type="button" @click="focusUpload(true)">
                <i class="bi bi-cloud-arrow-up-fill"></i>
                Upload sekarang
              </button>
            </div>

            <div class="hero-card hero-card--soft">
              <div class="hero-card__icon" aria-hidden="true">
                <i class="bi bi-image"></i>
              </div>
              <div class="hero-card__title">Thumbnail opsional</div>
              <div class="hero-card__text">Tambahkan thumbnail biar terlihat profesional (atau biarkan kosong untuk otomatis).</div>
              <button class="btn btn-ghost btn-sm hero-card__btn" type="button" @click="focusUpload(false)">
                <i class="bi bi-plus-lg"></i>
                Tambah thumbnail
              </button>
            </div>
          </div>
        </section>

        <section class="content-grid">
          <!-- Upload Panel -->
          <div ref="uploadFormSection" class="panel upload-panel reveal" style="--d: 60ms">
            <div class="panel-header">
              <div class="panel-title">
                <div class="panel-icon" aria-hidden="true">
                  <i class="bi bi-cloud-arrow-up-fill"></i>
                </div>
                <div class="panel-title__copy">
                  <h2>Form Upload</h2>
                  <p class="text-muted">Isi informasi lagu, lalu upload video dan thumbnail.</p>
                </div>
              </div>
              <div class="panel-steps" aria-hidden="true">
                <span class="step-pill">1. Info</span>
                <span class="step-pill">2. Video</span>
                <span class="step-pill">3. Submit</span>
              </div>
            </div>

            <form class="upload-form" @submit.prevent="handleUpload">
              <div class="form-grid">
                <div class="field">
                  <label class="form-label">Judul Lagu *</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.title"
                    required
                    placeholder="Masukkan judul lagu"
                  />
                </div>
                <div class="field">
                  <label class="form-label">Artis</label>
                  <input type="text" class="form-control" v-model="form.artist" placeholder="Nama artis/penyanyi" />
                </div>
                <div class="field">
                  <label class="form-label">Genre</label>
                  <select class="form-select" v-model="form.genre">
                    <option value="">Pilih genre</option>
                    <option value="Pop">Pop</option>
                    <option value="Rock">Rock</option>
                    <option value="Dangdut">Dangdut</option>
                    <option value="Jazz">Jazz</option>
                    <option value="R&B">R&B</option>
                    <option value="Hip Hop">Hip Hop</option>
                    <option value="EDM">EDM</option>
                    <option value="Ballad">Ballad</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div class="field">
                  <label class="form-label">Bahasa/Negara</label>
                  <select class="form-select" v-model="form.language">
                    <option value="">Pilih bahasa</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="English">English</option>
                    <option value="Korean">Korean</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Mandarin">Mandarin</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div class="dropzones">
                <div class="dropzone-card">
                  <div class="dropzone-header">
                    <div class="dropzone-title">
                      <i class="bi bi-camera-reels-fill" aria-hidden="true"></i>
                      <span>File Video *</span>
                    </div>
                    <div class="dropzone-hint">MP4/MKV/WebM</div>
                  </div>

                  <div
                    class="upload-dropzone"
                    :class="{ 'has-file': form.file }"
                    @click="openVideoPicker"
                    @dragover.prevent
                    @drop.prevent="handleVideoDrop"
                    role="button"
                    tabindex="0"
                    @keydown.enter.prevent="openVideoPicker"
                    @keydown.space.prevent="openVideoPicker"
                    aria-label="Pilih file video"
                  >
                    <input ref="fileInput" type="file" @change="handleFileSelect" accept="video/*" hidden />

                    <div v-if="!form.file" class="dropzone-content">
                      <i class="bi bi-cloud-upload" aria-hidden="true"></i>
                      <p>Klik atau drag & drop file video</p>
                      <span>Rekomendasi: MP4 • Maks 500MB</span>
                    </div>

                    <div v-else class="file-preview">
                      <i class="bi bi-file-earmark-play-fill" aria-hidden="true"></i>
                      <div class="file-preview__copy">
                        <p :title="form.file.name">{{ form.file.name }}</p>
                        <span>{{ formatFileSize(form.file.size) }}</span>
                      </div>
                      <button type="button" class="btn-remove" @click.stop="removeFile" aria-label="Hapus file video">
                        <i class="bi bi-x-lg" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="dropzone-card">
                  <div class="dropzone-header">
                    <div class="dropzone-title">
                      <i class="bi bi-image" aria-hidden="true"></i>
                      <span>Thumbnail (Opsional)</span>
                    </div>
                    <div class="dropzone-hint">JPG/PNG/WebP</div>
                  </div>

                  <div
                    class="upload-dropzone upload-dropzone--thumb"
                    :class="{ 'has-file': form.thumbnail }"
                    @click="openThumbnailPicker"
                    @dragover.prevent
                    @drop.prevent="handleThumbnailDrop"
                    role="button"
                    tabindex="0"
                    @keydown.enter.prevent="openThumbnailPicker"
                    @keydown.space.prevent="openThumbnailPicker"
                    aria-label="Pilih thumbnail"
                  >
                    <input ref="thumbInput" type="file" @change="handleThumbnailSelect" accept="image/*" hidden />

                    <div v-if="!form.thumbnail" class="dropzone-content dropzone-content--thumb">
                      <i class="bi bi-image" aria-hidden="true"></i>
                      <p>Upload thumbnail (opsional)</p>
                      <span>Jika kosong, thumbnail akan dibuat otomatis</span>
                    </div>

                    <div v-else class="thumb-preview">
                      <img :src="thumbnailPreviewUrl" alt="Preview thumbnail" />
                      <div class="file-preview__copy">
                        <p :title="form.thumbnail.name">{{ form.thumbnail.name }}</p>
                        <span>{{ formatFileSize(form.thumbnail.size) }}</span>
                      </div>
                      <button
                        type="button"
                        class="btn-remove"
                        @click.stop="removeThumbnail"
                        aria-label="Hapus thumbnail"
                      >
                        <i class="bi bi-x-lg" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="uploadProgress > 0" class="upload-progress" role="status" aria-live="polite">
                <div class="progress-track" aria-hidden="true">
                  <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
                </div>
                <div class="progress-meta">
                  <span class="progress-label">Progress upload</span>
                  <span class="progress-value">{{ uploadProgress }}%</span>
                </div>
              </div>

              <div v-if="error" class="alert-card alert-card--danger" role="status">
                <div class="alert-icon" aria-hidden="true">
                  <i class="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div class="alert-body">
                  <div class="alert-title">Gagal upload</div>
                  <div class="alert-text text-muted">{{ error }}</div>
                </div>
              </div>

              <div v-if="success" class="alert-card alert-card--success" role="status">
                <div class="alert-icon" aria-hidden="true">
                  <i class="bi bi-check-circle-fill"></i>
                </div>
                <div class="alert-body">
                  <div class="alert-title">Berhasil</div>
                  <div class="alert-text text-muted">{{ success }}</div>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-ghost" @click="resetAll" :disabled="uploading">
                  <i class="bi bi-arrow-counterclockwise me-1" aria-hidden="true"></i>
                  Reset
                </button>

                <button type="submit" class="btn btn-primary btn-lg" :disabled="uploading || !form.file || !form.title.trim()">
                  <span v-if="uploading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                  {{ uploading ? 'Mengupload…' : 'Upload Video' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Side Panel -->
          <aside class="side-panel">
            <div class="panel info-panel reveal" style="--d: 90ms">
              <div class="panel-header panel-header--compact">
                <div class="panel-title">
                  <div class="panel-icon panel-icon--soft" aria-hidden="true">
                    <i class="bi bi-info-circle-fill"></i>
                  </div>
                  <div class="panel-title__copy">
                    <h2>Panduan cepat</h2>
                    <p class="text-muted">Biar upload kamu cepat disetujui.</p>
                  </div>
                </div>
              </div>

              <ul class="info-list">
                <li><strong>Judul</strong> dan <strong>artis</strong> diisi jelas.</li>
                <li>Video rapi, audio jelas, dan tidak ada watermark berlebihan.</li>
                <li>Thumbnail opsional (lebih bagus jika resolusi 16:9).</li>
                <li>Status akan muncul di “Upload Saya” setelah berhasil.</li>
              </ul>
            </div>

            <div ref="myUploadsSection" class="panel uploads-panel reveal" style="--d: 120ms">
              <div class="panel-header panel-header--compact">
                <div class="panel-title">
                  <div class="panel-icon panel-icon--soft" aria-hidden="true">
                    <i class="bi bi-list-check"></i>
                  </div>
                  <div class="panel-title__copy">
                    <h2>Upload Saya</h2>
                    <p class="text-muted">Pantau status review admin.</p>
                  </div>
                </div>

                <button class="btn btn-ghost btn-sm" type="button" @click="fetchMyUploads" :disabled="loadingUploads">
                  <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
                  Refresh
                </button>
              </div>

              <div v-if="loadingUploads && myUploads.length === 0" class="uploads-list uploads-list--skeleton" aria-hidden="true">
                <div v-for="n in 6" :key="n" class="upload-item upload-item--skeleton">
                  <div class="upload-thumb">
                    <div class="skeleton-thumb loading-skeleton"></div>
                  </div>
                  <div class="upload-info">
                    <div class="skeleton-line loading-skeleton"></div>
                    <div class="skeleton-line skeleton-line--sm loading-skeleton"></div>
                  </div>
                  <div class="skeleton-pill loading-skeleton"></div>
                </div>
              </div>

              <div v-else-if="!loadingUploads && myUploads.length === 0" class="empty-state empty-state--mini reveal" style="--d: 0ms">
                <div class="empty-icon" aria-hidden="true">
                  <i class="bi bi-cloud-upload"></i>
                </div>
                <h3>Belum ada upload</h3>
                <p class="text-muted">Pilih video dan upload untuk mulai.</p>
                <button class="btn btn-primary btn-sm" type="button" @click="focusUpload(true)">
                  <i class="bi bi-upload me-1" aria-hidden="true"></i>
                  Upload sekarang
                </button>
              </div>

              <div v-else class="uploads-list">
                <article v-for="upload in myUploads" :key="upload.id" class="upload-item">
                  <div class="upload-thumb" aria-hidden="true">
                    <img v-if="upload.thumbnail_url" :src="upload.thumbnail_url" :alt="upload.title" loading="lazy" />
                    <i v-else class="bi bi-music-note-beamed"></i>
                  </div>

                  <div class="upload-info">
                    <h3 :title="upload.title">{{ upload.title }}</h3>
                    <p class="text-muted">{{ upload.artist || '-' }}</p>
                  </div>

                  <span class="status-pill" :class="statusPillClass(upload.status)">
                    <i :class="statusIcon(upload.status)" aria-hidden="true"></i>
                    {{ statusLabel(upload.status) }}
                  </span>
                </article>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>

    <MobileNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { uploadsAPI } from '@/services/api'
import MobileNav from '@/components/MobileNav.vue'

const fileInput = ref(null)
const thumbInput = ref(null)
const uploadFormSection = ref(null)
const myUploadsSection = ref(null)

const form = ref({ title: '', artist: '', genre: '', language: '', file: null, thumbnail: null })
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const success = ref('')
const myUploads = ref([])
const loadingUploads = ref(true)
const thumbnailPreviewUrl = ref('')

const totalUploads = computed(() => myUploads.value.length)
const pendingUploads = computed(() => myUploads.value.filter((u) => (u.status || 'pending') === 'pending').length)
const approvedUploads = computed(() => myUploads.value.filter((u) => u.status === 'approved').length)

const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return true
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? true
}

const scrollToSection = (element) => {
  element?.scrollIntoView?.({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
}

const openVideoPicker = async () => {
  await nextTick()
  fileInput.value?.click?.()
}

const openThumbnailPicker = async () => {
  await nextTick()
  thumbInput.value?.click?.()
}

const focusUpload = async (openVideo = false) => {
  scrollToSection(uploadFormSection.value)
  if (openVideo) {
    setTimeout(() => openVideoPicker(), prefersReducedMotion() ? 0 : 220)
    return
  }
  setTimeout(() => openThumbnailPicker(), prefersReducedMotion() ? 0 : 220)
}

const scrollToMyUploads = () => {
  scrollToSection(myUploadsSection.value)
}

const clearFileInput = () => {
  if (fileInput.value) fileInput.value.value = ''
}

const clearThumbInput = () => {
  if (thumbInput.value) thumbInput.value.value = ''
}

const handleFileSelect = (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  error.value = ''
  success.value = ''

  if (!file.type.startsWith('video/')) {
    error.value = 'File harus berupa video'
    clearFileInput()
    return
  }

  form.value.file = file
}

const handleThumbnailSelect = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  attachThumbnail(file)
}

const attachThumbnail = (file) => {
  error.value = ''
  success.value = ''

  if (!file.type.startsWith('image/')) {
    error.value = 'Thumbnail harus berupa gambar'
    clearThumbInput()
    return
  }

  if (thumbnailPreviewUrl.value) {
    URL.revokeObjectURL(thumbnailPreviewUrl.value)
  }

  form.value.thumbnail = file
  thumbnailPreviewUrl.value = URL.createObjectURL(file)
}

const handleVideoDrop = (e) => {
  const file = e.dataTransfer.files?.[0]
  if (!file) return

  if (!file.type.startsWith('video/')) {
    error.value = 'File yang di-drop harus berupa video'
    return
  }

  error.value = ''
  success.value = ''
  form.value.file = file
}

const handleThumbnailDrop = (e) => {
  const file = e.dataTransfer.files?.[0]
  if (!file) return
  attachThumbnail(file)
}

const removeFile = () => {
  form.value.file = null
  clearFileInput()
}

const removeThumbnail = () => {
  form.value.thumbnail = null
  clearThumbInput()
  if (thumbnailPreviewUrl.value) {
    URL.revokeObjectURL(thumbnailPreviewUrl.value)
    thumbnailPreviewUrl.value = ''
  }
}

const resetFields = () => {
  form.value = { title: '', artist: '', genre: '', language: '', file: null, thumbnail: null }
  uploadProgress.value = 0
  removeFile()
  removeThumbnail()
}

const resetAll = () => {
  resetFields()
  error.value = ''
  success.value = ''
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const handleUpload = async () => {
  if (!form.value.file) return

  uploading.value = true
  error.value = ''
  success.value = ''
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('artist', form.value.artist)
    formData.append('genre', form.value.genre)
    formData.append('language', form.value.language)
    formData.append('video', form.value.file)
    if (form.value.thumbnail) {
      formData.append('thumbnail', form.value.thumbnail)
    }

    await uploadsAPI.upload(formData, (percent) => {
      uploadProgress.value = percent
    })

    success.value = 'Video berhasil diupload! Menunggu review admin.'
    resetFields()
    await fetchMyUploads()
  } catch (err) {
    error.value = err.response?.data?.message || 'Gagal mengupload video'
  } finally {
    uploading.value = false
  }
}

const fetchMyUploads = async () => {
  loadingUploads.value = true
  try {
    const response = await uploadsAPI.getMyUploads()
    myUploads.value = response.data.data || []
  } catch (err) {
    console.error(err)
  } finally {
    loadingUploads.value = false
  }
}

const statusLabel = (status) => {
  if (status === 'approved') return 'Disetujui'
  if (status === 'rejected') return 'Ditolak'
  return 'Menunggu Review'
}

const statusIcon = (status) => {
  if (status === 'approved') return 'bi bi-check-circle-fill'
  if (status === 'rejected') return 'bi bi-x-circle-fill'
  return 'bi bi-hourglass-split'
}

const statusPillClass = (status) => {
  if (status === 'approved') return 'status-pill--approved'
  if (status === 'rejected') return 'status-pill--rejected'
  return 'status-pill--pending'
}

onMounted(fetchMyUploads)

onUnmounted(() => {
  if (thumbnailPreviewUrl.value) {
    URL.revokeObjectURL(thumbnailPreviewUrl.value)
    thumbnailPreviewUrl.value = ''
  }
})
</script>

<style scoped>
.page-layout {
  /* Local theme override (green–blue gradient) */
  --up-green: #22c55e;
  --up-cyan: #06b6d4;
  --up-blue: #3b82f6;

  --primary: var(--up-cyan);
  --primary-light: #22d3ee;
  --primary-dark: #0891b2;
  --secondary: var(--up-green);
  --accent: var(--up-blue);

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
    radial-gradient(900px 600px at 10% 10%, rgba(34, 197, 94, 0.2) 0%, transparent 55%),
    radial-gradient(860px 560px at 92% 18%, rgba(6, 182, 212, 0.18) 0%, transparent 55%),
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

/* Form */
.upload-form {
  padding: 1rem 1.2rem 1.2rem;
  display: grid;
  gap: 1.1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem 1rem;
}

.field {
  min-width: 0;
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
  background: rgba(255, 255, 255, 0.04);
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

/* Dropzones */
.dropzones {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.65fr);
  gap: 1rem;
}

.dropzone-card {
  display: grid;
  gap: 0.65rem;
}

.dropzone-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
}

.dropzone-title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.dropzone-title i {
  color: var(--primary-light);
}

.dropzone-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.upload-dropzone {
  border: 2px dashed rgba(94, 234, 212, 0.2);
  border-radius: var(--radius-lg);
  padding: 2.6rem 1.1rem;
  text-align: center;
  cursor: pointer;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
  background: rgba(255, 255, 255, 0.03);
  position: relative;
  outline: none;
}

.upload-dropzone:hover {
  border-color: rgba(94, 234, 212, 0.34);
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-1px);
}

.upload-dropzone:focus-visible {
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.16);
}

.upload-dropzone.has-file {
  border-style: solid;
  border-color: rgba(34, 197, 94, 0.42);
  background: rgba(34, 197, 94, 0.06);
}

.upload-dropzone--thumb {
  padding: 1.65rem 1rem;
}

.dropzone-content i {
  font-size: 3rem;
  margin-bottom: 0.85rem;
  display: block;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dropzone-content--thumb i {
  font-size: 2.2rem;
  margin-bottom: 0.65rem;
}

.dropzone-content p {
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.dropzone-content span {
  display: inline-block;
  margin-top: 0.35rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.file-preview,
.thumb-preview {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  text-align: left;
}

.file-preview i {
  font-size: 2.2rem;
  color: rgba(34, 197, 94, 0.95);
  flex: 0 0 auto;
}

.thumb-preview img {
  width: 96px;
  height: 54px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid rgba(94, 234, 212, 0.2);
  background: var(--bg-darker);
  flex-shrink: 0;
}

.file-preview__copy {
  min-width: 0;
  flex: 1;
}

.file-preview__copy p {
  margin: 0;
  font-weight: 750;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-preview__copy span {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.btn-remove {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(248, 113, 113, 0.95);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
  flex: 0 0 auto;
}

.btn-remove:hover {
  transform: translateY(-1px);
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.12);
}

/* Progress */
.upload-progress {
  display: grid;
  gap: 0.5rem;
}

.progress-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(94, 234, 212, 0.16);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  transition: width 180ms ease;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.progress-value {
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary);
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

.alert-card--success {
  border-color: rgba(34, 197, 94, 0.22);
  background: rgba(34, 197, 94, 0.08);
}

.alert-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.alert-card--danger .alert-icon {
  border-color: rgba(239, 68, 68, 0.28);
  background: rgba(239, 68, 68, 0.12);
  color: rgba(254, 202, 202, 0.98);
}

.alert-card--success .alert-icon {
  border-color: rgba(34, 197, 94, 0.22);
  background: rgba(34, 197, 94, 0.12);
  color: rgba(187, 247, 208, 0.98);
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
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Uploads list */
.uploads-list {
  padding: 1rem 1.2rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.upload-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 0.95rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.18);
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
}

.upload-item:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.26);
  background: rgba(255, 255, 255, 0.04);
}

.upload-thumb {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(94, 234, 212, 0.14);
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  overflow: hidden;
  color: var(--text-muted);
}

.upload-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.upload-info {
  min-width: 0;
  flex: 1;
}

.upload-info h3 {
  margin: 0 0 0.12rem;
  font-size: 0.98rem;
  font-weight: 850;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-info p {
  margin: 0;
  font-size: 0.85rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
  flex: 0 0 auto;
}

.status-pill--pending {
  background: rgba(6, 182, 212, 0.1);
  border-color: rgba(94, 234, 212, 0.2);
  color: rgba(165, 243, 252, 0.98);
}

.status-pill--approved {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.22);
  color: rgba(187, 247, 208, 0.98);
}

.status-pill--rejected {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.22);
  color: rgba(254, 202, 202, 0.98);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 1.2rem 1rem 1.1rem;
}

.empty-state--mini {
  padding: 1rem 1.2rem 1.2rem;
}

.empty-icon {
  width: 66px;
  height: 66px;
  border-radius: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.22);
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.45);
  margin-bottom: 0.8rem;
}

.empty-icon i {
  font-size: 2rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.empty-state h3 {
  font-weight: 850;
  font-size: 1.05rem;
  margin: 0 0 0.25rem;
}

.empty-state p {
  margin: 0 0 0.85rem;
}

/* Info list */
.info-list {
  padding: 0.9rem 1.2rem 1.2rem;
  margin: 0;
  display: grid;
  gap: 0.6rem;
  color: var(--text-secondary);
}

.info-list li {
  line-height: 1.5;
}

.info-list strong {
  color: var(--text-primary);
}

/* Skeleton */
.upload-item--skeleton {
  pointer-events: none;
  background: rgba(255, 255, 255, 0.03);
}

.upload-item--skeleton:hover {
  transform: none;
}

.skeleton-thumb {
  width: 100%;
  height: 100%;
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

.skeleton-pill {
  width: 110px;
  height: 1.05rem;
  border-radius: 999px;
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

  .upload-item,
  .btn,
  .nav-item,
  .icon-btn,
  .upload-dropzone {
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

  .dropzones {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .upload-item {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .status-pill {
    margin-left: auto;
  }
}

@media (max-width: 425px) {
  .page-content {
    padding: 1rem;
  }

  .panel-header {
    padding: 1rem;
  }

  .upload-form,
  .uploads-list,
  .info-list {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
