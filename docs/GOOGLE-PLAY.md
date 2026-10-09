# Arcana en Google Play

## Cómo está hecha la app

Es una **Trusted Web Activity (TWA)**: un envoltorio Android oficial de Google que abre miarcana.com a
pantalla completa, con el ícono, el nombre y los colores de Arcana, sin barra del navegador. Toda la
app vive en la web; cada mejora de la web llega a la app sin publicar versiones nuevas.

- Paquete: `com.miarcana.app` · configuración en `android/twa-manifest.json`.
- Verificación del dominio: `public/.well-known/assetlinks.json` con la huella SHA-256 de la llave de
  firma. Si la huella no coincide, la app se abre con barra de navegador (sigue funcionando).
- Compilación: GitHub → Actions → "Android (Google Play)" → Run workflow. Al terminar, en la sección
  Artifacts se descarga `arcana-android.zip` con `app-release-bundle.aab` (para Play) y
  `app-release-signed.apk` (para instalar en un teléfono y probar antes).
- Secretos necesarios en GitHub (Settings → Secrets and variables → Actions):
  `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_PASSWORD` (los dos últimos con la
  misma contraseña de la llave).
- Dentro de la app no se venden créditos (abre con `?app=android`, que deja una cookie `plataforma`):
  Google Play exige su propio sistema de pago para bienes digitales y rechaza apps que cobren por fuera.
  Los créditos se recargan en la web. Segunda fase: integrar Google Play Billing (Digital Goods API)
  para vender créditos dentro de la app con la comisión de Play (15 % el primer millón de USD al año).

## Pasos en Google Play Console

1. Crear la cuenta de desarrollador en https://play.google.com/console (pago único de 25 USD) y
   verificar la identidad. Las cuentas personales nuevas deben hacer una **prueba cerrada con al menos
   12 probadores durante 14 días** antes de poder publicar en producción.
2. Crear la app: nombre "Arcana: tarot, carta astral y más", idioma predeterminado español
   (Latinoamérica), tipo App, gratuita.
3. Configuración de la app (panel "Configura tu app"): política de privacidad
   `https://miarcana.com/privacidad`; acceso a la app: todas las funciones disponibles sin acceso
   especial (adjuntar una cuenta de prueba si lo piden); anuncios: no; clasificación de contenido:
   cuestionario IARC, categoría "Referencia, noticias o educación" o "Entretenimiento", sin violencia,
   sin apuestas (nota: las lecturas son entretenimiento); público objetivo: 18 años o más; app de
   noticias: no; COVID: no; seguridad de los datos: ver abajo; categoría de la tienda: Estilo de vida.
4. Ficha de Play Store (textos abajo) con ícono 512×512, gráfico destacado 1024×500 y 4 a 8 capturas de
   teléfono (1080×1920).
5. Pruebas → Prueba cerrada → crear versión → subir `app-release-bundle.aab` → activar
   **Firma de aplicaciones de Play** (recomendado; la llave de subida es la del repositorio).
6. Añadir probadores (lista de correos) y compartir el enlace de prueba. Tras 14 días con 12 probadores,
   solicitar acceso a producción.

## Seguridad de los datos (respuestas)

- Recopila datos: sí. Nombre, correo electrónico (cuenta); fecha, hora y lugar de nacimiento (perfil,
  opcional); fotos (solo la palma de la mano, para la lectura; se guarda en almacenamiento privado);
  mensajes de la persona (preguntas y chat); historial de compras (referencias de pago, no datos de
  tarjeta); identificadores de dispositivo para notificaciones push (opcional).
- Finalidad: funcionalidad de la app y personalización. No se usan para publicidad.
- Se comparten con terceros: el contenido de las consultas se envía al proveedor de IA (Anthropic) para
  escribir las lecturas; los pagos los procesa Bold (en la web). No se venden datos.
- Cifrado en tránsito: sí (HTTPS). La persona puede pedir la eliminación de sus datos: sí (escribir al
  correo de contacto; pendiente el botón "eliminar cuenta" en la app).

## Ficha de Play Store

**Nombre (30):** Arcana: tarot y carta astral

**Descripción breve (80):** Tarot con cartas reales, tu carta astral y tu cielo de cada día, escritos para ti.

**Descripción completa:**

Arcana es tu guía esotérica personal. Fotografía tu palma, saca tu carta del día o calcula tu carta astral
con la posición real de los planetas, y recibe una lectura escrita solo para ti en menos de un minuto.

LO QUE PUEDES HACER
• Tarot con el mazo Rider-Waite original: carta del día gratis, tirada de tres cartas y Cruz Celta.
• Carta astral calculada con tu fecha, hora y lugar de nacimiento: Sol, Luna, Ascendente, casas y aspectos.
• Lectura de la mano: encuadra tu palma con la guía y Arcana lee tus líneas de vida, cabeza, corazón y destino.
• Numerología, I Ching, compatibilidad y calendario chino con tu animal, tu elemento y tu año.
• Lecturas cruzadas: dos sistemas sobre ti a la vez, por ejemplo tarot con carta astral.
• Tu cielo hoy: cada mañana, un mensaje sobre los tránsitos reales de tu carta, no sobre tu signo.
• Sibila, tu guía: pregúntale sobre tus lecturas, tu día o qué consulta te conviene.

CÓMO FUNCIONA
Creas tu cuenta gratis y recibes 3 créditos de bienvenida. La carta del día es gratis todos los días. Cada
lectura cuesta entre 1 y 5 créditos y queda guardada en tu historial para volver a ella cuando quieras.
Arcana recuerda tus lecturas y habla con continuidad.

Disponible en español, inglés y portugués.

Las lecturas son una herramienta de reflexión y entretenimiento; no sustituyen asesoría médica, legal,
psicológica ni financiera.

**Palabras clave sugeridas:** tarot, carta astral, horóscopo, astrología, numerología, quiromancia,
I Ching, horóscopo chino, lectura de la mano, carta natal.

## Créditos para los probadores de la prueba cerrada

Los probadores deben registrarse primero en la app (con la misma cuenta de Google que está en la lista de verificadores). Después, en Supabase → SQL Editor, este bloque les carga 30 créditos una sola vez (es seguro repetirlo: salta a quien ya los recibió y a quien aún no se ha registrado):

```sql
do $$
declare
  v_correos text[] := array[
    'probador1@gmail.com',
    'probador2@gmail.com'
  ];
  v_usuario uuid;
  v_correo text;
begin
  foreach v_correo in array v_correos loop
    select u.id into v_usuario from auth.users u where lower(u.email) = lower(v_correo);
    if v_usuario is null then
      raise notice 'Sin cuenta todavía: %', v_correo;
    elsif exists (select 1 from public.movimientos_creditos m where m.usuario_id = v_usuario and m.motivo = 'prueba_play') then
      raise notice 'Ya tenía los créditos: %', v_correo;
    else
      perform public.devolver_creditos(v_usuario, 30, 'prueba_play', 'prueba cerrada Google Play');
      raise notice 'Acreditados 30 a %', v_correo;
    end if;
  end loop;
end $$;
```

Para ver cuánto gastó cada probador al terminar la prueba:

```sql
select u.email, sum(case when m.cantidad < 0 then -m.cantidad else 0 end) as gastados
from public.movimientos_creditos m join auth.users u on u.id = m.usuario_id
where m.usuario_id in (select usuario_id from public.movimientos_creditos where motivo = 'prueba_play')
group by u.email order by gastados desc;
```

Costo de la IA durante la prueba: con el reparto de modelos (Opus solo en carta astral, Cruz Celta, quiromancia y cruces; Sonnet en el resto), 12 probadores con 30 créditos cuestan entre 5 y 8 USD en total. Para abaratar aún más, definir `ARCANA_IA_MODEL=claude-sonnet-5-5` en Vercel fuerza Sonnet en todo.

## Estado de la prueba cerrada (9 oct 2026)

12 probadores aceptaron; el 9 de octubre llevaba 4 días consecutivos de los 14 exigidos, así que el botón
"Solicitar acceso a producción" se habilita hacia el 19 de octubre si el número no baja de 12 (si baja, el
contador se reinicia). Respuestas preparadas para el cuestionario de Google en
`marketing/play-store/respuestas-acceso-produccion.txt`.
