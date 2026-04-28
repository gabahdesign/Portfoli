/**
 * service-worker.js - Service Worker para PWA
 * Permite funcionamiento offline y mejora el rendimiento
 */

const CACHE_NAME = 'impostor-game-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/config.js',
    '/js/data.js',
    '/js/game.js',
    '/js/players.js',
    '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Cacheando archivos');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[Service Worker] Instalado correctamente');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Error en instalación:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activando...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] Eliminando caché antigua:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activado correctamente');
                return self.clients.claim();
            })
    );
});

// Intercepción de peticiones (estrategia Cache First)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Si está en caché, devolver desde caché
                if (response) {
                    return response;
                }

                // Si no está en caché, hacer fetch
                return fetch(event.request)
                    .then((response) => {
                        // Verificar si es una respuesta válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clonar la respuesta
                        const responseToCache = response.clone();

                        // Guardar en caché
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Error en fetch:', error);

                        // Aquí podrías devolver una página offline personalizada
                        // return caches.match('/offline.html');
                    });
            })
    );
});

// Manejo de mensajes desde la aplicación
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
