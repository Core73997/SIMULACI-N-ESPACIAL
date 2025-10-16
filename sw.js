// Service Worker para Sistema Solar 3D
const CACHE_NAME = 'sistema-solar-3d-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Archivos a cachear
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/manifest.json',
    '/config.json',
    '/js/main.js',
    '/js/solarSystem.js',
    '/js/physicsComparison.js',
    '/js/effects.js',
    '/data/planets.json',
    '/data/missions.json',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap'
];

// Archivos que nunca deben ser cacheados
const NEVER_CACHE = [
    /\/api\//,
    /\/admin\//,
    /\.json$/
];

// Función para verificar si una URL debe ser cacheada
function shouldCache(url) {
    return !NEVER_CACHE.some(pattern => pattern.test(url));
}

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Cacheando archivos estáticos');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Archivos estáticos cacheados');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Error cacheando archivos:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activando...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activado');
                return self.clients.claim();
            })
    );
});

// Interceptación de peticiones
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // No interceptar peticiones no GET
    if (request.method !== 'GET') {
        return;
    }
    
    // No interceptar peticiones de Chrome Extensions
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Estrategia de cache para diferentes tipos de recursos
    if (request.destination === 'image') {
        // Cache first para imágenes
        event.respondWith(cacheFirst(request));
    } else if (request.destination === 'script' || request.destination === 'style') {
        // Cache first para scripts y estilos
        event.respondWith(cacheFirst(request));
    } else if (url.origin === location.origin) {
        // Network first para recursos locales
        event.respondWith(networkFirst(request));
    } else {
        // Cache first para recursos externos
        event.respondWith(cacheFirst(request));
    }
});

// Estrategia: Cache First
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok && shouldCache(request.url)) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Service Worker: Error en cacheFirst:', error);
        
        // Fallback para HTML
        if (request.destination === 'document') {
            return caches.match('/index.html');
        }
        
        // Fallback genérico
        return new Response('Recurso no disponible', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Estrategia: Network First
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok && shouldCache(request.url)) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Usando cache como fallback');
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback para HTML
        if (request.destination === 'document') {
            return caches.match('/index.html');
        }
        
        throw error;
    }
}

// Estrategia: Stale While Revalidate
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const networkResponsePromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok && shouldCache(request.url)) {
            const cache = caches.open(DYNAMIC_CACHE);
            cache.then((c) => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    }).catch(() => {
        console.log('Service Worker: Error de red, usando cache');
    });
    
    return cachedResponse || networkResponsePromise;
}

// Manejo de mensajes del cliente
self.addEventListener('message', (event) => {
    console.log('Service Worker: Mensaje recibido:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        console.log('Service Worker: Limpiando cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            })
        );
    }
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Sincronización en segundo plano:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Aquí podrías añadir lógica para sincronizar datos
            Promise.resolve()
        );
    }
});

// Notificaciones push
self.addEventListener('push', (event) => {
    console.log('Service Worker: Notificación push recibida');
    
    const options = {
        body: '¡Nueva actualización disponible en Sistema Solar 3D!',
        icon: '/resources/icon-192.png',
        badge: '/resources/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Explorar',
                icon: '/resources/action-explore.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/resources/action-close.png'
            }
        ]
    };
    
    if (event.data) {
        const data = event.data.json();
        options.body = data.body || options.body;
        options.title = data.title || 'Sistema Solar 3D';
    }
    
    event.waitUntil(
        self.registration.showNotification('Sistema Solar 3D', options)
    );
});

// Manejo de notificaciones
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Click en notificación');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Errores no capturados
self.addEventListener('error', (event) => {
    console.error('Service Worker: Error no capturado:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Rechazo no manejado:', event.reason);
});

console.log('Service Worker: Cargado correctamente');