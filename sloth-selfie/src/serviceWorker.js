self.addEventListener("push", event => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "Notification";
    const options = {
      body: data.body || "You have a new notification!",
      icon: data.icon || "/static/icon.png",
      badge: data.badge || "/static/badge.png",
    };
  
    // Show the notification
    event.waitUntil(self.registration.showNotification(title, options));
  });
  
  self.addEventListener("notificationclick", event => {
    event.notification.close(); // Close the notification
  
    // Handle notification click (e.g., navigate to a URL)
    event.waitUntil(
      clients.openWindow("/notifications") // Adjust to your app's relevant page
    );
  });
  