const SW_VERSION = "v2";

self.addEventListener("push", event => {
  let data = {
    title: "Neues Lösungswort",
    body: "Ein neues Lösungswort ist verfügbar.",
    url: "./"
  };

  try {
    if (event.data) {
      data = {
        ...data,
        ...event.data.json()
      };
    }
  } catch (error) {
    console.error(
      "Push-Daten konnten nicht gelesen werden:",
      error
    );
  }

  const options = {
    body: data.body,

    icon: "./icon-192.png",

    // optional: großes Bild
    image: "./door-notification.png",

    // für Android-Statusleiste
    badge: "./badge.png?v=2",

    // ganz wichtig:
    // immer dieselbe Benachrichtigung ersetzen
    tag: "solution-word",

    renotify: false,

    // nicht dauerhaft erzwingen
    requireInteraction: false,

    silent: false,

    data: {
      url: data.url || "./"
    },

    actions: [
      {
        action: "open",
        title: "Quiz öffnen"
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title,
      options
    )
  );
});


// ======================================================
// KLICK AUF BENACHRICHTIGUNG
// ======================================================

self.addEventListener(
  "notificationclick",
  event => {

    event.notification.close();

    const targetUrl =
      event.notification.data?.url || "./";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true
        })
        .then(clientList => {

          for (const client of clientList) {

            if (
              "focus" in client
            ) {
              return client.focus();
            }
          }

          if (
            clients.openWindow
          ) {
            return clients.openWindow(
              targetUrl
            );
          }
        })
    );
  }
);
