<template>
  <div class="admin-settings">
    <header class="page-header reveal" style="--d: 0ms">
      <div class="page-header__copy">
        <div class="page-badge">
          <i class="bi bi-sliders2-vertical" aria-hidden="true"></i>
          <span>Pengaturan</span>
        </div>
        <h1>Atur aplikasi dengan nyaman</h1>
        <p class="text-muted">Kelola nama aplikasi, aturan upload, dan tampilan. Responsif di desktop maupun mobile.</p>
        <div class="page-meta text-muted">
          <i class="bi bi-clock" aria-hidden="true"></i>
          <span>Terakhir update: {{ lastUpdatedLabel }}</span>
        </div>
      </div>

      <div class="page-header__actions">
        <button class="btn btn-ghost" type="button" @click="fetchSettings" :disabled="loadingAny">
          <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
          {{ loadingAny ? 'Memuat…' : 'Refresh' }}
        </button>
        <button class="btn btn-primary" type="button" @click="saveSettings" :disabled="saving || loading || !hasChanges">
          <span v-if="saving" class="spinner" aria-hidden="true"></span>
          <i v-else class="bi bi-check-lg" aria-hidden="true"></i>
          Simpan
        </button>
      </div>
    </header>

    <div v-if="errorMessage && !loadingAny" class="alert-card alert-card--danger reveal" style="--d: 60ms" role="status">
      <div class="alert-icon" aria-hidden="true">
        <i class="bi bi-exclamation-triangle-fill"></i>
      </div>
      <div class="alert-body">
        <div class="alert-title">Gagal memuat pengaturan</div>
        <div class="alert-text text-muted">{{ errorMessage }}</div>
      </div>
      <button class="btn btn-ghost btn-sm" type="button" @click="fetchSettings">
        <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
        Coba lagi
      </button>
    </div>

    <!-- Quick stats -->
    <section class="stats-grid reveal" style="--d: 90ms" aria-label="Ringkasan pengaturan">
      <template v-if="loading">
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
            <div class="stat-value">{{ card.value }}</div>
            <div v-if="card.hint" class="stat-hint text-muted">{{ card.hint }}</div>
          </div>
        </div>
      </template>
    </section>

    <section class="panel reveal" style="--d: 120ms" aria-label="Form pengaturan aplikasi">
      <div class="panel-header">
        <div class="panel-title">
          <div class="panel-icon" aria-hidden="true">
            <i class="bi bi-gear-fill"></i>
          </div>
          <div class="panel-title__copy">
            <h2>Pengaturan Aplikasi</h2>
            <p class="text-muted">Perubahan akan langsung berlaku setelah disimpan.</p>
          </div>
        </div>

        <div class="panel-actions">
          <button class="btn btn-ghost btn-sm" type="button" @click="resetChanges" :disabled="saving || !hasChanges">
            <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
            Reset
          </button>
        </div>
      </div>

      <div class="panel-body">
        <form class="settings-grid" @submit.prevent="saveSettings">
          <!-- General -->
          <section class="settings-card">
            <header class="settings-card__header">
              <div class="settings-icon tone-cyan" aria-hidden="true">
                <i class="bi bi-stars"></i>
              </div>
              <div class="settings-head-copy">
                <h3>Umum</h3>
                <p class="text-muted">Identitas aplikasi yang tampil di UI.</p>
              </div>
            </header>

            <div class="settings-card__body">
              <div class="field">
                <label class="field-label" for="app-name">Nama Aplikasi</label>
                <input
                  id="app-name"
                  v-model="settings.app_name"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: KaraokeKu"
                  :disabled="saving"
                />
                <div v-if="meta.app_name?.description" class="field-hint text-muted">{{ meta.app_name.description }}</div>
              </div>

              <div class="field">
                <label class="field-label" for="app-tagline">Tagline</label>
                <input
                  id="app-tagline"
                  v-model="settings.app_tagline"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: Nyanyi Dimana Saja, Kapan Saja"
                  :disabled="saving"
                />
                <div v-if="meta.app_tagline?.description" class="field-hint text-muted">{{ meta.app_tagline.description }}</div>
              </div>
            </div>
          </section>

          <!-- Upload -->
          <section class="settings-card">
            <header class="settings-card__header">
              <div class="settings-icon tone-green" aria-hidden="true">
                <i class="bi bi-cloud-arrow-up-fill"></i>
              </div>
              <div class="settings-head-copy">
                <h3>Upload</h3>
                <p class="text-muted">Batas ukuran dan format video yang diizinkan.</p>
              </div>
            </header>

            <div class="settings-card__body">
              <div class="field">
                <label class="field-label" for="max-upload">Maksimal Ukuran Upload (MB)</label>
                <input
                  id="max-upload"
                  v-model.number="settings.max_upload_size_mb"
                  type="number"
                  min="1"
                  class="form-control"
                  :disabled="saving"
                />
                <div class="chips-row chips-row--compact" aria-label="Shortcut ukuran upload">
                  <button class="chip" type="button" @click="settings.max_upload_size_mb = 200" :disabled="saving">
                    200 MB
                  </button>
                  <button class="chip" type="button" @click="settings.max_upload_size_mb = 500" :disabled="saving">
                    500 MB
                  </button>
                  <button class="chip" type="button" @click="settings.max_upload_size_mb = 1000" :disabled="saving">
                    1000 MB
                  </button>
                </div>
                <div v-if="meta.max_upload_size_mb?.description" class="field-hint text-muted">
                  {{ meta.max_upload_size_mb.description }}
                </div>
              </div>

              <div class="field">
                <label class="field-label" for="allowed-formats">Format yang Diizinkan</label>
                <input
                  id="allowed-formats"
                  v-model="settings.allowed_formats"
                  type="text"
                  class="form-control"
                  placeholder="mp4,mkv,webm,avi"
                  :disabled="saving"
                  @blur="settings.allowed_formats = normalizeAllowedFormats(settings.allowed_formats)"
                />

                <div class="chips-row chips-row--compact" aria-label="Shortcut format video">
                  <button
                    v-for="format in formatSuggestions"
                    :key="format"
                    class="chip chip--toggle"
                    type="button"
                    :class="{ on: allowedFormatsList.includes(format) }"
                    @click="toggleFormat(format)"
                    :disabled="saving"
                  >
                    {{ format }}
                  </button>
                </div>

                <div class="field-hint text-muted">
                  Total format aktif: <strong>{{ allowedFormatsList.length }}</strong>
                </div>
                <div v-if="meta.allowed_formats?.description" class="field-hint text-muted">{{ meta.allowed_formats.description }}</div>
              </div>
            </div>
          </section>

          <!-- Display -->
          <section class="settings-card">
            <header class="settings-card__header">
              <div class="settings-icon tone-blue" aria-hidden="true">
                <i class="bi bi-layout-text-window-reverse"></i>
              </div>
              <div class="settings-head-copy">
                <h3>Tampilan</h3>
                <p class="text-muted">Atur jumlah data agar nyaman dilihat.</p>
              </div>
            </header>

            <div class="settings-card__body">
              <div class="field">
                <label class="field-label" for="songs-per-page">Jumlah Lagu per Halaman</label>
                <input
                  id="songs-per-page"
                  v-model.number="settings.songs_per_page"
                  type="number"
                  min="1"
                  class="form-control"
                  :disabled="saving"
                />
                <div class="chips-row chips-row--compact" aria-label="Shortcut jumlah lagu">
                  <button class="chip" type="button" @click="settings.songs_per_page = 10" :disabled="saving">10</button>
                  <button class="chip" type="button" @click="settings.songs_per_page = 20" :disabled="saving">20</button>
                  <button class="chip" type="button" @click="settings.songs_per_page = 40" :disabled="saving">40</button>
                </div>
                <div v-if="meta.songs_per_page?.description" class="field-hint text-muted">{{ meta.songs_per_page.description }}</div>
              </div>

              <div class="preview-card" aria-label="Preview ringkas">
                <div class="preview-title">Preview</div>
                <div class="preview-row">
                  <span class="text-muted">Nama</span>
                  <span class="preview-value">{{ settings.app_name || '-' }}</span>
                </div>
                <div class="preview-row">
                  <span class="text-muted">Tagline</span>
                  <span class="preview-value">{{ settings.app_tagline || '-' }}</span>
                </div>
                <div class="preview-row">
                  <span class="text-muted">Upload max</span>
                  <span class="preview-value">{{ formatNumber(settings.max_upload_size_mb) }} MB</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Action bar -->
          <section class="action-bar" aria-label="Aksi simpan">
            <div class="action-left">
              <span v-if="hasChanges" class="pill pill--warn">
                <i class="bi bi-exclamation-circle-fill" aria-hidden="true"></i>
                Perubahan belum disimpan
              </span>
              <span v-else class="pill pill--ok">
                <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
                Tersimpan
              </span>
            </div>

            <div class="action-right">
              <button class="btn btn-ghost btn-sm" type="button" @click="resetChanges" :disabled="saving || !hasChanges">
                <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
                Reset
              </button>
              <button class="btn btn-primary btn-sm" type="submit" :disabled="saving || !hasChanges">
                <span v-if="saving" class="spinner" aria-hidden="true"></span>
                <i v-else class="bi bi-check-lg" aria-hidden="true"></i>
                Simpan
              </button>
            </div>
          </section>
        </form>
      </div>
    </section>

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
import { adminAPI } from '@/services/api'

const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const lastUpdatedAt = ref(Date.now())

const settings = ref({
  app_name: '',
  app_tagline: '',
  max_upload_size_mb: 500,
  allowed_formats: 'mp4,mkv,webm,avi',
  songs_per_page: 20
})

const meta = ref({})
const originalSettings = ref(null)

const showToast = ref(false)
const toastMessage = ref('')
const toastTone = ref('success')
let toastTimeout = null

const formatSuggestions = ['mp4', 'mkv', 'webm', 'avi', 'mpg']

const loadingAny = computed(() => loading.value || saving.value)
const errorMessage = computed(() => loadError.value || '')

const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(Number(value) || 0)

const lastUpdatedLabel = computed(() => {
  const date = new Date(lastUpdatedAt.value || Date.now())
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date)
})

const normalizeAllowedFormats = (raw) => {
  const list = String(raw || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return Array.from(new Set(list)).join(',')
}

const allowedFormatsList = computed(() => {
  const normalized = normalizeAllowedFormats(settings.value.allowed_formats)
  return normalized ? normalized.split(',') : []
})

const toggleFormat = (format) => {
  const normalized = normalizeAllowedFormats(settings.value.allowed_formats)
  const set = new Set(normalized ? normalized.split(',') : [])
  if (set.has(format)) set.delete(format)
  else set.add(format)
  settings.value.allowed_formats = Array.from(set).join(',')
}

const hasChanges = computed(() => {
  if (!originalSettings.value) return false
  return Object.keys(settings.value).some((key) => String(settings.value[key]) !== String(originalSettings.value[key]))
})

const statCards = computed(() => {
  const appName = String(settings.value.app_name || '').trim() || '-'
  const maxUpload = `${formatNumber(settings.value.max_upload_size_mb)} MB`
  const formats = `${allowedFormatsList.value.length} format`
  const perPage = `${formatNumber(settings.value.songs_per_page)} /hal`
  return [
    { key: 'app', label: 'Aplikasi', value: appName, icon: 'bi bi-stars', tone: 'tone-cyan' },
    { key: 'upload', label: 'Upload Max', value: maxUpload, icon: 'bi bi-cloud-arrow-up-fill', tone: 'tone-green' },
    { key: 'formats', label: 'Format', value: formats, icon: 'bi bi-filetype-mp4', tone: 'tone-blue' },
    { key: 'page', label: 'Lagu/Halaman', value: perPage, icon: 'bi bi-layout-text-window-reverse', tone: 'tone-cyan' }
  ]
})

const triggerToast = (message, tone = 'success') => {
  toastMessage.value = message
  toastTone.value = tone
  showToast.value = true
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    showToast.value = false
  }, 2500)
}

const fetchSettings = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const response = await adminAPI.getSettings()
    const data = response.data.data || {}

    const nextSettings = {}
    const nextMeta = {}

    for (const [key, entry] of Object.entries(data)) {
      nextMeta[key] = { type: entry?.type, description: entry?.description }
      const value = entry?.value
      if (entry?.type === 'number') nextSettings[key] = Number(value) || 0
      else nextSettings[key] = value ?? ''
    }

    settings.value = {
      ...settings.value,
      ...nextSettings,
      allowed_formats: normalizeAllowedFormats(nextSettings.allowed_formats ?? settings.value.allowed_formats)
    }

    meta.value = nextMeta
    originalSettings.value = { ...settings.value }
    lastUpdatedAt.value = Date.now()
  } catch (error) {
    console.error('Error fetching settings:', error)
    loadError.value = error.response?.data?.message || 'Gagal memuat pengaturan'
  } finally {
    loading.value = false
  }
}

const resetChanges = () => {
  if (!originalSettings.value) return
  settings.value = { ...originalSettings.value }
  settings.value.allowed_formats = normalizeAllowedFormats(settings.value.allowed_formats)
  triggerToast('Perubahan dibatalkan', 'info')
}

const validateSettings = () => {
  if (!String(settings.value.app_name || '').trim()) {
    triggerToast('Nama aplikasi wajib diisi', 'danger')
    return false
  }
  if (Number(settings.value.max_upload_size_mb) <= 0) {
    triggerToast('Maksimal upload harus lebih dari 0', 'danger')
    return false
  }
  if (Number(settings.value.songs_per_page) <= 0) {
    triggerToast('Jumlah lagu per halaman harus lebih dari 0', 'danger')
    return false
  }
  settings.value.allowed_formats = normalizeAllowedFormats(settings.value.allowed_formats)
  return true
}

const saveSettings = async () => {
  if (saving.value) return
  if (!hasChanges.value) return triggerToast('Tidak ada perubahan untuk disimpan', 'info')
  if (!validateSettings()) return

  saving.value = true
  try {
    await adminAPI.updateSettings(settings.value)
    originalSettings.value = { ...settings.value }
    lastUpdatedAt.value = Date.now()
    triggerToast('Pengaturan berhasil disimpan', 'success')
  } catch (error) {
    console.error('Error saving settings:', error)
    triggerToast(error.response?.data?.message || 'Gagal menyimpan pengaturan', 'danger')
  } finally {
    saving.value = false
  }
}

onMounted(fetchSettings)

onBeforeUnmount(() => {
  if (toastTimeout) clearTimeout(toastTimeout)
})
</script>

<style scoped>
.admin-settings {
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
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
  min-width: 0;
}

.stat-label {
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  opacity: 0.85;
}

.stat-value {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

/* Settings cards */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  align-items: start;
}

.settings-card {
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(6, 19, 25, 0.5);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.settings-card__header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(94, 234, 212, 0.12);
  background: rgba(255, 255, 255, 0.03);
}

.settings-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(6, 182, 212, 0.08);
}

.settings-icon i {
  color: var(--primary-light);
  font-size: 1.25rem;
}

.settings-icon.tone-green {
  border-color: rgba(34, 197, 94, 0.22);
  background: rgba(34, 197, 94, 0.08);
}

.settings-icon.tone-blue {
  border-color: rgba(59, 130, 246, 0.22);
  background: rgba(59, 130, 246, 0.08);
}

.settings-head-copy h3 {
  margin: 0;
  font-size: 1.05rem;
}

.settings-head-copy p {
  margin: 0.2rem 0 0;
  font-size: 0.92rem;
}

.settings-card__body {
  padding: 1rem;
  display: grid;
  gap: 0.95rem;
}

.field {
  display: grid;
  gap: 0.45rem;
}

.field-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.field-hint {
  font-size: 0.88rem;
}

.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.5rem;
}

.chips-row--compact {
  margin-top: 0.4rem;
}

.chip {
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  padding: 0.35rem 0.75rem;
  font-size: 0.88rem;
}

.chip:hover {
  background: rgba(255, 255, 255, 0.07);
}

.chip--toggle.on {
  border-color: rgba(6, 182, 212, 0.42);
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.14);
}

.preview-card {
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.12);
  background: rgba(255, 255, 255, 0.03);
  padding: 0.9rem;
  display: grid;
  gap: 0.55rem;
}

.preview-title {
  font-weight: 750;
  letter-spacing: -0.02em;
  margin-bottom: 0.2rem;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.preview-value {
  font-weight: 650;
  text-align: right;
  max-width: 65%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Action bar */
.action-bar {
  grid-column: 1 / -1;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(10, 22, 28, 0.76);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 18px 70px rgba(0, 0, 0, 0.45);
  padding: 0.9rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  position: sticky;
  bottom: 0.9rem;
}

.action-right {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(255, 255, 255, 0.04);
  font-size: 0.9rem;
}

.pill--warn {
  border-color: rgba(251, 191, 36, 0.28);
  background: rgba(251, 191, 36, 0.1);
}

.pill--ok {
  border-color: rgba(34, 197, 94, 0.28);
  background: rgba(34, 197, 94, 0.1);
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

/* Responsive */
@media (max-width: 1100px) {
  .settings-grid {
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

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .action-bar {
    flex-direction: column;
    align-items: flex-start;
    bottom: 0.75rem;
  }

  .action-right {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
