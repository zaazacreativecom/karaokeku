const CACHE_VERSION = 'v1'
const APP_CACHE = `karaokeku-app-${CACHE_VERSION}`
const RUNTIME_CACHE = `karaokeku-runtime-${CACHE_VERSION}`

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/logo.svg',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![APP_CACHE, RUNTIME_CACHE].includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

function isCacheableRequest(request) {
  if (request.method !== 'GET') return false

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return false

  if (url.pathname.startsWith('/api/')) return false
  if (url.pathname.startsWith('/videos/')) return false
  if (url.pathname.startsWith('/uploads/')) return false
  if (url.pathname.startsWith('/socket.io/')) return false

  return true
}

self.addEventListener('fetch', (event) => {
  if (!isCacheableRequest(event.request)) return

  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request)
          const cache = await caches.open(RUNTIME_CACHE)
          cache.put(event.request, response.clone())
          return response
        } catch (_error) {
          const cache = await caches.open(RUNTIME_CACHE)
          const cached = await cache.match(event.request)
          return cached || cache.match('/') || Response.error()
        }
      })()
    )
    return
  }

  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(event.request)
      if (cachedResponse) return cachedResponse

      try {
        const response = await fetch(event.request)
        const cache = await caches.open(RUNTIME_CACHE)
        cache.put(event.request, response.clone())
        return response
      } catch (_error) {
        return Response.error()
      }
    })()
  )
})
