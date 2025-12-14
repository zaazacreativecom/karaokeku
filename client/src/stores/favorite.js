/**
 * Favorite Store - Manage user's favorite songs
 * File: src/stores/favorite.js
 */

import { defineStore } from 'pinia'
import { favoritesAPI } from '@/services/api'
import { ref, computed } from 'vue'

export const useFavoriteStore = defineStore('favorite', () => {
    const favoriteIds = ref(new Set())
    const favorites = ref([])
    const loading = ref(false)

    // Check if a song is favorited
    const isFavorite = computed(() => (songId) => favoriteIds.value.has(songId))

    // Fetch only IDs (lightweight for lists)
    const fetchFavoriteIds = async () => {
        try {
            const res = await favoritesAPI.getIds()
            if (res.data.success) {
                favoriteIds.value = new Set(res.data.data)
            }
        } catch (error) {
            console.error('Failed to fetch favorite IDs:', error)
        }
    }

    // Toggle favorite action
    const toggleFavorite = async (songId) => {
        // Optimistic UI update
        const wasFavorite = favoriteIds.value.has(songId)
        if (wasFavorite) {
            favoriteIds.value.delete(songId)
        } else {
            favoriteIds.value.add(songId)
        }

        try {
            const res = await favoritesAPI.toggle(songId)
            // Sync with server result just in case
            if (res.data.data.isFavorite) {
                favoriteIds.value.add(songId)
            } else {
                favoriteIds.value.delete(songId)
            }
            return res.data.success
        } catch (error) {
            // Revert on error
            if (wasFavorite) {
                favoriteIds.value.add(songId)
            } else {
                favoriteIds.value.delete(songId)
            }
            console.error('Failed to toggle favorite:', error)
            return false
        }
    }

    // Fetch full favorite songs list
    const fetchFavorites = async (params = {}) => {
        loading.value = true
        try {
            const res = await favoritesAPI.getAll(params)
            favorites.value = res.data.data || []
            // Sync IDs from fetched list
            favorites.value.forEach(song => favoriteIds.value.add(song.id))
            return res.data
        } catch (error) {
            console.error('Failed to fetch favorites:', error)
        } finally {
            loading.value = false
        }
    }

    return {
        favoriteIds,
        favorites,
        loading,
        isFavorite,
        fetchFavoriteIds,
        toggleFavorite,
        fetchFavorites
    }
})
