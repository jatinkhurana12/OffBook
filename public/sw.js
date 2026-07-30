// Minimal service worker: shows a system notification when a push arrives,
// and focuses (or opens) the Offbook messages tab when the user taps it.

self.addEventListener("push", (event) => {
  let data = { title: "Offbook", body: "You have a new message.", url: "/messages" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (err) {
    // Non-JSON payload — fall back to the defaults above.
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/messages";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});