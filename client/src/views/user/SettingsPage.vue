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
                <router-link to="/upload" class="nav-item"><i class="bi bi-cloud-upload-fill"></i><span>Upload
                        Lagu</span></router-link>
                <router-link to="/history" class="nav-item"><i class="bi bi-clock-history"></i><span>Riwayat &
                        Score</span></router-link>
                <router-link to="/request" class="nav-item"><i class="bi bi-plus-circle-fill"></i><span>Request
                        Lagu</span></router-link>
                <router-link to="/donation" class="nav-item"><i
                        class="bi bi-heart-fill"></i><span>Donasi</span></router-link>
                <div class="nav-divider"></div>
                <router-link to="/settings" class="nav-item active"><i
                        class="bi bi-gear-fill"></i><span>Pengaturan</span></router-link>
            </nav>
        </aside>

        <main class="page-main">
            <div class="page-content">
                <div class="page-header">
                    <h1><i class="bi bi-gear-fill me-2"></i>Pengaturan Akun</h1>
                    <p class="text-muted">Kelola profil dan keamanan akun Anda</p>
                </div>

                <!-- Profile Section -->
                <div class="settings-card card">
                    <div class="card-header">
                        <h3>Profil</h3>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="updateProfile">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Nama Lengkap</label>
                                        <input type="text" class="form-control" v-model="profile.name" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Username</label>
                                        <input type="text" class="form-control" v-model="profile.username" required>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" v-model="profile.email" required>
                            </div>
                            <div v-if="profileMessage"
                                :class="['alert', profileSuccess ? 'alert-success' : 'alert-danger']">
                                {{ profileMessage }}
                            </div>
                            <button type="submit" class="btn btn-primary" :disabled="savingProfile">
                                {{ savingProfile ? 'Menyimpan...' : 'Simpan Perubahan' }}
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Password Section -->
                <div class="settings-card card mt-4">
                    <div class="card-header">
                        <h3>Ubah Password</h3>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="changePassword">
                            <div class="mb-3">
                                <label class="form-label">Password Lama</label>
                                <input type="password" class="form-control" v-model="passwordForm.currentPassword"
                                    required>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Password Baru</label>
                                        <input type="password" class="form-control" v-model="passwordForm.newPassword"
                                            required minlength="6">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Konfirmasi Password Baru</label>
                                        <input type="password" class="form-control"
                                            v-model="passwordForm.confirmNewPassword" required>
                                    </div>
                                </div>
                            </div>
                            <div v-if="passwordMessage"
                                :class="['alert', passwordSuccess ? 'alert-success' : 'alert-danger']">
                                {{ passwordMessage }}
                            </div>
                            <button type="submit" class="btn btn-primary" :disabled="savingPassword">
                                {{ savingPassword ? 'Menyimpan...' : 'Ubah Password' }}
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Logout -->
                <div class="mt-4">
                    <button class="btn btn-outline-danger" @click="handleLogout">
                        <i class="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                </div>
            </div>
        </main>

        <!-- Mobile Navigation -->
        <MobileNav />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/services/api'
import MobileNav from '@/components/MobileNav.vue'

const router = useRouter()
const authStore = useAuthStore()

const profile = ref({ name: '', username: '', email: '' })
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
const savingProfile = ref(false)
const savingPassword = ref(false)
const profileMessage = ref('')
const profileSuccess = ref(false)
const passwordMessage = ref('')
const passwordSuccess = ref(false)

const loadProfile = () => {
    if (authStore.user) {
        profile.value = {
            name: authStore.user.name,
            username: authStore.user.username,
            email: authStore.user.email
        }
    }
}

const updateProfile = async () => {
    savingProfile.value = true
    profileMessage.value = ''

    const result = await authStore.updateProfile(profile.value)

    profileSuccess.value = result.success
    profileMessage.value = result.success ? 'Profil berhasil diupdate!' : result.error
    savingProfile.value = false
}

const changePassword = async () => {
    passwordMessage.value = ''

    if (passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword) {
        passwordMessage.value = 'Password baru tidak cocok'
        passwordSuccess.value = false
        return
    }

    savingPassword.value = true

    try {
        await authAPI.changePassword(passwordForm.value)
        passwordSuccess.value = true
        passwordMessage.value = 'Password berhasil diubah!'
        passwordForm.value = { currentPassword: '', newPassword: '', confirmNewPassword: '' }
    } catch (err) {
        passwordSuccess.value = false
        passwordMessage.value = err.response?.data?.message || 'Gagal mengubah password'
    } finally {
        savingPassword.value = false
    }
}

const handleLogout = () => {
    authStore.logout()
    router.push('/')
}

onMounted(loadProfile)
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

.nav-divider {
    height: 1px;
    background: var(--border-color);
    margin: 1rem 0;
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

.settings-card .card-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.settings-card .card-header h3 {
    margin: 0;
    font-size: 1.125rem;
}

.settings-card .card-body {
    padding: 1.5rem;
}
</style>
