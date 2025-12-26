<template>
  <main class="not-found-page">
    <div class="nf-bg" aria-hidden="true">
      <div class="bg-mesh"></div>
      <div class="bg-particles"></div>
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
    </div>

    <section class="nf-shell" aria-label="Halaman tidak ditemukan">
      <div class="nf-card reveal" style="--d: 0ms">
        <div class="nf-badge">
          <span class="nf-badge__icon" aria-hidden="true">
            <i class="bi bi-compass-fill"></i>
          </span>
          <span>404 • Not Found</span>
        </div>

        <div class="nf-code" aria-hidden="true">404</div>

        <h1>Halaman tidak ditemukan</h1>
        <p class="text-muted">
          Maaf, halaman yang kamu cari tidak tersedia atau sudah dipindahkan. Kamu bisa kembali, atau langsung menuju halaman utama.
        </p>

        <div v-if="attemptedPath" class="nf-meta" aria-label="URL yang dicari">
          <div class="nf-meta__label text-muted">URL</div>
          <div class="nf-meta__value" :title="attemptedPath">{{ attemptedPath }}</div>
          <button class="btn btn-ghost btn-sm btn-icon" type="button" @click="copyUrl" :disabled="copyState === 'copying'">
            <span v-if="copyState === 'copying'" class="spinner" aria-hidden="true"></span>
            <i v-else class="bi bi-copy" aria-hidden="true"></i>
            <span class="btn-text">{{ copyState === 'copied' ? 'Tersalin' : 'Copy' }}</span>
          </button>
        </div>

        <div class="nf-actions">
          <router-link :to="primaryHref" class="btn btn-primary">
            <i :class="primaryIcon" class="me-2" aria-hidden="true"></i>
            {{ primaryLabel }}
          </router-link>

          <button class="btn btn-ghost" type="button" @click="goBack">
            <i class="bi bi-arrow-left me-2" aria-hidden="true"></i>
            Kembali
          </button>
        </div>

        <div class="nf-links" aria-label="Tautan cepat">
          <router-link to="/" class="link-pill">
            <i class="bi bi-house-door-fill" aria-hidden="true"></i>
            <span>Beranda</span>
          </router-link>
          <router-link v-if="authStore.isLoggedIn" to="/songs" class="link-pill">
            <i class="bi bi-music-note-list" aria-hidden="true"></i>
            <span>Lagu</span>
          </router-link>
          <router-link v-if="authStore.isAdmin" to="/admin" class="link-pill">
            <i class="bi bi-shield-lock-fill" aria-hidden="true"></i>
            <span>Admin</span>
          </router-link>
        </div>

        <div class="nf-tips" aria-label="Saran singkat">
          <div class="tip">
            <div class="tip-icon" aria-hidden="true"><i class="bi bi-link-45deg"></i></div>
            <div class="tip-copy">
              <div class="tip-title">Cek ejaan URL</div>
              <div class="tip-text text-muted">Pastikan tidak ada salah ketik atau spasi.</div>
            </div>
          </div>
          <div class="tip">
            <div class="tip-icon" aria-hidden="true"><i class="bi bi-arrow-clockwise"></i></div>
            <div class="tip-copy">
              <div class="tip-title">Coba refresh</div>
              <div class="tip-text text-muted">Jika koneksi lambat, halaman mungkin belum termuat.</div>
            </div>
          </div>
          <div class="tip">
            <div class="tip-icon" aria-hidden="true"><i class="bi bi-life-preserver"></i></div>
            <div class="tip-copy">
              <div class="tip-title">Butuh bantuan?</div>
              <div class="tip-text text-muted">Kembali ke beranda, lalu cari menu yang kamu butuhkan.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const copyState = ref('idle') // idle | copying | copied

const attemptedPath = computed(() => {
  const pathMatch = route.params?.pathMatch
  if (Array.isArray(pathMatch) && pathMatch.length) return `/${pathMatch.join('/')}`
  if (typeof pathMatch === 'string' && pathMatch) return `/${pathMatch}`
  const fullPath = String(route.fullPath || '').trim()
  return fullPath || ''
})

const primaryHref = computed(() => (authStore.isLoggedIn ? '/dashboard' : '/'))
const primaryLabel = computed(() => (authStore.isLoggedIn ? 'Ke Dashboard' : 'Ke Beranda'))
const primaryIcon = computed(() => (authStore.isLoggedIn ? 'bi bi-speedometer2' : 'bi bi-house-fill'))

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push(primaryHref.value)
  }
}

const copyUrl = async () => {
  if (!attemptedPath.value) return
  if (!navigator.clipboard?.writeText) return
  if (copyState.value === 'copying') return

  copyState.value = 'copying'
  try {
    await navigator.clipboard.writeText(attemptedPath.value)
    copyState.value = 'copied'
    setTimeout(() => {
      copyState.value = 'idle'
    }, 1600)
  } catch (error) {
    console.error('Clipboard error:', error)
    copyState.value = 'idle'
  }
}
</script>

<style scoped>
.not-found-page {
  /* Local theme override (green–blue gradient) */
  --nf-green: #22c55e;
  --nf-cyan: #06b6d4;
  --nf-blue: #3b82f6;

  --primary: var(--nf-green);
  --primary-light: #4ade80;
  --primary-dark: #16a34a;
  --accent: var(--nf-cyan);

  --bg-dark: #061319;
  --bg-darker: #040c10;
  --bg-card: rgba(10, 22, 28, 0.72);
  --bg-card-hover: rgba(14, 30, 37, 0.82);
  --border-color: rgba(94, 234, 212, 0.14);
  --border-color-light: rgba(94, 234, 212, 0.28);

  --gradient-primary: linear-gradient(135deg, #22c55e 0%, #06b6d4 55%, #3b82f6 100%);
  --gradient-glow: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.35) 0%,
    rgba(6, 182, 212, 0.35) 55%,
    rgba(59, 130, 246, 0.25) 100%
  );
  --shadow-glow: 0 0 36px rgba(6, 182, 212, 0.35);

  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.75rem 1rem;
  position: relative;
  overflow: hidden;
  background: var(--bg-dark);
}

.nf-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
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
  opacity: 0.92;
  background-image: url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306b6d4' fill-opacity='0.06'%3E%3Ccircle cx='10' cy='14' r='1.6'/%3E%3Ccircle cx='38' cy='30' r='1.4'/%3E%3Ccircle cx='54' cy='50' r='1.8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.bg-orb {
  position: absolute;
  width: 460px;
  height: 460px;
  border-radius: 50%;
  filter: blur(72px);
  opacity: 0.34;
  animation: orbFloat 14s ease-in-out infinite;
}

.orb-1 {
  background: rgba(34, 197, 94, 0.36);
  top: -170px;
  left: -180px;
}

.orb-2 {
  background: rgba(6, 182, 212, 0.38);
  bottom: -210px;
  right: -190px;
  animation-delay: -4s;
}

.orb-3 {
  width: 320px;
  height: 320px;
  background: rgba(59, 130, 246, 0.22);
  top: 30%;
  right: 14%;
  animation-delay: -9s;
}

@keyframes orbFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(18px, -14px, 0) scale(1.05);
  }
}

.nf-shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 860px;
}

.nf-card {
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(10, 22, 28, 0.72);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 22px 90px rgba(0, 0, 0, 0.55);
  padding: 2.15rem 2rem;
  position: relative;
  overflow: hidden;
}

.nf-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  background:
    radial-gradient(540px 240px at 18% 8%, rgba(34, 197, 94, 0.18) 0%, transparent 62%),
    radial-gradient(560px 240px at 85% 36%, rgba(6, 182, 212, 0.16) 0%, transparent 62%),
    radial-gradient(520px 240px at 60% 120%, rgba(59, 130, 246, 0.12) 0%, transparent 64%);
  pointer-events: none;
}

.nf-badge,
.nf-code,
h1,
p,
.nf-meta,
.nf-actions,
.nf-links,
.nf-tips {
  position: relative;
  z-index: 1;
}

.nf-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.22);
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.nf-badge__icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(94, 234, 212, 0.08);
  border: 1px solid rgba(94, 234, 212, 0.18);
}

.nf-badge__icon i {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.1rem;
}

.nf-code {
  font-size: clamp(5.2rem, 12vw, 9rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 0.95;
  margin: 0 0 0.85rem;
  text-shadow: 0 0 40px rgba(6, 182, 212, 0.25);
}

.nf-code::after {
  content: '';
  position: absolute;
  inset: auto auto -18px 0;
  width: 55%;
  height: 4px;
  border-radius: 999px;
  background: var(--gradient-glow);
  opacity: 0.8;
}

h1 {
  margin: 0 0 0.4rem;
  font-size: clamp(1.65rem, 3.2vw, 2.25rem);
  font-weight: 850;
  letter-spacing: -0.02em;
}

p {
  color: var(--text-secondary);
  margin: 0 0 1.35rem;
  max-width: 52rem;
}

.nf-meta {
  display: grid;
  grid-template-columns: 70px 1fr auto;
  gap: 0.7rem;
  align-items: center;
  padding: 0.85rem 0.9rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 1.25rem;
}

.nf-meta__label {
  font-size: 0.9rem;
}

.nf-meta__value {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.btn-text {
  font-size: 0.9rem;
}

.nf-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
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

.nf-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-bottom: 1.35rem;
}

.link-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  transition: transform var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
}

.link-pill:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(94, 234, 212, 0.28);
  transform: translateY(-1px);
}

.nf-tips {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}

.tip {
  display: flex;
  gap: 0.75rem;
  padding: 0.95rem 0.95rem;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(255, 255, 255, 0.03);
}

.tip-icon {
  width: 42px;
  height: 42px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(94, 234, 212, 0.08);
  flex: 0 0 auto;
}

.tip-icon i {
  color: var(--primary-light);
  font-size: 1.15rem;
}

.tip-title {
  font-weight: 750;
  letter-spacing: -0.01em;
  margin-bottom: 0.15rem;
}

.tip-text {
  font-size: 0.92rem;
  margin: 0;
}

/* Animations */
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

@media (max-width: 900px) {
  .nf-card {
    padding: 1.85rem 1.45rem;
  }

  .nf-tips {
    grid-template-columns: 1fr;
  }

  .tip {
    padding: 0.9rem;
  }
}

@media (max-width: 560px) {
  .not-found-page {
    padding: 1.35rem 0.95rem;
  }

  .nf-card {
    padding: 1.5rem 1.15rem;
  }

  .nf-meta {
    grid-template-columns: 1fr;
    gap: 0.55rem;
  }

  .nf-actions {
    grid-template-columns: 1fr;
  }

  .btn-text {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .bg-orb,
  .spinner {
    animation: none !important;
  }
}
</style>
