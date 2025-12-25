<template>
    <div class="page-layout">
        <aside class="dashboard-sidebar">
            <div class="sidebar-header"><router-link to="/dashboard" class="brand"><i
                        class="bi bi-music-note-beamed"></i><span>Karaoke<span
                            class="text-gradient">Ku</span></span></router-link>
            </div>
            <nav class="sidebar-nav">
                <router-link to="/dashboard" class="nav-item"><i
                        class="bi bi-grid-1x2-fill"></i><span>Dashboard</span></router-link>
                <router-link to="/karaoke" class="nav-item"><i
                        class="bi bi-mic-fill"></i><span>Karaoke</span></router-link>
                <router-link to="/songs" class="nav-item"><i class="bi bi-music-note-list"></i><span>Pilih
                        Lagu</span></router-link>
                <router-link to="/favorites" class="nav-item"><i class="bi bi-heart-fill"></i><span>Lagu
                        Favorit</span></router-link>
                <router-link to="/playlists" class="nav-item"><i class="bi bi-collection-play-fill"></i><span>Playlist
                        Saya</span></router-link>
                <router-link to="/upload" class="nav-item active"><i class="bi bi-cloud-upload-fill"></i><span>Upload
                        Lagu</span></router-link>
                <router-link to="/history" class="nav-item"><i class="bi bi-clock-history"></i><span>Riwayat &
                        Score</span></router-link>
                <router-link to="/request" class="nav-item"><i class="bi bi-plus-circle-fill"></i><span>Request
                        Lagu</span></router-link>
                <router-link to="/donation" class="nav-item"><i
                        class="bi bi-heart-fill"></i><span>Donasi</span></router-link>
                <div class="nav-divider"></div>
                <router-link to="/settings" class="nav-item"><i
                        class="bi bi-gear-fill"></i><span>Pengaturan</span></router-link>
            </nav>
        </aside>

        <main class="page-main">
            <div class="page-content">
                <div class="page-header">
                    <h1><i class="bi bi-cloud-upload-fill me-2"></i>Upload Lagu Karaoke</h1>
                    <p class="text-muted">Upload video karaoke Anda untuk direview admin</p>
                </div>

                <div class="upload-section">
                    <form @submit.prevent="handleUpload" class="upload-form card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Judul Lagu *</label>
                                        <input type="text" class="form-control" v-model="form.title" required
                                            placeholder="Masukkan judul lagu">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Artis</label>
                                        <input type="text" class="form-control" v-model="form.artist"
                                            placeholder="Nama artis/penyanyi">
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
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
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
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
                            </div>

                            <div class="mb-3">
                                <label class="form-label">File Video *</label>
                                <div class="upload-dropzone" :class="{ 'has-file': form.file }"
                                    @click="$refs.fileInput.click()" @dragover.prevent @drop.prevent="handleDrop">
                                    <input type="file" ref="fileInput" @change="handleFileSelect" accept="video/*"
                                        hidden>
                                    <div v-if="!form.file" class="dropzone-content">
                                        <i class="bi bi-cloud-upload"></i>
                                        <p>Klik atau drag & drop file video</p>
                                        <span>Format: MP4, MKV, WebM (Maks. 500MB)</span>
                                    </div>
                                    <div v-else class="file-preview">
                                        <i class="bi bi-file-earmark-play-fill"></i>
                                        <div>
                                            <p>{{ form.file.name }}</p>
                                            <span>{{ formatFileSize(form.file.size) }}</span>
                                        </div>
                                        <button type="button" class="btn-remove" @click.stop="removeFile">
                                            <i class="bi bi-x-lg"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Thumbnail (Opsional)</label>
                                <div class="upload-dropzone upload-dropzone--thumb"
                                    :class="{ 'has-file': form.thumbnail }" @click="$refs.thumbInput.click()">
                                    <input type="file" ref="thumbInput" @change="handleThumbnailSelect" accept="image/*"
                                        hidden>

                                    <div v-if="!form.thumbnail" class="dropzone-content dropzone-content--thumb">
                                        <i class="bi bi-image"></i>
                                        <p>Upload thumbnail (opsional)</p>
                                        <span>Format: JPG, PNG, WebP (opsional - jika kosong akan dibuat otomatis)</span>
                                    </div>

                                    <div v-else class="thumb-preview">
                                        <img :src="thumbnailPreviewUrl" alt="Thumbnail preview" />
                                        <div>
                                            <p>{{ form.thumbnail.name }}</p>
                                            <span>{{ formatFileSize(form.thumbnail.size) }}</span>
                                        </div>
                                        <button type="button" class="btn-remove" @click.stop="removeThumbnail">
                                            <i class="bi bi-x-lg"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div v-if="uploadProgress > 0" class="upload-progress">
                                <div class="progress">
                                    <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
                                </div>
                                <span>{{ uploadProgress }}%</span>
                            </div>

                            <div v-if="error" class="alert alert-danger">{{ error }}</div>
                            <div v-if="success" class="alert alert-success">{{ success }}</div>

                            <button type="submit" class="btn btn-primary btn-lg w-100"
                                :disabled="uploading || !form.file">
                                <span v-if="uploading" class="spinner-border spinner-border-sm me-2"></span>
                                {{ uploading ? 'Mengupload...' : 'Upload Video' }}
                            </button>
                        </div>
                    </form>
                </div>

                <!-- My Uploads -->
                <div class="my-uploads mt-4">
                    <h3>Upload Saya</h3>
                    <div v-if="myUploads.length === 0" class="text-muted">Belum ada upload</div>
                    <div v-else class="uploads-list">
                        <div v-for="upload in myUploads" :key="upload.id" class="upload-item">
                            <div class="upload-thumb">
                                <img v-if="upload.thumbnail_url" :src="upload.thumbnail_url" :alt="upload.title" />
                                <i v-else class="bi bi-music-note-beamed"></i>
                            </div>
                            <div class="upload-info">
                                <h4>{{ upload.title }}</h4>
                                <p>{{ upload.artist || '-' }}</p>
                            </div>
                            <span class="upload-status" :class="upload.status">
                                {{ upload.status === 'pending' ? 'Menunggu Review' : upload.status === 'approved' ?
                                    'Disetujui' :
                                    'Ditolak' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Mobile Navigation -->
        <MobileNav />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { uploadsAPI } from '@/services/api'
import MobileNav from '@/components/MobileNav.vue'

const form = ref({ title: '', artist: '', genre: '', language: '', file: null, thumbnail: null })
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const success = ref('')
const myUploads = ref([])
const thumbnailPreviewUrl = ref('')

const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) form.value.file = file
}

const handleThumbnailSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
        error.value = 'Thumbnail harus berupa gambar'
        return
    }

    if (thumbnailPreviewUrl.value) {
        URL.revokeObjectURL(thumbnailPreviewUrl.value)
    }

    form.value.thumbnail = file
    thumbnailPreviewUrl.value = URL.createObjectURL(file)
}

const handleDrop = (e) => {
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
        form.value.file = file
    }
}

const removeFile = () => {
    form.value.file = null
}

const removeThumbnail = () => {
    form.value.thumbnail = null
    if (thumbnailPreviewUrl.value) {
        URL.revokeObjectURL(thumbnailPreviewUrl.value)
        thumbnailPreviewUrl.value = ''
    }
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
        removeThumbnail()
        form.value = { title: '', artist: '', genre: '', language: '', file: null, thumbnail: null }
        uploadProgress.value = 0
        fetchMyUploads()
    } catch (err) {
        error.value = err.response?.data?.message || 'Gagal mengupload video'
    } finally {
        uploading.value = false
    }
}

const fetchMyUploads = async () => {
    try {
        const response = await uploadsAPI.getMyUploads()
        myUploads.value = response.data.data || []
    } catch (err) {
        console.error(err)
    }
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
    display: flex;
    min-height: 100vh;
}

.dashboard-sidebar {
    width: 260px;
    background: var(--bg-card);
    border-right: 1px solid var(--border-color);
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 100;
    display: flex;
    flex-direction: column;
}

.sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
}

.brand i {
    font-size: 1.5rem;
    color: var(--primary);
}

.sidebar-nav {
    flex: 1;
    padding: 1rem;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: var(--text-secondary);
    border-radius: var(--radius-md);
    margin-bottom: 0.25rem;
}

.nav-item:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
    color: white;
    background: var(--gradient-primary);
}

.page-main {
    flex: 1;
    margin-left: 260px;
}

.page-content {
    padding: 2rem;
    max-width: 800px;
}

.page-header {
    margin-bottom: 2rem;
}

.page-header h1 {
    margin: 0;
}

.upload-form {
    margin-bottom: 2rem;
}

.upload-dropzone {
    border: 2px dashed var(--border-color);
    border-radius: var(--radius-lg);
    padding: 3rem;
    text-align: center;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.upload-dropzone--thumb {
    padding: 1.5rem;
}

.upload-dropzone:hover {
    border-color: var(--primary);
}

.upload-dropzone.has-file {
    border-style: solid;
    border-color: var(--success);
}

.dropzone-content i {
    font-size: 3rem;
    color: var(--primary);
    margin-bottom: 1rem;
    display: block;
}

.dropzone-content--thumb i {
    font-size: 2.25rem;
    margin-bottom: 0.75rem;
}

.dropzone-content p {
    margin: 0;
}

.dropzone-content span {
    font-size: 0.875rem;
    color: var(--text-muted);
}

.file-preview {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.file-preview i {
    font-size: 2.5rem;
    color: var(--success);
}

.file-preview p {
    margin: 0;
    font-weight: 500;
}

.file-preview span {
    font-size: 0.875rem;
    color: var(--text-muted);
}

.thumb-preview {
    display: flex;
    align-items: center;
    gap: 1rem;
    text-align: left;
}

.thumb-preview img {
    width: 96px;
    height: 54px;
    object-fit: cover;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    background: var(--bg-darker);
    flex-shrink: 0;
}

.btn-remove {
    background: none;
    border: none;
    color: var(--danger);
    cursor: pointer;
    margin-left: auto;
}

.upload-progress {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.upload-progress .progress {
    flex: 1;
    height: 8px;
    background: var(--bg-darker);
    border-radius: var(--radius-full);
    overflow: hidden;
}

.upload-progress .progress-bar {
    height: 100%;
    background: var(--gradient-primary);
    transition: width 0.2s;
}

.my-uploads h3 {
    margin-bottom: 1rem;
}

.uploads-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.upload-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-card);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
}

.upload-info h4 {
    margin: 0 0 0.25rem;
    font-size: 1rem;
}

.upload-info p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-muted);
}

.upload-status {
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 500;
    margin-left: auto;
}

.upload-status.pending {
    background: rgba(245, 158, 11, 0.2);
    color: var(--warning);
}

.upload-status.approved {
    background: rgba(34, 197, 94, 0.2);
    color: var(--success);
}

.upload-status.rejected {
    background: rgba(239, 68, 68, 0.2);
    color: var(--danger);
}

.upload-thumb {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    background: var(--bg-darker);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--text-muted);
}

.upload-thumb img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    border-radius: inherit;
}
</style>
