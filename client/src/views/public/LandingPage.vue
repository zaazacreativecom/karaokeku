<template>
  <div class="landing-container">
    <!-- Background (decorative) -->
    <div class="landing-bg" aria-hidden="true">
      <div class="bg-mesh"></div>
      <div class="bg-particles"></div>
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
    </div>

    <!-- Topbar -->
    <header class="landing-topbar">
      <div class="topbar-inner">
        <button class="brand-mini" type="button" @click="scrollToTop">
          <span class="brand-mini__icon" aria-hidden="true">
            <i class="bi bi-music-note-beamed"></i>
          </span>
          <span class="brand-mini__text">
            Karaoke<span class="text-gradient">Ku</span>
          </span>
        </button>

        <nav class="topbar-nav d-none d-lg-flex" aria-label="Navigasi landing">
          <button type="button" class="nav-link" @click="scrollToSection('favorites')">Favorit</button>
          <button type="button" class="nav-link" @click="scrollToSection('popular')">Populer</button>
          <button v-if="leaderboard.length" type="button" class="nav-link" @click="scrollToSection('leaderboard')">
            Top Singer
          </button>
        </nav>

        <div class="topbar-actions">
          <button type="button" class="btn btn-ghost btn-sm d-none d-sm-inline-flex" @click="focusAuth('login')">
            Masuk
          </button>
          <button type="button" class="topbar-icon-btn d-sm-none" @click="focusAuth('login')" aria-label="Masuk">
            <i class="bi bi-box-arrow-in-right" aria-hidden="true"></i>
          </button>
          <button type="button" class="btn btn-primary btn-sm" @click="focusAuth('register')">
            <span class="d-none d-sm-inline">Mulai Gratis</span>
            <span class="d-sm-none">Daftar</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="landing-content">
      <!-- Left -->
      <section class="landing-left" aria-label="Konten utama">
        <section class="hero-spotlight" aria-label="Perkenalan">
          <div class="hero-spotlight__grid">
            <div class="hero__copy">
              <div class="logo-wrapper">
                <span class="logo-badge" aria-hidden="true">
                  <i class="bi bi-music-note-beamed"></i>
                </span>
                <div class="brand-section">
                  <div class="hero-kicker" aria-label="Highlight">
                    <span class="kicker-pill">
                      <i class="bi bi-broadcast" aria-hidden="true"></i>
                      Real-time
                    </span>
                    <span class="kicker-pill">
                      <i class="bi bi-mic-fill" aria-hidden="true"></i>
                      Vocal/Karaoke
                    </span>
                    <span class="kicker-pill">
                      <i class="bi bi-trophy-fill" aria-hidden="true"></i>
                      Score
                    </span>
                  </div>
                  <h1 class="hero-title">
                    Karaoke<span class="text-gradient">Ku</span>
                  </h1>
                  <p class="hero-subtitle">Karaoke online yang ringan, seru, dan siap di semua perangkat.</p>
                </div>
              </div>

              <p class="hero-desc">
                Pilih lagu favorit, nyanyi dengan mode Vocal/Karaoke, pantau lirik, kumpulkan skor, dan ngobrol bareng
                teman secara real-time.
              </p>

              <div class="hero-actions">
                <button type="button" class="btn btn-primary btn-lg" @click="focusAuth('register')">
                  Mulai Gratis <i class="bi bi-arrow-right"></i>
                </button>
                <button type="button" class="btn btn-outline-primary btn-lg" @click="focusAuth('login')">
                  Saya Sudah Punya Akun
                </button>
              </div>

              <div class="hero-features" aria-label="Fitur unggulan">
                <div class="feature-pill">
                  <i class="bi bi-music-note-list"></i>
                  Koleksi Lagu
                </div>
                <div class="feature-pill">
                  <i class="bi bi-heart-pulse"></i>
                  Favorit & Playlist
                </div>
                <div class="feature-pill">
                  <i class="bi bi-chat-dots"></i>
                  Request Lagu
                </div>
                <div class="feature-pill">
                  <i class="bi bi-upload"></i>
                  Upload Mandiri
                </div>
              </div>
            </div>

            <div class="hero__visual d-none d-lg-block" aria-hidden="true">
              <div class="visual-card card-border">
                <div class="visual-top">
                  <span class="dot dot--g"></span>
                  <span class="dot dot--b"></span>
                  <span class="dot dot--c"></span>
                </div>

                <div class="visual-title">
                  <span class="visual-title__pill"></span>
                  <span class="visual-title__pill pill--short"></span>
                </div>

                <div class="equalizer">
                  <span v-for="i in 12" :key="i" class="bar" :style="{ animationDelay: `${i * 80}ms` }"></span>
                </div>

                <div class="visual-micro">
                  <span class="micro-chip"><i class="bi bi-mic-fill"></i> Karaoke</span>
                  <span class="micro-chip"><i class="bi bi-stars"></i> Score</span>
                  <span class="micro-chip"><i class="bi bi-people-fill"></i> Party</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="howto lp-panel card-glass card-border" aria-label="Cara mulai">
          <div class="howto-head">
            <h3 class="howto-title">
              <i class="bi bi-lightning-charge-fill" aria-hidden="true"></i>
              Mulai dalam 3 langkah
            </h3>
            <p class="howto-sub">Cepat, simpel, dan langsung bisa karaoke.</p>
          </div>

          <div class="howto-grid">
            <div class="howto-card">
              <div class="howto-icon" aria-hidden="true"><i class="bi bi-person-check-fill"></i></div>
              <div class="howto-body">
                <div class="howto-step">Langkah 1</div>
                <div class="howto-label">Masuk / Daftar</div>
                <div class="howto-desc">Gunakan email/username atau Google (jika sudah diaktifkan).</div>
              </div>
            </div>

            <div class="howto-card">
              <div class="howto-icon howto-icon--alt" aria-hidden="true"><i class="bi bi-music-note-list"></i></div>
              <div class="howto-body">
                <div class="howto-step">Langkah 2</div>
                <div class="howto-label">Pilih Lagu</div>
                <div class="howto-desc">Cari lagu favorit, lihat yang populer, atau pakai playlist.</div>
              </div>
            </div>

            <div class="howto-card">
              <div class="howto-icon howto-icon--blue" aria-hidden="true"><i class="bi bi-mic-fill"></i></div>
              <div class="howto-body">
                <div class="howto-step">Langkah 3</div>
                <div class="howto-label">Nyanyi & Dapat Score</div>
                <div class="howto-desc">Simpan riwayat dan kejar posisi di leaderboard.</div>
              </div>
            </div>
          </div>
        </section>

        <section class="showcase" aria-label="Preview lagu dan leaderboard">
          <div class="showcase-grid">
            <div class="showcase-card lp-panel card card-glass card-border" ref="favoritesSection">
              <div class="card-head">
                <h3 class="card-title">
                  <i class="bi bi-heart-fill"></i>
                  Lagu Terfavorit
                </h3>
                <span class="card-chip">Top Favorit</span>
              </div>

              <div class="top-songs-list" v-if="!loadingSongs">
                <div v-for="(song, index) in topSongs" :key="song.id" class="top-song-item animate-item"
                  :style="{ animationDelay: `${index * 70}ms` }">
                  <span class="song-rank" :class="{ 'is-top': index === 0 }">{{ index + 1 }}</span>
                  <div class="song-info">
                    <h4 class="song-title">{{ song.title }}</h4>
                    <p class="song-artist">{{ song.artist }}</p>
                  </div>
                  <span class="song-metric">
                    <i class="bi bi-heart-fill"></i>
                    {{ song.favorite_count || 0 }}
                  </span>
                </div>
              </div>

              <div v-else class="loading-songs">
                <div v-for="i in 5" :key="i" class="song-skeleton loading-skeleton"></div>
              </div>
            </div>

            <div class="showcase-card lp-panel card card-glass card-border" ref="popularSection">
              <div class="card-head">
                <h3 class="card-title">
                  <i class="bi bi-graph-up-arrow"></i>
                  Lagu Terpopuler
                </h3>
                <span class="card-chip chip--blue">Most Played</span>
              </div>

              <div class="top-songs-list" v-if="!loadingSongs">
                <div v-for="(song, index) in popularSongs" :key="song.id" class="top-song-item animate-item"
                  :style="{ animationDelay: `${index * 70}ms` }">
                  <span class="song-rank" :class="{ 'is-top': index === 0 }">{{ index + 1 }}</span>
                  <div class="song-info">
                    <h4 class="song-title">{{ song.title }}</h4>
                    <p class="song-artist">{{ song.artist }}</p>
                  </div>
                  <span class="song-metric metric--plays">
                    <i class="bi bi-play-fill"></i>
                    {{ formatPlayCount(song.play_count) }}
                  </span>
                </div>
              </div>

              <div v-else class="loading-songs">
                <div v-for="i in 5" :key="i" class="song-skeleton loading-skeleton"></div>
              </div>
            </div>
          </div>

          <div class="leaderboard-card lp-panel card card-glass card-border" v-if="leaderboard.length > 0"
            ref="leaderboardSection">
            <div class="card-head">
              <h3 class="card-title">
                <i class="bi bi-trophy-fill"></i>
                Top Singers
              </h3>
              <span class="card-chip chip--gold">Leaderboard</span>
            </div>

            <div class="leaderboard-list">
              <div v-for="(user, index) in leaderboard.slice(0, 3)" :key="user.id" class="leaderboard-item animate-item"
                :style="{ animationDelay: `${index * 90}ms` }">
                <span class="rank-badge" :class="`rank-${index + 1}`">
                  {{ index + 1 }}
                </span>
                <span class="user-name">{{ user.name }}</span>
                <span class="user-score">{{ user.total_score }} pts</span>
              </div>
            </div>
          </div>
        </section>
      </section>

      <!-- Right -->
      <aside class="landing-right" ref="authSection" aria-label="Autentikasi">
        <div class="auth-card lp-panel card card-glass card-border" :class="{ 'is-register': activeTab === 'register' }">
          <div class="auth-head">
            <p class="auth-eyebrow">Selamat datang</p>
            <h2 class="auth-title">
              {{ activeTab === 'login' ? 'Masuk ke KaraokeKu' : 'Daftar Akun Baru' }}
            </h2>
            <p class="auth-subtitle">
              {{ activeTab === 'login' ? 'Lanjutkan sesi dan mulai bernyanyi.' : 'Daftar cepat, lalu langsung karaoke.'
              }}
            </p>
          </div>

          <div class="auth-tabs" role="tablist" aria-label="Pilih mode autentikasi">
            <span class="tab-indicator" aria-hidden="true"></span>
            <button type="button" class="auth-tab" :class="{ active: activeTab === 'login' }" role="tab"
              :aria-selected="activeTab === 'login'" @click="setTab('login')">
              Masuk
            </button>
            <button type="button" class="auth-tab" :class="{ active: activeTab === 'register' }" role="tab"
              :aria-selected="activeTab === 'register'" @click="setTab('register')">
              Daftar
            </button>
          </div>

          <transition name="fade-slide" mode="out-in">
            <div v-if="activeTab === 'login'" key="login" class="auth-form">
              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label class="form-label">Email atau Username</label>
                  <div class="input-with-icon">
                    <i class="bi bi-person-badge" aria-hidden="true"></i>
                    <input ref="loginIdentityInput" type="text" class="form-control" v-model="loginForm.emailOrUsername"
                      placeholder="Masukkan email atau username" required>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <div class="input-with-icon password-input">
                    <i class="bi bi-lock" aria-hidden="true"></i>
                    <input ref="loginPasswordInput" :type="showPassword ? 'text' : 'password'" class="form-control"
                      v-model="loginForm.password" placeholder="Masukkan password" required>
                    <button type="button" class="toggle-password" @click="showPassword = !showPassword"
                      :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'">
                      <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>
                </div>

                <div class="alert alert-danger" v-if="authError">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  {{ authError }}
                </div>

                <button type="submit" class="btn btn-primary w-100 btn-lg" :disabled="authLoading">
                  <span v-if="authLoading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ authLoading ? 'Memproses...' : 'Masuk' }}
                </button>

                <div class="auth-divider" aria-hidden="true">
                  <span>atau</span>
                </div>

                <div class="google-auth">
                  <template v-if="googleEnabled">
                    <button type="button" class="btn btn-ghost w-100 google-btn" @click="handleGoogleLogin"
                      :disabled="authLoading">
                      <i class="bi bi-google me-2" aria-hidden="true"></i>
                      {{ authLoading ? 'Memproses...' : 'Login dengan Google' }}
                    </button>

                    <p v-if="googleError" class="google-error">
                      <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
                      {{ googleError }}
                    </p>

                    <p v-else class="google-note">
                      Di iOS/Safari, login akan menggunakan redirect. Jika popup diblokir, otomatis pakai redirect.
                    </p>
                  </template>

                  <template v-else>
                    <button type="button" class="btn btn-ghost w-100 google-disabled" disabled>
                      <i class="bi bi-google me-2" aria-hidden="true"></i>
                      Login dengan Google (belum aktif)
                    </button>
                    <p class="google-note">
                      Untuk mengaktifkan, set env Firebase (<code>VITE_FIREBASE_API_KEY</code>,
                      <code>VITE_FIREBASE_AUTH_DOMAIN</code>,
                      <code>VITE_FIREBASE_PROJECT_ID</code>, <code>VITE_FIREBASE_APP_ID</code>).
                    </p>
                  </template>
                </div>
              </form>
            </div>

            <div v-else key="register" class="auth-form">
              <form @submit.prevent="handleRegister">
                <div class="mb-3">
                  <label class="form-label">Nama Lengkap</label>
                  <div class="input-with-icon">
                    <i class="bi bi-person-fill" aria-hidden="true"></i>
                    <input ref="registerNameInput" type="text" class="form-control" v-model="registerForm.name"
                      placeholder="Masukkan nama lengkap" required>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <div class="input-with-icon">
                    <i class="bi bi-envelope-fill" aria-hidden="true"></i>
                    <input type="email" class="form-control" v-model="registerForm.email" placeholder="Masukkan email"
                      required>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Username</label>
                  <div class="input-with-icon">
                    <i class="bi bi-at" aria-hidden="true"></i>
                    <input type="text" class="form-control" v-model="registerForm.username" placeholder="Pilih username"
                      required>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <div class="input-with-icon">
                    <i class="bi bi-key-fill" aria-hidden="true"></i>
                    <input type="password" class="form-control" v-model="registerForm.password"
                      placeholder="Minimal 6 karakter" required>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Konfirmasi Password</label>
                  <div class="input-with-icon">
                    <i class="bi bi-check2-circle" aria-hidden="true"></i>
                    <input type="password" class="form-control" v-model="registerForm.confirmPassword"
                      placeholder="Ulangi password" required>
                  </div>
                </div>

                <div class="alert alert-danger" v-if="authError">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  {{ authError }}
                </div>

                <button type="submit" class="btn btn-primary w-100 btn-lg" :disabled="authLoading">
                  <span v-if="authLoading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ authLoading ? 'Memproses...' : 'Daftar Sekarang' }}
                </button>
              </form>
            </div>
          </transition>

          <p class="auth-footnote">
            Dengan melanjutkan, Anda menyetujui <span class="muted-link">S&amp;K</span> dan
            <span class="muted-link">Kebijakan Privasi</span>.
          </p>
        </div>

        <div class="mini-trust lp-panel card card-glass card-border d-none d-lg-block">
          <div class="mini-trust__row">
            <i class="bi bi-shield-check"></i>
            <span>Login aman &amp; cepat</span>
          </div>
          <div class="mini-trust__row">
            <i class="bi bi-lightning-charge"></i>
            <span>Performa ringan</span>
          </div>
          <div class="mini-trust__row">
            <i class="bi bi-cloud-arrow-up"></i>
            <span>Upload lagu sendiri</span>
          </div>
        </div>
      </aside>
    </main>

    <footer class="landing-footer">
      <p>
        Created by
        <a href="https://github.com/apriliansya" target="_blank" rel="noopener noreferrer">Deny Apriliansyah</a>
      </p>
      <p>Version 1.0.0</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { songsAPI, playbackAPI, favoritesAPI } from '@/services/api'
import { createGoogleProvider, getFirebaseAuth, isFirebaseConfigured } from '@/services/firebase'
import {
  browserLocalPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect
} from 'firebase/auth'

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

// Refs (UI)
const authSection = ref(null)
const favoritesSection = ref(null)
const popularSection = ref(null)
const leaderboardSection = ref(null)
const loginIdentityInput = ref(null)
const loginPasswordInput = ref(null)
const registerNameInput = ref(null)

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

// Google Login
const googleEnabled = computed(() => isFirebaseConfigured)
const googleError = ref('')

// Methods
const setTab = (tab) => {
  activeTab.value = tab
  authError.value = ''
  if (tab !== 'login') showPassword.value = false
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const scrollToSection = (key) => {
  const map = {
    favorites: favoritesSection.value,
    popular: popularSection.value,
    leaderboard: leaderboardSection.value
  }

  const el = map[key]
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const focusAuth = async (tab = 'login') => {
  setTab(tab)
  await nextTick()
  authSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  await nextTick()

  if (tab === 'register') {
    registerNameInput.value?.focus?.()
    return
  }

  loginIdentityInput.value?.focus?.()
}

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

const formatFirebaseAuthError = (err) => {
  const code = String(err?.code || '')
  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
  const protocol = typeof window !== 'undefined' ? window.location.protocol : ''

  if (code === 'auth/popup-closed-by-user') return 'Login dibatalkan.'
  if (code === 'auth/cancelled-popup-request') return 'Request popup dibatalkan. Coba lagi.'
  if (code === 'auth/popup-blocked') return 'Popup diblokir browser. Coba izinkan popup atau gunakan mode redirect.'
  if (code === 'auth/redirect-cancelled-by-user') return 'Login dibatalkan.'
  if (code === 'auth/unauthorized-domain') {
    return hostname
      ? `Domain "${hostname}" belum diizinkan di Firebase (Authentication → Settings → Authorized domains).`
      : 'Domain belum diizinkan di Firebase (Authentication → Settings → Authorized domains).'
  }
  if (code === 'auth/invalid-continue-uri') {
    return 'Redirect URL tidak valid. Pastikan domain origin sudah ada di Authorized domains Firebase.'
  }
  if (code === 'auth/operation-not-allowed') return 'Google provider belum diaktifkan di Firebase Auth.'
  if (code === 'auth/web-storage-unsupported')
    return 'Browser memblokir penyimpanan (cookies/storage). Nonaktifkan mode private / blokir cookies lalu coba lagi.'
  if (code === 'auth/network-request-failed') return 'Koneksi bermasalah. Coba lagi.'

  if (protocol === 'http:' && hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return 'Login Google biasanya butuh HTTPS untuk domain non-localhost. Coba akses lewat HTTPS atau gunakan domain localhost.'
  }

  return 'Login dengan Google gagal. Coba lagi.'
}

const shouldUseGoogleRedirect = () => {
  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/i.test(ua) || (ua.includes('Mac') && 'ontouchend' in document)
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.navigator?.standalone === true

  // iOS PWA/standalone sering bermasalah dengan popup → redirect lebih aman.
  if (isIOS && isStandalone) return true

  // Android Chrome umumnya aman pakai popup (lebih mulus untuk PWA). Redirect tetap jadi fallback bila popup diblokir.
  return false
}

const GOOGLE_REDIRECT_PENDING_KEY = 'karaoke_google_redirect_pending'

const ensureFirebaseAuthPersistence = async (auth) => {
  try {
    await setPersistence(auth, browserLocalPersistence)
  } catch (_) {
    // ignore (some environments block web storage)
  }
}

const waitForFirebaseUser = (auth, timeoutMs = 2500) => {
  return new Promise((resolve) => {
    let done = false

    const finish = (user) => {
      if (done) return
      done = true
      resolve(user || auth.currentUser || null)
    }

    const timer = window.setTimeout(() => finish(null), timeoutMs)

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        window.clearTimeout(timer)
        unsubscribe()
        finish(user)
      },
      () => {
        window.clearTimeout(timer)
        unsubscribe()
        finish(null)
      }
    )
  })
}

const loginWithFirebaseGoogleUser = async (firebaseUser) => {
  const idToken = await firebaseUser.getIdToken(true)
  const result = await authStore.loginWithGoogle(idToken)

  if (result.success) {
    router.push('/dashboard')
    return
  }

  authError.value = result.error
  await focusAuth('login')
}

const handleGoogleLogin = async () => {
  if (!googleEnabled.value) {
    googleError.value = 'Google login belum aktif.'
    return
  }

  if (authLoading.value) return

  authError.value = ''
  googleError.value = ''
  authLoading.value = true

  try {
    const auth = getFirebaseAuth()
    if (!auth) {
      googleError.value = 'Firebase belum dikonfigurasi.'
      return
    }

    await ensureFirebaseAuthPersistence(auth)
    const provider = createGoogleProvider()

    if (shouldUseGoogleRedirect()) {
      localStorage.setItem(GOOGLE_REDIRECT_PENDING_KEY, '1')
      await signInWithRedirect(auth, provider)
      return
    }

    let result
    try {
      result = await signInWithPopup(auth, provider)
    } catch (err) {
      const code = String(err?.code || '')
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/operation-not-supported-in-this-environment'
      ) {
        localStorage.setItem(GOOGLE_REDIRECT_PENDING_KEY, '1')
        await signInWithRedirect(auth, provider)
        return
      }
      throw err
    }

    await loginWithFirebaseGoogleUser(result.user)
  } catch (err) {
    console.error('Firebase Google login error:', err)
    googleError.value = formatFirebaseAuthError(err)
    localStorage.removeItem(GOOGLE_REDIRECT_PENDING_KEY)
  } finally {
    authLoading.value = false
  }
}

const handleGoogleRedirectResult = async () => {
  if (!googleEnabled.value) return

  const auth = getFirebaseAuth()
  if (!auth) return

  await ensureFirebaseAuthPersistence(auth)

  const hasPendingRedirect = localStorage.getItem(GOOGLE_REDIRECT_PENDING_KEY) === '1'
  const hasAppToken = Boolean(localStorage.getItem('token'))

  // Jika sudah ada token app, biarkan checkAuth/router guard yang handle redirect user.
  if (hasAppToken) {
    localStorage.removeItem(GOOGLE_REDIRECT_PENDING_KEY)
    return
  }

  if (hasPendingRedirect) {
    authLoading.value = true
  }

  try {
    const result = await getRedirectResult(auth)
    let user = result?.user || auth.currentUser

    if (!user && hasPendingRedirect) {
      user = await waitForFirebaseUser(auth)
    }

    localStorage.removeItem(GOOGLE_REDIRECT_PENDING_KEY)
    if (!user) {
      if (hasPendingRedirect) {
        googleError.value = 'Login Google belum selesai. Coba klik "Login dengan Google" lagi.'
        await focusAuth('login')
      }
      return
    }

    authError.value = ''
    googleError.value = ''
    await loginWithFirebaseGoogleUser(user)
  } catch (err) {
    console.error('Firebase redirect result error:', err)
    googleError.value = formatFirebaseAuthError(err)
    localStorage.removeItem(GOOGLE_REDIRECT_PENDING_KEY)
  } finally {
    authLoading.value = false
  }
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

onMounted(async () => {
  await handleGoogleRedirectResult()
  fetchData()
})
</script>

<style scoped>
.landing-container {
  /* Local theme override (green–blue gradient) */
  --lp-green: #22c55e;
  --lp-cyan: #06b6d4;
  --lp-blue: #3b82f6;

  --primary: var(--lp-green);
  --primary-light: #4ade80;
  --primary-dark: #16a34a;
  --accent: var(--lp-cyan);

  /* Brighter text palette for this page */
  --text-primary: rgba(255, 255, 255, 0.96);
  --text-secondary: rgba(235, 255, 252, 0.86);
  --text-muted: rgba(235, 255, 252, 0.74);

  --bg-dark: #061319;
  --bg-darker: #040c10;
  --bg-card: rgba(10, 22, 28, 0.72);
  --bg-card-hover: rgba(14, 30, 37, 0.82);
  --border-color: rgba(94, 234, 212, 0.14);
  --border-color-light: rgba(94, 234, 212, 0.28);

  --gradient-primary: linear-gradient(135deg, #22c55e 0%, #06b6d4 55%, #3b82f6 100%);
  --gradient-glow: linear-gradient(135deg,
      rgba(34, 197, 94, 0.35) 0%,
      rgba(6, 182, 212, 0.35) 55%,
      rgba(59, 130, 246, 0.25) 100%);
  --shadow-glow: 0 0 36px rgba(6, 182, 212, 0.35);

  color: var(--text-primary);
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  overflow-x: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Background */
.landing-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.bg-mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(900px 600px at 10% 10%, rgba(34, 197, 94, 0.25) 0%, transparent 55%),
    radial-gradient(860px 560px at 90% 18%, rgba(6, 182, 212, 0.22) 0%, transparent 55%),
    radial-gradient(980px 680px at 70% 92%, rgba(59, 130, 246, 0.18) 0%, transparent 60%),
    linear-gradient(180deg, rgba(2, 6, 23, 0.2) 0%, rgba(2, 6, 23, 0.92) 70%),
    var(--bg-dark);
}

.bg-particles {
  position: absolute;
  inset: 0;
  opacity: 0.9;
  background-image: url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306b6d4' fill-opacity='0.06'%3E%3Ccircle cx='10' cy='14' r='1.6'/%3E%3Ccircle cx='38' cy='30' r='1.4'/%3E%3Ccircle cx='54' cy='50' r='1.8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.bg-orb {
  position: absolute;
  width: 460px;
  height: 460px;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.35;
  animation: orbFloat 14s ease-in-out infinite;
}

.orb-1 {
  background: rgba(34, 197, 94, 0.35);
  top: -160px;
  left: -180px;
}

.orb-2 {
  background: rgba(6, 182, 212, 0.38);
  bottom: -200px;
  right: -180px;
  animation-delay: -4s;
}

.orb-3 {
  width: 320px;
  height: 320px;
  background: rgba(59, 130, 246, 0.22);
  top: 30%;
  right: 18%;
  animation-delay: -9s;
}

@keyframes orbFloat {

  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    transform: translate3d(20px, -14px, 0) scale(1.05);
  }
}

/* Topbar */
.landing-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 0.85rem 1rem;
  background: rgba(4, 12, 16, 0.55);
  border-bottom: 1px solid rgba(94, 234, 212, 0.18);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.topbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand-mini {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: none;
  padding: 0;
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
}

.brand-mini__icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(94, 234, 212, 0.08);
  border: 1px solid rgba(94, 234, 212, 0.18);
  box-shadow: 0 12px 36px rgba(6, 182, 212, 0.14);
}

.brand-mini__icon i {
  font-size: 1.25rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-mini__text {
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
}

.topbar-nav {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: var(--radius-full);
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(255, 255, 255, 0.04);
}

.nav-link {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  padding: 0.5rem 0.9rem;
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
}

.nav-link:hover {
  background: rgba(94, 234, 212, 0.1);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.topbar-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.topbar-icon-btn {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
}

.topbar-icon-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(94, 234, 212, 0.28);
}

.topbar-icon-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.22);
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.07);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.12);
}

.btn-primary:hover {
  box-shadow: 0 0 44px rgba(6, 182, 212, 0.45);
}

.form-control:focus {
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.18);
}

/* Content Layout */
.landing-content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 2.5rem;
  padding: 2.25rem 1.25rem 2.75rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  align-items: start;
}

/* Left Section */
.landing-left {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.logo-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.brand-section {
  min-width: 0;
}

.brand-section .text-gradient {
  filter: drop-shadow(0 10px 22px rgba(6, 182, 212, 0.18));
}

.hero-kicker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin: 0 0 0.4rem;
}

.kicker-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.6rem;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(94, 234, 212, 0.16);
  color: rgba(235, 255, 252, 0.82);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.kicker-pill i {
  color: rgba(94, 234, 212, 0.95);
}

.logo-badge {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(94, 234, 212, 0.09);
  border: 1px solid rgba(94, 234, 212, 0.22);
  box-shadow: 0 18px 40px rgba(6, 182, 212, 0.16);
}

.logo-badge i {
  font-size: 1.55rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-spotlight {
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background:
    radial-gradient(900px 520px at 10% 0%, rgba(34, 197, 94, 0.22) 0%, transparent 60%),
    radial-gradient(820px 520px at 92% 8%, rgba(6, 182, 212, 0.18) 0%, transparent 60%),
    radial-gradient(920px 620px at 60% 100%, rgba(59, 130, 246, 0.14) 0%, transparent 65%),
    rgba(10, 22, 28, 0.46);
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.62), 0 0 0 1px rgba(94, 234, 212, 0.06) inset;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.hero-spotlight::before {
  content: '';
  position: absolute;
  left: 18px;
  right: 18px;
  top: 0;
  height: 1px;
  border-radius: 999px;
  background: var(--gradient-primary);
  opacity: 0.85;
  pointer-events: none;
}

.hero-spotlight__grid {
  position: relative;
  z-index: 1;
  padding: 2rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 2rem;
  align-items: start;
}

.hero__copy {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  min-width: 0;
}

.hero-title {
  font-size: 3rem;
  font-weight: 850;
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.08;
}

.hero-subtitle {
  margin: 0.15rem 0 0;
  font-size: 1.05rem;
  color: var(--text-secondary);
}

.hero-desc {
  margin: 0.3rem 0 0.2rem;
  color: var(--text-secondary);
  max-width: 62ch;
  line-height: 1.55;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.35rem;
}

.hero-actions .btn {
  border-radius: 14px;
}

.hero-actions .btn i {
  font-size: 1.1rem;
}

.hero-features {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.feature-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.85rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(94, 234, 212, 0.14);
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  transition: transform var(--transition-normal), border-color var(--transition-normal), background var(--transition-normal);
  min-height: 54px;
}

.feature-pill:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(94, 234, 212, 0.26);
}

.feature-pill i {
  width: 34px;
  height: 34px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(94, 234, 212, 0.1);
  border: 1px solid rgba(94, 234, 212, 0.16);
  color: rgba(94, 234, 212, 0.98);
  font-size: 1.05rem;
}

.hero__visual {
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  align-self: stretch;
}

.howto {
  border-radius: var(--radius-xl);
  padding: 1.5rem 1.75rem;
}

.howto-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.howto-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 850;
  letter-spacing: -0.01em;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.howto-title i {
  color: rgba(94, 234, 212, 0.95);
}

.howto-sub {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.howto-grid {
  margin-top: 1.1rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}

.howto-card {
  display: flex;
  gap: 0.85rem;
  padding: 0.95rem 1rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(94, 234, 212, 0.14);
  transition: transform var(--transition-normal), border-color var(--transition-normal), background var(--transition-normal);
}

.howto-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(94, 234, 212, 0.26);
}

.howto-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  background: rgba(34, 197, 94, 0.14);
  border: 1px solid rgba(34, 197, 94, 0.24);
  color: rgba(235, 255, 252, 0.92);
}

.howto-icon--alt {
  background: rgba(94, 234, 212, 0.12);
  border-color: rgba(94, 234, 212, 0.22);
}

.howto-icon--blue {
  background: rgba(59, 130, 246, 0.14);
  border-color: rgba(59, 130, 246, 0.22);
}

.howto-icon i {
  font-size: 1.15rem;
}

.howto-body {
  min-width: 0;
}

.howto-step {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(94, 234, 212, 0.85);
  font-weight: 800;
}

.howto-label {
  margin-top: 0.2rem;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.howto-desc {
  margin-top: 0.2rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
  line-height: 1.4;
}

.visual-card {
  width: 100%;
  border-radius: var(--radius-xl);
  padding: 1.25rem;
  background: rgba(4, 12, 16, 0.36);
  border: 1px solid rgba(94, 234, 212, 0.12);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
}

.visual-top {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  opacity: 0.85;
}

.dot--g {
  background: rgba(34, 197, 94, 0.9);
}

.dot--b {
  background: rgba(6, 182, 212, 0.95);
}

.dot--c {
  background: rgba(59, 130, 246, 0.85);
}

.visual-title {
  margin-top: 0.85rem;
  display: grid;
  gap: 0.4rem;
}

.visual-title__pill {
  height: 10px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.14);
}

.pill--short {
  width: 66%;
}

.equalizer {
  margin-top: 1.25rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 96px;
  gap: 6px;
}

.bar {
  flex: 1;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  opacity: 0.85;
  transform-origin: bottom;
  animation: equalize 1.35s ease-in-out infinite;
}

@keyframes equalize {

  0%,
  100% {
    transform: scaleY(0.25);
  }

  50% {
    transform: scaleY(1);
  }
}

.visual-micro {
  margin-top: auto;
  padding-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.micro-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.7rem;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(94, 234, 212, 0.14);
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.micro-chip i {
  color: rgba(94, 234, 212, 0.95);
}

/* Cards (override glass tone) */
.card-glass {
  background: rgba(10, 22, 28, 0.66);
  border: 1px solid rgba(94, 234, 212, 0.14);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.card-border {
  position: relative;
}

.card-border::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: inherit;
  background: var(--gradient-glow);
  pointer-events: none;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.85;
}

@supports not ((-webkit-mask: linear-gradient(#000 0 0)) and (-webkit-mask-composite: xor)) {
  .card-border::before {
    content: none;
  }
}

.lp-panel {
  position: relative;
  overflow: hidden;
}

.lp-panel::after {
  content: '';
  position: absolute;
  left: 18px;
  right: 18px;
  top: 0;
  height: 1px;
  border-radius: 999px;
  background: var(--gradient-primary);
  opacity: 0.7;
  pointer-events: none;
}

.showcase {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.showcase-card {
  padding: 1.25rem;
  border-radius: var(--radius-xl);
}

.leaderboard-card {
  padding: 1.25rem;
  border-radius: var(--radius-xl);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.card-title {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.card-title i {
  font-size: 1.05rem;
  color: rgba(94, 234, 212, 0.95);
}

.card-chip {
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  color: rgba(235, 255, 252, 0.88);
  background: rgba(34, 197, 94, 0.14);
  border: 1px solid rgba(34, 197, 94, 0.22);
  white-space: nowrap;
}

.chip--blue {
  background: rgba(6, 182, 212, 0.14);
  border-color: rgba(6, 182, 212, 0.22);
}

.chip--gold {
  background: rgba(251, 191, 36, 0.14);
  border-color: rgba(251, 191, 36, 0.22);
}

/* Top Songs */
.top-songs-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.top-song-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.8rem 0.9rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  transition: transform var(--transition-normal), border-color var(--transition-normal), background var(--transition-normal);
}

.top-song-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(94, 234, 212, 0.28);
  transform: translateY(-2px);
}

.song-rank {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(94, 234, 212, 0.12);
  border: 1px solid rgba(94, 234, 212, 0.22);
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.875rem;
  color: rgba(235, 255, 252, 0.92);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15) inset;
}

.song-rank.is-top {
  background: var(--gradient-primary);
  border-color: rgba(255, 255, 255, 0.18);
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

.song-metric {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
  color: rgba(235, 255, 252, 0.9);
  font-size: 0.8rem;
  padding: 0.35rem 0.55rem;
  border-radius: var(--radius-full);
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.18);
}

.song-metric i {
  color: rgba(34, 197, 94, 0.95);
}

.metric--plays {
  background: rgba(6, 182, 212, 0.12);
  border-color: rgba(6, 182, 212, 0.18);
}

.metric--plays i {
  color: rgba(6, 182, 212, 0.95);
}

.song-skeleton {
  height: 60px;
  border-radius: 16px;
  margin-bottom: 0.5rem;
}

/* Leaderboard */
.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.85rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(94, 234, 212, 0.12);
  border-radius: 16px;
  transition: transform var(--transition-normal), border-color var(--transition-normal), background var(--transition-normal);
}

.leaderboard-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(94, 234, 212, 0.26);
  transform: translateY(-2px);
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
  color: rgba(94, 234, 212, 0.95);
}

/* Right Section - Auth */
.landing-right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-card {
  width: 100%;
  border-radius: var(--radius-xl);
  padding: 1.75rem;
}

@media (min-width: 992px) {
  .landing-right {
    position: sticky;
    top: 92px;
    align-self: start;
  }
}

.auth-head {
  margin-bottom: 1.25rem;
}

.auth-eyebrow {
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(94, 234, 212, 0.9);
}

.auth-title {
  margin: 0.35rem 0 0.25rem;
  font-size: 1.5rem;
}

.auth-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.auth-tabs {
  display: flex;
  position: relative;
  gap: 0;
  margin: 1.25rem 0 1.25rem;
  background: rgba(0, 0, 0, 0.28);
  padding: 0.25rem;
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  overflow: hidden;
}

.tab-indicator {
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  bottom: 0.25rem;
  width: calc(50% - 0.25rem);
  border-radius: 14px;
  background: var(--gradient-primary);
  box-shadow: var(--shadow-glow);
  transform: translateX(0);
  transition: transform var(--transition-normal);
  pointer-events: none;
}

.auth-card.is-register .tab-indicator {
  transform: translateX(100%);
}

.auth-tab {
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: color var(--transition-fast);
  position: relative;
  z-index: 1;
}

.auth-tab.active {
  color: white;
}

.auth-form {
  min-height: 320px;
}

.auth-divider {
  position: relative;
  margin: 1rem 0;
  text-align: center;
}

.auth-divider::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: rgba(94, 234, 212, 0.18);
}

.auth-divider span {
  position: relative;
  display: inline-block;
  padding: 0 0.85rem;
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(235, 255, 252, 0.75);
  background: rgba(10, 22, 28, 0.88);
  border: 1px solid rgba(94, 234, 212, 0.12);
  border-radius: 999px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.google-auth {
  display: grid;
  gap: 0.65rem;
}

.google-btn,
.google-placeholder {
  border: 1px solid rgba(94, 234, 212, 0.18);
}

.google-disabled {
  opacity: 0.85;
  cursor: not-allowed;
}

.google-note,
.google-error {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.4;
  padding: 0.75rem 0.9rem;
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(235, 255, 252, 0.86);
}

.google-error {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
  color: rgba(255, 255, 255, 0.92);
}

.google-note code {
  padding: 0.15rem 0.4rem;
  border-radius: 10px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(0, 0, 0, 0.25);
  color: rgba(235, 255, 252, 0.92);
}

.password-input {
  position: relative;
}

.input-with-icon {
  position: relative;
}

.input-with-icon>i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(235, 255, 252, 0.55);
  pointer-events: none;
  transition: color var(--transition-fast);
}

.input-with-icon .form-control {
  padding-left: 2.5rem;
}

.password-input .form-control {
  padding-right: 3rem;
}

.input-with-icon:focus-within>i {
  color: rgba(94, 234, 212, 0.95);
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  background: none;
  border: none;
  color: rgba(235, 255, 252, 0.55);
  cursor: pointer;
  z-index: 2;
}

.toggle-password:hover {
  color: rgba(94, 234, 212, 0.95);
}

.alert-danger {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: rgba(255, 255, 255, 0.92);
}

.auth-footnote {
  margin: 1rem 0 0;
  font-size: 0.78rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.muted-link {
  color: rgba(235, 255, 252, 0.78);
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 3px;
}

.mini-trust {
  border-radius: var(--radius-xl);
  padding: 1rem 1.1rem;
}

.mini-trust__row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.mini-trust__row i {
  color: rgba(94, 234, 212, 0.95);
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

/* Animations */
.animate-item {
  animation: itemIn 520ms ease both;
}

@keyframes itemIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {

  .bg-orb,
  .bar,
  .animate-item {
    animation: none !important;
  }

  .fade-slide-enter-active,
  .fade-slide-leave-active,
  .tab-indicator {
    transition: none !important;
  }
}

/* Responsive */
@media (max-width: 991.98px) {
  .landing-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .landing-left {
    order: 2;
  }

  .landing-right {
    order: 1;
  }

  .hero-spotlight__grid {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }

  .showcase-grid {
    grid-template-columns: 1fr;
  }

  .howto-grid {
    grid-template-columns: 1fr;
  }

  .auth-form {
    min-height: unset;
  }
}

@media (max-width: 575.98px) {
  .landing-topbar {
    padding: 0.75rem 0.85rem;
  }

  .landing-content {
    padding: 1.5rem 1rem 2.25rem;
  }

  .hero-title {
    font-size: 2.15rem;
  }

  .hero-subtitle {
    font-size: 0.98rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .hero-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .hero-features {
    grid-template-columns: 1fr;
  }

  .auth-card {
    padding: 1.25rem;
  }

  .howto {
    padding: 1.25rem;
  }

  .card-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.6rem;
  }

  .song-title {
    font-size: 0.92rem;
  }

  .song-metric {
    font-size: 0.78rem;
  }
}
</style>
