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
          <i class="bi bi-music-note-beamed" aria-hidden="true"></i>
          <span>Karaoke<span class="text-gradient">Ku</span></span>
        </router-link>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item">
          <i class="bi bi-grid-1x2-fill" aria-hidden="true"></i><span>Dashboard</span>
        </router-link>
        <router-link to="/karaoke" class="nav-item">
          <i class="bi bi-mic-fill" aria-hidden="true"></i><span>Karaoke</span>
        </router-link>
        <router-link to="/songs" class="nav-item">
          <i class="bi bi-music-note-list" aria-hidden="true"></i><span>Pilih Lagu</span>
        </router-link>
        <router-link to="/favorites" class="nav-item">
          <i class="bi bi-heart-fill" aria-hidden="true"></i><span>Lagu Favorit</span>
        </router-link>
        <router-link to="/playlists" class="nav-item">
          <i class="bi bi-collection-play-fill" aria-hidden="true"></i><span>Playlist Saya</span>
        </router-link>
        <router-link to="/upload" class="nav-item">
          <i class="bi bi-cloud-upload-fill" aria-hidden="true"></i><span>Upload Lagu</span>
        </router-link>
        <router-link to="/history" class="nav-item">
          <i class="bi bi-clock-history" aria-hidden="true"></i><span>Riwayat & Score</span>
        </router-link>
        <router-link to="/request" class="nav-item">
          <i class="bi bi-plus-circle-fill" aria-hidden="true"></i><span>Request Lagu</span>
        </router-link>
        <router-link to="/donation" class="nav-item">
          <i class="bi bi-heart-fill" aria-hidden="true"></i><span>Donasi</span>
        </router-link>
        <div class="nav-divider"></div>
        <router-link to="/settings" class="nav-item active">
          <i class="bi bi-gear-fill" aria-hidden="true"></i><span>Pengaturan</span>
        </router-link>
      </nav>
    </aside>

    <main class="page-main">
      <div class="page-content">
        <!-- Mobile Topbar -->
        <div class="mobile-topbar">
          <router-link to="/dashboard" class="brand brand--compact">
            <i class="bi bi-music-note-beamed" aria-hidden="true"></i>
            <span>Karaoke<span class="text-gradient">Ku</span></span>
          </router-link>

          <div class="mobile-topbar__actions">
            <button class="icon-btn" type="button" @click="loadProfile" aria-label="Refresh profil">
              <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
            </button>
            <button class="icon-btn" type="button" @click="scrollToSecurity" aria-label="Buka pengaturan keamanan">
              <i class="bi bi-shield-lock-fill" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <!-- Hero -->
        <section class="hero reveal" style="--d: 0ms">
          <div class="hero__content">
            <div class="hero__badge">
              <i class="bi bi-gear-fill" aria-hidden="true"></i>
              <span>Pengaturan Akun</span>
            </div>

            <h1>
              Kelola akun dengan <span class="text-gradient">aman</span> dan nyaman
            </h1>
            <p class="hero__sub text-white">
              Perbarui profil, ganti password, dan atur keamanan akun Anda.
            </p>

            <div class="hero__stats" aria-label="Ringkasan akun">
              <div class="stat-pill">
                <i class="bi bi-person-fill" aria-hidden="true"></i>
                <span>{{ profile.username || 'username' }}</span>
              </div>
              <div class="stat-pill stat-pill--soft">
                <i class="bi bi-envelope-fill" aria-hidden="true"></i>
                <span>{{ profile.email || 'email' }}</span>
              </div>
              <div v-if="isProfileDirty" class="stat-pill stat-pill--soft" aria-live="polite">
                <i class="bi bi-pencil-square" aria-hidden="true"></i>
                <span>Ada perubahan belum disimpan</span>
              </div>

              <button class="btn btn-primary btn-sm" type="button" @click="scrollToProfile">
                <i class="bi bi-person-lines-fill" aria-hidden="true"></i>
                Profil
              </button>
              <button class="btn btn-ghost btn-sm" type="button" @click="scrollToSecurity">
                <i class="bi bi-shield-lock-fill" aria-hidden="true"></i>
                Keamanan
              </button>
            </div>
          </div>

          <div class="hero__art" aria-hidden="true">
            <div class="hero-card hero-card--account">
              <div class="account-avatar">{{ avatarText }}</div>
              <div class="account-name">{{ profile.name || 'Pengguna KaraokeKu' }}</div>
              <div class="account-meta">{{ profile.email || '—' }}</div>
              <div class="account-chips">
                <span class="pill pill--soft"><i class="bi bi-at" aria-hidden="true"></i> {{ profile.username || '—' }}</span>
                <span class="pill"><i class="bi bi-shield-check" aria-hidden="true"></i> Tips aman</span>
              </div>
            </div>

            <div class="hero-card hero-card--soft">
              <div class="hero-card__icon" aria-hidden="true">
                <i class="bi bi-lightning-charge-fill"></i>
              </div>
              <div class="hero-card__title">Saran cepat</div>
              <div class="hero-card__text">
                Gunakan password kuat dan jangan bagikan informasi akun.
              </div>
              <div class="hero-card__mini">
                <div class="mini-item">
                  <i class="bi bi-check2-circle" aria-hidden="true"></i>
                  <span>Min. 6 karakter</span>
                </div>
                <div class="mini-item">
                  <i class="bi bi-check2-circle" aria-hidden="true"></i>
                  <span>Kombinasi angka & simbol</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="content-grid">
          <!-- Profile -->
          <div ref="profileSectionRef" class="panel profile-panel reveal" style="--d: 90ms">
            <div class="panel-header">
              <div class="panel-title">
                <div class="panel-icon" aria-hidden="true">
                  <i class="bi bi-person-lines-fill"></i>
                </div>
                <div class="panel-title__copy">
                  <h2>Profil</h2>
                  <p class="text-white">Perbarui nama, username, dan email.</p>
                </div>
              </div>

              <div class="panel-actions">
                <span v-if="savingProfile" class="pill pill--soft" aria-live="polite">
                  <span class="spinner" aria-hidden="true"></span>
                  Menyimpan…
                </span>
                <button
                  class="btn btn-ghost btn-sm"
                  type="button"
                  @click="resetProfile"
                  :disabled="savingProfile || !isProfileDirty"
                >
                  <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
                  Reset
                </button>
              </div>
            </div>

            <div class="panel-body">
              <div
                v-if="profileMessage"
                class="status-banner"
                :class="profileSuccess ? 'is-success' : 'is-danger'"
                role="status"
                aria-live="polite"
              >
                <i
                  :class="profileSuccess ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill'"
                  aria-hidden="true"
                ></i>
                <span>{{ profileMessage }}</span>
              </div>

              <form class="settings-form" @submit.prevent="updateProfile">
                <div class="form-grid">
                  <div class="field">
                    <label class="field-label" for="sp-name">Nama Lengkap</label>
                    <input
                      id="sp-name"
                      class="form-control"
                      type="text"
                      v-model="profile.name"
                      :disabled="savingProfile"
                      required
                      autocomplete="name"
                    />
                  </div>

                  <div class="field">
                    <label class="field-label" for="sp-username">Username</label>
                    <input
                      id="sp-username"
                      class="form-control"
                      type="text"
                      v-model="profile.username"
                      :disabled="savingProfile"
                      required
                      autocomplete="username"
                    />
                    <div class="field-hint text-white">Digunakan untuk identitas di beberapa fitur.</div>
                  </div>

                  <div class="field field--full">
                    <label class="field-label" for="sp-email">Email</label>
                    <input
                      id="sp-email"
                      class="form-control"
                      type="email"
                      v-model="profile.email"
                      :disabled="savingProfile"
                      required
                      autocomplete="email"
                    />
                  </div>
                </div>

                <div class="form-actions">
                  <button class="btn btn-primary" type="submit" :disabled="savingProfile || !isProfileDirty">
                    <i class="bi bi-save2-fill" aria-hidden="true"></i>
                    {{ savingProfile ? 'Menyimpan…' : 'Simpan Perubahan' }}
                  </button>
                  <button class="btn btn-ghost" type="button" @click="scrollToSecurity">
                    <i class="bi bi-shield-lock-fill" aria-hidden="true"></i>
                    Lanjut ke keamanan
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Side panels -->
          <aside class="side-panel">
            <!-- Security -->
            <div ref="securitySectionRef" class="panel security-panel reveal" style="--d: 120ms">
              <div class="panel-header">
                <div class="panel-title">
                  <div class="panel-icon panel-icon--soft" aria-hidden="true">
                    <i class="bi bi-shield-lock-fill"></i>
                  </div>
                  <div class="panel-title__copy">
                    <h2>Keamanan</h2>
                    <p class="text-muted">Ganti password untuk menjaga akun tetap aman.</p>
                  </div>
                </div>

                <div class="panel-actions">
                  <span v-if="savingPassword" class="pill pill--soft" aria-live="polite">
                    <span class="spinner" aria-hidden="true"></span>
                    Memproses…
                  </span>
                  <button class="btn btn-ghost btn-sm" type="button" @click="resetPasswordForm" :disabled="savingPassword">
                    <i class="bi bi-eraser-fill" aria-hidden="true"></i>
                    Bersihkan
                  </button>
                </div>
              </div>

              <div class="panel-body">
                <div
                  v-if="passwordMessage"
                  class="status-banner"
                  :class="passwordSuccess ? 'is-success' : 'is-danger'"
                  role="status"
                  aria-live="polite"
                >
                  <i
                    :class="passwordSuccess ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill'"
                    aria-hidden="true"
                  ></i>
                  <span>{{ passwordMessage }}</span>
                </div>

                <form class="settings-form" @submit.prevent="changePassword">
                  <div class="field">
                    <label class="field-label" for="sp-current">Password Lama</label>
                    <div class="field-control">
                      <input
                        id="sp-current"
                        class="form-control"
                        :type="showCurrentPassword ? 'text' : 'password'"
                        v-model="passwordForm.currentPassword"
                        :disabled="savingPassword"
                        required
                        autocomplete="current-password"
                      />
                      <button
                        class="field-action"
                        type="button"
                        @click="showCurrentPassword = !showCurrentPassword"
                        :aria-label="showCurrentPassword ? 'Sembunyikan password lama' : 'Tampilkan password lama'"
                      >
                        <i :class="showCurrentPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>

                  <div class="form-grid form-grid--2">
                    <div class="field">
                      <label class="field-label" for="sp-new">Password Baru</label>
                      <div class="field-control">
                        <input
                          id="sp-new"
                          class="form-control"
                          :type="showNewPassword ? 'text' : 'password'"
                          v-model="passwordForm.newPassword"
                          :disabled="savingPassword"
                          minlength="6"
                          required
                          autocomplete="new-password"
                        />
                        <button
                          class="field-action"
                          type="button"
                          @click="showNewPassword = !showNewPassword"
                          :aria-label="showNewPassword ? 'Sembunyikan password baru' : 'Tampilkan password baru'"
                        >
                          <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i>
                        </button>
                      </div>

                      <div
                        v-if="passwordForm.newPassword"
                        class="password-meter"
                        :class="`is-${passwordStrength.tone}`"
                        aria-hidden="true"
                      >
                        <div class="password-meter__bar" :style="{ width: `${passwordStrength.score}%` }"></div>
                      </div>
                      <div v-if="passwordForm.newPassword" class="field-hint text-muted">
                        Kekuatan: <strong>{{ passwordStrength.label }}</strong>
                      </div>
                    </div>

                    <div class="field">
                      <label class="field-label" for="sp-confirm">Konfirmasi Password Baru</label>
                      <div class="field-control">
                        <input
                          id="sp-confirm"
                          class="form-control"
                          :type="showConfirmPassword ? 'text' : 'password'"
                          v-model="passwordForm.confirmNewPassword"
                          :disabled="savingPassword"
                          required
                          autocomplete="new-password"
                        />
                        <button
                          class="field-action"
                          type="button"
                          @click="showConfirmPassword = !showConfirmPassword"
                          :aria-label="showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'"
                        >
                          <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i>
                        </button>
                      </div>

                      <div v-if="passwordMismatch" class="field-hint field-hint--danger" role="status" aria-live="polite">
                        Password baru tidak cocok.
                      </div>
                    </div>
                  </div>

                  <div class="form-actions form-actions--stack">
                    <button class="btn btn-primary" type="submit" :disabled="savingPassword || passwordMismatch">
                      <i class="bi bi-shield-check" aria-hidden="true"></i>
                      {{ savingPassword ? 'Menyimpan…' : 'Ubah Password' }}
                    </button>
                    <div class="security-note text-muted">
                      Demi keamanan, gunakan password unik yang tidak dipakai di akun lain.
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <!-- Logout -->
            <div class="panel danger-panel reveal" style="--d: 150ms">
              <div class="panel-header panel-header--compact">
                <div class="panel-title">
                  <div class="panel-icon panel-icon--danger" aria-hidden="true">
                    <i class="bi bi-box-arrow-right"></i>
                  </div>
                  <div class="panel-title__copy">
                    <h2>Aksi Akun</h2>
                    <p class="text-muted">Keluar dari akun pada perangkat ini.</p>
                  </div>
                </div>
              </div>

              <div class="panel-body">
                <div class="danger-card">
                  <div class="danger-card__copy">
                    <div class="danger-card__title">Logout</div>
                    <div class="danger-card__text text-muted">
                      Pastikan kamu sudah menyimpan perubahan profil sebelum keluar.
                    </div>
                  </div>
                  <button class="btn btn-danger" type="button" @click="handleLogout">
                    <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
                    Logout
                  </button>
                </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/services/api'
import MobileNav from '@/components/MobileNav.vue'

const router = useRouter()
const authStore = useAuthStore()

const profile = ref({ name: '', username: '', email: '' })
const profileSnapshot = ref({ name: '', username: '', email: '' })
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmNewPassword: '' })

const savingProfile = ref(false)
const savingPassword = ref(false)

const profileMessage = ref('')
const profileSuccess = ref(false)
const passwordMessage = ref('')
const passwordSuccess = ref(false)

const profileSectionRef = ref(null)
const securitySectionRef = ref(null)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return true
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? true
}

const scrollToSection = (element) => {
  element?.scrollIntoView?.({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
}

const scrollToProfile = () => scrollToSection(profileSectionRef.value)
const scrollToSecurity = () => scrollToSection(securitySectionRef.value)

const loadProfile = () => {
  if (!authStore.user) return

  profile.value = {
    name: authStore.user.name || '',
    username: authStore.user.username || '',
    email: authStore.user.email || ''
  }
  profileSnapshot.value = { ...profile.value }
}

const resetProfile = () => {
  profile.value = { ...profileSnapshot.value }
  profileMessage.value = ''
}

const resetPasswordForm = () => {
  passwordForm.value = { currentPassword: '', newPassword: '', confirmNewPassword: '' }
  passwordMessage.value = ''
}

const isProfileDirty = computed(() => {
  return ['name', 'username', 'email'].some((k) => profile.value[k] !== profileSnapshot.value[k])
})

const passwordMismatch = computed(() => {
  const { newPassword, confirmNewPassword } = passwordForm.value
  if (!newPassword || !confirmNewPassword) return false
  return newPassword !== confirmNewPassword
})

const passwordStrength = computed(() => {
  const password = passwordForm.value.newPassword || ''
  let score = 0

  if (password.length >= 6) score += 25
  if (password.length >= 10) score += 25
  if (/[A-Z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 15
  if (/[^A-Za-z0-9]/.test(password)) score += 20

  score = Math.min(score, 100)

  let label = 'Lemah'
  let tone = 'weak'
  if (score >= 80) {
    label = 'Kuat'
    tone = 'strong'
  } else if (score >= 50) {
    label = 'Sedang'
    tone = 'ok'
  }

  return { score, label, tone }
})

const avatarText = computed(() => {
  const raw = String(profile.value.name || profile.value.username || 'User').trim()
  if (!raw) return 'U'
  const parts = raw.split(/\s+/).filter(Boolean).slice(0, 2)
  const letters = parts.map((p) => p[0]?.toUpperCase()).join('')
  return letters || raw.slice(0, 1).toUpperCase()
})

const updateProfile = async () => {
  savingProfile.value = true
  profileMessage.value = ''
  profileSuccess.value = false

  const result = await authStore.updateProfile(profile.value)

  profileSuccess.value = result.success
  profileMessage.value = result.success ? 'Profil berhasil diupdate!' : result.error || 'Gagal mengupdate profil'
  savingProfile.value = false

  if (result.success) {
    profileSnapshot.value = { ...profile.value }
  }
}

const changePassword = async () => {
  passwordMessage.value = ''
  passwordSuccess.value = false

  if (passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword) {
    passwordMessage.value = 'Password baru tidak cocok'
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
  /* Local theme override (green–blue gradient) */
  --sp-green: #22c55e;
  --sp-cyan: #06b6d4;
  --sp-blue: #3b82f6;

  --primary: var(--sp-cyan);
  --primary-light: #22d3ee;
  --primary-dark: #0891b2;
  --secondary: var(--sp-green);
  --accent: var(--sp-blue);

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
    radial-gradient(900px 600px at 8% 10%, rgba(34, 197, 94, 0.2) 0%, transparent 55%),
    radial-gradient(820px 560px at 92% 16%, rgba(6, 182, 212, 0.18) 0%, transparent 55%),
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
  grid-template-columns: 1.25fr 0.85fr;
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
  color: rgba(187, 247, 208, 0.98);
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
  max-width: 100%;
}

.stat-pill span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 44ch;
}

.stat-pill i {
  color: var(--primary-light);
}

.stat-pill--soft {
  background: rgba(6, 182, 212, 0.08);
}

.hero__art {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.9rem;
  align-content: start;
}

.hero-card {
  padding: 1rem 1rem 0.95rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(0, 0, 0, 0.25);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  display: grid;
  gap: 0.55rem;
}

.hero-card--account {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.12) 0%,
    rgba(6, 182, 212, 0.1) 55%,
    rgba(59, 130, 246, 0.12) 100%
  );
}

.account-avatar {
  width: 64px;
  height: 64px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  font-weight: 950;
  letter-spacing: 0.04em;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(94, 234, 212, 0.18);
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.35);
}

.account-name {
  font-weight: 900;
  letter-spacing: -0.01em;
}

.account-meta {
  color: var(--text-muted);
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.hero-card--soft {
  background: rgba(0, 0, 0, 0.18);
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
  font-weight: 900;
  letter-spacing: -0.01em;
}

.hero-card__text {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.55;
}

.hero-card__mini {
  display: grid;
  gap: 0.4rem;
  margin-top: 0.2rem;
  color: var(--text-secondary);
  font-size: 0.88rem;
}

.mini-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.mini-item i {
  color: rgba(187, 247, 208, 0.95);
}

/* Layout */
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

.panel-icon--danger {
  border-color: rgba(239, 68, 68, 0.26);
  background: rgba(239, 68, 68, 0.1);
  color: rgba(254, 202, 202, 0.98);
}

.panel-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.panel-body {
  padding: 1rem 1.2rem 1.2rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(94, 234, 212, 0.14);
  color: var(--text-secondary);
  font-size: 0.78rem;
  white-space: nowrap;
}

.pill--soft {
  background: rgba(6, 182, 212, 0.08);
}

.spinner {
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 999px;
  border: 2px solid rgba(165, 243, 252, 0.35);
  border-top-color: rgba(165, 243, 252, 0.9);
  animation: spin 800ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Status banner */
.status-banner {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  padding: 0.85rem 0.95rem;
  border-radius: 18px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(0, 0, 0, 0.2);
  margin-bottom: 0.9rem;
}

.status-banner i {
  margin-top: 0.05rem;
}

.status-banner.is-success {
  border-color: rgba(34, 197, 94, 0.22);
  background: rgba(34, 197, 94, 0.1);
}

.status-banner.is-success i {
  color: rgba(187, 247, 208, 0.98);
}

.status-banner.is-danger {
  border-color: rgba(239, 68, 68, 0.26);
  background: rgba(239, 68, 68, 0.1);
}

.status-banner.is-danger i {
  color: rgba(254, 202, 202, 0.98);
}

/* Forms */
.settings-form {
  display: grid;
  gap: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.form-grid--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field--full {
  grid-column: 1 / -1;
}

.field-label {
  display: inline-flex;
  margin-bottom: 0.45rem;
  color: var(--text-secondary);
  font-weight: 650;
}

.field-hint {
  margin-top: 0.45rem;
  font-size: 0.88rem;
}

.field-hint--danger {
  color: rgba(254, 202, 202, 0.98);
}

.field-control {
  position: relative;
}

.field-control .form-control {
  padding-right: 2.8rem;
}

.field-action {
  position: absolute;
  right: 0.55rem;
  top: 50%;
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  border-radius: 14px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
}

.field-action:hover {
  transform: translateY(-50%) scale(1.02);
  border-color: rgba(94, 234, 212, 0.28);
  background: rgba(255, 255, 255, 0.1);
}

.password-meter {
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(94, 234, 212, 0.14);
  overflow: hidden;
  margin-top: 0.55rem;
}

.password-meter__bar {
  height: 100%;
  border-radius: 999px;
  background: var(--gradient-primary);
  width: 0%;
  transition: width var(--transition-normal);
}

.password-meter.is-weak .password-meter__bar {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(245, 158, 11, 0.9));
}

.password-meter.is-ok .password-meter__bar {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.95), rgba(34, 197, 94, 0.9));
}

.password-meter.is-strong .password-meter__bar {
  background: var(--gradient-primary);
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.form-actions--stack {
  flex-direction: column;
  align-items: stretch;
}

.security-note {
  font-size: 0.9rem;
  text-align: center;
}

/* Danger */
.btn-danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.92), rgba(245, 158, 11, 0.9));
  border: none;
  color: white;
  box-shadow: 0 0 26px rgba(239, 68, 68, 0.22);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 38px rgba(239, 68, 68, 0.3);
  color: white;
}

.danger-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-radius: 20px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.08);
}

.danger-card__title {
  font-weight: 900;
  letter-spacing: -0.01em;
}

.danger-card__text {
  margin-top: 0.15rem;
  font-size: 0.92rem;
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

  .icon-btn,
  .nav-item,
  .btn,
  .form-control,
  .field-action {
    transition: none !important;
  }

  .password-meter__bar {
    transition: none !important;
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .hero {
    grid-template-columns: 1fr;
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
    padding-bottom: 110px;
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

  .stat-pill span {
    max-width: 30ch;
  }
}

@media (max-width: 425px) {
  .page-content {
    padding: 1rem;
    padding-bottom: 112px;
  }

  .panel-header {
    padding: 1rem;
  }

  .panel-body {
    padding: 1rem;
  }

  .form-grid,
  .form-grid--2 {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .danger-card {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
