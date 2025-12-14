/**
 * Player Store - Pinia store untuk karaoke player
 * File: src/stores/player.js
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { playbackAPI, songsAPI } from '@/services/api'

export const usePlayerStore = defineStore('player', () => {
  // State
  const currentSong = ref(null)
  const historyId = ref(null)
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.8)
  const pitch = ref(0) // -6 to +6
  const vocalOn = ref(false) // false = karaoke mode (instrumental)
  const showOverlay = ref(false) // Song selection overlay
  const queue = ref([]) // Song queue
  const loading = ref(false)
  
  // Getters
  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })
  
  const currentVideoUrl = computed(() => {
    if (!currentSong.value) return null
    return vocalOn.value 
      ? currentSong.value.video_url_full 
      : currentSong.value.video_url_instrumental
  })
  
  const formattedCurrentTime = computed(() => formatTime(currentTime.value))
  const formattedDuration = computed(() => formatTime(duration.value))
  
  // Actions
  
  /**
   * Load dan play lagu
   */
  const playSong = async (song) => {
    loading.value = true
    
    try {
      // End session sebelumnya jika ada
      if (historyId.value && currentSong.value) {
        await endCurrentSession()
      }
      
      // Set lagu baru
      currentSong.value = song
      
      // Start playback session di backend
      const response = await playbackAPI.start(song.id)
      historyId.value = response.data.data.historyId
      
      isPlaying.value = true
      isPaused.value = false
      currentTime.value = 0
      
      // Close overlay jika terbuka
      showOverlay.value = false
      
    } catch (error) {
      console.error('Error playing song:', error)
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Pause playback
   */
  const pause = () => {
    isPlaying.value = false
    isPaused.value = true
  }
  
  /**
   * Resume playback
   */
  const resume = () => {
    isPlaying.value = true
    isPaused.value = false
  }
  
  /**
   * Stop playback dan simpan score
   */
  const stop = async () => {
    if (historyId.value) {
      await endCurrentSession()
    }
    
    isPlaying.value = false
    isPaused.value = false
    currentTime.value = 0
  }
  
  /**
   * End current session dan simpan ke backend
   */
  const endCurrentSession = async () => {
    if (!historyId.value) return null
    
    try {
      const response = await playbackAPI.end(
        historyId.value,
        Math.round(currentTime.value)
      )
      
      const result = response.data.data
      historyId.value = null
      
      return result
    } catch (error) {
      console.error('Error ending session:', error)
      return null
    }
  }
  
  /**
   * Update current time
   */
  const updateTime = (time) => {
    currentTime.value = time
  }
  
  /**
   * Update duration
   */
  const setDuration = (dur) => {
    duration.value = dur
  }
  
  /**
   * Set volume (0-1)
   */
  const setVolume = (vol) => {
    volume.value = Math.max(0, Math.min(1, vol))
  }
  
  /**
   * Set pitch (-6 to +6)
   */
  const setPitch = (p) => {
    pitch.value = Math.max(-6, Math.min(6, p))
  }
  
  /**
   * Toggle vocal on/off
   */
  const toggleVocal = () => {
    vocalOn.value = !vocalOn.value
  }
  
  /**
   * Toggle song overlay
   */
  const toggleOverlay = () => {
    showOverlay.value = !showOverlay.value
  }
  
  /**
   * Add song to queue
   */
  const addToQueue = (song) => {
    queue.value.push(song)
  }
  
  /**
   * Play next song in queue
   */
  const playNext = async () => {
    if (queue.value.length > 0) {
      const nextSong = queue.value.shift()
      await playSong(nextSong)
    }
  }
  
  /**
   * Clear queue
   */
  const clearQueue = () => {
    queue.value = []
  }
  
  /**
   * Format time mm:ss
   */
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return {
    // State
    currentSong,
    historyId,
    isPlaying,
    isPaused,
    currentTime,
    duration,
    volume,
    pitch,
    vocalOn,
    showOverlay,
    queue,
    loading,
    // Getters
    progress,
    currentVideoUrl,
    formattedCurrentTime,
    formattedDuration,
    // Actions
    playSong,
    pause,
    resume,
    stop,
    endCurrentSession,
    updateTime,
    setDuration,
    setVolume,
    setPitch,
    toggleVocal,
    toggleOverlay,
    addToQueue,
    playNext,
    clearQueue
  }
})
