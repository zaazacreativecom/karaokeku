<template>
  <div class="karaoke-layout">
    <!-- Sidebar (same as dashboard) -->
    <aside class="dashboard-sidebar">
      <div class="sidebar-header">
        <router-link to="/dashboard" class="brand">
          <i class="bi bi-music-note-beamed"></i>
          <span>Karaoke<span class="text-gradient">Ku</span></span>
        </router-link>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item">
          <i class="bi bi-grid-1x2-fill"></i>
          <span>Dashboard</span>
        </router-link>

        <router-link to="/karaoke" class="nav-item active">
          <i class="bi bi-mic-fill"></i>
          <span>Karaoke</span>
        </router-link>

        <router-link to="/songs" class="nav-item">
          <i class="bi bi-music-note-list"></i>
          <span>Pilih Lagu</span>
        </router-link>
        <router-link to="/favorites" class="nav-item"><i class="bi bi-heart-fill"></i><span>Lagu
            Favorit</span></router-link>

        <router-link to="/playlists" class="nav-item">
          <i class="bi bi-collection-play-fill"></i>
          <span>Playlist Saya</span>
        </router-link>

        <router-link to="/upload" class="nav-item">
          <i class="bi bi-cloud-upload-fill"></i>
          <span>Upload Lagu</span>
        </router-link>

        <router-link to="/history" class="nav-item">
          <i class="bi bi-clock-history"></i>
          <span>Riwayat & Score</span>
        </router-link>

        <router-link to="/request" class="nav-item">
          <i class="bi bi-plus-circle-fill"></i>
          <span>Request Lagu</span>
        </router-link>

        <router-link to="/donation" class="nav-item">
          <i class="bi bi-heart-fill"></i>
          <span>Donasi</span>
        </router-link>

        <div class="nav-divider"></div>

        <router-link to="/settings" class="nav-item">
          <i class="bi bi-gear-fill"></i>
          <span>Pengaturan</span>
        </router-link>
      </nav>
    </aside>

    <!-- Main Karaoke Area -->
    <main class="karaoke-main">
      <!-- Video Player -->
      <div class="player-wrapper">
        <div class="video-glow" :style="{ backgroundImage: `url(${glowImage})` }"></div>
        <div class="video-container">
          <div v-if="!playerStore.currentSong" class="video-placeholder">
            <video class="video-intro" autoplay loop muted playsinline>
              <source src="/assets/video_intro.mp4" type="video/mp4">
            </video>
            <div class="placeholder-content">
              <i class="bi bi-music-note-beamed"></i>
              <h2>KaraokeKu</h2>
              <p>Pilih lagu untuk mulai bernyanyi</p>
              <button class="btn btn-primary btn-lg" @click="playerStore.toggleOverlay()">
                <i class="bi bi-search me-2"></i>
                Pilih Lagu
              </button>
            </div>
          </div>

          <!-- Single Video with Web Audio API for channel control -->
          <video ref="videoRef" class="video-player" :src="encodedVideoUrl" @timeupdate="onTimeUpdate"
            @loadedmetadata="onLoadedMetadata" @ended="onVideoEnded" @play="onPlay" @pause="onPause"
            crossorigin="anonymous">
          </video>

          <!-- Lyrics Overlay -->
          <div v-if="playerStore.currentSong && currentLyrics" class="lyrics-overlay">
            <p class="lyric-line" :class="{ active: true }">
              {{ currentLyrics }}
            </p>
          </div>

          <!-- Song Info Overlay -->
          <div v-if="playerStore.currentSong" class="song-info-overlay">
            <h3>{{ playerStore.currentSong.title }}</h3>
            <p>{{ playerStore.currentSong.artist }}</p>
          </div>
        </div>
      </div>

      <!-- Controls Bar -->
      <div class="controls-bar">
        <!-- Mobile Control Overlays -->
        <div v-if="activeMobileControl" class="mobile-control-overlay" @click.self="activeMobileControl = null">
          <div class="mobile-control-popup" :class="activeMobileControl">
            <!-- Pitch Popup -->
            <div v-if="activeMobileControl === 'pitch'" class="control-popup-content">
              <div class="popup-header">
                <i class="bi bi-music-note"></i>
                <span>Pitch Control</span>
                <button class="btn-close-popup" @click="activeMobileControl = null"><i class="bi bi-x"></i></button>
              </div>
              <div class="popup-body">
                <button class="btn-popup-control" @click="decreasePitch" :disabled="playerStore.pitch <= -12">
                  <i class="bi bi-dash"></i>
                </button>
                <div class="popup-value" :class="{ positive: playerStore.pitch > 0, negative: playerStore.pitch < 0 }">
                  {{ playerStore.pitch > 0 ? '+' : '' }}{{ playerStore.pitch }}
                </div>
                <button class="btn-popup-control" @click="increasePitch" :disabled="playerStore.pitch >= 12">
                  <i class="bi bi-plus"></i>
                </button>
                <button v-if="playerStore.pitch !== 0" class="btn-popup-reset" @click="resetPitch">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-container">
          <span class="time-display">{{ playerStore.formattedCurrentTime }}</span>
          <div class="progress-bar" @click="seekTo">
            <div class="progress-fill" :style="{ width: playerStore.progress + '%' }"></div>
            <div class="progress-thumb" :style="{ left: playerStore.progress + '%' }"></div>
          </div>
          <span class="time-display">{{ playerStore.formattedDuration }}</span>
        </div>

        <!-- Main Controls -->
        <div class="controls-main">
          <!-- Left Controls -->
          <div class="controls-left">
            <button class="btn-control" @click="playerStore.toggleOverlay()" title="Pilih Lagu">
              <i class="bi bi-music-note-list"></i>
            </button>
          </div>

          <!-- Center Controls -->
          <div class="controls-center">
            <button class="btn-control" @click="skipPrev" title="Sebelumnya">
              <i class="bi bi-skip-start-fill"></i>
            </button>

            <button class="btn-play" @click="togglePlay" :disabled="!playerStore.currentSong">
              <i :class="playerStore.isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill'"></i>
            </button>

            <button class="btn-control" @click="skipNext" title="Selanjutnya">
              <i class="bi bi-skip-end-fill"></i>
            </button>

            <button class="btn-control desktop-only" @click="stopPlayback" title="Stop">
              <i class="bi bi-stop-fill"></i>
            </button>
          </div>

          <!-- Right Controls -->
          <div class="controls-right">
            <!-- Audio Channel Toggle (ON/OFF) -->
            <button class="btn-control btn-channel" :class="{ on: playerStore.vocalOn, off: !playerStore.vocalOn }"
              @click="toggleAudioChannel" title="Toggle Audio Channel" :disabled="!playerStore.currentSong">
              <i :class="playerStore.vocalOn ? 'bi bi-mic-fill' : 'bi bi-mic-fill'"></i>
              <span class="desktop-only">{{ playerStore.vocalOn ? 'ON' : 'OFF' }}</span>
            </button>

            <!-- Mobile Pitch Icon -->
            <button class="btn-control mobile-only" :class="{ active: activeMobileControl === 'pitch' }"
              @click="toggleMobileControl('pitch')" title="Pitch" :disabled="!playerStore.currentSong">
              <i class="bi bi-music-note"></i>
            </button>

            <!-- Desktop Pitch Control -->
            <div class="pitch-control desktop-only">
              <span class="control-label">Pitch:</span>
              <button class="btn-sm-control" @click="decreasePitch" :disabled="playerStore.pitch <= -12" title="-1">
                <i class="bi bi-dash"></i>
              </button>
              <span class="control-value" :class="{ positive: playerStore.pitch > 0, negative: playerStore.pitch < 0 }">
                {{ playerStore.pitch > 0 ? '+' : '' }}{{ playerStore.pitch }}
              </span>
              <button class="btn-sm-control" @click="increasePitch" :disabled="playerStore.pitch >= 12" title="+1">
                <i class="bi bi-plus"></i>
              </button>
              <button v-if="playerStore.pitch !== 0" class="btn-sm-control btn-reset" @click="resetPitch" title="Reset">
                <i class="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>

            <!-- Desktop Tempo Control (Hidden on mobile) -->
            <div class="tempo-control desktop-only">
              <span class="control-label">Tempo:</span>
              <button class="btn-sm-control" @click="decreaseTempo" :disabled="tempo <= 0.5" title="Slower">
                <i class="bi bi-dash"></i>
              </button>
              <span class="control-value">
                {{ Math.round(tempo * 100) }}%
              </span>
              <button class="btn-sm-control" @click="increaseTempo" :disabled="tempo >= 2.0" title="Faster">
                <i class="bi bi-plus"></i>
              </button>
              <button v-if="tempo !== 1.0" class="btn-sm-control btn-reset" @click="resetTempo" title="Reset">
                <i class="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>

            <!-- Volume (Desktop) -->
            <div class="volume-control desktop-only">
              <button class="btn-control" @click="toggleMute">
                <i :class="volumeIcon"></i>
              </button>
              <input type="range" min="0" max="1" step="0.1" :value="playerStore.volume" @input="setVolume"
                class="volume-slider">
            </div>
          </div>
        </div>
      </div>

      <!-- Song Selection Overlay -->
      <div v-if="playerStore.showOverlay" class="song-overlay" @click.self="playerStore.toggleOverlay()">
        <div class="overlay-content">
          <div class="overlay-header">
            <h2>Pilih Lagu</h2>
            <button class="btn-close-overlay" @click="playerStore.toggleOverlay()">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Search -->
          <div class="overlay-search">
            <i class="bi bi-search"></i>
            <input type="text" v-model="searchQuery" @input="handleSearch" placeholder="Cari judul atau artis..."
              class="form-control">
          </div>

          <!-- Filters -->
          <div class="overlay-filters">
            <select v-model="filterGenre" @change="fetchSongs" class="form-select">
              <option value="">Semua Genre</option>
              <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
            </select>
            <select v-model="filterLanguage" @change="fetchSongs" class="form-select">
              <option value="">Semua Bahasa</option>
              <option v-for="l in languages" :key="l" :value="l">{{ l }}</option>
            </select>
          </div>

          <!-- Song List -->
          <div class="overlay-songs">
            <div v-for="song in songs" :key="song.id" class="overlay-song-item">
              <!-- Desktop Thumbnail -->
              <div class="song-thumbnail desktop-only">
                <i class="bi bi-music-note"></i>
              </div>

              <!-- Mobile Left Actions (Thumbnail replacement) -->
              <div class="mobile-left-actions mobile-only">
                <button class="btn btn-primary btn-icon-sm" @click="playSong(song)">
                  <i class="bi bi-play-fill"></i>
                </button>
                <button class="btn btn-ghost btn-icon-sm" @click="addToQueue(song)">
                  <i class="bi bi-plus-lg"></i>
                </button>
              </div>

              <div class="song-details">
                <h4>{{ song.title }}</h4>
                <p>{{ song.artist }}</p>
                <div class="song-meta">
                  <span v-if="song.genre"><i class="bi bi-tag"></i> {{ song.genre }}</span>
                  <span v-if="song.language"><i class="bi bi-globe"></i> {{ song.language }}</span>
                </div>
              </div>

              <div class="song-actions desktop-only">
                <button class="btn btn-primary btn-sm" @click="playSong(song)">
                  <i class="bi bi-play-fill me-1"></i> Play
                </button>
                <button class="btn btn-ghost btn-sm" @click="addToQueue(song)">
                  <i class="bi bi-plus-lg"></i>
                </button>
              </div>
            </div>

            <div v-if="songs.length === 0 && !loadingSongs" class="empty-songs">
              <i class="bi bi-music-note-beamed"></i>
              <p>Tidak ada lagu ditemukan</p>
            </div>

            <div v-if="loadingSongs" class="loading-songs">
              <div class="spinner-border text-primary"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Score Modal -->
      <div v-if="showScoreModal" class="score-modal">
        <div class="score-content">
          <div class="score-header">
            <h2>🎉 Selesai!</h2>
          </div>
          <div class="score-body">
            <div class="score-value">{{ lastScore }}</div>
            <p>Score Kamu</p>
            <div v-if="isHighScore" class="high-score-badge">
              <i class="bi bi-trophy-fill"></i> High Score Baru!
            </div>
          </div>
          <div class="score-footer">
            <button class="btn btn-ghost" @click="closeScoreModal">Tutup</button>
            <button class="btn btn-primary" @click="replaySong">
              <i class="bi bi-arrow-repeat me-2"></i> Main Lagi
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Mobile Navigation -->
    <MobileNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { songsAPI } from '@/services/api'
import MobileNav from '@/components/MobileNav.vue'
import { getHighResThumbnailUrl } from '@/utils/media'

const route = useRoute()
const playerStore = usePlayerStore()

// Refs - Single video
const videoRef = ref(null)

// Web Audio API refs
let audioContext = null
let sourceNode = null
let gainNode = null
let channelSplitter = null
let channelMerger = null
let leftGain = null
let rightGain = null

const currentSong = computed(() => playerStore.currentSong)
const glowImage = computed(() => {
  if (!currentSong.value) return ''
  return getHighResThumbnailUrl(currentSong.value)
})

// Fix for URLs with special characters (like #)
const encodedVideoUrl = computed(() => {
  let url = currentSong.value?.video_url_full;
  if (!url) return '';

  // Strip localhost if present
  if (url.includes('localhost')) {
    url = url.replace(/^http(s)?:\/\/localhost(:\d+)?/, '');
  }

  // Split key parts to encode filenames properly
  const parts = url.split('/');
  const filename = parts.pop();
  const basePath = parts.join('/');

  // We only encode the filename, but keeping common path separators
  // Using encodeURIComponent triggers correctness for #, ?, etc.
  return `${basePath}/${encodeURIComponent(filename)}`;
});

// State
const searchQuery = ref('')
const filterGenre = ref('')
const filterLanguage = ref('')
const songs = ref([])
const genres = ref([])
const languages = ref([])
const loadingSongs = ref(false)
const currentLyrics = ref('')
const showScoreModal = ref(false)
const lastScore = ref(0)
const isHighScore = ref(false)
const previousVolume = ref(0.8)
const tempo = ref(1.0) // Tempo control (0.5x - 2.0x)
const audioInitialized = ref(false)
const activeMobileControl = ref(null)

// Computed
const volumeIcon = computed(() => {
  if (playerStore.volume === 0) return 'bi bi-volume-mute-fill'
  if (playerStore.volume < 0.5) return 'bi bi-volume-down-fill'
  return 'bi bi-volume-up-fill'
})

// Initialize Web Audio API for channel control
const initAudioContext = () => {
  if (audioInitialized.value || !videoRef.value) return

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    sourceNode = audioContext.createMediaElementSource(videoRef.value)

    // Create channel splitter (2 channels for stereo)
    channelSplitter = audioContext.createChannelSplitter(2)

    // Create gain nodes for each channel
    leftGain = audioContext.createGain()
    rightGain = audioContext.createGain()

    // Create channel merger
    channelMerger = audioContext.createChannelMerger(2)

    // Main gain node
    gainNode = audioContext.createGain()

    // Connect: source -> splitter -> gains -> merger -> destination
    sourceNode.connect(channelSplitter)
    channelSplitter.connect(leftGain, 0) // Left channel
    channelSplitter.connect(rightGain, 1) // Right channel
    leftGain.connect(channelMerger, 0, 0) // Left to left
    leftGain.connect(channelMerger, 0, 1) // Left to right (for mono from left)
    rightGain.connect(channelMerger, 0, 0) // Right to left (for stereo)
    rightGain.connect(channelMerger, 0, 1) // Right to right (for stereo)
    channelMerger.connect(gainNode)
    gainNode.connect(audioContext.destination)

    audioInitialized.value = true

    // Apply initial channel setting
    applyChannelSettings()

  } catch (error) {
    console.error('Error initializing Web Audio API:', error)
    // Fallback - connect directly
    if (sourceNode) {
      sourceNode.connect(audioContext.destination)
    }
  }
}

// Apply channel settings (STEREO/LEFT)
const applyChannelSettings = () => {
  if (!leftGain || !rightGain) return

  if (playerStore.vocalOn) {
    // STEREO mode - both channels active
    leftGain.gain.value = 0.5
    rightGain.gain.value = 0.5
  } else {
    // LEFT mode - only left channel (typically instrumental in karaoke)
    leftGain.gain.value = 1.0
    rightGain.gain.value = 0.0
  }
}

// Toggle Audio Channel (STEREO/LEFT)
const toggleAudioChannel = () => {
  if (!playerStore.currentSong) return

  playerStore.toggleVocal()
  applyChannelSettings()
}

// Methods
const togglePlay = () => {
  if (!videoRef.value) return

  // Initialize audio on first play (required by browsers)
  if (!audioInitialized.value) {
    initAudioContext()
    if (audioContext?.state === 'suspended') {
      audioContext.resume()
    }
  }

  if (playerStore.isPlaying) {
    videoRef.value.pause()
    playerStore.pause()
  } else {
    videoRef.value.play()
    playerStore.resume()
  }
}

const onTimeUpdate = (e) => {
  const time = e.target.currentTime
  const duration = e.target.duration

  playerStore.updateTime(time)
  updateLyrics(time)

  // Auto-end song at 90% to skip outro
  if (duration > 0 && time >= duration * 0.9 && !showScoreModal.value && !playerStore.loading) {
    // Prevent multiple triggers
    if (!isEnding.value) {
      isEnding.value = true;
      onVideoEnded();
    }
  }
}
const isEnding = ref(false);

const onLoadedMetadata = (e) => {
  playerStore.setDuration(e.target.duration)
}

const onPlay = () => {
  playerStore.resume()
  if (audioContext?.state === 'suspended') {
    audioContext.resume()
  }
}

const onPause = () => {
  playerStore.pause()
}

const onVideoEnded = async () => {
  const result = await playerStore.endCurrentSession()

  if (result) {
    lastScore.value = result.score
    isHighScore.value = result.isHighScore
    showScoreModal.value = true
  }

  // Play next in queue
  if (playerStore.queue.length > 0) {
    setTimeout(() => {
      playerStore.playNext()
    }, 2000)
  }
}

const stopPlayback = async () => {
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
  }
  await playerStore.stop()
}

const seekTo = (e) => {
  if (!videoRef.value || !playerStore.duration) return

  const rect = e.currentTarget.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  const time = percent * playerStore.duration

  videoRef.value.currentTime = time
  playerStore.updateTime(time)
}

const skipPrev = () => {
  if (videoRef.value) {
    videoRef.value.currentTime = 0
  }
  playerStore.updateTime(0)
}

const skipNext = () => {
  if (playerStore.queue.length > 0) {
    playerStore.playNext()
  }
}

const setVolume = (e) => {
  const vol = parseFloat(e.target.value)
  playerStore.setVolume(vol)
  if (gainNode) {
    gainNode.gain.value = vol
  }
}

const toggleMute = () => {
  if (playerStore.volume > 0) {
    previousVolume.value = playerStore.volume
    playerStore.setVolume(0)
    if (gainNode) gainNode.gain.value = 0
  } else {
    playerStore.setVolume(previousVolume.value)
    if (gainNode) gainNode.gain.value = previousVolume.value
  }
}

// Pitch Control dengan preservesPitch (mengubah pitch tanpa mengubah tempo)
const playbackRate = ref(1.0)
const preservePitch = ref(false) // true = pitch berubah, tempo tetap

// Compute playback rate dari semitone
const computePlaybackRateFromSemitone = (semi) => {
  return Math.pow(2, semi / 12)
}

const increasePitch = () => {
  if (playerStore.pitch < 6) {
    playerStore.setPitch(playerStore.pitch + 1)
    applyPlaybackRate()
  }
}

const decreasePitch = () => {
  if (playerStore.pitch > -6) {
    playerStore.setPitch(playerStore.pitch - 1)
    applyPlaybackRate()
  }
}

const resetPitch = () => {
  playerStore.setPitch(0)
  applyPlaybackRate()
}

const applyPlaybackRate = () => {
  if (!videoRef.value) return

  playbackRate.value = computePlaybackRateFromSemitone(playerStore.pitch)
  videoRef.value.playbackRate = playbackRate.value

  // Set preservesPitch (dengan vendor prefixes untuk kompatibilitas)
  try {
    videoRef.value.preservesPitch = preservePitch.value
    videoRef.value.mozPreservesPitch = preservePitch.value
    videoRef.value.webkitPreservesPitch = preservePitch.value
  } catch (e) {
    console.log('preservesPitch not supported')
  }
}

// Tempo Control (kecepatan playback)
const increaseTempo = () => {
  if (tempo.value < 2.0) {
    tempo.value = Math.min(2.0, Math.round((tempo.value + 0.1) * 10) / 10)
    applyTempo()
  }
}

const decreaseTempo = () => {
  if (tempo.value > 0.5) {
    tempo.value = Math.max(0.5, Math.round((tempo.value - 0.1) * 10) / 10)
    applyTempo()
  }
}

const resetTempo = () => {
  tempo.value = 1.0
  applyTempo()
}

const applyTempo = () => {
  if (!videoRef.value) return

  // Pitch dari store, tempo dari local
  const pitchRate = computePlaybackRateFromSemitone(playerStore.pitch)
  const finalRate = pitchRate * tempo.value
  videoRef.value.playbackRate = finalRate

  // Set preservesPitch untuk menjaga pitch saat tempo berubah
  try {
    videoRef.value.preservesPitch = true // Tempo changes should preserve pitch
    videoRef.value.mozPreservesPitch = true
    videoRef.value.webkitPreservesPitch = true
  } catch (e) { }
}

const updateLyrics = (time) => {
  if (!playerStore.currentSong?.lyrics_data) {
    currentLyrics.value = ''
    return
  }

  const lyrics = playerStore.currentSong.lyrics_data
  if (!Array.isArray(lyrics)) return

  // Find current lyric line
  let current = ''
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (lyrics[i].time <= time) {
      current = lyrics[i].text
      break
    }
  }

  currentLyrics.value = current
}

const toggleMobileControl = (control) => {
  if (activeMobileControl.value === control) {
    activeMobileControl.value = null
  } else {
    activeMobileControl.value = control
  }
}

const handleSearch = () => {
  fetchSongs()
}

const fetchSongs = async () => {
  loadingSongs.value = true

  try {
    const params = {
      search: searchQuery.value,
      genre: filterGenre.value,
      language: filterLanguage.value,
      limit: 50
    }

    const response = await songsAPI.getAll(params)
    songs.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching songs:', error)
  } finally {
    loadingSongs.value = false
  }
}

const fetchFilters = async () => {
  try {
    const [genresRes, langsRes] = await Promise.all([
      songsAPI.getGenres(),
      songsAPI.getLanguages()
    ])

    genres.value = genresRes.data.data || []
    languages.value = langsRes.data.data || []
  } catch (error) {
    console.error('Error fetching filters:', error)
  }
}

const playSong = async (song) => {
  await playerStore.playSong(song)

  // Wait for video to be ready
  setTimeout(() => {
    if (videoRef.value) {
      // Initialize audio context on first play
      if (!audioInitialized.value) {
        initAudioContext()
      }

      videoRef.value.play()

      // Apply current pitch + transpose settings
      applyTempo()
    }
  }, 100)
}

const addToQueue = (song) => {
  playerStore.addToQueue(song)
}

const closeScoreModal = () => {
  showScoreModal.value = false
}

const replaySong = async () => {
  showScoreModal.value = false
  if (playerStore.currentSong) {
    await playerStore.playSong(playerStore.currentSong)
    setTimeout(() => {
      if (videoRef.value) {
        videoRef.value.play()
      }
    }, 100)
  }
}

// Load song from route param
const loadSongFromRoute = async () => {
  if (route.params.songId) {
    try {
      const response = await songsAPI.getById(route.params.songId)
      if (response.data.data) {
        await playSong(response.data.data)
      }
    } catch (error) {
      console.error('Error loading song:', error)
    }
  }
}

onMounted(() => {
  fetchSongs()
  fetchFilters()
  loadSongFromRoute()
})

onUnmounted(() => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
  // Cleanup audio context
  if (audioContext) {
    audioContext.close()
  }
})
</script>

<style scoped>
.karaoke-layout {
  display: flex;
  min-height: 100vh;
  background: #000;
}


/* Utility - Visibility */
.mobile-only {
  display: none !important;
}

/* Reused sidebar styles from dashboard */
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
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.brand i {
  font-size: 1.5rem;
  color: var(--primary);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem;
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
  color: white;
  background: var(--gradient-primary);
}

/* Main Karaoke Area */
.karaoke-main {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

/* Video Container - fills remaining space after controls */
/* Player Wrapper & Glow */
.player-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem;
  max-width: 1200px;
  width: 100%;
  align-self: center;
}

.video-glow {
  position: absolute;
  inset: -20px;
  background-size: cover;
  background-position: center;
  filter: blur(40px);
  opacity: 0.3;
  z-index: 0;
  border-radius: 30px;
  transition: background-image 0.5s ease;
}

/* Video Container */
.video-container {
  width: 100%;
  aspect-ratio: 16/9;
  position: relative;
  background: #000;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  background: black;
  position: relative;
  overflow: hidden;
}

.video-intro {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.4;
  z-index: 0;
}

.placeholder-content {
  position: relative;
  z-index: 1;
}

.placeholder-content i {
  font-size: 5rem;
  background: var(--gradient-primary);
  background-clip: text;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: var(--primary);
  margin-bottom: 1rem;
  display: block;
}

.placeholder-content h2 {
  margin-bottom: 0.5rem;
  background: var(--gradient-primary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.placeholder-content p {
  margin-bottom: 2rem;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Lyrics Overlay */
.lyrics-overlay {
  position: absolute;
  bottom: 120px;
  left: 0;
  right: 0;
  text-align: center;
  padding: 1rem;
}

.lyric-line {
  display: inline-block;
  background: rgba(0, 0, 0, 0.7);
  padding: 0.75rem 2rem;
  border-radius: var(--radius-lg);
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.lyric-line.active {
  color: var(--primary-light);
  background-clip: text;
  -webkit-background-clip: text;
}

/* Song Info Overlay */
.song-info-overlay {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(0, 0, 0, 0.7);
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-md);
}

.song-info-overlay h3 {
  font-size: 1rem;
  margin: 0;
}

.song-info-overlay p {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

/* Controls Bar - fixed at bottom, never shrinks */
/* Controls Bar */
.controls-bar {
  background: rgba(25, 25, 35, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 2rem;
  flex-shrink: 0;
  margin: 0 1rem 1rem;
  border-radius: 20px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.time-display {
  font-size: 0.875rem;
  color: var(--text-muted);
  min-width: 45px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-darker);
  border-radius: var(--radius-full);
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  transition: width 0.1s linear;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  box-shadow: var(--shadow-md);
}

.controls-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.controls-center {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.controls-left,
.controls-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-control {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: var(--text-primary);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-control:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-play {
  width: 56px;
  height: 56px;
  background: var(--gradient-primary);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-play:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: var(--shadow-glow);
}

.btn-play:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-channel {
  width: auto;
  padding: 0.5rem 1rem;
  gap: 0.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
}

.btn-channel.on {
  background: var(--success);
  color: white;
}

.btn-channel.off {
  background: rgba(245, 158, 11, 0.3);
  border: 1px solid var(--warning);
  color: var(--warning);
}

.btn-channel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-channel span {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.pitch-control,
.tempo-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
}

.control-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-right: 0.25rem;
  white-space: nowrap;
}

.btn-sm-control {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.btn-sm-control:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  color: var(--primary-light);
}

.btn-sm-control:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-sm-control.btn-reset {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning);
}

.control-value {
  min-width: 35px;
  text-align: center;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-sm);
}

.control-value.positive {
  color: var(--success);
}

.control-value.negative {
  color: var(--danger);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.volume-slider {
  width: 80px;
  height: 4px;
  appearance: none;
  background: var(--bg-darker);
  border-radius: var(--radius-full);
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
}

/* Song Overlay */
.song-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.overlay-content {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  width: 90%;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.overlay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.overlay-header h2 {
  margin: 0;
}

.btn-close-overlay {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: var(--text-primary);
  cursor: pointer;
}

.overlay-search {
  padding: 1rem 1.5rem;
  position: relative;
}

.overlay-search i {
  position: absolute;
  left: 2.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.overlay-search input {
  padding-left: 2.5rem;
}

.overlay-filters {
  display: flex;
  gap: 1rem;
  padding: 0 1.5rem 1rem;
}

.overlay-filters select {
  flex: 1;
}

.overlay-songs {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem 1.5rem;
}

.overlay-song-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  margin-bottom: 0.5rem;
  transition: all var(--transition-fast);
}

.overlay-song-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.song-thumbnail {
  width: 50px;
  height: 50px;
  background: var(--gradient-primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-details h4 {
  font-size: 0.95rem;
  margin: 0 0 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-details p {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

.song-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.song-meta i {
  margin-right: 0.25rem;
}

.song-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-songs {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.empty-songs i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.loading-songs {
  text-align: center;
  padding: 2rem;
}

/* Score Modal */
.score-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.score-content {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 2rem;
  text-align: center;
  min-width: 300px;
}

.score-header h2 {
  font-size: 2rem;
  margin: 0 0 1rem;
}

.score-value {
  font-size: 5rem;
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
}

.score-body p {
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.high-score-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--warning);
  color: black;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  margin-top: 1rem;
  font-weight: 600;
}

.score-footer {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
}

/* Responsive */
@media (max-width: 992px) {
  .dashboard-sidebar {
    width: 70px;
  }

  .brand span,
  .nav-item span {
    display: none;
  }

  .karaoke-main {
    margin-left: 70px;
  }

  .nav-item {
    justify-content: center;
  }

  .controls-bar {
    padding: 1rem;
  }

  .volume-slider {
    display: none;
  }
}

@media (max-width: 768px) {
  .dashboard-sidebar {
    display: none;
  }

  /* Utility classes */
  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: inline-flex !important;
  }

  .karaoke-main {
    margin-left: 0;
    padding-bottom: 220px;
  }

  /* Modern Mobile Controls Bar */
  .controls-bar {
    position: fixed;
    bottom: 80px;
    left: 1rem;
    right: 1rem;
    padding: 1rem;
    background: rgba(30, 30, 40, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    z-index: 150;
    /* Below Song Overlay (200), below Mobile Nav (3000) */
    margin: 0;
  }

  /* Progress Bar */
  .progress-container {
    margin-bottom: 0.25rem;
  }

  .progress-bar {
    height: 6px;
  }

  .progress-thumb {
    width: 12px;
    height: 12px;
  }

  /* Controls Grid */
  .controls-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .controls-center {
    gap: 1rem;
  }

  .btn-play {
    width: 56px;
    height: 56px;
    font-size: 1.75rem;
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
  }

  .btn-control {
    width: 42px;
    height: 42px;
    background: rgba(255, 255, 255, 0.05);
  }

  .btn-control.active {
    background: var(--primary);
    color: white;
    box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
  }

  /* Channel Button */
  .btn-channel {
    width: 42px !important;
    height: 42px !important;
    padding: 0;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Mobile Overlay Popup */
  .mobile-control-overlay {
    position: absolute;
    bottom: 110%;
    /* Above the controls bar */
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    z-index: 200;
  }

  .mobile-control-popup {
    background: rgba(30, 30, 40, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    padding: 1rem;
    width: 200px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.2s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    font-weight: 600;
    font-size: 0.9rem;
  }

  .popup-header i {
    color: var(--primary);
  }

  .btn-close-popup {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1.1rem;
  }

  .popup-body {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
  }

  .btn-popup-control {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-popup-control:active {
    background: rgba(255, 255, 255, 0.2);
  }

  .popup-value {
    font-size: 1.25rem;
    font-weight: 800;
  }

  .btn-popup-reset {
    position: absolute;
    bottom: -25px;
    /* hang below or change layout */
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.7rem;
    background: none;
    border: none;
    color: var(--warning);
    text-decoration: underline;
  }

  /* Reset adjust: let's put it inside body properly or header */
  /* Re-adjust popup body to accommodate reset better */
}

/* Small Mobile Adjustments */
@media (max-width: 380px) {
  .controls-bar {
    left: 0.5rem;
    right: 0.5rem;
    padding: 0.75rem;
  }

  .controls-center {
    gap: 0.75rem;
  }

  .btn-play {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }

  /* Adjust Overlay for Mobile */
  .song-overlay {
    background: rgba(0, 0, 0, 0.6);
    /* Semi-transparent backdrop */
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }

  .overlay-content {
    width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
    background: rgba(25, 25, 35, 0.85);
    /* Glassmorphism content */
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    display: flex;
    flex-direction: column;
  }

  .overlay-header {
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1rem 1.5rem;
  }

  .overlay-songs {
    padding: 1rem;
  }

  .overlay-song-item {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    /* Lighter item bg */
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    margin-bottom: 0.75rem;
    align-items: flex-start;
    /* Align top for wrapped text */
  }

  .song-thumbnail {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
    flex-shrink: 0;
    border-radius: 8px;
  }

  .song-details {
    padding-right: 0.5rem;
  }

  .song-details h4 {
    font-size: 1rem;
    white-space: normal;
    /* Allow wrapping */
    overflow: visible;
    text-overflow: clip;
    line-height: 1.3;
    margin-bottom: 0.25rem;
  }

  .song-details p {
    font-size: 0.85rem;
    opacity: 0.8;
  }

  .song-meta {
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  /* Mobile Icon Buttons (New Left Placement) */
  .mobile-left-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-right: 0.75rem;
    flex-shrink: 0;
  }

  .btn-icon-sm {
    display: block;
    width: 32px;
    height: 32px;
    line-height: 32px;
    border-radius: 6px;
    padding: 0;
    text-align: center;
    font-size: 1rem;
  }

  /* Tweaks for song items */
  .overlay-song-item {
    padding: 0.75rem;
    align-items: flex-start;
    /* Keep them top aligned usually looks better if song title wraps */
  }

  .song-actions {
    flex-direction: column;
    /* Stack actions if needed, or row */
    gap: 0.5rem;
    align-self: center;
  }
}
</style>
