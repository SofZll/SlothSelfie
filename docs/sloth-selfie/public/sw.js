self.addEventListener('push', function(event) {
    let notificationData = {};

    if (event.data) {
        try {
            notificationData = event.data.json();
        } catch (error) {
            console.error('Error parsing push notification data:', error);
        }
    }

    const title = notificationData.title || 'Nuova Notifica';
    const options = {
        body: notificationData.body || 'Contenuto della notifica',
        icon: notificationData.icon || 'images/notification-icon.png',
        badge: notificationData.badge || 'images/notification-badge.png',
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('https://site232453.tw.cs.unibo.it')
    );
});