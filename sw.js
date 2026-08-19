self.addEventListener("push", event => {
  let data = {
    title: "🚪 Die Tür öffnet sich …",
    body: "Ein neues Lösungswort wartet auf dich."
  };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (error) {
    console.error("Push-Daten konnten nicht gelesen werden:", error);
  }

  const options = {
    body: data.body,

    // Normales Benachrichtigungs-/App-Icon
    icon: "./icon-192.png",

    // Großes Bild in der Benachrichtigung
    image: "./door-notification.png",

    // Kleines Symbol für Android
    badge: "./badge-96.png",

    // Alte Benachrichtigung ersetzen statt stapeln
    tag: "hourly-solution-word",
    renotify: true,

    // Benachrichtigung nicht automatisch schließen
    requireInteraction: false,

    actions: [
      {
        action: "open-quiz",
        title: "🚪 Quiz öffnen"
      }
    ],

    data: {
      url: "./"
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "🚪 Neues Lösungswort",
      options
    )
  );
});


// ======================================================
// KLICK AUF DIE BENACHRICHTIGUNG
// ======================================================

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const url =
    event.notification.data?.url || "./";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true
      })
      .then(clientList => {

        // Falls die Quiz-Seite bereits geöffnet ist:
        // vorhandenes Fenster in den Vordergrund holen
        for (const client of clientList) {
          if ("focus" in client) {
            return client.focus();
          }
        }

        // Sonst neues Fenster öffnen
        if (clients.openWindow) {
          return clients.openWindow(url);
        }

      })
  );
});
