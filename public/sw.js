/* Service worker de Arcana: solo recibe avisos push y abre la página al tocarlos. No cachea nada. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (evento) => {
  let datos = { titulo: "Arcana", cuerpo: "", url: "/hoy" };
  try {
    if (evento.data) datos = { ...datos, ...evento.data.json() };
  } catch {
    if (evento.data) datos.cuerpo = evento.data.text();
  }
  evento.waitUntil(
    self.registration.showNotification(datos.titulo, {
      body: datos.cuerpo,
      icon: "/marca/icono-192.png",
      badge: "/marca/icono-192.png",
      tag: datos.tag || "arcana-hoy",
      renotify: false,
      data: { url: datos.url },
    }),
  );
});

self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  const url = new URL((evento.notification.data && evento.notification.data.url) || "/hoy", self.location.origin).href;
  evento.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      for (const v of ventanas) {
        if (v.url.startsWith(self.location.origin) && "focus" in v) {
          v.navigate(url);
          return v.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
