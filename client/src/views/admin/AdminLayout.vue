<template>
  <div class="admin-layout">
    <!-- Admin Sidebar -->
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <router-link to="/admin" class="brand">
          <i class="bi bi-shield-lock-fill"></i>
          <span>Admin Panel</span>
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
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { adminAPI } from '@/services/api'

const authStore = useAuthStore()
const pendingUploads = ref(0)

const fetchPendingCount = async () => {
  try {
    const response = await adminAPI.getDashboard()
    pendingUploads.value = response.data.data?.pendingUploads || 0
  } catch (err) {
    console.error(err)
  }
}

onMounted(fetchPendingCount)
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-dark);
}

.admin-sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1e1e3f 0%, #0f0f1a 100%);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--warning);
}

.brand i {
  font-size: 1.5rem;
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
}

.nav-item:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  color: var(--bg-dark);
  background: var(--warning);
}

.nav-item i {
  font-size: 1.125rem;
  width: 24px;
  text-align: center;
}

.nav-item .badge {
  margin-left: auto;
  background: var(--danger);
  color: white;
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-full);
}

.nav-divider {
  height: 1px;
  background: var(--border-color);
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
}

.admin-main {
  flex: 1;
  margin-left: 260px;
  padding: 2rem;
}
</style>
