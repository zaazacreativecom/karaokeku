/**
 * Vue Router Configuration
 * File: src/router/index.js
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Public Views
import LandingPage from '@/views/public/LandingPage.vue'

// Lazy load other views
const DashboardPage = () => import('@/views/user/DashboardPage.vue')
const KaraokePage = () => import('@/views/user/KaraokePage.vue')
const SongsPage = () => import('@/views/user/SongsPage.vue')
const PlaylistPage = () => import('@/views/user/PlaylistPage.vue')
const UploadPage = () => import('@/views/user/UploadPage.vue')
const HistoryPage = () => import('@/views/user/HistoryPage.vue')
const SettingsPage = () => import('@/views/user/SettingsPage.vue')

// Admin Views
const AdminLayout = () => import('@/views/admin/AdminLayout.vue')
const AdminDashboard = () => import('@/views/admin/AdminDashboard.vue')
const AdminSongs = () => import('@/views/admin/AdminSongs.vue')
const AdminUsers = () => import('@/views/admin/AdminUsers.vue')
const AdminUploads = () => import('@/views/admin/AdminUploads.vue')
const AdminSettings = () => import('@/views/admin/AdminSettings.vue')

const routes = [
  // ==========================================
  // PUBLIC ROUTES
  // ==========================================
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
    meta: { requiresGuest: true }
  },
  
  // ==========================================
  // USER ROUTES
  // ==========================================
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/karaoke',
    name: 'Karaoke',
    component: KaraokePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/karaoke/:songId',
    name: 'KaraokePlay',
    component: KaraokePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/songs',
    name: 'Songs',
    component: SongsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/playlists',
    name: 'Playlists',
    component: PlaylistPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/upload',
    name: 'Upload',
    component: UploadPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
    meta: { requiresAuth: true }
  },
  
  // ==========================================
  // ADMIN ROUTES
  // ==========================================
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminDashboard
      },
      {
        path: 'songs',
        name: 'AdminSongs',
        component: AdminSongs
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: AdminUsers
      },
      {
        path: 'uploads',
        name: 'AdminUploads',
        component: AdminUploads
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: AdminSettings
      }
    ]
  },
  
  // ==========================================
  // 404
  // ==========================================
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/public/NotFoundPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Cek apakah route butuh auth
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next({ name: 'Landing' })
  }
  
  // Cek apakah route butuh admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'Dashboard' })
  }
  
  // Cek apakah route hanya untuk guest
  if (to.meta.requiresGuest && authStore.isLoggedIn) {
    return next({ name: 'Dashboard' })
  }
  
  next()
})

export default router
