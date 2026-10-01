# App de Android (Google Play)

La app es una **Trusted Web Activity**: un envoltorio Android que abre miarcana.com a pantalla
completa, sin barra del navegador, con el ícono y el nombre de Arcana. Toda la lógica vive en la web.

- `twa-manifest.json`: configuración (paquete `com.miarcana.app`, colores, URL de inicio, atajos).
- `arcana-upload.keystore`: **no está en el repositorio**. Vive en los secretos de GitHub
  (`ANDROID_KEYSTORE_BASE64`) y se restaura al compilar. La huella de su certificado está en
  `public/.well-known/assetlinks.json`, que es lo que permite abrir la web sin barra del navegador.
- La compilación la hace GitHub Actions (`.github/workflows/android.yml`): produce `app-release-bundle.aab`
  (para subir a Play) y `app-release-signed.apk` (para instalar en un teléfono y probar).

Para subir una versión nueva: cambia `appVersionCode` (+1) y `appVersionName` en `twa-manifest.json`,
haz commit y ejecuta el flujo "Android (Google Play)" desde la pestaña Actions de GitHub.
