import { build, files, version } from '$service-worker'

const ASSETS_CACHE_KEY = `assets_${version}`
const OFFLINE_CACHE_KEY = `offline_${version}`

function isRuntimeData(file) {
  const pathname = new URL(file, 'https://example.invalid').pathname

  return pathname.includes('/data/') || pathname.endsWith('/index.m3u')
}

// `files` contains the configured SvelteKit base path on project pages
// (for example /iptv/data/...). Match by pathname segment instead of startsWith('/data/').
const filteredFiles = files.filter(file => !isRuntimeData(file))
const assetsToCache = [...build, ...filteredFiles]
const assetsMap = new Set(assetsToCache)

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(ASSETS_CACHE_KEY)
      .then(cache => cache.addAll(assetsToCache))
      .then(() => {
        self.skipWaiting()
      })
      .catch(console.error)
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(async keys => {
        for (const key of keys) {
          if (key !== ASSETS_CACHE_KEY && key !== OFFLINE_CACHE_KEY) {
            await caches.delete(key)
          }
        }

        self.clients.claim()
      })
      .catch(console.error)
  )
})

async function fetchAndCache(request) {
  const cache = await caches.open(OFFLINE_CACHE_KEY)

  try {
    const response = await fetch(request)

    // Do not preserve 404/429/5xx responses in the offline cache.
    if (response.ok) {
      await cache.put(request, response.clone())
    }

    return response
  } catch (err) {
    const response = await cache.match(request)
    if (response) return response

    throw err
  }
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || event.request.headers.has('range')) return

  const url = new URL(event.request.url)

  const isHttp = url.protocol.startsWith('http')
  const isDevServerRequest =
    url.hostname === self.location.hostname && url.port !== self.location.port
  const isSameOrigin = url.host === self.location.host
  const isStaticAsset = isSameOrigin && assetsMap.has(url.pathname)
  const skipBecauseUncached = event.request.cache === 'only-if-cached' && !isStaticAsset

  if (isHttp && isSameOrigin && !isDevServerRequest && !skipBecauseUncached) {
    event.respondWith(
      (async () => {
        const cachedAsset = isStaticAsset && (await caches.match(event.request))

        return cachedAsset || fetchAndCache(event.request)
      })()
    )
  }
})
