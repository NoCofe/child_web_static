const CACHE_NAME = 'warm-time-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/features.html',
  '/solutions.html',
  '/about.html',
  '/faq.html',
  '/privacy.html',
  '/music.html',
  '/manifest.json',
  // 添加重要的静态资源
  '/pic/HelloSong.png',
  '/pic/LittleStarVariation.png',
  '/pic/AnimalCrawlingRace.png',
  '/pic/BalanceBeamChallenge.png',
  '/pic/ColorfulBlocksClassification.png',
  '/pic/FingerPaintRainbow.png',
  '/pic/LittleFrogJumping.png',
  '/pic/LittlePitcher.png',
  '/pic/LittleRabbitJumping.png',
  '/pic/RollingBigBall.png',
  // 封面图片
  '/cover/Art.png',
  '/cover/Cognitive.png',
  '/cover/Emotional.png',
  '/cover/Language.png',
  '/cover/Motor.png',
  '/cover/Music.png',
  '/cover/Physical.png',
  '/cover/Social.png'
];

// 安装事件 - 缓存资源
self.addEventListener('install', event => {
  console.log('Service Worker 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('所有资源已缓存');
        return self.skipWaiting();
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  console.log('Service Worker 激活中...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker 已激活');
      return self.clients.claim();
    })
  );
});

// 拦截请求 - 缓存优先策略
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有，直接返回
        if (response) {
          return response;
        }

        // 否则发起网络请求
        return fetch(event.request).then(response => {
          // 检查是否是有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 克隆响应，因为响应流只能使用一次
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // 网络失败时，如果是导航请求，返回离线页面
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// 处理消息
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 推送通知支持（可选）
self.addEventListener('push', event => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };

    event.waitUntil(
      self.registration.showNotification('暖时光', options)
    );
  }
});

// 通知点击处理
self.addEventListener('notificationclick', event => {
  console.log('通知被点击:', event.notification.tag);
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});
