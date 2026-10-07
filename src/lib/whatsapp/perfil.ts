import "server-only";
import { sitio } from "@/lib/correo";

/**
 * Perfil de empresa de la línea de WhatsApp (lo que ve la gente al tocar el
 * nombre "Arcana" en el chat): foto, Info, descripción, correo, sitios web y
 * categoría. Se aplica con la Cloud API desde /admin/whatsapp. Para cambiar
 * un texto, editarlo aquí y volver a pulsar "Aplicar perfil".
 *
 * Límites de Meta: about ≤ 139, description ≤ 512, address ≤ 256,
 * email ≤ 128, hasta 2 sitios web, foto cuadrada JPG/PNG de 192 a 640 px.
 */
export const PERFIL_EMPRESA = {
  about: "Tarot, carta astral, mano y sueños, escritos para ti. Tu carta del día gratis en miarcana.com ✦",
  description:
    "Arcana es tu guía esotérica en el celular. Sibila te lee el tarot (Rider-Waite, Marsella, Ángeles y Tarot Arcana), la carta astral, la mano, los sueños, la taza de chocolate y más, escrito para ti en minutos. Carta del día gratis todos los días y 3 créditos de regalo al registrarte. Pagos con Nequi, PSE y tarjeta. Escríbenos aquí: Sibila te responde a cualquier hora.",
  address: "Colombia · servicio en línea",
  email: "miarcana4@gmail.com",
  websites: ["https://miarcana.com/", "https://www.instagram.com/miarcana.oficial"],
  vertical: "ENTERTAIN",
  /** Ruta pública de la foto de perfil (640×640). */
  foto: "/marca/whatsapp-perfil.jpg",
} as const;

const API = "https://graph.facebook.com/v25.0";
/** Identificador de la app de Meta (no es secreto): lo exige la subida de la foto. */
const APP_ID = process.env.WA_APP_ID ?? "728785650291159";

export interface PerfilActual {
  about?: string;
  description?: string;
  address?: string;
  email?: string;
  websites?: string[];
  vertical?: string;
  profile_picture_url?: string;
}

function token() {
  return process.env.WA_TOKEN ?? "";
}

async function json<T>(res: Response, que: string): Promise<T> {
  const datos = (await res.json().catch(() => ({}))) as T & { error?: { message?: string; error_user_msg?: string; code?: number } };
  if (!res.ok || datos.error) {
    const e = datos.error;
    throw new Error(`${que}: ${e?.error_user_msg ?? e?.message ?? res.status}${e?.code ? ` (código ${e.code})` : ""}`);
  }
  return datos;
}

/** El perfil tal como lo tiene Meta ahora. */
export async function leerPerfil(): Promise<PerfilActual> {
  const res = await fetch(`${API}/${process.env.WA_PHONE_NUMBER_ID}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical`, {
    headers: { Authorization: `Bearer ${token()}` },
    cache: "no-store",
  });
  const datos = await json<{ data?: PerfilActual[] }>(res, "Leer perfil");
  return datos.data?.[0] ?? {};
}

/**
 * Sube la foto con la API de subida reanudable de Meta y devuelve el
 * "handle" que pide el perfil.
 */
async function subirFoto(): Promise<string> {
  const imagen = await fetch(`${sitio()}${PERFIL_EMPRESA.foto}`, { cache: "no-store" });
  if (!imagen.ok) throw new Error(`Foto de perfil: no se pudo leer ${PERFIL_EMPRESA.foto} (${imagen.status})`);
  const bytes = Buffer.from(await imagen.arrayBuffer());
  const tipo = imagen.headers.get("content-type")?.split(";")[0] || "image/jpeg";

  const sesion = await json<{ id?: string }>(
    await fetch(`${API}/${APP_ID}/uploads?file_name=arcana-perfil.jpg&file_length=${bytes.length}&file_type=${encodeURIComponent(tipo)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
      cache: "no-store",
    }),
    "Abrir subida",
  );
  if (!sesion.id) throw new Error("Abrir subida: Meta no devolvió la sesión");

  const subida = await json<{ h?: string }>(
    await fetch(`${API}/${sesion.id}`, {
      method: "POST",
      headers: { Authorization: `OAuth ${token()}`, file_offset: "0", "Content-Type": tipo },
      body: bytes,
      cache: "no-store",
    }),
    "Subir foto",
  );
  if (!subida.h) throw new Error("Subir foto: Meta no devolvió el identificador");
  return subida.h;
}

/** Aplica el perfil completo (textos, sitios, categoría y foto). Devuelve si la foto quedó. */
export async function aplicarPerfil(): Promise<{ foto: boolean; avisoFoto?: string }> {
  let handle: string | null = null;
  let avisoFoto: string | undefined;
  try {
    handle = await subirFoto();
  } catch (e) {
    // Los textos se aplican igual; la foto se puede subir a mano en WhatsApp Manager.
    avisoFoto = e instanceof Error ? e.message : String(e);
  }
  const cuerpo: Record<string, unknown> = {
    messaging_product: "whatsapp",
    about: PERFIL_EMPRESA.about,
    description: PERFIL_EMPRESA.description,
    address: PERFIL_EMPRESA.address,
    email: PERFIL_EMPRESA.email,
    websites: PERFIL_EMPRESA.websites,
    vertical: PERFIL_EMPRESA.vertical,
  };
  if (handle) cuerpo.profile_picture_handle = handle;
  await json(
    await fetch(`${API}/${process.env.WA_PHONE_NUMBER_ID}/whatsapp_business_profile`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
      cache: "no-store",
    }),
    "Guardar perfil",
  );
  return { foto: Boolean(handle), avisoFoto };
}
