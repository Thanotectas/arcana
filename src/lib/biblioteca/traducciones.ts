import "server-only";
import { createHash } from "node:crypto";
import { generarTexto } from "@/lib/ia";
import { IDIOMA_PARA_IA, type Idioma } from "@/lib/i18n/idiomas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";
import { BIBLIOTECA, type EntradaBiblioteca, type Ficha } from "./fichas";

/**
 * Las fichas de El Arcano se escriben en español y se traducen una sola vez a cada idioma con el modelo estándar
 * (una traducción torpe es lo que hace desconfiar). Se guardan en biblioteca_traducciones con la huella del texto en
 * español: si la ficha cambia, se traduce de nuevo. Mientras se traduce, quien entra ve el español.
 */

/** Huella del texto en español de una ficha. */
export function versionFicha(e: EntradaBiblioteca) {
  return createHash("sha1").update(JSON.stringify(e.textos.es)).digest("hex").slice(0, 16);
}

/** Una traducción válida tiene la misma forma que el original (mismas secciones, párrafos, símbolos y preguntas). */
function mismaForma(o: Ficha, t: unknown): t is Ficha {
  if (!t || typeof t !== "object") return false;
  const f = t as Ficha;
  const textos = (x: unknown) => typeof x === "string" && x.trim().length > 0;
  return (
    [f.titulo, f.descripcion, f.nombres, f.entrada, f.cta?.titulo, f.cta?.texto, f.cta?.boton].every(textos) &&
    Array.isArray(f.secciones) &&
    f.secciones.length === o.secciones.length &&
    f.secciones.every((s, i) => textos(s.titulo) && Array.isArray(s.parrafos) && s.parrafos.length === o.secciones[i].parrafos.length && s.parrafos.every(textos)) &&
    Array.isArray(f.preguntas) &&
    f.preguntas.length === o.preguntas.length &&
    f.preguntas.every((p) => textos(p.p) && textos(p.r)) &&
    (!o.simbolos || (textos(f.simbolos?.titulo) && textos(f.simbolos?.intro) && f.simbolos?.lista.length === o.simbolos.lista.length && f.simbolos.lista.every((x) => textos(x.s) && textos(x.d))))
  );
}

/**
 * Devuelve la traducción con las claves del original: a veces el modelo traduce también los nombres de los campos
 * («descripcion» → «descricao»), así que cada valor se toma por su clave o, si no está, por su posición.
 */
function alinear(original: unknown, traducido: unknown): unknown {
  if (typeof original === "string") return typeof traducido === "string" ? traducido : original;
  if (Array.isArray(original)) return Array.isArray(traducido) ? original.map((o, i) => alinear(o, traducido[i])) : traducido;
  if (original && typeof original === "object") {
    if (!traducido || typeof traducido !== "object" || Array.isArray(traducido)) return traducido;
    const t = traducido as Record<string, unknown>;
    const valores = Object.values(t);
    return Object.fromEntries(Object.keys(original).map((k, i) => [k, alinear((original as Record<string, unknown>)[k], k in t ? t[k] : valores[i])]));
  }
  return traducido;
}

/** Traduce una ficha con el modelo; null si la respuesta no sirve. */
async function traducir(e: EntradaBiblioteca, idioma: Idioma): Promise<Ficha | null> {
  const original = e.textos.es;
  const r = await generarTexto(
    `Traduce al ${IDIOMA_PARA_IA[idioma]} todos los textos de esta ficha de El Arcano de Sibila (la sección de tradiciones del mundo de Arcana). Devuelve SOLO el mismo JSON, con las mismas claves SIN traducir (titulo, descripcion, nombres, entrada, secciones, parrafos, simbolos, lista, s, d, preguntas, p, r, cta, texto, boton) y la misma cantidad de secciones, párrafos, símbolos y preguntas, sin comentarios ni markdown.\n\n${JSON.stringify(original)}`,
    [
      "Eres traductora nativa y escritora. Traduce el sentido con naturalidad, como lo escribiría desde cero un hablante nativo que conoce y respeta estas tradiciones: desde adentro de la tradición, cálido y documental.",
      "Conserva los datos, las fechas, los nombres propios y las palabras en su lengua original (nazar, khamsa, ruda, limpia, maşallah, ما شاء الله…): cuando sea útil, explícalas con su nombre local en el idioma de destino.",
      "Si la ficha menciona «nuestra tierra» o expresiones propias de Latinoamérica, adáptalas para que se entiendan desde el idioma de destino (por ejemplo, «en Latinoamérica»).",
      "No agregues ni quites información; no prometas resultados, salud ni protección. El título y la descripción son los que se leen en Google: que suenen naturales en ese idioma.",
    ].join("\n"),
    { effort: "low", maxTokens: 16000, nivel: "estandar", idioma },
  );
  try {
    const json = alinear(original, JSON.parse(r.slice(r.indexOf("{"), r.lastIndexOf("}") + 1)) as unknown);
    if (mismaForma(original, json)) return json;
    console.error(`[arcano] ${e.slug} al ${idioma}: forma distinta`, JSON.stringify(json).slice(0, 300));
  } catch (err) {
    console.error(`[arcano] ${e.slug} al ${idioma}: JSON inválido (${err instanceof Error ? err.message : err}) ${r.length} caracteres:`, r.slice(0, 300));
  }
  return null;
}

/** Las traducciones ya hechas (y al día) de varias fichas en un idioma. */
export async function traduccionesGuardadas(idioma: Idioma, entradas: EntradaBiblioteca[] = BIBLIOTECA): Promise<Map<string, Ficha>> {
  const salida = new Map<string, Ficha>();
  if (idioma === "es" || !entradas.length) return salida;
  const { data } = await getSupabaseAdmin()
    .from("biblioteca_traducciones")
    .select("slug, version, ficha")
    .eq("idioma", idioma)
    .in("slug", entradas.map((e) => e.slug));
  for (const fila of data ?? []) {
    const e = entradas.find((x) => x.slug === fila.slug);
    if (e && fila.ficha && fila.version === versionFicha(e) && mismaForma(e.textos.es, fila.ficha)) salida.set(fila.slug, fila.ficha as unknown as Ficha);
  }
  return salida;
}

/** La ficha en el idioma de quien entra: la escrita a mano, la ya traducida o, mientras tanto, la de español. */
export async function fichaTraducida(e: EntradaBiblioteca, idioma: Idioma): Promise<{ ficha: Ficha; falta: boolean }> {
  if (idioma === "es") return { ficha: e.textos.es, falta: false };
  const propia = e.textos[idioma];
  if (propia) return { ficha: propia, falta: false };
  const guardada = (await traduccionesGuardadas(idioma, [e])).get(e.slug);
  return guardada ? { ficha: guardada, falta: false } : { ficha: e.textos.es, falta: true };
}

/**
 * Traduce y guarda las fichas que faltan en un idioma (se llama en segundo plano, con after()). Cada ficha se reserva
 * antes de traducir para que dos visitas no la traduzcan a la vez; una reserva de más de 10 minutos se da por caída.
 */
export async function traducirFaltantes(idioma: Idioma, entradas: EntradaBiblioteca[]) {
  if (idioma === "es") return;
  const admin = getSupabaseAdmin();
  await Promise.all(
    entradas.map(async (e) => {
      if (e.textos[idioma]) return;
      const version = versionFicha(e);
      const { data: fila } = await admin.from("biblioteca_traducciones").select("version, ficha, creado_en").eq("slug", e.slug).eq("idioma", idioma).maybeSingle();
      if (fila?.version === version && fila.ficha) return;
      if (fila && !fila.ficha && fila.version === version && Date.now() - new Date(fila.creado_en).getTime() < 10 * 60_000) return;
      // Reserva (si otra visita la tomó en el mismo instante, el filtro por creado_en deja pasar solo a una).
      if (fila) {
        const { data: tomada } = await admin
          .from("biblioteca_traducciones")
          .update({ version, ficha: null, creado_en: new Date().toISOString() })
          .eq("slug", e.slug)
          .eq("idioma", idioma)
          .eq("creado_en", fila.creado_en)
          .select("slug");
        if (!tomada?.length) return;
      } else {
        const { error } = await admin.from("biblioteca_traducciones").insert({ slug: e.slug, idioma, version });
        if (error) return;
      }
      try {
        const ficha = (await traducir(e, idioma)) ?? (await traducir(e, idioma));
        if (ficha) await admin.from("biblioteca_traducciones").update({ ficha: ficha as unknown as Json, creado_en: new Date().toISOString() }).eq("slug", e.slug).eq("idioma", idioma);
        else console.error(`[arcano] la traducción de ${e.slug} al ${idioma} no tuvo la forma esperada`);
      } catch (err) {
        console.error(`[arcano] traducción de ${e.slug} al ${idioma}:`, err instanceof Error ? err.message : err);
      }
    }),
  );
}
