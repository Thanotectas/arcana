import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * La biblioteca de Sibila: manuales propios de Arcana, uno por práctica, que
 * se le pasan antes de cada lectura de ese tema (en un bloque del sistema que
 * queda en caché) para que lea con la misma tradición cada vez y no improvise.
 * Los manuales son Markdown en esta carpeta; para agregar uno, se crea el
 * archivo y se suma su nombre a TEMAS_MANUAL.
 */
export const TEMAS_MANUAL = ["huevo", "velas"] as const;
export type TemaManual = (typeof TEMAS_MANUAL)[number];

const cache = new Map<TemaManual, string>();

/** El manual del tema, o una cadena vacía si no se puede leer (la lectura sigue sin él). */
export function manual(tema: TemaManual): string {
  const guardado = cache.get(tema);
  if (guardado !== undefined) return guardado;
  let texto = "";
  try {
    texto = readFileSync(join(process.cwd(), "src/lib/conocimiento", `${tema}.md`), "utf8").trim();
  } catch (e) {
    console.error(`[conocimiento] no se pudo leer ${tema}.md:`, e instanceof Error ? e.message : e);
  }
  cache.set(tema, texto);
  return texto;
}
