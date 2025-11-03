// sw.js - Service Worker pour HosBac
const CACHE_NAME = 'hosbac-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

self.addEventListener('install', function(event) {
  // Installation du Service Worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache First - Retourne la ressource depuis le cache si disponible
        if (response) {
          return response;
        }
        
        // Sinon, fait la requête réseau
        return fetch(event.request).then(function(response) {
          // Vérifie si la réponse est valide
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone la réponse
          var responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
    );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});