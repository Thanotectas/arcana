import type { ComponentType } from "react";
import type { TipoLectura } from "@/lib/creditos";
import type { Idioma } from "@/lib/i18n/idiomas";
import { VistaKundli } from "./VistaKundli";
import { VistaKundliMilan } from "./VistaKundliMilan";
import { VistaWeton } from "./VistaWeton";
import { VistaWetonJodoh } from "./VistaWetonJodoh";
import { VistaAbjad } from "./VistaAbjad";
import { VistaGeomancia } from "./VistaGeomancia";
import { VistaMarsella } from "./VistaMarsella";
import { VistaIskambil } from "./VistaIskambil";

/** Vista del resultado de cada producto con módulo propio (la lectura escrita va debajo, como en todos). */
export type PropsVista = { entrada: Record<string, unknown>; resultado: Record<string, unknown>; idioma: Idioma };

export const VISTAS_EXTERNAS: Partial<Record<TipoLectura, ComponentType<PropsVista>>> = {
  kundli: VistaKundli,
  kundli_milan: VistaKundliMilan,
  weton: VistaWeton,
  weton_jodoh: VistaWetonJodoh,
  abjad: VistaAbjad,
  geomancia: VistaGeomancia,
  marsella: VistaMarsella,
  iskambil: VistaIskambil,
};
