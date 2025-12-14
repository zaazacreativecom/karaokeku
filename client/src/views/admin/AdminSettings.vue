<template>
  <div class="admin-settings">
    <h1 class="page-title">Pengaturan Aplikasi</h1>

    <div v-if="loading" class="loading-state"><div class="spinner-border text-primary"></div></div>

    <div v-else class="settings-form card">
      <div class="card-body">
        <form @submit.prevent="saveSettings">
          <div class="setting-group">
            <h3>Umum</h3>
            <div class="mb-3">
              <label class="form-label">Nama Aplikasi</label>
              <input type="text" class="form-control" v-model="settings.app_name">
            </div>
            <div class="mb-3">
              <label class="form-label">Tagline</label>
              <input type="text" class="form-control" v-model="settings.app_tagline">
            </div>
          </div>

          <div class="setting-group">
            <h3>Upload</h3>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Maksimal Ukuran Upload (MB)</label>
                <input type="number" class="form-control" v-model="settings.max_upload_size_mb">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Format yang Diizinkan</label>
                <input type="text" class="form-control" v-model="settings.allowed_formats" placeholder="mp4,mkv,webm">
              </div>
            </div>
          </div>

          <div class="setting-group">
            <h3>Tampilan</h3>
            <div class="mb-3">
              <label class="form-label">Jumlah Lagu per Halaman</label>
              <input type="number" class="form-control" v-model="settings.songs_per_page" style="max-width: 150px;">
            </div>
          </div>

          <div v-if="message" :class="['alert', success ? 'alert-success' : 'alert-danger']">
            {{ message }}
          </div>

          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/services/api'

const settings = ref({})
const loading = ref(true)
const saving = ref(false)
const message = ref('')
const success = ref(false)

const fetchSettings = async () => {
  loading.value = true
  try {
    const response = await adminAPI.getSettings()
    const data = response.data.data || {}
    // Convert to simple key-value
    settings.value = {}
    for (const [key, val] of Object.entries(data)) {
      settings.value[key] = val.value
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  message.value = ''
  
  try {
    await adminAPI.updateSettings(settings.value)
    success.value = true
    message.value = 'Pengaturan berhasil disimpan!'
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Gagal menyimpan pengaturan'
  } finally {
    saving.value = false
  }
}

onMounted(fetchSettings)
</script>

<style scoped>
.admin-settings { max-width: 700px; }
.page-title { margin-bottom: 2rem; }
.loading-state { text-align: center; padding: 3rem; }
.settings-form .card-body { padding: 2rem; }
.setting-group { margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid var(--border-color); }
.setting-group:last-of-type { border-bottom: none; margin-bottom: 1rem; }
.setting-group h3 { font-size: 1.125rem; margin-bottom: 1rem; color: var(--text-secondary); }
</style>
