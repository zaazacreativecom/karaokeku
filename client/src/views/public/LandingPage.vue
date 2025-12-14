<template>
  <div class="landing-container">
    <!-- Background dengan efek -->
    <div class="landing-bg">
      <div class="bg-gradient"></div>
      <div class="bg-particles"></div>
    </div>

    <!-- Main Content -->
    <div class="landing-content">
      <!-- Left Section - Branding & Top Songs -->
      <div class="landing-left">
        <!-- Logo & Tagline -->
        <div class="brand-section">
          <div class="logo-wrapper">
            <i class="bi bi-music-note-beamed logo-icon"></i>
            <h1 class="brand-name">Karaoke<span class="text-gradient">Ku</span></h1>
          </div>
          <p class="tagline">Nyanyi Dimana Saja, Kapan Saja 🎤</p>
        </div>

        <!-- Popular Favorites -->
        <div class="top-songs-section">
          <h3 class="section-title">
            <i class="bi bi-heart-fill text-danger"></i>
            Lagu Terfavorit
          </h3>

          <div class="top-songs-list" v-if="!loadingSongs">
            <div v-for="(song, index) in topSongs" :key="song.id" class="top-song-item">
              <span class="song-rank">{{ index + 1 }}</span>
              <div class="song-info">
                <h4 class="song-title">{{ song.title }}</h4>
                <p class="song-artist">{{ song.artist }}</p>
              </div>
              <span class="song-plays">
                <i class="bi bi-heart-fill text-danger"></i>
                {{ song.favorite_count || 0 }}
              </span>
            </div>
          </div>

          <div v-else class="loading-songs">
            <div v-for="i in 5" :key="i" class="song-skeleton loading-skeleton"></div>
          </div>
        </div>

        <!-- Popular Songs (Most Played) -->
        <div class="top-songs-section mt-4">
          <h3 class="section-title">
            <i class="bi bi-fire text-warning"></i>
            Lagu Terpopuler
          </h3>

          <div class="top-songs-list" v-if="!loadingSongs">
            <div v-for="(song, index) in popularSongs" :key="song.id" class="top-song-item">
              <span class="song-rank">{{ index + 1 }}</span>
              <div class="song-info">
                <h4 class="song-title">{{ song.title }}</h4>
                <p class="song-artist">{{ song.artist }}</p>
              </div>
              <span class="song-plays">
                <i class="bi bi-play-fill text-primary"></i>
                {{ formatPlayCount(song.play_count) }}
              </span>
            </div>
          </div>

          <div v-else class="loading-songs">
            <div v-for="i in 5" :key="i" class="song-skeleton loading-skeleton"></div>
          </div>
        </div>

        <!-- Leaderboard Preview -->
        <div class="leaderboard-preview" v-if="leaderboard.length > 0">
          <h4 class="section-title">
            <i class="bi bi-trophy-fill"></i>
            Top Singers
          </h4>
          <div class="leaderboard-list">
            <div v-for="(user, index) in leaderboard.slice(0, 3)" :key="user.id" class="leaderboard-item">
              <span class="rank-badge" :class="`rank-${index + 1}`">
                {{ index + 1 }}
              </span>
              <span class="user-name">{{ user.name }}</span>
              <span class="user-score">{{ user.total_score }} pts</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Section - Auth Card -->
      <div class="landing-right">
        <div class="auth-card card card-glass">
          <!-- Tabs -->
          <div class="auth-tabs">
            <button class="auth-tab" :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">
              Masuk
            </button>
            <button class="auth-tab" :class="{ active: activeTab === 'register' }" @click="activeTab = 'register'">
              Daftar
            </button>
          </div>

          <!-- Login Form -->
          <div v-if="activeTab === 'login'" class="auth-form animate-fadeIn">
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label class="form-label">Email atau Username</label>
                <input type="text" class="form-control" v-model="loginForm.emailOrUsername"
                  placeholder="Masukkan email atau username" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Password</label>
                <div class="password-input">
                  <input :type="showPassword ? 'text' : 'password'" class="form-control" v-model="loginForm.password"
                    placeholder="Masukkan password" required>
                  <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>

              <div class="alert alert-danger" v-if="authError">
                {{ authError }}
              </div>

              <button type="submit" class="btn btn-primary w-100" :disabled="authLoading">
                <span v-if="authLoading" class="spinner-border spinner-border-sm me-2"></span>
                {{ authLoading ? 'Memproses...' : 'Masuk' }}
              </button>
            </form>
          </div>

          <!-- Register Form -->
          <div v-else class="auth-form animate-fadeIn">
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label class="form-label">Nama Lengkap</label>
                <input type="text" class="form-control" v-model="registerForm.name" placeholder="Masukkan nama lengkap"
                  required>
              </div>

              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" v-model="registerForm.email" placeholder="Masukkan email"
                  required>
              </div>

              <div class="mb-3">
                <label class="form-label">Username</label>
                <input type="text" class="form-control" v-model="registerForm.username" placeholder="Pilih username"
                  required>
              </div>

              <div class="mb-3">
                <label class="form-label">Password</label>
                <input type="password" class="form-control" v-model="registerForm.password"
                  placeholder="Minimal 6 karakter" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Konfirmasi Password</label>
                <input type="password" class="form-control" v-model="registerForm.confirmPassword"
                  placeholder="Ulangi password" required>
              </div>

              <div class="alert alert-danger" v-if="authError">
                {{ authError }}
              </div>

              <button type="submit" class="btn btn-primary w-100" :disabled="authLoading">
                <span v-if="authLoading" class="spinner-border spinner-border-sm me-2"></span>
                {{ authLoading ? 'Memproses...' : 'Daftar Sekarang' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="landing-footer">
      <p>Created by <a href="https://github.com/apriliansya">Deny Apriliansyah</a></p>
      <p>Version 1.0.0</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { songsAPI, playbackAPI, favoritesAPI } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

// State
const activeTab = ref('login')
const showPassword = ref(false)
const loadingSongs = ref(true)
const topSongs = ref([]) // Favorites
const popularSongs = ref([]) // Most Played
const leaderboard = ref([])
const authLoading = ref(false)
const authError = ref('')

// Forms
const loginForm = ref({
  emailOrUsername: '',
  password: ''
})

const registerForm = ref({
  name: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: ''
})

// Methods
const handleLogin = async () => {
  authError.value = ''
  authLoading.value = true

  const result = await authStore.login(loginForm.value)

  if (result.success) {
    router.push('/dashboard')
  } else {
    authError.value = result.error
  }

  authLoading.value = false
}

const handleRegister = async () => {
  authError.value = ''

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    authError.value = 'Password tidak cocok'
    return
  }

  authLoading.value = true

  const result = await authStore.register(registerForm.value)

  if (result.success) {
    router.push('/dashboard')
  } else {
    authError.value = result.error
  }

  authLoading.value = false
}

const formatPlayCount = (count) => {
  if (!count) return '0'
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
  return count.toString()
}

const fetchData = async () => {
  try {
    // Fetch popular favorites (Lagu Terfavorit)
    const favoritesResponse = await favoritesAPI.getPopular(5)
    topSongs.value = favoritesResponse.data.data || []

    // Fetch most played (Lagu Terpopuler)
    const popularResponse = await songsAPI.getTop(5)
    popularSongs.value = popularResponse.data.data || []

    // Fetch leaderboard
    const leaderboardResponse = await playbackAPI.getLeaderboard(3)
    leaderboard.value = leaderboardResponse.data.data || []
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loadingSongs.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.landing-container {
  min-height: 100vh;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Background */
.landing-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
    var(--bg-dark);
}

.bg-particles {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238b5cf6' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* Content Layout */
.landing-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 4rem;
  padding: 2rem 4rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  align-items: center;
}

/* Left Section */
.landing-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.brand-section {
  margin-bottom: 1rem;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.logo-icon {
  font-size: 3rem;
  color: var(--primary);
  text-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
}

.brand-name {
  font-size: 3rem;
  font-weight: 800;
  margin: 0;
}

.tagline {
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.section-title i {
  color: var(--warning);
}

/* Top Songs */
.top-songs-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.top-song-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
}

.top-song-item:hover {
  background: var(--bg-card-hover);
  border-color: var(--primary);
  transform: translateX(5px);
}

.song-rank {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 0.875rem;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

.song-plays {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.song-skeleton {
  height: 60px;
  border-radius: var(--radius-md);
  margin-bottom: 0.5rem;
}

/* Leaderboard */
.leaderboard-preview {
  margin-top: 1rem;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
}

.rank-badge {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
}

.rank-1 {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.rank-2 {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
}

.rank-3 {
  background: linear-gradient(135deg, #d97706, #b45309);
}

.user-name {
  flex: 1;
  font-size: 0.875rem;
}

.user-score {
  font-size: 0.8rem;
  color: var(--primary-light);
}

/* Right Section - Auth */
.landing-right {
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.auth-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--bg-darker);
  padding: 0.25rem;
  border-radius: var(--radius-md);
}

.auth-tab {
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-weight: 500;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.auth-tab.active {
  background: var(--gradient-primary);
  color: white;
}

.auth-form {
  min-height: 300px;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
}

/* Footer */
.landing-footer {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 1rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 992px) {
  .landing-content {
    grid-template-columns: 1fr;
    padding: 1.5rem;
    gap: 2rem;
    overflow-y: auto;
  }

  .landing-container {
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
  }

  .landing-left {
    order: 2;
  }

  .landing-right {
    order: 1;
  }

  .brand-name {
    font-size: 2.5rem;
  }
}
</style>
