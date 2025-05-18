self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Notification';
    const options = {
        body: data.body || 'You have a new notification!',
        icon: data.icon || '../assets/icons/SlothLogo.jsx',
        data: data || {}
    };

    // Show the notification
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil(
    clients.openWindow('https://site232453.tw.cs.unibo.it')
    );
});
