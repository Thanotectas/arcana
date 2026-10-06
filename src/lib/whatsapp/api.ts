import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * API de WhatsApp Business (Meta Cloud API) para la línea de atención de
 * Arcana. Variables: WA_PHONE_NUMBER_ID (id del número en Meta), WA_TOKEN
 * (token permanente de usuario del sistema con whatsapp_business_messaging),
 * WA_VERIFY_TOKEN (palabra que se escribe al registrar el webhook) y
 * WA_APP_SECRET (secreto de la app, para verificar la firma de cada aviso).
 */
const API = "https://graph.facebook.com/v25.0";

export function whatsappConfigurado() {
  return Boolean(process.env.WA_PHONE_NUMBER_ID && process.env.WA_TOKEN && process.env.WA_VERIFY_TOKEN);
}

/** Firma X-Hub-Signature-256 de Meta: HMAC-SHA256 del cuerpo con el secreto de la app. */
export function firmaValida(cuerpo: string, cabecera: string | null) {
  // Tolera espacios, saltos de línea o comillas pegados por error al copiar la clave.
  const secreto = (process.env.WA_APP_SECRET ?? "").trim().replace(/^["']|["']$/g, "");
  if (!secreto) return true; // sin secreto configurado no se exige firma (solo para pruebas)
  if (!cabecera?.startsWith("sha256=")) return false;
  const esperada = createHmac("sha256", secreto).update(cuerpo).digest("hex");
  const recibida = cabecera.slice(7);
  const valida = esperada.length === recibida.length && timingSafeEqual(Buffer.from(esperada), Buffer.from(recibida));
  if (!valida) {
    // Pista sin revelar la clave: la clave secreta de una app de Meta son 32 caracteres hexadecimales.
    const forma = /^[0-9a-f]{32}$/i.test(secreto) ? "tiene la forma de una clave secreta (32 hex): es de otra app o fue regenerada" : `no tiene la forma de una clave secreta (longitud ${secreto.length}, se esperan 32 caracteres hexadecimales): quizá se copió otro valor`;
    console.warn(`[whatsapp] WA_APP_SECRET ${forma}`);
  }
  return valida;
}

async function llamar(cuerpo: Record<string, unknown>) {
  const res = await fetch(`${API}/${process.env.WA_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WA_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", ...cuerpo }),
    cache: "no-store",
  });
  const datos = (await res.json().catch(() => ({}))) as { messages?: { id: string }[]; error?: { message?: string; code?: number } };
  if (!res.ok || datos.error) {
    const e = datos.error;
    throw new Error(`WhatsApp: ${e?.message ?? res.status}${e?.code ? ` (código ${e.code})` : ""}`);
  }
  return datos.messages?.[0]?.id ?? "";
}

export function enviarTexto(para: string, texto: string) {
  return llamar({ to: para, type: "text", text: { body: texto.slice(0, 4000), preview_url: true } });
}

export function enviarImagen(para: string, url: string, pie?: string) {
  return llamar({ to: para, type: "image", image: { link: url, caption: pie?.slice(0, 1024) } });
}

/** Marca el mensaje como leído (los dos chulos azules) para que la persona sepa que llegó. */
export async function marcarLeido(idMensaje: string) {
  try {
    await llamar({ status: "read", message_id: idMensaje });
  } catch {
    // No importa si falla.
  }
}

// --- Forma del aviso que manda Meta --------------------------------------
export interface MensajeEntrante {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
}

export interface AvisoWhatsapp {
  object?: string;
  entry?: {
    changes?: {
      field?: string;
      value?: {
        metadata?: { phone_number_id?: string };
        contacts?: { wa_id: string; profile?: { name?: string } }[];
        messages?: MensajeEntrante[];
        statuses?: unknown[];
      };
    }[];
  }[];
}

/** Mensajes dirigidos a nuestro número, con el nombre del contacto. */
export function extraerMensajes(aviso: AvisoWhatsapp): { mensaje: MensajeEntrante; nombre: string | null }[] {
  const propio = process.env.WA_PHONE_NUMBER_ID;
  const lista: { mensaje: MensajeEntrante; nombre: string | null }[] = [];
  for (const entrada of aviso.entry ?? []) {
    for (const cambio of entrada.changes ?? []) {
      const v = cambio.value;
      if (!v?.messages || (propio && v.metadata?.phone_number_id && v.metadata.phone_number_id !== propio)) continue;
      const nombres = new Map((v.contacts ?? []).map((c) => [c.wa_id, c.profile?.name ?? null]));
      for (const m of v.messages) lista.push({ mensaje: m, nombre: nombres.get(m.from) ?? null });
    }
  }
  return lista;
}

// --- Registro y estado del número (para /admin/whatsapp) -------------------
export interface EstadoNumero {
  verified_name?: string;
  display_phone_number?: string;
  code_verification_status?: string;
  status?: string;
  quality_rating?: string;
  name_status?: string;
  platform_type?: string;
}

/** Estado del número según Meta: nombre verificado, verificación, calidad, plataforma. */
export async function estadoNumero(): Promise<EstadoNumero> {
  const res = await fetch(`${API}/${process.env.WA_PHONE_NUMBER_ID}?fields=verified_name,display_phone_number,code_verification_status,status,quality_rating,name_status,platform_type`, {
    headers: { Authorization: `Bearer ${process.env.WA_TOKEN}` },
    cache: "no-store",
  });
  const datos = (await res.json().catch(() => ({}))) as EstadoNumero & { error?: { message?: string; code?: number } };
  if (!res.ok || datos.error) throw new Error(`WhatsApp: ${datos.error?.message ?? res.status}${datos.error?.code ? ` (código ${datos.error.code})` : ""}`);
  return datos;
}

/**
 * Registra el número en la API de la nube con un PIN de seis dígitos
 * (verificación en dos pasos). Equivale al botón "Registrar" del panel de
 * Meta, que a veces falla sin explicación.
 */
export async function registrarNumero(pin: string): Promise<void> {
  const res = await fetch(`${API}/${process.env.WA_PHONE_NUMBER_ID}/register`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WA_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", pin }),
    cache: "no-store",
  });
  const datos = (await res.json().catch(() => ({}))) as { success?: boolean; error?: { message?: string; code?: number; error_subcode?: number } };
  if (!res.ok || datos.error) {
    const e = datos.error;
    throw new Error(`WhatsApp register: ${e?.message ?? res.status}${e?.code ? ` (código ${e.code}${e.error_subcode ? `/${e.error_subcode}` : ""})` : ""}`);
  }
}

async function llamarNumero(ruta: string, cuerpo: Record<string, unknown>) {
  const res = await fetch(`${API}/${process.env.WA_PHONE_NUMBER_ID}/${ruta}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WA_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
    cache: "no-store",
  });
  const datos = (await res.json().catch(() => ({}))) as { success?: boolean; error?: { message?: string; code?: number; error_subcode?: number; error_user_msg?: string } };
  if (!res.ok || datos.error) {
    const e = datos.error;
    throw new Error(`WhatsApp ${ruta}: ${e?.error_user_msg ?? e?.message ?? res.status}${e?.code ? ` (código ${e.code}${e.error_subcode ? `/${e.error_subcode}` : ""})` : ""}`);
  }
}

/** Pide a Meta un nuevo código de verificación del número por SMS o llamada. */
export function pedirCodigo(metodo: "SMS" | "VOICE" = "SMS") {
  return llamarNumero("request_code", { code_method: metodo, language: "es" });
}

/** Confirma el código recibido: el número vuelve a quedar verificado. */
export function verificarCodigo(codigo: string) {
  return llamarNumero("verify_code", { code: codigo });
}
