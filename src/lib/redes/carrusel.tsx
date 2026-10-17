import "server-only";
import { join } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { generarTexto } from "@/lib/ia";
import { SIGNOS, type Signo } from "@/lib/zodiaco";
import { simboloDataUri } from "@/lib/marca/simbolo";
import { webpComoDataUri } from "@/lib/marca/imagenes";
import { estrellas, png } from "./reel";
import { lunesDe, sumarDias } from "./calendario";

/**
 * Carrusel semanal "Tu signo esta semana" (Instagram y Facebook, los lunes):
 * portada, seis láminas con dos signos cada una y un cierre con la invitación
 * al horóscopo gratis. Sibila escribe un mensaje por signo y el pie; el texto
 * se guarda en `publicaciones_redes.contenido` y las láminas se dibujan en
 * /api/redes/carrusel?semana=AAAA-MM-DD&n=0..7.
 */
export const LAMINAS = 8;
const ANCHO = 1080;
const ALTO = 1350;
const PARES: [string, string][] = [
  ["aries", "tauro"],
  ["geminis", "cancer"],
  ["leo", "virgo"],
  ["libra", "escorpio"],
  ["sagitario", "capricornio"],
  ["acuario", "piscis"],
];

export interface ContenidoCarrusel {
  semana: string; // lunes AAAA-MM-DD
  titulo: string;
  texto: string; // pie de la publicación
  signos: Record<string, string>;
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function rangoSigno(s: Signo) {
  return `${s.inicio[1]} ${MESES[s.inicio[0] - 1]} – ${s.fin[1]} ${MESES[s.fin[0] - 1]}`;
}

function rangoSemana(lunes: string) {
  const formato = (f: string, conMes: boolean) => {
    const d = new Date(`${f}T12:00:00Z`);
    return `${d.getUTCDate()}${conMes ? ` de ${new Intl.DateTimeFormat("es-CO", { month: "long", timeZone: "UTC" }).format(d)}` : ""}`;
  };
  const domingo = sumarDias(lunes, 6);
  const mismoMes = lunes.slice(5, 7) === domingo.slice(5, 7);
  return `${formato(lunes, !mismoMes)} al ${formato(domingo, true)}`;
}

/** Semana que cubre el carrusel: la actual si es lunes a jueves; la siguiente de viernes a domingo. */
export function semanaDelCarrusel(hoy: string) {
  const lunes = lunesDe(hoy);
  const dia = Math.round((Date.parse(`${hoy}T12:00:00Z`) - Date.parse(`${lunes}T12:00:00Z`)) / 86_400_000);
  return dia >= 4 ? sumarDias(lunes, 7) : lunes;
}

const INSTRUCCION = `Tarea: escribir el carrusel semanal "Tu signo esta semana" de Arcana para Instagram y Facebook. Responde SOLO con un objeto JSON válido, sin texto antes ni después ni marcas de código:
{"titulo": "...", "texto": "...", "signos": {"aries": "...", "tauro": "...", "geminis": "...", "cancer": "...", "leo": "...", "virgo": "...", "libra": "...", "escorpio": "...", "sagitario": "...", "capricornio": "...", "acuario": "...", "piscis": "..."}}
- "signos": un mensaje por signo para la semana, de 110 a 160 caracteres, con la voz de Sibila: una idea concreta (en qué fijarse, qué cuidar, qué aprovechar), apoyada en los rasgos del signo. Tutea. Sin emojis.
- "titulo": máximo 40 caracteres, gancho para la portada (por ejemplo «Lo que la semana pide a tu signo»). Sin comillas ni punto final.
- "texto": el pie de la publicación, de 350 a 600 caracteres: invita a deslizar para encontrar el signo, a guardar la publicación para leerla durante la semana y a comentar el signo («Comenta tu signo y Sibila te responde»); menciona que el horóscopo diario es gratis en miarcana.com/horoscopo (escríbelo tal cual, sin https). Al final una línea con 5 hashtags en español que incluya #miarcana y #horoscopo. 1 o 2 emojis como mucho.
- Tono: cercano y sereno, sin predicciones absolutas ni promesas; nada de salud, dinero garantizado ni miedo. Español de Colombia neutro.`;

/** Pide a Sibila los textos del carrusel de la semana que empieza en `lunes`. */
export async function redactarCarrusel(lunes: string): Promise<ContenidoCarrusel> {
  const rasgos = SIGNOS.map((s) => `- ${s.id} (${s.nombre}, ${s.elemento}, regente ${s.regente}): ${s.rasgos.join(", ")}`).join("\n");
  const crudo = await generarTexto(`Semana del ${rangoSemana(lunes)}.\nSignos:\n${rasgos}`, INSTRUCCION, { effort: "medium", maxTokens: 3000, nivel: "estandar", idioma: "es" });
  const inicio = crudo.indexOf("{");
  const fin = crudo.lastIndexOf("}");
  let datos: { titulo?: unknown; texto?: unknown; signos?: Record<string, unknown> };
  try {
    datos = JSON.parse(crudo.slice(inicio, fin + 1));
  } catch {
    throw new Error("Sibila no devolvió JSON válido para el carrusel");
  }
  const signos: Record<string, string> = {};
  for (const s of SIGNOS) {
    const t = String(datos.signos?.[s.id] ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
    if (!t) throw new Error(`Falta el mensaje de ${s.nombre}`);
    signos[s.id] = t;
  }
  const titulo = String(datos.titulo ?? "").replace(/\s+/g, " ").trim().slice(0, 60) || "Tu signo esta semana";
  const texto = String(datos.texto ?? "").trim().slice(0, 2000);
  if (!texto) throw new Error("Falta el pie del carrusel");
  return { semana: lunes, titulo, texto, signos };
}

/** Contenido guardado del carrusel de esa semana (de cualquier red), si existe. */
export async function contenidoGuardado(admin: SupabaseClient<Database>, lunes: string): Promise<ContenidoCarrusel | null> {
  const { data } = await admin.from("publicaciones_redes").select("contenido").eq("tipo", "carrusel").eq("fecha", lunes).not("contenido", "is", null).limit(1).maybeSingle();
  const c = data?.contenido as ContenidoCarrusel | null | undefined;
  return c?.signos ? c : null;
}

function sitio() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://miarcana.com").replace(/\/$/, "");
}

/** URLs públicas de las láminas (Meta las descarga al publicar). */
export function urlsLaminas(lunes: string, version = "") {
  return Array.from({ length: LAMINAS }, (_, n) => `${sitio()}/api/redes/carrusel?semana=${lunes}&n=${n}${version ? `&v=${version}` : ""}`);
}

function Fondo({ semilla, children }: { semilla: number; children: React.ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative", background: "radial-gradient(800px 600px at 50% 0%, rgba(139,108,246,0.35), transparent 60%), radial-gradient(700px 500px at 100% 100%, rgba(217,180,90,0.16), transparent 60%), #0b0716", color: "#ece6f7", fontFamily: "Inter" }}>
      {estrellas(semilla, 70, ALTO).map((e, i) => (
        <div key={i} style={{ position: "absolute", left: e.x, top: e.y, width: e.r * 2, height: e.r * 2, borderRadius: 999, background: "#fff6d8", opacity: e.o * 0.7 }} />
      ))}
      {children}
    </div>
  );
}

function Cabecera({ derecha }: { derecha: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "64px 72px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse no usa next/image */}
        <img src={simboloDataUri()} width={56} height={56} alt="" />
        <span style={{ fontFamily: "Cormorant", fontSize: 44, color: "#f1d99a" }}>Arcana</span>
      </div>
      <span style={{ fontSize: 22, letterSpacing: 5, textTransform: "uppercase", color: "#b7a5ff" }}>{derecha}</span>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element -- ImageResponse no usa next/image */
/** Dibuja la lámina `n` (0 portada, 1–6 parejas de signos, 7 cierre) como PNG 1080×1350. */
export async function lamina(c: ContenidoCarrusel, n: number): Promise<Buffer> {
  const semilla = Number(c.semana.replace(/-/g, "")) + n;
  const moneda = (id: string, lado: number) => webpComoDataUri(join(process.cwd(), "public", "signos", `${id}.webp`), { lado });

  if (n === 0) {
    const monedas = await Promise.all(SIGNOS.map((s) => moneda(s.id, 150)));
    return png(
      <Fondo semilla={semilla}>
        <Cabecera derecha="Horóscopo semanal" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 70 }}>
          <span style={{ fontSize: 28, letterSpacing: 8, textTransform: "uppercase", color: "#b7a5ff" }}>{`Semana del ${rangoSemana(c.semana)}`}</span>
          <span style={{ marginTop: 22, fontFamily: "Cormorant", fontSize: c.titulo.length > 30 ? 84 : 100, lineHeight: 1.02, color: "#f1d99a", textAlign: "center", maxWidth: 940 }}>{c.titulo}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 30, marginTop: 70, padding: "0 190px" }}>
          {monedas.map((src, i) => (src ? <img key={i} src={src} width={150} height={150} alt="" style={{ filter: "drop-shadow(0 14px 26px rgba(0,0,0,0.6))" }} /> : null))}
        </div>
        <div style={{ position: "absolute", bottom: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <span style={{ fontSize: 34, color: "#ece6f7", padding: "16px 44px", borderRadius: 999, border: "2px solid rgba(241,217,154,0.6)" }}>Desliza y busca tu signo →</span>
        </div>
      </Fondo>,
      ALTO,
      ANCHO,
    );
  }

  if (n >= 1 && n <= PARES.length) {
    const par = PARES[n - 1].map((id) => SIGNOS.find((s) => s.id === id)!);
    const monedas = await Promise.all(par.map((s) => moneda(s.id, 230)));
    return png(
      <Fondo semilla={semilla}>
        <Cabecera derecha={`Semana del ${rangoSemana(c.semana)}`} />
        <div style={{ display: "flex", flexDirection: "column", gap: 44, padding: "70px 72px 0" }}>
          {par.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 40, padding: "34px 36px", borderRadius: 36, background: "rgba(21,15,38,0.82)", border: "1px solid rgba(241,217,154,0.25)" }}>
              {monedas[i] ? <img src={monedas[i]} width={230} height={230} alt="" style={{ filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.6))" }} /> : null}
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <span style={{ fontFamily: "Cormorant", fontSize: 70, lineHeight: 1, color: "#f1d99a" }}>{s.nombre}</span>
                <span style={{ marginTop: 6, fontSize: 24, color: "#b7a5ff", letterSpacing: 2 }}>{rangoSigno(s)}</span>
                <span style={{ marginTop: 18, fontSize: 31, lineHeight: 1.4, color: "#ece6f7" }}>{c.signos[s.id]}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", bottom: 56, left: 0, right: 0, display: "flex", justifyContent: "center", fontSize: 24, color: "#a89fc0" }}>{`${n} / ${PARES.length} · miarcana.com`}</div>
      </Fondo>,
      ALTO,
      ANCHO,
    );
  }

  return png(
    <Fondo semilla={semilla}>
      <Cabecera derecha="Horóscopo semanal" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "0 90px 120px", textAlign: "center" }}>
        <img src={simboloDataUri()} width={170} height={170} alt="" style={{ filter: "drop-shadow(0 0 40px rgba(139,108,246,0.7))" }} />
        <span style={{ marginTop: 40, fontFamily: "Cormorant", fontSize: 88, lineHeight: 1.05, color: "#f1d99a" }}>¿Y tu día de hoy?</span>
        <span style={{ marginTop: 22, fontSize: 36, lineHeight: 1.4, color: "#ece6f7" }}>Tu horóscopo diario y tu carta del día, gratis todos los días.</span>
        <span style={{ marginTop: 44, fontSize: 42, color: "#0b0716", background: "linear-gradient(135deg, #f1d99a, #d9b45a)", padding: "18px 52px", borderRadius: 999 }}>miarcana.com</span>
        <span style={{ marginTop: 40, fontSize: 32, color: "#b7a5ff" }}>Comenta tu signo y Sibila te responde</span>
      </div>
    </Fondo>,
    ALTO,
    ANCHO,
  );
}
/* eslint-enable @next/next/no-img-element */
