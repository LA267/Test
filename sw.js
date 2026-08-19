self.addEventListener("push", event => {
  let data = {
    title: "Neues Lösungswort",
    body: "Ein neues Lösungswort ist verfügbar."
  };

  try {
    if (event.data) data = event.data.json();
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: "hourly-solution-word",
      renotify: true
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if ("focus" in client) return client.focus();
        }
        return clients.openWindow("./");
      })
  );
});
