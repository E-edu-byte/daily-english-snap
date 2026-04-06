// Service Worker - PWAインストール条件を満たす
const CACHE_VERSION = 'v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // 基本的にネットワークから取得（常に最新のコンテンツを表示）
});
