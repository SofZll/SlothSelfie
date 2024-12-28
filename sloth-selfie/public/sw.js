self.addEventListener('push', function(event) {
    const title = event.data ? event.data.text() : 'Nuova Notifica';
    const options = {
        body: event.data ? event.data.text() : 'Contenuto della notifica',
        icon: 'images/notification-icon.png',
        badge: 'images/notification-badge.png'
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('http://localhost:3000')
    );
});