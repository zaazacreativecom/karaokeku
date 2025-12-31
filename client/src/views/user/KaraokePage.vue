<template>
  <div class="karaoke-layout">
    <!-- Background (decorative) -->
    <div class="karaoke-bg" aria-hidden="true">
      <div class="bg-mesh"></div>
      <div class="bg-particles"></div>
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
    </div>

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
      <!-- Mobile Topbar (sidebar hidden on mobile) -->
      <div class="mobile-topbar">
        <router-link to="/dashboard" class="brand brand--compact">
          <i class="bi bi-music-note-beamed"></i>
          <span>Karaoke<span class="text-gradient">Ku</span></span>
        </router-link>

        <div class="mobile-now">
          <div class="now-title">{{ playerStore.currentSong?.title || 'Pilih Lagu' }}</div>
          <div class="now-sub">{{ playerStore.currentSong?.artist || 'Mulai karaoke dengan memilih lagu' }}</div>
        </div>

        <button class="icon-btn" type="button" @click="playerStore.toggleOverlay()" aria-label="Pilih Lagu">
          <span v-if="playerStore.queue.length > 0" class="icon-badge">{{ playerStore.queue.length }}</span>
          <i class="bi bi-music-note-list"></i>
        </button>
      </div>

      <!-- Video Player -->
      <div class="player-wrapper">
        <div class="video-glow"
          :style="{ backgroundImage: glowImage ? `var(--gradient-glow), url(${glowImage})` : 'var(--gradient-glow)' }">
        </div>
        <div class="video-container">
          <div v-if="!playerStore.currentSong" class="video-placeholder">
            <video class="video-intro" autoplay loop muted playsinline>
              <source src="/assets/video_intro.mp4" type="video/mp4">
            </video>
            <div class="placeholder-content">
              <button class="btn btn-primary btn-lg" @click="playerStore.toggleOverlay()">
                <i class="bi bi-search me-2"></i>
                Pilih Lagu
              </button>
            </div>
          </div>

          <!-- Single Video with Web Audio API for channel control -->
          <video ref="videoRef" class="video-player" :src="encodedVideoUrl" @timeupdate="onTimeUpdate"
            @loadedmetadata="onLoadedMetadata" @ended="onVideoEnded" @play="onPlay" @pause="onPause"
            @error="onVideoError" crossorigin="anonymous" preload="auto" playsinline>
          </video>

          <!-- Lyrics Overlay -->
          <div v-if="playerStore.currentSong && currentLyrics" class="lyrics-overlay">
            <p class="lyric-line" :class="{ active: true }">
              <span class="lyric-text">{{ currentLyrics }}</span>
            </p>
          </div>

          <!-- Song Info Overlay -->
          <div v-if="playerStore.currentSong" class="song-info-overlay">
            <div class="song-info-row">
              <div class="song-info-text">
                <h3>{{ playerStore.currentSong.title }}</h3>
                <p>{{ playerStore.currentSong.artist }}</p>
              </div>
            </div>
          </div>

          <div v-if="playerStore.currentSong" class="song-info-badges song-info-badges--corner">
            <span class="song-pill" :class="{ on: playerStore.vocalOn }">
              {{ playerStore.vocalOn ? 'VOCAL' : 'KARAOKE' }}
            </span>
            <span v-if="preferLowQualityForSong && !forceOriginalQuality" class="song-pill song-pill--soft">
              LOW
            </span>
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
                <div class="popup-row">
                  <button class="btn-popup-control" @click="decreasePitch" :disabled="playerStore.pitch <= -12">
                    <i class="bi bi-dash"></i>
                  </button>
                  <div class="popup-value"
                    :class="{ positive: playerStore.pitch > 0, negative: playerStore.pitch < 0 }">
                    {{ playerStore.pitch > 0 ? '+' : '' }}{{ playerStore.pitch }}
                  </div>
                  <button class="btn-popup-control" @click="increasePitch" :disabled="playerStore.pitch >= 12">
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
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
            <button class="btn-control" type="button" @click="playerStore.toggleOverlay()" title="Pilih Lagu">
              <span v-if="playerStore.queue.length > 0" class="icon-badge">{{ playerStore.queue.length }}</span>
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
        <div class="overlay-content" role="dialog" aria-modal="true" aria-label="Pilih Lagu">
          <div class="overlay-header">
            <div class="overlay-title">
              <h2 class="text-gradient">Pilih Lagu</h2>
              <div class="overlay-subtitle">
                <span class="overlay-count">{{ songs.length }} lagu</span>
                <span v-if="filterGenre" class="overlay-chip"><i class="bi bi-tag"></i>{{ filterGenre }}</span>
                <span v-if="filterLanguage" class="overlay-chip"><i class="bi bi-globe2"></i>{{ filterLanguage }}</span>
                <span v-if="playerStore.queue.length > 0" class="overlay-chip">
                  <i class="bi bi-list-ul"></i>{{ playerStore.queue.length }} antrian
                </span>
              </div>
            </div>

            <div class="overlay-actions">
              <button v-if="searchQuery || filterGenre || filterLanguage" class="btn btn-ghost btn-sm overlay-reset"
                type="button" @click="resetOverlayFilters">
                <i class="bi bi-arrow-counterclockwise"></i>
                <span class="overlay-reset-text">Reset</span>
              </button>

              <button class="btn-close-overlay" type="button" @click="playerStore.toggleOverlay()" aria-label="Tutup">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <div class="overlay-toolbar">
            <!-- Search -->
            <div class="overlay-search">
              <i class="bi bi-search"></i>
              <input type="text" v-model="searchQuery" @input="handleSearch" placeholder="Cari judul atau artis..."
                class="form-control">
              <button v-if="searchQuery" class="search-clear" type="button" @click="clearSearch"
                aria-label="Hapus pencarian">
                <i class="bi bi-x"></i>
              </button>
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
          </div>

          <!-- Song List -->
          <div ref="overlaySongsRef" class="overlay-songs" @scroll.passive="onOverlaySongsScroll">
            <div v-for="song in songs" :key="song.id" class="overlay-song-item">
              <div class="song-thumbnail">
                <img v-if="getThumbnailUrl(song)" :src="getThumbnailUrl(song)" :alt="song.title" loading="lazy" />
                <i v-else class="bi bi-music-note"></i>
              </div>

              <div class="song-details">
                <h4>{{ song.title }}</h4>
                <p>{{ song.artist }}</p>
                <div class="song-meta">
                  <span v-if="song.genre"><i class="bi bi-tag"></i> {{ song.genre }}</span>
                  <span v-if="song.language"><i class="bi bi-globe"></i> {{ song.language }}</span>
                </div>
              </div>

              <div class="song-actions">
                <button class="btn btn-primary btn-sm btn-play-song" type="button" @click="playSong(song)"
                  aria-label="Play">
                  <i class="bi bi-play-fill"></i>
                  <span class="btn-label">Play</span>
                </button>
                <button class="btn btn-ghost btn-sm btn-queue-song" type="button" @click="addToQueue(song)"
                  aria-label="Tambah ke antrian">
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

            <div v-if="loadingMoreSongs" class="loading-songs loading-songs--more">
              <div class="spinner-border text-primary"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Score Modal -->
      <transition name="kp-score-modal" appear>
        <div v-if="showScoreModal" class="score-modal" role="dialog" aria-modal="true" aria-label="Hasil skor karaoke">
          <canvas ref="scoreFireworksCanvas" class="score-fireworks" aria-hidden="true"></canvas>

          <div class="score-content" :class="{ 'is-high-score': isHighScore }">
            <div class="score-header">
              <div class="score-header-top">
                <i class="bi bi-stars" aria-hidden="true"></i>
                <h2>Selesai!</h2>
              </div>

              <div class="score-mood" :class="`score-mood--${scoreMood.tone}`">
                <div class="score-mood-ring" role="img" :aria-label="scoreMood.aria">
                  <i :class="scoreMood.icon" aria-hidden="true"></i>
                </div>
                <div class="score-mood-copy">
                  <div class="score-mood-title">{{ scoreMood.title }}</div>
                  <div class="score-mood-subtitle">{{ scoreMood.subtitle }}</div>
                </div>
              </div>
            </div>

            <div class="score-body">
              <div class="score-value-line">
                <div class="score-value">{{ animatedScore }}</div>
                <span class="score-max">/100</span>
              </div>
              <p class="score-label">Score Kamu</p>

              <div
                v-if="scoreLevelLabel || scoreRangeLabel || scoreBaseLabel || scoreMultiplierLabel"
                class="score-meta"
                aria-label="Info level dan bonus score"
              >
                <span v-if="scoreLevelLabel" class="score-chip">
                  <i class="bi bi-award-fill" aria-hidden="true"></i>
                  <span>Level {{ scoreLevelLabel }}</span>
                </span>
                <span v-if="scoreRangeLabel" class="score-chip score-chip--soft">
                  <i class="bi bi-shuffle" aria-hidden="true"></i>
                  <span>{{ scoreRangeLabel }}</span>
                </span>
                <span v-if="scoreBaseLabel" class="score-chip score-chip--soft">
                  <i class="bi bi-speedometer2" aria-hidden="true"></i>
                  <span>{{ scoreBaseLabel }}</span>
                </span>
                <span v-if="scoreMultiplierLabel" class="score-chip score-chip--soft">
                  <i class="bi bi-graph-up-arrow" aria-hidden="true"></i>
                  <span>{{ scoreMultiplierLabel }}</span>
                </span>
              </div>

              <div class="score-meter" aria-hidden="true">
                <div class="score-meter-bar" :style="{ width: `${scorePercent}%` }"></div>
              </div>

              <div v-if="isHighScore" class="high-score-badge">
                <i class="bi bi-trophy-fill" aria-hidden="true"></i>
                <span>High Score Baru!</span>
              </div>
            </div>

            <div class="score-footer">
              <button class="btn btn-ghost" @click="closeScoreModal">Tutup</button>
              <button class="btn btn-primary" @click="replaySong">
                <i class="bi bi-arrow-repeat me-2" aria-hidden="true"></i>
                Main Lagi
              </button>
            </div>
          </div>
        </div>
      </transition>
    </main>

    <transition name="kp-toast">
      <div v-if="showToast" class="kp-toast-notification" role="status" aria-live="polite">
        <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>

    <!-- Mobile Navigation -->
    <MobileNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { songsAPI } from '@/services/api'
import MobileNav from '@/components/MobileNav.vue'
import { getHighResThumbnailUrl, getThumbnailUrl } from '@/utils/media'

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

const forceOriginalQuality = ref(false)
const overrideVideoUrl = ref('')

const shouldUseLowQuality = () => {
  if (typeof navigator === 'undefined') return false
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (!conn) return false
  if (conn.saveData) return true
  const effectiveType = (conn.effectiveType || '').toLowerCase()
  return ['slow-2g', '2g', '3g'].includes(effectiveType)
}

const preferLowQualityForSong = ref(false)

watch(
  currentSong,
  () => {
    forceOriginalQuality.value = false
    preferLowQualityForSong.value = shouldUseLowQuality()
    overrideVideoUrl.value = ''
  },
  { immediate: true }
)

watch(
  () => playerStore.vocalOn,
  () => {
    overrideVideoUrl.value = ''
  }
)

const stripLocalhost = (url) => {
  if (!url) return ''
  if (url.includes('localhost')) return url.replace(/^http(s)?:\/\/localhost(:\d+)?/, '')
  return url
}

const toLowVariantUrl = (url) => {
  if (!url) return url
  if (url.includes('/videos/low/')) return url
  const marker = '/videos/'
  const idx = url.indexOf(marker)
  if (idx === -1) return url
  return `${url.slice(0, idx)}${marker}low/${url.slice(idx + marker.length)}`
}

const encodeFilenameInUrl = (url) => {
  if (!url) return ''
  const [pathPart, queryPart] = url.split('?')
  const parts = pathPart.split('/')
  const filename = parts.pop() || ''
  const basePath = parts.join('/')
  const encoded = `${basePath}/${encodeURIComponent(filename)}`
  return queryPart ? `${encoded}?${queryPart}` : encoded
}

const selectedVideoUrl = computed(() => {
  let url = overrideVideoUrl.value || playerStore.currentVideoUrl || currentSong.value?.video_url_full
  url = stripLocalhost(url)
  if (!url) return ''

  // Only use low variant for local /videos/* assets
  const canUseLow = url.includes('/videos/') && !url.includes('youtu')
  const wantLow = preferLowQualityForSong.value && !forceOriginalQuality.value
  if (canUseLow && wantLow) {
    return toLowVariantUrl(url)
  }
  return url
})

// Fix for URLs with special characters (like #)
const encodedVideoUrl = computed(() => encodeFilenameInUrl(selectedVideoUrl.value))

const toMp4VariantUrl = (url) => {
  if (!url) return ''
  const [pathPart, queryPart] = url.split('?')
  if (!pathPart.toLowerCase().endsWith('.mpg')) return url
  const mp4Path = pathPart.replace(/\.mpg$/i, '.mp4')
  return queryPart ? `${mp4Path}?${queryPart}` : mp4Path
}

const onVideoError = () => {
  // Fallback to original quality if low variant is missing/invalid
  if (preferLowQualityForSong.value && !forceOriginalQuality.value) {
    forceOriginalQuality.value = true
    nextTick(() => {
      if (!videoRef.value) return
      // Try to continue playback seamlessly (best effort)
      videoRef.value.play().catch(() => { })
    })
    return
  }

  // If a song URL ends with .mpg and the browser can't play it, try the .mp4 variant.
  if (!overrideVideoUrl.value && selectedVideoUrl.value.toLowerCase().endsWith('.mpg')) {
    overrideVideoUrl.value = toMp4VariantUrl(selectedVideoUrl.value)
    forceOriginalQuality.value = true
    nextTick(() => {
      if (!videoRef.value) return
      videoRef.value.play().catch(() => { })
    })
  }
}

// State
const searchQuery = ref('')
const filterGenre = ref('')
const filterLanguage = ref('')
const songs = ref([])
const genres = ref([])
const languages = ref([])
const loadingSongs = ref(false)
const loadingMoreSongs = ref(false)
const currentLyrics = ref('')
const showScoreModal = ref(false)
const lastScore = ref(0)
const lastScoreBase = ref(null)
const lastScoreMultiplier = ref(1)
const lastUserLevel = ref('')
const lastUserBadge = ref('')
const lastScoreMin = ref(null)
const lastScoreMax = ref(null)
const isHighScore = ref(false)
const animatedScore = ref(0)
const scoreFireworksCanvas = ref(null)
const previousVolume = ref(0.8)
const tempo = ref(1.0) // Tempo control (0.5x - 2.0x)
const audioInitialized = ref(false)
const activeMobileControl = ref(null)

const showToast = ref(false)
const toastMessage = ref('')
let toastTimeout = null
let autoNextTimeout = null

const showToastMessage = (message) => {
  toastMessage.value = message
  showToast.value = true

  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    showToast.value = false
  }, 1700)
}

const clearAutoNextTimeout = () => {
  if (!autoNextTimeout) return
  clearTimeout(autoNextTimeout)
  autoNextTimeout = null
}

// Computed
const volumeIcon = computed(() => {
  if (playerStore.volume === 0) return 'bi bi-volume-mute-fill'
  if (playerStore.volume < 0.5) return 'bi bi-volume-down-fill'
  return 'bi bi-volume-up-fill'
})

const scorePercent = computed(() => Math.max(0, Math.min(100, Number(animatedScore.value) || 0)))

const formatMultiplier = (value) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return '1'
  return num.toFixed(2).replace(/\.?0+$/, '')
}

const scoreLevelLabel = computed(() => {
  const level = String(lastUserLevel.value || '').trim()
  if (!level) return ''
  const badge = String(lastUserBadge.value || '').trim()
  return `${badge ? `${badge} ` : ''}${level}`.trim()
})

const scoreBaseLabel = computed(() => {
  const base = Number(lastScoreBase.value)
  const final = Number(lastScore.value)
  if (!Number.isFinite(base) || !Number.isFinite(final)) return ''
  if (Math.round(base) === Math.round(final)) return ''
  const clamped = Math.max(0, Math.min(100, Math.round(base)))
  return `Dasar ${clamped}/100`
})

const scoreRangeLabel = computed(() => {
  const min = Number(lastScoreMin.value)
  const max = Number(lastScoreMax.value)
  if (!Number.isFinite(min) || !Number.isFinite(max)) return ''

  const low = Math.max(0, Math.min(100, Math.round(Math.min(min, max))))
  const high = Math.max(0, Math.min(100, Math.round(Math.max(min, max))))

  if (low === high) return `Rentang ${low}/100`
  return `Rentang ${low}–${high}`
})

const scoreMultiplierLabel = computed(() => {
  const mult = Number(lastScoreMultiplier.value)
  if (!Number.isFinite(mult) || mult === 1) return ''

  const label = mult > 1 ? 'Bonus' : 'Penyesuaian'
  return `${label} x${formatMultiplier(mult)}`
})

const scoreMood = computed(() => {
  const score = Math.max(0, Math.min(100, Number(lastScore.value) || 0))

  if (score >= 95) {
    return {
      tone: 'legend',
      icon: 'bi bi-emoji-heart-eyes-fill',
      title: 'Luar Biasa!',
      subtitle: 'Nyaris sempurna — pertahankan!',
      aria: 'Ekspresi sangat senang'
    }
  }

  if (score >= 80) {
    return {
      tone: 'great',
      icon: 'bi bi-emoji-laughing-fill',
      title: 'Keren!',
      subtitle: 'Sudah sangat bagus!',
      aria: 'Ekspresi senang'
    }
  }

  if (score >= 60) {
    return {
      tone: 'good',
      icon: 'bi bi-emoji-smile-fill',
      title: 'Bagus!',
      subtitle: 'Dikit lagi makin mantap.',
      aria: 'Ekspresi tersenyum'
    }
  }

  if (score >= 40) {
    return {
      tone: 'okay',
      icon: 'bi bi-emoji-neutral-fill',
      title: 'Lumayan!',
      subtitle: 'Yuk coba lagi biar lebih tinggi.',
      aria: 'Ekspresi netral'
    }
  }

  return {
    tone: 'low',
    icon: 'bi bi-emoji-frown-fill',
    title: 'Coba Lagi!',
    subtitle: 'Santai, latihan dulu ya.',
    aria: 'Ekspresi sedih'
  }
})

const prefersReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

let scoreCountRaf = null
let fireworksRaf = null
let fireworksResizeCleanup = null
const fireworksParticles = []

const stopScoreEffects = () => {
  if (scoreCountRaf) {
    cancelAnimationFrame(scoreCountRaf)
    scoreCountRaf = null
  }

  if (fireworksRaf) {
    cancelAnimationFrame(fireworksRaf)
    fireworksRaf = null
  }

  if (typeof fireworksResizeCleanup === 'function') {
    fireworksResizeCleanup()
    fireworksResizeCleanup = null
  }

  fireworksParticles.length = 0

  const canvas = scoreFireworksCanvas.value
  const ctx = canvas?.getContext?.('2d')
  if (canvas && ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

const startScoreCountUp = () => {
  const target = Math.max(0, Math.min(100, Number(lastScore.value) || 0))

  if (prefersReducedMotion()) {
    animatedScore.value = target
    return
  }

  const durationMs = 900
  const startAt = performance.now()
  animatedScore.value = 0

  const tick = (now) => {
    const t = Math.min(1, (now - startAt) / durationMs)
    const eased = 1 - Math.pow(1 - t, 3)
    animatedScore.value = Math.round(target * eased)

    if (t < 1) {
      scoreCountRaf = requestAnimationFrame(tick)
    } else {
      scoreCountRaf = null
      animatedScore.value = target
    }
  }

  scoreCountRaf = requestAnimationFrame(tick)
}

const startScoreFireworks = () => {
  if (prefersReducedMotion()) return

  const canvas = scoreFireworksCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resize = () => {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    const rect = canvas.getBoundingClientRect()
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  resize()
  const onResize = () => resize()
  window.addEventListener('resize', onResize, { passive: true })
  fireworksResizeCleanup = () => window.removeEventListener('resize', onResize)

  const palette = isHighScore.value
    ? ['#22c55e', '#06b6d4', '#3b82f6', '#a7f3d0', '#67e8f9']
    : ['#22c55e', '#06b6d4', '#3b82f6', '#a7f3d0', '#67e8f9']

  const burstCount = isHighScore.value ? 8 : 5
  const stopAt = performance.now() + (isHighScore.value ? 3200 : 2400)
  let spawned = 0

  const spawnBurst = () => {
    if (spawned >= burstCount) return
    spawned += 1

    const w = canvas.clientWidth
    const h = canvas.clientHeight
    const cx = w * (0.18 + Math.random() * 0.64)
    const cy = h * (0.18 + Math.random() * 0.46)
    const count = isHighScore.value ? 46 : 34

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.25
      const speed = (isHighScore.value ? 2.8 : 2.2) + Math.random() * (isHighScore.value ? 3.0 : 2.4)
      fireworksParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        ttl: 52 + Math.random() * 18,
        size: 1.1 + Math.random() * 1.8,
        color: palette[Math.floor(Math.random() * palette.length)]
      })
    }
  }

  const loop = (now) => {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'

    if (now < stopAt && spawned < burstCount) {
      const chance = isHighScore.value ? 0.13 : 0.095
      if (Math.random() < chance) spawnBurst()
    }

    for (let i = fireworksParticles.length - 1; i >= 0; i--) {
      const p = fireworksParticles[i]
      p.life += 1

      p.vx *= 0.985
      p.vy = p.vy * 0.985 + 0.028
      p.x += p.vx
      p.y += p.vy

      const t = p.life / p.ttl
      const alpha = Math.max(0, 1 - t)

      ctx.fillStyle = p.color
      ctx.globalAlpha = alpha * 0.9
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()

      if (p.life >= p.ttl || alpha <= 0.01) {
        fireworksParticles.splice(i, 1)
      }
    }

    ctx.restore()

    if (now < stopAt || fireworksParticles.length > 0) {
      fireworksRaf = requestAnimationFrame(loop)
    } else {
      fireworksRaf = null
    }
  }

  fireworksRaf = requestAnimationFrame(loop)
}

watch(
  () => showScoreModal.value,
  async (open) => {
    stopScoreEffects()
    if (!open) return
    await nextTick()
    startScoreCountUp()
    startScoreFireworks()
  }
)

watch(
  () => lastScore.value,
  async () => {
    if (!showScoreModal.value) return
    stopScoreEffects()
    await nextTick()
    startScoreCountUp()
    startScoreFireworks()
  }
)

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

  playerStore.updateTime(time)
  updateLyrics(time)
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
  if (isEnding.value) return
  isEnding.value = true

  if (videoRef.value) {
    videoRef.value.pause()
  }

  const result = await playerStore.endCurrentSession()

  if (result) {
    lastScore.value = result.score
    isHighScore.value = result.isHighScore
    lastScoreBase.value = result.baseScore ?? null
    lastScoreMultiplier.value = result.scoreMultiplier ?? 1
    lastUserLevel.value = result.level || ''
    lastUserBadge.value = result.badge || ''
    lastScoreMin.value = result.scoreMin ?? null
    lastScoreMax.value = result.scoreMax ?? null
    showScoreModal.value = true
  }

  // Play next in queue
  if (playerStore.queue.length > 0) {
    clearAutoNextTimeout()
    autoNextTimeout = setTimeout(() => {
      playNextFromQueue().catch((error) => console.error('Error playing next song:', error))
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

const playNextFromQueue = async () => {
  if (playerStore.queue.length === 0) return
  const nextSong = playerStore.queue.shift()
  if (!nextSong) return

  showScoreModal.value = false
  await playSong(nextSong)
}

const skipNext = async () => {
  if (playerStore.queue.length > 0) {
    await playNextFromQueue()
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
  scheduleFetchSongs()
}

const clearSearch = () => {
  if (!searchQuery.value) return
  searchQuery.value = ''
  scheduleFetchSongs(0)
}

const resetOverlayFilters = () => {
  searchQuery.value = ''
  filterGenre.value = ''
  filterLanguage.value = ''
  scheduleFetchSongs(0)
}

const overlaySongsRef = ref(null)
const songsPage = ref(1)
const songsHasNextPage = ref(false)
const SONGS_PAGE_SIZE = 30
const SONGS_SCROLL_THRESHOLD_PX = 220
const songsQuerySeq = ref(0)
let searchDebounceTimeout = null

const scheduleFetchSongs = (delayMs = 250) => {
  if (searchDebounceTimeout) clearTimeout(searchDebounceTimeout)
  searchDebounceTimeout = setTimeout(() => {
    fetchSongs()
  }, delayMs)
}

const buildSongsParams = (page) => ({
  search: (searchQuery.value || '').trim(),
  genre: filterGenre.value,
  language: filterLanguage.value,
  page,
  limit: SONGS_PAGE_SIZE
})

const canLoadMoreSongs = () =>
  !loadingSongs.value && !loadingMoreSongs.value && songsHasNextPage.value

const fetchSongs = async () => {
  songsQuerySeq.value += 1
  const seq = songsQuerySeq.value

  loadingSongs.value = true
  loadingMoreSongs.value = false
  songs.value = []
  songsPage.value = 1
  songsHasNextPage.value = false

  try {
    const response = await songsAPI.getAll(buildSongsParams(1))
    if (seq !== songsQuerySeq.value) return

    const data = response.data.data || []
    const meta = response.data.meta || {}

    songs.value = data
    songsPage.value = meta.page || 1
    songsHasNextPage.value = Boolean(meta.hasNextPage)
  } catch (error) {
    console.error('Error fetching songs:', error)
  } finally {
    if (seq === songsQuerySeq.value) {
      await nextTick()
      overlaySongsRef.value?.scrollTo?.({ top: 0 })
      loadingSongs.value = false
      onOverlaySongsScroll()
    }
  }
}

const fetchMoreSongs = async () => {
  if (!canLoadMoreSongs()) return

  const seq = songsQuerySeq.value
  const nextPage = songsPage.value + 1
  loadingMoreSongs.value = true

  try {
    const response = await songsAPI.getAll(buildSongsParams(nextPage))
    if (seq !== songsQuerySeq.value) return

    const data = response.data.data || []
    const meta = response.data.meta || {}

    songs.value = [...songs.value, ...data]
    songsPage.value = meta.page || nextPage
    songsHasNextPage.value = Boolean(meta.hasNextPage)
  } catch (error) {
    console.error('Error fetching more songs:', error)
  } finally {
    if (seq === songsQuerySeq.value) {
      await nextTick()
      loadingMoreSongs.value = false
      onOverlaySongsScroll()
    }
  }
}

const onOverlaySongsScroll = () => {
  if (!overlaySongsRef.value) return
  if (!canLoadMoreSongs()) return

  const el = overlaySongsRef.value
  const remaining = el.scrollHeight - (el.scrollTop + el.clientHeight)
  if (remaining <= SONGS_SCROLL_THRESHOLD_PX) {
    fetchMoreSongs()
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
  clearAutoNextTimeout()
  isEnding.value = false
  showScoreModal.value = false

  await playerStore.playSong(song)

  // Wait for video to be ready
  setTimeout(() => {
    if (videoRef.value) {
      // Initialize audio context on first play
      if (!audioInitialized.value) {
        initAudioContext()
      }

      videoRef.value.play().catch(() => {})

      // Apply current pitch + transpose settings
      applyTempo()
    }
  }, 100)
}

const addToQueue = (song) => {
  playerStore.addToQueue(song)
  showToastMessage(`Ditambahkan ke antrian: ${song.title}`)
}

const closeScoreModal = () => {
  showScoreModal.value = false
}

const replaySong = async () => {
  if (playerStore.currentSong) {
    await playSong(playerStore.currentSong)
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
  if (searchDebounceTimeout) clearTimeout(searchDebounceTimeout)
  if (videoRef.value) {
    videoRef.value.pause()
  }
  clearAutoNextTimeout()
  if (toastTimeout) clearTimeout(toastTimeout)
  stopScoreEffects()
  // Cleanup audio context
  if (audioContext) {
    audioContext.close()
  }
})

watch(
  () => playerStore.showOverlay,
  async (open) => {
    if (!open) return
    await nextTick()
    onOverlaySongsScroll()
  }
)
</script>

<style scoped>
.karaoke-layout {
  /* Local theme override (green–blue gradient) */
  --kp-green: #22c55e;
  --kp-cyan: #06b6d4;
  --kp-blue: #3b82f6;

  --primary: var(--kp-cyan);
  --primary-light: #22d3ee;
  --primary-dark: #0891b2;
  --secondary: var(--kp-green);
  --accent: var(--kp-blue);

  --bg-dark: #061319;
  --bg-darker: #040c10;
  --bg-card: rgba(10, 22, 28, 0.72);
  --bg-card-hover: rgba(14, 30, 37, 0.82);
  --border-color: rgba(94, 234, 212, 0.14);
  --border-color-light: rgba(94, 234, 212, 0.28);

  --gradient-primary: linear-gradient(135deg, #22c55e 0%, #06b6d4 55%, #3b82f6 100%);
  --gradient-glow: linear-gradient(135deg,
      rgba(34, 197, 94, 0.32) 0%,
      rgba(6, 182, 212, 0.34) 55%,
      rgba(59, 130, 246, 0.26) 100%);
  --shadow-glow: 0 0 36px rgba(6, 182, 212, 0.35);
  --kp-shell-max: 1200px;
  --kp-shell-gutter: 1rem;

  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow-x: hidden;
  background: var(--bg-dark);
}

/* Background */
.karaoke-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.bg-mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(900px 600px at 8% 10%, rgba(34, 197, 94, 0.22) 0%, transparent 55%),
    radial-gradient(820px 560px at 92% 16%, rgba(6, 182, 212, 0.2) 0%, transparent 55%),
    radial-gradient(980px 680px at 70% 92%, rgba(59, 130, 246, 0.15) 0%, transparent 60%),
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
  width: 440px;
  height: 440px;
  border-radius: 50%;
  filter: blur(78px);
  opacity: 0.34;
  animation: orbFloat 16s ease-in-out infinite;
}

.orb-1 {
  background: rgba(34, 197, 94, 0.32);
  top: -190px;
  left: -200px;
}

.orb-2 {
  background: rgba(6, 182, 212, 0.34);
  bottom: -240px;
  right: -210px;
  animation-delay: -5s;
}

.orb-3 {
  width: 320px;
  height: 320px;
  background: rgba(59, 130, 246, 0.2);
  top: 34%;
  right: 22%;
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
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
}

.sidebar-header {
  padding: 1.25rem 1.25rem 1.1rem;
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
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  transition: transform var(--transition-normal), opacity var(--transition-normal);
}

.brand:hover {
  transform: translateY(-1px);
  opacity: 0.95;
}

.brand i {
  font-size: 1.5rem;
  color: var(--primary-light);
  filter: drop-shadow(0 0 16px rgba(34, 197, 94, 0.18));
}

.sidebar-nav {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.nav-divider {
  height: 1px;
  background: rgba(94, 234, 212, 0.14);
  margin: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 0.25rem;
  transition: transform var(--transition-fast), background var(--transition-fast), color var(--transition-fast),
    border-color var(--transition-fast);
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
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

.nav-item>* {
  position: relative;
  z-index: 1;
}

.nav-item:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(94, 234, 212, 0.18);
  transform: translateY(-1px);
}

.nav-item:hover::before {
  opacity: 0.18;
  transform: translateX(0);
}

.nav-item.active {
  color: white;
  background: linear-gradient(135deg,
      rgba(34, 197, 94, 0.18) 0%,
      rgba(6, 182, 212, 0.12) 55%,
      rgba(59, 130, 246, 0.16) 100%);
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

/* Main Karaoke Area */
.karaoke-main {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  max-height: 100vh;
  max-height: 100dvh;
  overflow: hidden;
  min-height: 0;
  min-width: 0;
  position: relative;
  z-index: 1;
  background: transparent;
}

/* Mobile topbar */
.mobile-topbar {
  display: none;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  margin: 1rem 1rem 0.25rem;
  border: 1px solid rgba(94, 234, 212, 0.16);
  border-radius: var(--radius-xl);
  background: rgba(4, 12, 16, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.brand--compact {
  font-size: 1.1rem;
  flex: 0 0 auto;
}

.mobile-now {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.now-title {
  font-weight: 750;
  font-size: 0.95rem;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.now-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
  position: relative;
}

.icon-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.28);
  background: rgba(255, 255, 255, 0.1);
}

.icon-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--gradient-primary);
  color: #001015;
  font-size: 0.7rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
}

/* Video Container - fills remaining space after controls */
/* Player Wrapper & Glow */
.player-wrapper {
  flex: 1;
  min-height: 0;
  min-width: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem auto;
  width: min(var(--kp-shell-max), calc(100% - (var(--kp-shell-gutter) * 2)));
  align-self: center;
}

.video-glow {
  position: absolute;
  inset: -28px;
  background-size: cover;
  background-position: center;
  filter: blur(56px);
  opacity: 0.28;
  z-index: 0;
  border-radius: 34px;
  transition: background-image 0.6s ease, opacity var(--transition-normal);
}

/* Video Container */
.video-container {
  width: 100%;
  aspect-ratio: 16/9;
  max-height: 100%;
  position: relative;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    0 22px 60px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(94, 234, 212, 0.09) inset,
    0 0 60px rgba(6, 182, 212, 0.12);
  border: 1px solid rgba(94, 234, 212, 0.14);
  z-index: 1;
}

.btn-primary:hover {
  box-shadow:
    0 18px 50px rgba(0, 0, 0, 0.55),
    0 0 46px rgba(6, 182, 212, 0.34) !important;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(900px 520px at 25% 20%, rgba(34, 197, 94, 0.18) 0%, transparent 60%),
    radial-gradient(820px 520px at 85% 30%, rgba(6, 182, 212, 0.16) 0%, transparent 60%),
    radial-gradient(900px 520px at 60% 85%, rgba(59, 130, 246, 0.12) 0%, transparent 65%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.92) 70%);
  position: relative;
  overflow: hidden;
}

.video-placeholder::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(800px 520px at 50% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 60%);
  opacity: 0.55;
  pointer-events: none;
  z-index: 1;
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
  z-index: 2;
  width: min(520px, calc(100% - 2rem));
  padding: clamp(1.6rem, 3.8vw, 2.25rem);
  border-radius: 26px;
  border: none;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
  overflow: visible;
  isolation: auto;
}

.placeholder-content::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(120% 90% at 12% 10%, rgba(34, 197, 94, 0.18) 0%, transparent 55%),
    radial-gradient(90% 80% at 92% 22%, rgba(6, 182, 212, 0.2) 0%, transparent 55%),
    radial-gradient(85% 80% at 40% 120%, rgba(59, 130, 246, 0.14) 0%, transparent 60%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 55%, transparent 100%);
  opacity: 0;
  pointer-events: none;
  z-index: 0;
}

.placeholder-content::after {
  content: '';
  position: absolute;
  inset: -45%;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.18) 0%, transparent 56%),
    radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.14) 0%, transparent 58%);
  transform: translate3d(-12%, -10%, 0) rotate(18deg);
  opacity: 0;
  mix-blend-mode: screen;
  filter: blur(0.2px);
  pointer-events: none;
  z-index: 0;
  animation: none;
}

.placeholder-content>* {
  position: relative;
  z-index: 1;
}

@keyframes kpLiquidSheen {

  0%,
  100% {
    transform: translate3d(-12%, -10%, 0) rotate(18deg);
    opacity: 0.56;
  }

  50% {
    transform: translate3d(10%, 12%, 0) rotate(8deg);
    opacity: 0.78;
  }
}

.placeholder-content>i {
  font-size: clamp(3.2rem, 9vw, 5rem);
  background: var(--gradient-primary);
  background-clip: text;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: var(--primary);
  margin-bottom: 1rem;
  display: block;
  filter: drop-shadow(0 16px 40px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 24px rgba(6, 182, 212, 0.25));
}

.placeholder-content h2 {
  margin-bottom: 0.5rem;
  background: var(--gradient-primary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}

.placeholder-content p {
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.78);
  max-width: 42ch;
  margin-left: auto;
  margin-right: auto;
}

.placeholder-content .btn-primary {
  background: linear-gradient(135deg,
      rgba(34, 197, 94, 0.82) 0%,
      rgba(6, 182, 212, 0.74) 55%,
      rgba(59, 130, 246, 0.74) 100%);
  border: 1px solid rgba(94, 234, 212, 0.18);
  backdrop-filter: blur(10px) saturate(160%);
  -webkit-backdrop-filter: blur(10px) saturate(160%);
  box-shadow:
    0 18px 50px rgba(0, 0, 0, 0.6),
    0 0 40px rgba(6, 182, 212, 0.22);
}

.placeholder-content .btn.btn-primary.btn-lg {
  padding: 0.55rem 0.95rem;
  font-size: 0.88rem;
  border-radius: 18px;
}

.placeholder-content .btn.btn-primary.btn-lg i {
  font-size: 0.9em;
  line-height: 1;
}

.placeholder-content .btn-primary:hover {
  box-shadow:
    0 22px 70px rgba(0, 0, 0, 0.7),
    0 0 54px rgba(6, 182, 212, 0.34);
  color: white;
}

.placeholder-content .btn-primary:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 5px rgba(6, 182, 212, 0.22),
    0 22px 70px rgba(0, 0, 0, 0.7);
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Lyrics Overlay */
.lyrics-overlay {
  position: absolute;
  bottom: clamp(84px, 14%, 140px);
  left: 0;
  right: 0;
  text-align: center;
  padding: 1rem;
}

.lyric-line {
  display: inline-block;
  background: rgba(4, 12, 16, 0.55);
  border: 1px solid rgba(94, 234, 212, 0.16);
  padding: 0.75rem 1.6rem;
  border-radius: var(--radius-lg);
  font-size: clamp(1.05rem, 2.4vw, 1.5rem);
  font-weight: 750;
  color: white;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.lyric-line.active {
  box-shadow: 0 18px 70px rgba(0, 0, 0, 0.55);
}

.lyric-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

/* Song Info Overlay */
.song-info-overlay {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: transparent;
  /* border: 1px solid rgba(94, 234, 212, 0.16); */
  padding: 0.75rem 0.9rem;
  /* border-radius: var(--radius-md); */
  /* box-shadow: 0 16px 60px rgba(0, 0, 0, 0.55); */
  max-width: min(520px, calc(100% - 2rem));
}

.song-info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.song-info-text {
  min-width: 0;
}

.song-info-overlay h3 {
  font-size: 1rem;
  margin: 0;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-info-overlay p {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-info-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 0 0 auto;
}

.song-info-badges--corner {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  z-index: 5;
  pointer-events: none;
}

.song-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.song-pill.on {
  background: rgba(34, 197, 94, 0.16);
  border-color: rgba(34, 197, 94, 0.3);
  color: #b7ffcf;
}

.song-pill--soft {
  background: rgba(6, 182, 212, 0.12);
  border-color: rgba(94, 234, 212, 0.26);
  color: #bff6ff;
}

/* Controls Bar - fixed at bottom, never shrinks */
/* Controls Bar */
.controls-bar {
  position: relative;
  background: rgba(4, 12, 16, 0.62);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(94, 234, 212, 0.16);
  padding: 1.25rem 1.5rem;
  flex-shrink: 0;
  margin: 0 auto 1rem;
  width: min(var(--kp-shell-max), calc(100% - (var(--kp-shell-gutter) * 2)));
  border-radius: 20px;
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.55);
}

.controls-bar::before {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  top: 0;
  height: 1px;
  border-radius: 999px;
  background: var(--gradient-glow);
  opacity: 0.75;
  pointer-events: none;
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
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(94, 234, 212, 0.12);
  border-radius: var(--radius-full);
  cursor: pointer;
  position: relative;
}

.progress-bar:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(94, 234, 212, 0.18);
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
  background: var(--gradient-primary);
  border: 2px solid rgba(4, 12, 16, 0.9);
  border-radius: 50%;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.6),
    0 0 26px rgba(6, 182, 212, 0.25);
  transition: transform var(--transition-fast);
}

.progress-bar:hover .progress-thumb {
  transform: translate(-50%, -50%) scale(1.06);
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
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(94, 234, 212, 0.14);
  border-radius: 50%;
  color: var(--text-primary);
  font-size: 1.25rem;
  cursor: pointer;
  transition: transform var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  position: relative;
}

.btn-control:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(94, 234, 212, 0.22);
  box-shadow:
    0 14px 38px rgba(0, 0, 0, 0.42),
    0 0 0 1px rgba(94, 234, 212, 0.06) inset;
}

.btn-control:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-control:focus-visible {
  outline: none;
  border-color: rgba(94, 234, 212, 0.35);
  box-shadow:
    0 0 0 4px rgba(6, 182, 212, 0.18),
    0 14px 38px rgba(0, 0, 0, 0.42);
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
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), filter var(--transition-fast),
    opacity var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 18px 50px rgba(0, 0, 0, 0.55),
    0 0 36px rgba(6, 182, 212, 0.22);
}

.btn-play:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.6),
    0 0 54px rgba(6, 182, 212, 0.34);
}

.btn-play:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-play:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 5px rgba(6, 182, 212, 0.22),
    0 20px 60px rgba(0, 0, 0, 0.6);
}

.btn-channel {
  width: auto;
  padding: 0.5rem 1rem;
  gap: 0.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  border: 1px solid rgba(94, 234, 212, 0.18);
}

.btn-channel.on {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(6, 182, 212, 0.85) 55%, rgba(59, 130, 246, 0.85) 100%);
  color: white;
  border-color: rgba(34, 197, 94, 0.35);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.45),
    0 0 30px rgba(34, 197, 94, 0.22);
}

.btn-channel.off {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(245, 158, 11, 0.35);
  color: #ffd58a;
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
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(94, 234, 212, 0.14);
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
  background: rgba(255, 255, 255, 0.06);
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
  background: rgba(255, 255, 255, 0.12);
  color: var(--primary-light);
}

.btn-sm-control:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-sm-control.btn-reset {
  background: rgba(245, 158, 11, 0.16);
  color: var(--warning);
}

.control-value {
  min-width: 35px;
  text-align: center;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.26);
  border: 1px solid rgba(94, 234, 212, 0.12);
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: var(--gradient-primary);
  border: 2px solid rgba(4, 12, 16, 0.9);
  border-radius: 50%;
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.55),
    0 0 20px rgba(6, 182, 212, 0.24);
}

/* Song Overlay */
.song-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.68);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.overlay-content {
  background: rgba(4, 12, 16, 0.78);
  border-radius: 28px;
  width: 90%;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(94, 234, 212, 0.16);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  box-shadow:
    0 28px 90px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(94, 234, 212, 0.06) inset;
  position: relative;
  isolation: isolate;
  animation: kpModalIn 0.22s ease-out;
}

.overlay-content::before {
  content: '';
  position: absolute;
  left: 16px;
  right: 16px;
  top: 0;
  height: 1px;
  border-radius: 999px;
  background: var(--gradient-glow);
  opacity: 0.75;
  pointer-events: none;
  z-index: 1;
}

.overlay-content::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(900px 560px at 12% 10%, rgba(34, 197, 94, 0.18) 0%, transparent 60%),
    radial-gradient(820px 520px at 90% 14%, rgba(6, 182, 212, 0.16) 0%, transparent 60%),
    radial-gradient(900px 620px at 66% 92%, rgba(59, 130, 246, 0.12) 0%, transparent 65%),
    radial-gradient(700px 420px at 40% 0%, rgba(255, 255, 255, 0.06) 0%, transparent 55%);
  opacity: 0.75;
  pointer-events: none;
  z-index: 0;
}

.overlay-content>* {
  position: relative;
  z-index: 2;
}

@keyframes kpModalIn {
  from {
    opacity: 0;
    transform: translate3d(0, 10px, 0) scale(0.99);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

.overlay-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.35rem 1.35rem 1.05rem;
  border-bottom: 1px solid rgba(94, 234, 212, 0.14);
}

.overlay-title {
  min-width: 0;
}

.overlay-title h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 850;
  letter-spacing: -0.02em;
}

.overlay-subtitle {
  margin-top: 0.45rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.85rem;
}

.overlay-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: #bff6ff;
  font-weight: 750;
}

.overlay-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.74);
  max-width: 100%;
}

.overlay-chip i {
  color: rgba(94, 234, 212, 0.9);
}

.overlay-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 0 0 auto;
}

.overlay-reset {
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  padding: 0.45rem 0.75rem;
}

.overlay-reset:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(94, 234, 212, 0.24);
}

.overlay-reset i {
  color: rgba(94, 234, 212, 0.95);
}

.overlay-reset-text {
  margin-left: 0.35rem;
  font-weight: 750;
  letter-spacing: 0.02em;
}

.btn-close-overlay {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(94, 234, 212, 0.16);
  border-radius: 50%;
  color: var(--text-primary);
  cursor: pointer;
  transition: transform var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
}

.btn-close-overlay:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(94, 234, 212, 0.24);
}

.overlay-toolbar {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 0.9rem;
  padding: 0 1.35rem 1.15rem;
}

.overlay-search {
  position: relative;
}

.overlay-search i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.55);
  font-size: 1rem;
  pointer-events: none;
}

.overlay-search .form-control {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(94, 234, 212, 0.14);
  border-radius: 18px;
  padding-left: 2.65rem;
  padding-right: 2.65rem;
}

.overlay-search:focus-within .form-control {
  border-color: rgba(94, 234, 212, 0.28);
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.16);
}

.search-clear {
  position: absolute;
  right: 0.55rem;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border-radius: 14px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
}

.search-clear:hover {
  transform: translateY(-50%) scale(1.02);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(94, 234, 212, 0.22);
}

.overlay-filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}

.overlay-filters .form-select {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(94, 234, 212, 0.14);
  border-radius: 18px;
  padding: 0.75rem 0.95rem;
}

.overlay-filters .form-select:focus {
  border-color: rgba(94, 234, 212, 0.28);
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.16);
}

.overlay-songs {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.35rem 1.35rem;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.overlay-song-item {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 0.95rem 1rem;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(94, 234, 212, 0.12);
  border-radius: 18px;
  margin-bottom: 0.5rem;
  transition: transform var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.overlay-song-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-glow);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.overlay-song-item>* {
  position: relative;
  z-index: 1;
}

.overlay-song-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(94, 234, 212, 0.22);
  transform: translateY(-1px);
}

.overlay-song-item:hover::before {
  opacity: 0.16;
}

.overlay-song-item:focus-within {
  border-color: rgba(94, 234, 212, 0.3);
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.16);
}

.song-thumbnail {
  width: 56px;
  height: 56px;
  background: var(--gradient-primary);
  border-radius: 18px;
  border: 1px solid rgba(94, 234, 212, 0.16);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.45),
    0 0 30px rgba(6, 182, 212, 0.12);
}

.song-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-details h4 {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  margin: 0 0 0.15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-details p {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.song-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.4rem;
}

.song-meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.72rem;
}

.song-meta i {
  margin-right: 0;
  color: rgba(94, 234, 212, 0.9);
}

.song-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.song-actions .btn {
  border-radius: 16px;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast),
    border-color var(--transition-fast);
}

.song-actions .btn-primary {
  border: 1px solid rgba(94, 234, 212, 0.18);
  box-shadow:
    0 16px 44px rgba(0, 0, 0, 0.55),
    0 0 34px rgba(6, 182, 212, 0.18);
}

.song-actions .btn-primary:hover {
  box-shadow:
    0 18px 60px rgba(0, 0, 0, 0.65),
    0 0 50px rgba(6, 182, 212, 0.3);
  transform: translateY(-1px);
}

.song-actions .btn-ghost {
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(255, 255, 255, 0.05);
}

.song-actions .btn-ghost:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(94, 234, 212, 0.22);
  transform: translateY(-1px);
}

.btn-play-song {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.95rem;
}

.btn-play-song i {
  font-size: 1.05rem;
}

.btn-label {
  font-weight: 750;
}

.btn-queue-song {
  width: 42px;
  height: 42px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-queue-song i {
  font-size: 1.05rem;
}

.empty-songs {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.7);
}

.empty-songs i {
  font-size: 3.25rem;
  margin-bottom: 1rem;
  display: block;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.loading-songs {
  text-align: center;
  padding: 2rem;
}

.loading-songs .spinner-border {
  color: var(--primary-light);
}

.loading-songs--more {
  padding: 1.25rem 0 1.75rem;
}

/* Toast */
.kp-toast-notification {
  position: fixed;
  left: 50%;
  bottom: 1.6rem;
  transform: translateX(-50%);
  z-index: 4000;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border-radius: 18px;
  background: rgba(34, 197, 94, 0.95);
  color: white;
  box-shadow: 0 18px 70px rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(187, 247, 208, 0.35);
}

.kp-toast-enter-active,
.kp-toast-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.kp-toast-enter-from,
.kp-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

/* Score Modal */
.kp-score-modal-enter-active,
.kp-score-modal-leave-active {
  transition: opacity 220ms ease;
}

.kp-score-modal-enter-from,
.kp-score-modal-leave-to {
  opacity: 0;
}

.kp-score-modal-enter-active .score-content,
.kp-score-modal-leave-active .score-content {
  transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1), opacity 260ms ease;
}

.kp-score-modal-enter-from .score-content {
  transform: translate3d(0, 14px, 0) scale(0.98);
  opacity: 0;
}

.kp-score-modal-leave-to .score-content {
  transform: translate3d(0, 10px, 0) scale(0.985);
  opacity: 0;
}

.score-modal {
  position: fixed;
  inset: 0;
  padding: calc(1rem + env(safe-area-inset-top)) 1rem calc(1rem + env(safe-area-inset-bottom));
  background:
    radial-gradient(980px 680px at 14% 20%, rgba(34, 197, 94, 0.16) 0%, transparent 62%),
    radial-gradient(920px 640px at 88% 18%, rgba(6, 182, 212, 0.18) 0%, transparent 60%),
    radial-gradient(920px 640px at 65% 92%, rgba(59, 130, 246, 0.12) 0%, transparent 65%),
    rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 4100;
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
}

.score-fireworks {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.9;
  filter: blur(0.25px);
  mix-blend-mode: screen;
  z-index: 0;
}

.score-content {
  border-radius: var(--radius-xl);
  border: 1px solid transparent;
  background:
    linear-gradient(180deg, rgba(10, 22, 28, 0.92) 0%, rgba(4, 12, 16, 0.84) 55%, rgba(4, 12, 16, 0.8) 100%) padding-box,
    var(--gradient-glow) border-box;
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  padding: 2rem;
  text-align: center;
  min-width: 300px;
  max-width: min(520px, calc(100% - 2rem));
  position: relative;
  overflow: hidden;
  box-shadow:
    0 30px 110px rgba(0, 0, 0, 0.74),
    0 0 0 1px rgba(94, 234, 212, 0.08) inset;
  max-height: calc(100vh - 2rem);
  isolation: isolate;
  transform: translateZ(0);
}

.score-content::before {
  content: '';
  position: absolute;
  left: 16px;
  right: 16px;
  top: 0;
  height: 1px;
  border-radius: 999px;
  background: var(--gradient-primary);
  opacity: 0.82;
  pointer-events: none;
  z-index: 1;
}

.score-content::after {
  content: '';
  position: absolute;
  inset: -45%;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.16) 0%, transparent 56%),
    radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.14) 0%, transparent 58%),
    radial-gradient(circle at 18% 78%, rgba(34, 197, 94, 0.14) 0%, transparent 62%);
  transform: translate3d(-12%, -10%, 0) rotate(18deg);
  opacity: 0.7;
  mix-blend-mode: screen;
  pointer-events: none;
  z-index: 0;
  animation: kpLiquidSheen 3.8s ease-in-out infinite;
}

.score-content>* {
  position: relative;
  z-index: 2;
}

.score-content.is-high-score {
  background:
    linear-gradient(180deg, rgba(10, 22, 28, 0.94) 0%, rgba(4, 12, 16, 0.86) 55%, rgba(4, 12, 16, 0.82) 100%) padding-box,
    var(--gradient-primary) border-box;
  box-shadow:
    0 34px 128px rgba(0, 0, 0, 0.78),
    0 0 0 1px rgba(94, 234, 212, 0.14) inset,
    0 0 0 12px rgba(6, 182, 212, 0.08);
}

.score-header-top {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  margin-bottom: 1.1rem;
}

.score-header-top i {
  font-size: 1.35rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 12px 36px rgba(0, 0, 0, 0.7));
  animation: kpScoreTwinkle 1.9s ease-in-out infinite;
}

.score-header h2 {
  font-size: 1.75rem;
  margin: 0;
  font-weight: 900;
  letter-spacing: -0.02em;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 12px 48px rgba(0, 0, 0, 0.7);
}

.score-mood {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin: 0.25rem 0 1.35rem;
}

.score-mood-ring {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  position: relative;
  isolation: isolate;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0.12) 28%, transparent 60%),
    var(--gradient-primary);
  border: 1px solid rgba(94, 234, 212, 0.26);
  box-shadow:
    0 0 0 10px rgba(6, 182, 212, 0.12),
    0 26px 90px rgba(0, 0, 0, 0.6);
  animation: kpScoreIconPop 0.52s ease-out both;
}

.score-mood-ring::before {
  content: '';
  position: absolute;
  inset: -14px;
  border-radius: inherit;
  background: conic-gradient(from 180deg,
      rgba(34, 197, 94, 0.58),
      rgba(6, 182, 212, 0.52),
      rgba(59, 130, 246, 0.52),
      rgba(34, 197, 94, 0.58));
  filter: blur(14px);
  opacity: 0.62;
  z-index: 0;
  animation: kpScoreRingSpin 7s linear infinite;
}

.score-mood-ring::after {
  content: '';
  position: absolute;
  inset: 10px;
  border-radius: inherit;
  background: rgba(4, 12, 16, 0.18);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12) inset;
  opacity: 0.9;
  z-index: 1;
}

.score-mood-ring i {
  position: relative;
  z-index: 2;
  font-size: 3.1rem;
  color: rgba(255, 255, 255, 0.96);
  filter: drop-shadow(0 18px 32px rgba(0, 0, 0, 0.7));
}

.score-mood-title {
  font-weight: 900;
  font-size: 1.15rem;
  letter-spacing: -0.01em;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.score-mood-subtitle {
  margin-top: 0.15rem;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.92rem;
}

.score-mood--low .score-mood-ring {
  filter: saturate(0.88) brightness(0.92);
  box-shadow:
    0 0 0 10px rgba(6, 182, 212, 0.09),
    0 22px 80px rgba(0, 0, 0, 0.58);
}

.score-mood--legend .score-mood-ring {
  filter: saturate(1.12) brightness(1.06);
  border-color: rgba(94, 234, 212, 0.34);
  box-shadow:
    0 0 0 12px rgba(34, 197, 94, 0.14),
    0 0 0 10px rgba(6, 182, 212, 0.1),
    0 26px 120px rgba(0, 0, 0, 0.65);
}

.score-value-line {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.5rem;
}

.score-value {
  font-size: clamp(3.4rem, 11vw, 5rem);
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  text-shadow: 0 22px 80px rgba(0, 0, 0, 0.75);
  animation: kpScoreValuePop 0.7s ease-out both;
}

.score-max {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.58);
  margin-bottom: 0.35rem;
  font-weight: 750;
  letter-spacing: 0.02em;
}

.score-label {
  color: var(--text-muted);
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.score-meta {
  margin-top: 0.65rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.55rem;
}

.score-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.38rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.88rem;
  line-height: 1.2;
}

.score-chip i {
  color: rgba(94, 234, 212, 0.92);
}

.score-chip--soft {
  background: rgba(6, 182, 212, 0.08);
}

.score-meter {
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(94, 234, 212, 0.14);
  overflow: hidden;
  margin-top: 1.05rem;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.55);
}

.score-meter-bar {
  height: 100%;
  width: 0%;
  border-radius: 999px;
  background: var(--gradient-primary);
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 0 10px rgba(6, 182, 212, 0.12);
  will-change: width;
}

.score-meter-bar::after {
  content: '';
  position: absolute;
  inset: -40% -20%;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.42) 50%, transparent 100%);
  transform: translateX(-120%) rotate(10deg);
  opacity: 0.65;
  animation: kpScoreBarSheen 1.8s ease-in-out infinite;
}

.high-score-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.22) 0%, rgba(6, 182, 212, 0.24) 55%, rgba(59, 130, 246, 0.22) 100%);
  color: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(94, 234, 212, 0.26);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  margin-top: 1rem;
  font-weight: 850;
  letter-spacing: 0.02em;
  box-shadow: 0 18px 70px rgba(0, 0, 0, 0.55);
  animation: kpScoreBadgePop 0.55s ease-out both, kpScoreBadgePulse 1.6s ease-in-out infinite;
}

.high-score-badge i {
  color: rgba(94, 234, 212, 0.95);
}

.score-footer {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
}

@keyframes kpScoreTwinkle {

  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.85;
    filter: drop-shadow(0 12px 36px rgba(0, 0, 0, 0.7));
  }

  50% {
    transform: translate3d(0, -1px, 0) scale(1.02);
    opacity: 1;
    filter: drop-shadow(0 14px 46px rgba(0, 0, 0, 0.75));
  }
}

@keyframes kpScoreRingSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes kpScoreBarSheen {
  to {
    transform: translateX(120%) rotate(10deg);
  }
}

@keyframes kpScoreIconPop {
  0% {
    transform: translate3d(0, 8px, 0) scale(0.92);
    filter: saturate(0.9);
  }

  55% {
    transform: translate3d(0, -2px, 0) scale(1.05);
    filter: saturate(1.12);
  }

  100% {
    transform: translate3d(0, 0, 0) scale(1);
    filter: saturate(1);
  }
}

@keyframes kpScoreValuePop {
  from {
    transform: translate3d(0, 6px, 0) scale(0.98);
    opacity: 0.2;
  }

  to {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 1;
  }
}

@keyframes kpScoreBadgePop {
  from {
    opacity: 0;
    transform: translate3d(0, 10px, 0) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes kpScoreBadgePulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.03);
  }
}

@media (max-width: 520px) {
  .score-content {
    padding: 1.35rem 1.15rem;
    border-radius: 22px;
    min-width: 0;
  }

  .score-header-top {
    margin-bottom: 0.9rem;
  }

  .score-header h2 {
    font-size: 1.4rem;
  }

  .score-mood {
    margin-bottom: 1.1rem;
  }

  .score-mood-ring {
    width: 92px;
    height: 92px;
  }

  .score-mood-ring i {
    font-size: 2.6rem;
  }

  .score-mood-title {
    font-size: 1.05rem;
  }

  .score-mood-subtitle {
    font-size: 0.86rem;
  }

  .score-footer {
    flex-direction: column;
    gap: 0.7rem;
  }

  .score-footer .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-height: 420px) {
  .score-content {
    padding: 1.05rem 1.1rem;
  }

  .score-header-top {
    margin-bottom: 0.75rem;
  }

  .score-mood {
    flex-direction: row;
    justify-content: center;
    gap: 0.9rem;
    margin-bottom: 0.85rem;
  }

  .score-mood-copy {
    text-align: left;
  }

  .score-mood-ring {
    width: 74px;
    height: 74px;
  }

  .score-mood-ring i {
    font-size: 2.2rem;
  }

  .score-mood-subtitle {
    display: none;
  }

  .score-value {
    font-size: clamp(2.9rem, 9vw, 4rem);
  }

  .score-footer {
    margin-top: 1.25rem;
  }
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

@media (max-width: 900px) {
  .overlay-toolbar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-sidebar {
    display: none;
  }

  .mobile-topbar {
    display: flex;
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
    padding-bottom: calc(80px + 180px + env(safe-area-inset-bottom)) !important;
  }

  /* Compact song info overlay on mobile */
  .song-info-overlay {
    top: 0.65rem;
    left: 0.65rem;
    padding: 0.45rem 0.55rem;
    border-radius: 16px;
    max-width: min(320px, calc(100% - 1.3rem));
    background: transparent;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
    pointer-events: none;
  }

  .song-info-overlay h3 {
    font-size: 0.85rem;
  }

  .song-info-overlay p {
    font-size: 0.72rem;
  }

  .song-info-row {
    gap: 0.5rem;
  }

  .song-info-badges {
    gap: 0.35rem;
  }

  .song-info-badges--corner {
    right: 0.65rem;
    bottom: 0.65rem;
  }

  .song-pill {
    padding: 0.22rem 0.42rem;
    font-size: 0.62rem;
    letter-spacing: 0.06em;
  }

  /* Modern Mobile Controls Bar */
  .controls-bar {
    position: fixed;
    bottom: calc(80px + env(safe-area-inset-bottom));
    left: 1rem;
    right: 1rem;
    padding: 1rem;
    background: rgba(4, 12, 16, 0.72);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(94, 234, 212, 0.16);
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    z-index: 150;
    /* Below overlays (z-index 4k), below MobileNav (3k) */
    margin: 0;
  }

  .controls-bar::before {
    left: 18px;
    right: 18px;
  }

  /* Fullscreen song overlay on mobile */
  .overlay-content {
    width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
    border: none;
    box-shadow: none;
    animation: none;
  }

  .overlay-header {
    padding: calc(1rem + env(safe-area-inset-top)) 1rem 0.85rem;
  }

  .overlay-title h2 {
    font-size: 1.15rem;
  }

  .overlay-subtitle {
    font-size: 0.78rem;
  }

  .overlay-chip {
    display: none;
  }

  .overlay-reset {
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: 16px;
  }

  .overlay-reset-text {
    display: none;
  }

  .overlay-toolbar {
    grid-template-columns: 1fr;
    padding: 0 1rem 1rem;
    gap: 0.75rem;
  }

  .overlay-filters {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .overlay-search .form-control,
  .overlay-filters .form-select {
    border-radius: 18px;
    padding: 0.72rem 0.9rem;
  }

  .overlay-search .form-control {
    padding-left: 2.55rem;
    padding-right: 2.6rem;
  }

  .overlay-songs {
    padding: 1rem;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom));
  }

  .overlay-song-item {
    grid-template-columns: 48px 1fr auto;
    padding: 0.75rem 0.85rem;
    gap: 0.75rem;
  }

  .song-thumbnail {
    width: 48px;
    height: 48px;
    border-radius: 16px;
  }

  .song-details h4 {
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
  }

  .song-meta {
    margin-top: 0.45rem;
    gap: 0.45rem;
  }

  .btn-play-song {
    width: 42px;
    height: 42px;
    padding: 0;
    justify-content: center;
  }

  .btn-play-song .btn-label {
    display: none;
  }

  .btn-play-song i {
    font-size: 1.12rem;
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
    box-shadow:
      0 18px 50px rgba(0, 0, 0, 0.55),
      0 0 40px rgba(6, 182, 212, 0.26);
  }

  .btn-control {
    width: 42px;
    height: 42px;
    background: rgba(255, 255, 255, 0.05);
  }

  .btn-control.active {
    background: var(--primary);
    color: white;
    box-shadow: 0 0 18px rgba(6, 182, 212, 0.42);
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
    background: rgba(4, 12, 16, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    padding: 1rem;
    width: 200px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    animation: kpSlideUp 0.2s ease-out;
  }

  @keyframes kpSlideUp {
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
    flex-direction: column;
    gap: 0.75rem;
  }

  .popup-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
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
    align-self: center;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    background: rgba(245, 158, 11, 0.14);
    border: 1px solid rgba(245, 158, 11, 0.3);
    color: #ffd58a;
  }

  .btn-popup-reset:active {
    background: rgba(245, 158, 11, 0.22);
  }
}

/* Touch devices in landscape / short height: force compact mobile layout to avoid clipped UI */
@media (hover: none) and (pointer: coarse) and (max-height: 520px) {
  .dashboard-sidebar {
    display: none;
  }

  .mobile-topbar {
    display: flex;
    margin: calc(0.5rem + env(safe-area-inset-top)) 0.5rem 0.25rem;
    padding: 0.65rem 0.75rem;
  }

  .now-sub {
    display: none;
  }

  .karaoke-main {
    margin-left: 0;
    padding-bottom: calc(80px + 140px + env(safe-area-inset-bottom)) !important;
  }

  :deep(.mobile-nav) {
    display: block;
  }

  .player-wrapper {
    margin: 0.5rem auto;
  }

  .controls-bar {
    position: fixed;
    bottom: calc(80px + env(safe-area-inset-bottom));
    left: 0.5rem;
    right: 0.5rem;
    width: auto;
    padding: 0.75rem 0.9rem;
    border-radius: 20px;
    z-index: 150;
  }

  .progress-container {
    margin-bottom: 0.5rem;
  }

  .time-display {
    display: none;
  }

  .controls-center {
    gap: 0.85rem;
  }

  .btn-play {
    width: 50px;
    height: 50px;
    font-size: 1.55rem;
  }

  .btn-control {
    width: 40px;
    height: 40px;
  }
}

/* Small Mobile Adjustments */
@media (max-width: 380px) {
  .song-info-overlay p {
    display: none;
  }

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

  .overlay-header {
    padding: calc(0.85rem + env(safe-area-inset-top)) 0.9rem 0.75rem;
  }

  .overlay-subtitle {
    display: none;
  }

  .overlay-toolbar {
    padding: 0 0.9rem 0.9rem;
    gap: 0.65rem;
  }

  .overlay-filters {
    grid-template-columns: 1fr;
    gap: 0.65rem;
  }

  .overlay-songs {
    padding: 0.85rem;
    padding-bottom: calc(0.85rem + env(safe-area-inset-bottom));
  }

  .overlay-song-item {
    grid-template-columns: 44px 1fr auto;
    padding: 0.7rem;
    margin-bottom: 0.75rem;
    gap: 0.65rem;
  }

  .song-thumbnail {
    width: 44px;
    height: 44px;
    border-radius: 14px;
  }

  .song-details h4 {
    font-size: 1rem;
    white-space: normal;
    /* Allow wrapping */
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
    margin-bottom: 0.25rem;
  }

  .song-details p {
    font-size: 0.85rem;
    opacity: 0.8;
  }

  .song-meta {
    gap: 0.4rem;
    margin-top: 0.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {

  .kp-score-modal-enter-active,
  .kp-score-modal-leave-active,
  .kp-score-modal-enter-active .score-content,
  .kp-score-modal-leave-active .score-content {
    transition: none !important;
  }

  .bg-orb {
    animation: none !important;
  }

  .brand,
  .nav-item,
  .icon-btn,
  .video-glow,
  .btn-control,
  .btn-play,
  .overlay-content,
  .overlay-song-item,
  .overlay-reset,
  .search-clear {
    transition: none !important;
  }

  .song-overlay,
  .overlay-content,
  .score-modal,
  .score-content,
  .score-mood-ring,
  .score-mood-ring::before,
  .score-value,
  .high-score-badge,
  .mobile-control-popup {
    animation: none !important;
  }

  .score-content::after {
    animation: none !important;
  }

  .score-meter-bar::after,
  .score-header-top i {
    animation: none !important;
  }

  .placeholder-content::after {
    animation: none !important;
  }
}
</style>
