/**
 * Playlist Store - Pinia store untuk playlist
 * File: src/stores/playlist.js
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { playlistsAPI } from '@/services/api'

export const usePlaylistStore = defineStore('playlist', () => {
  // State
  const playlists = ref([])
  const currentPlaylist = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // Actions
  
  /**
   * Fetch all user playlists
   */
  const fetchPlaylists = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await playlistsAPI.getAll()
      playlists.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal memuat playlist'
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Get playlist by ID
   */
  const getPlaylist = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await playlistsAPI.getById(id)
      currentPlaylist.value = response.data.data
      return currentPlaylist.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal memuat playlist'
      return null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Create new playlist
   */
  const createPlaylist = async (data) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await playlistsAPI.create(data)
      const newPlaylist = response.data.data
      playlists.value.unshift(newPlaylist)
      return { success: true, playlist: newPlaylist }
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal membuat playlist'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Update playlist
   */
  const updatePlaylist = async (id, data) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await playlistsAPI.update(id, data)
      const updated = response.data.data
      
      // Update di list
      const index = playlists.value.findIndex(p => p.id === id)
      if (index !== -1) {
        playlists.value[index] = updated
      }
      
      return { success: true, playlist: updated }
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal update playlist'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Delete playlist
   */
  const deletePlaylist = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      await playlistsAPI.delete(id)
      playlists.value = playlists.value.filter(p => p.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal hapus playlist'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Add song to playlist
   */
  const addSongToPlaylist = async (playlistId, songId) => {
    try {
      await playlistsAPI.addSong(playlistId, songId)
      // Refresh playlist jika ini adalah current playlist
      if (currentPlaylist.value?.id === playlistId) {
        await getPlaylist(playlistId)
      }
      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Gagal menambahkan lagu' 
      }
    }
  }
  
  /**
   * Remove song from playlist
   */
  const removeSongFromPlaylist = async (playlistId, itemId) => {
    try {
      await playlistsAPI.removeSong(playlistId, itemId)
      // Refresh playlist jika ini adalah current playlist
      if (currentPlaylist.value?.id === playlistId) {
        await getPlaylist(playlistId)
      }
      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Gagal menghapus lagu' 
      }
    }
  }
  
  return {
    // State
    playlists,
    currentPlaylist,
    loading,
    error,
    // Actions
    fetchPlaylists,
    getPlaylist,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist
  }
})
