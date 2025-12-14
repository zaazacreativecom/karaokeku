/**
 * API Service - Axios instance dan API calls
 * File: src/services/api.js
 */

import axios from 'axios'

// Buat axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - tambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// ==========================================
// AUTH API
// ==========================================

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data)
}

// ==========================================
// SONGS API
// ==========================================

export const songsAPI = {
  getAll: (params) => api.get('/songs', { params }),
  getById: (id) => api.get(`/songs/${id}`),
  getTop: (limit = 10) => api.get('/songs/top', { params: { limit } }),
  getGenres: () => api.get('/songs/genres'),
  getLanguages: () => api.get('/songs/languages'),
  search: (q, limit = 10) => api.get('/songs/search', { params: { q, limit } })
}

// ==========================================
// PLAYLISTS API
// ==========================================

export const playlistsAPI = {
  getAll: () => api.get('/playlists'),
  getById: (id) => api.get(`/playlists/${id}`),
  create: (data) => api.post('/playlists', data),
  update: (id, data) => api.put(`/playlists/${id}`, data),
  delete: (id) => api.delete(`/playlists/${id}`),
  addSong: (playlistId, songId) => api.post(`/playlists/${playlistId}/songs`, { songId }),
  removeSong: (playlistId, itemId) => api.delete(`/playlists/${playlistId}/songs/${itemId}`),
  reorder: (playlistId, items) => api.put(`/playlists/${playlistId}/reorder`, { items })
}

// ==========================================
// PLAYBACK API
// ==========================================

export const playbackAPI = {
  start: (songId) => api.post('/playback/start', { songId }),
  end: (historyId, playedDuration, score = null) => 
    api.post('/playback/end', { historyId, playedDuration, score }),
  getScores: () => api.get('/playback/me/scores'),
  getHistory: (params) => api.get('/playback/me/history', { params }),
  getLeaderboard: (limit = 10) => api.get('/playback/leaderboard', { params: { limit } })
}

// ==========================================
// UPLOADS API
// ==========================================

export const uploadsAPI = {
  upload: (formData, onProgress) => api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent)
      }
    }
  }),
  getMyUploads: () => api.get('/uploads/me'),
  delete: (id) => api.delete(`/uploads/${id}`)
}

// ==========================================
// ADMIN API
// ==========================================

export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Songs
  getSongs: (params) => api.get('/admin/songs', { params }),
  createSong: (data) => api.post('/admin/songs', data),
  updateSong: (id, data) => api.put(`/admin/songs/${id}`, data),
  deleteSong: (id) => api.delete(`/admin/songs/${id}`),
  scanSongs: (directory, dryRun = false) => 
    api.post('/admin/songs/scan', { directory, dryRun }),
  uploadThumbnail: (id, formData) => api.post(`/admin/songs/${id}/thumbnail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Uploads
  getUploads: (params) => api.get('/admin/uploads', { params }),
  reviewUpload: (id, status, admin_note) => 
    api.put(`/admin/uploads/${id}`, { status, admin_note }),
  deleteUpload: (id) => api.delete(`/admin/uploads/${id}`),
  
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data)
}

export const favoritesAPI = {
    getAll: (params) => api.get('/favorites', { params }),
    getIds: () => api.get('/favorites/ids'),
    getPopular: (limit = 5) => api.get('/favorites/popular', { params: { limit } }),
    toggle: (songId) => api.post('/favorites/toggle', { songId })
}

export const chatAPI = {
    getConversations: () => api.get('/chat/conversations'),
    getMessages: (partnerId) => api.get(`/chat/messages/${partnerId}`),
    sendMessage: (data) => api.post('/chat/send', data),
    getUsers: () => api.get('/chat/users'),
    getUnreadCount: () => api.get('/chat/unread'),
    markRead: (messageId) => api.put(`/chat/read/${messageId}`)
}

export default api
