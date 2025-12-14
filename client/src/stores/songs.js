/**
 * Songs Store - Pinia store untuk daftar lagu
 * File: src/stores/songs.js
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { songsAPI } from '@/services/api'

export const useSongsStore = defineStore('songs', () => {
  // State
  const songs = ref([])
  const topSongs = ref([])
  const genres = ref([])
  const languages = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const filters = ref({
    search: '',
    genre: '',
    language: '',
    sortBy: 'title',
    sortOrder: 'ASC'
  })
  
  // Getters
  const hasMore = computed(() => pagination.value.page < pagination.value.totalPages)
  
  // Actions
  
  /**
   * Fetch songs dengan filter
   */
  const fetchSongs = async (resetPage = true) => {
    loading.value = true
    error.value = null
    
    if (resetPage) {
      pagination.value.page = 1
    }
    
    try {
      const params = {
        ...filters.value,
        page: pagination.value.page,
        limit: pagination.value.limit
      }
      
      const response = await songsAPI.getAll(params)
      
      if (resetPage) {
        songs.value = response.data.data
      } else {
        songs.value.push(...response.data.data)
      }
      
      if (response.data.meta) {
        pagination.value = response.data.meta
      }
      
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal memuat lagu'
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Load more songs (pagination)
   */
  const loadMore = async () => {
    if (!hasMore.value || loading.value) return
    
    pagination.value.page++
    await fetchSongs(false)
  }
  
  /**
   * Fetch top songs
   */
  const fetchTopSongs = async (limit = 10) => {
    try {
      const response = await songsAPI.getTop(limit)
      topSongs.value = response.data.data
    } catch (err) {
      console.error('Error fetching top songs:', err)
    }
  }
  
  /**
   * Fetch genres
   */
  const fetchGenres = async () => {
    try {
      const response = await songsAPI.getGenres()
      genres.value = response.data.data
    } catch (err) {
      console.error('Error fetching genres:', err)
    }
  }
  
  /**
   * Fetch languages
   */
  const fetchLanguages = async () => {
    try {
      const response = await songsAPI.getLanguages()
      languages.value = response.data.data
    } catch (err) {
      console.error('Error fetching languages:', err)
    }
  }
  
  /**
   * Search songs
   */
  const searchSongs = async (query) => {
    if (!query) {
      return []
    }
    
    try {
      const response = await songsAPI.search(query, 10)
      return response.data.data
    } catch (err) {
      console.error('Error searching songs:', err)
      return []
    }
  }
  
  /**
   * Set filter
   */
  const setFilter = (key, value) => {
    filters.value[key] = value
    fetchSongs(true)
  }
  
  /**
   * Clear filters
   */
  const clearFilters = () => {
    filters.value = {
      search: '',
      genre: '',
      language: '',
      sortBy: 'title',
      sortOrder: 'ASC'
    }
    fetchSongs(true)
  }
  
  /**
   * Initialize store
   */
  const init = async () => {
    await Promise.all([
      fetchSongs(),
      fetchTopSongs(),
      fetchGenres(),
      fetchLanguages()
    ])
  }
  
  return {
    // State
    songs,
    topSongs,
    genres,
    languages,
    loading,
    error,
    pagination,
    filters,
    // Getters
    hasMore,
    // Actions
    fetchSongs,
    loadMore,
    fetchTopSongs,
    fetchGenres,
    fetchLanguages,
    searchSongs,
    setFilter,
    clearFilters,
    init
  }
})
