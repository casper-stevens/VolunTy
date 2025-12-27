// Service Worker for handling push notifications

// Handle push events
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event);

  if (!event.data) {
    console.log("Push notification received but no data");
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body || "You have a new notification",
      icon: "/icon.png",
      badge: "/badge.png",
      tag: data.tag || "notification",
      requireInteraction: data.requireInteraction || false,
      data: data.data || {},
      actions: data.actions || [],
    };

    // Show the notification
    event.waitUntil(
      self.registration.showNotification(data.title || "VolunTy", options)
    );
  } catch (error) {
    console.error("Error handling push notification:", error);
    // Fallback if data is not JSON
    event.waitUntil(
      self.registration.showNotification("VolunTy", {
        body: event.data.text(),
        icon: "/icon.png",
      })
    );
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event.notification.tag);

  event.notification.close();

  const urlToOpen = event.notification.data.url || "/volunteer";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab with the target URL
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event.notification.tag);
});

// Handle service worker activation
self.addEventListener("activate", (event) => {
  console.log("Service worker activated");
  event.waitUntil(clients.claim());
});

// Handle service worker installation
self.addEventListener("install", (event) => {
  console.log("Service worker installing");
  self.skipWaiting();
});
