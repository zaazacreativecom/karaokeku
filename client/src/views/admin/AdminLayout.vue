<template>
  <div class="admin-layout" :class="{ 'is-sidebar-open': sidebarOpen }">
    <!-- Background (decorative) -->
    <div class="admin-bg" aria-hidden="true">
      <div class="bg-mesh"></div>
      <div class="bg-particles"></div>
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
    </div>

    <!-- Mobile Topbar -->
    <header class="admin-topbar">
      <button class="icon-btn" type="button" @click="toggleSidebar" :aria-label="sidebarOpen ? 'Tutup menu admin' : 'Buka menu admin'">
        <i class="bi" :class="sidebarOpen ? 'bi-x-lg' : 'bi-list'" aria-hidden="true"></i>
      </button>

      <router-link to="/admin" class="brand brand--compact">
        <i class="bi bi-shield-lock-fill" aria-hidden="true"></i>
        <span>Admin<span class="text-gradient">Panel</span></span>
      </router-link>

      <router-link to="/dashboard" class="icon-btn" aria-label="Kembali ke app">
        <i class="bi bi-arrow-left" aria-hidden="true"></i>
      </router-link>
    </header>

    <div v-if="sidebarOpen" class="sidebar-overlay" aria-hidden="true" @click="closeSidebar"></div>

    <!-- Admin Sidebar -->
    <aside class="admin-sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <router-link to="/admin" class="brand">
          <i class="bi bi-shield-lock-fill" aria-hidden="true"></i>
          <span>Admin<span class="text-gradient">Panel</span></span>
        </router-link>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin" class="nav-item" :class="{ active: $route.name === 'AdminDashboard' }">
          <i class="bi bi-speedometer2"></i>
          <span>Dashboard</span>
        </router-link>

        <router-link to="/admin/songs" class="nav-item" :class="{ active: $route.name === 'AdminSongs' }">
          <i class="bi bi-music-note-list"></i>
          <span>Manajemen Lagu</span>
        </router-link>

        <router-link to="/admin/users" class="nav-item" :class="{ active: $route.name === 'AdminUsers' }">
          <i class="bi bi-people-fill"></i>
          <span>Manajemen User</span>
        </router-link>

        <router-link to="/admin/uploads" class="nav-item" :class="{ active: $route.name === 'AdminUploads' }">
          <i class="bi bi-cloud-upload-fill"></i>
          <span>Review Upload</span>
          <span v-if="pendingUploads > 0" class="badge">{{ pendingUploads }}</span>
        </router-link>

        <router-link to="/admin/settings" class="nav-item" :class="{ active: $route.name === 'AdminSettings' }">
          <i class="bi bi-gear-fill"></i>
          <span>Pengaturan</span>
        </router-link>

        <router-link to="/admin/requests" class="nav-item" :class="{ active: $route.name === 'AdminRequests' }">
          <i class="bi bi-plus-circle-fill"></i>
          <span>Request Lagu</span>
        </router-link>

        <router-link to="/admin/donations" class="nav-item" :class="{ active: $route.name === 'AdminDonations' }">
          <i class="bi bi-heart-fill"></i>
          <span>Donasi</span>
        </router-link>

        <router-link to="/admin/payment-methods" class="nav-item"
          :class="{ active: $route.name === 'AdminPaymentMethods' }">
          <i class="bi bi-credit-card"></i>
          <span>Metode Pembayaran</span>
        </router-link>

        <div class="nav-divider"></div>

        <router-link to="/dashboard" class="nav-item">
          <i class="bi bi-arrow-left"></i>
          <span>Kembali ke App</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <i class="bi bi-person-circle"></i>
          <span>{{ authStore.user?.name }}</span>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="admin-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { adminAPI } from '@/services/api'

const authStore = useAuthStore()
const route = useRoute()

const pendingUploads = ref(0)
const sidebarOpen = ref(false)

const fetchPendingCount = async () => {
  try {
    const response = await adminAPI.getDashboard()
    pendingUploads.value = response.data.data?.pendingUploads || 0
  } catch (err) {
    console.error(err)
  }
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const onKeydown = (event) => {
  if (event.key !== 'Escape') return
  closeSidebar()
}

watch(
  () => route.fullPath,
  () => {
    closeSidebar()
  }
)

onMounted(() => {
  fetchPendingCount()
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.admin-layout {
  /* Local theme override (green–blue gradient) */
  --ad-green: #22c55e;
  --ad-cyan: #06b6d4;
  --ad-blue: #3b82f6;

  --primary: var(--ad-cyan);
  --primary-light: #22d3ee;
  --primary-dark: #0891b2;
  --secondary: var(--ad-green);
  --accent: var(--ad-blue);

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

  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-dark);
  overflow-x: hidden;
  position: relative;
}

/* Background */
.admin-bg {
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

.admin-sidebar {
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
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.6);
  transition: transform var(--transition-normal);
}

.sidebar-header {
  padding: 1.5rem;
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
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
  transition: transform var(--transition-normal), opacity var(--transition-normal);
}

.brand i {
  font-size: 1.5rem;
  color: var(--primary-light);
  filter: drop-shadow(0 0 16px rgba(34, 197, 94, 0.18));
}

.brand:hover {
  transform: translateY(-1px);
  opacity: 0.95;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 0.25rem;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
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

.nav-item i {
  font-size: 1.125rem;
  width: 24px;
  text-align: center;
  color: rgba(165, 243, 252, 0.95);
}

.nav-item .badge {
  margin-left: auto;
  background: rgba(239, 68, 68, 0.92);
  color: white;
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-full);
}

.nav-divider {
  height: 1px;
  background: rgba(94, 234, 212, 0.14);
  margin: 1rem 0;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.user-info i {
  font-size: 1.25rem;
  color: rgba(165, 243, 252, 0.95);
}

.admin-main {
  margin-left: 260px;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

/* Mobile topbar */
.admin-topbar {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  padding: 0.9rem 1rem;
  margin: 0.75rem 1rem 1rem;
  border: 1px solid rgba(94, 234, 212, 0.16);
  border-radius: var(--radius-xl);
  background: rgba(4, 12, 16, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  position: sticky;
  top: 0.75rem;
  z-index: 150;
}

.brand--compact {
  font-size: 1.05rem;
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

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 140;
}

/* Responsive */
@media (max-width: 992px) {
  .admin-sidebar {
    width: 70px;
  }

  .sidebar-header .brand span,
  .nav-item span {
    display: none;
  }

  .nav-item {
    justify-content: center;
    padding: 0.75rem;
  }

  .nav-item .badge {
    position: absolute;
    top: 0.55rem;
    right: 0.55rem;
    margin-left: 0;
  }

  .admin-main {
    margin-left: 70px;
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .admin-topbar {
    display: flex;
  }

  .sidebar-overlay {
    display: block;
  }

  .admin-sidebar {
    width: 280px;
    transform: translateX(-110%);
  }

  .admin-sidebar.open {
    transform: translateX(0);
  }

  .sidebar-header .brand span,
  .nav-item span {
    display: inline;
  }

  .nav-item {
    justify-content: flex-start;
    padding: 0.75rem 1rem;
  }

  .nav-item .badge {
    position: static;
    margin-left: auto;
  }

  .admin-main {
    margin-left: 0;
    padding: 0 1rem 1.5rem;
  }

  .sidebar-overlay {
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition-normal);
  }

  .admin-layout.is-sidebar-open .sidebar-overlay {
    opacity: 1;
    pointer-events: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bg-orb {
    animation: none;
  }

  .admin-sidebar,
  .nav-item,
  .icon-btn,
  .brand {
    transition: none !important;
  }
}
</style>
