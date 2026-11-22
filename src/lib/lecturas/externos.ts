import "server-only";
import type { TipoLectura } from "@/lib/creditos";
import type { Idioma } from "@/lib/i18n/idiomas";
import type { Prompt } from "./prompts";
import { promptAbjad } from "@/lib/abjad/prompt";
import { promptGeomancia } from "@/lib/geomancia/prompt";
import { promptIskambil } from "@/lib/iskambil/prompt";
import { promptKundli, promptKundliMilan } from "@/lib/vedica/prompt";
import { promptMarsella } from "@/lib/marsella/prompt";
import { promptWeton, promptWetonJodoh } from "@/lib/weton/prompt";

/**
 * Productos con módulo propio (src/lib/<producto>/prompt.ts): cada uno arma su propio mensaje para Sibila.
 * construirPrompt los consulta antes que los tipos de siempre.
 */
type ConstructorPrompt = (entrada: Record<string, unknown>, resultado: Record<string, unknown>, idioma: Idioma) => Prompt | Promise<Prompt>;

export const PROMPTS_EXTERNOS: Partial<Record<TipoLectura, ConstructorPrompt>> = {
  kundli: promptKundli,
  kundli_milan: promptKundliMilan,
  weton: promptWeton,
  weton_jodoh: promptWetonJodoh,
  abjad: promptAbjad,
  geomancia: promptGeomancia,
  marsella: promptMarsella,
  iskambil: promptIskambil,
};
