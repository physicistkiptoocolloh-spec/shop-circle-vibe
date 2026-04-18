// Minimal service worker for web push notifications.
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { /* noop */ }
  const title = data.title || "SokoMtaani";
  const options = {
    body: data.body || "You have a new message",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: data.url || "/inbox",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data || "/inbox";
  event.waitUntil(clients.openWindow(url));
});
