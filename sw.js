/**
 * EduQuiz — Service Worker
 * Basic caching strategy for offline support.
 */

const CACHE_NAME = 'eduquiz-v1';

const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/storage.js',
    '/js/ui-utils.js',
    '/js/gamification.js',
    '/js/quiz-engine.js',
    '/js/share.js',
    '/js/pages/home.js',
    '/js/pages/class-select.js',
    '/js/pages/subject-select.js',
    '/js/pages/quiz.js',
    '/js/pages/result.js',
    '/js/pages/leaderboard.js',
    '/js/pages/profile.js',
    '/js/pages/about.js',
    '/js/router.js',
    '/js/app.js',
    '/manifest.json',
];

// Install — cache essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_URLS);
        }).catch(() => {
            // Silently fail if caching fails
        })
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => {
            return Promise.all(
                names.filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone and cache successful responses
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
