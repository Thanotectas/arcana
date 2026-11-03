/**
 * Facebook limita los enlaces en publicaciones y comentarios orgánicos de la
 * página (2 al mes sin Meta One, desde nov 2026). Todo lo que Arcana publica o
 * comenta en Facebook pasa por aquí: las direcciones se dicen en palabras
 * («miarcana punto com») y Facebook no las cuenta como enlace. Los mensajes
 * directos (Messenger) y las demás redes no cambian.
 */
const SECCIONES: Record<string, string> = {
  huevo: "Limpia con huevo",
  "carta-astral": "Carta astral",
  sinastria: "Sinastría",
  compatibilidad: "Compatibilidad",
  horoscopo: "Horóscopo",
  luna: "Calendario lunar",
  rituales: "Rituales",
  velas: "Velas",
  tarot: "Tarot",
  numerologia: "Numerología",
  "matriz-del-destino": "Matriz del destino",
  creditos: "Créditos",
  vivo: "En vivo",
  pendulo: "Péndulo",
  chocolate: "Chocolate",
  cafe: "Café",
};
/** Enlaces cortos que solo marcan el origen (miarcana.com/fb/huevo → huevo). */
const ORIGENES = new Set(["fb", "ig", "yt", "tt", "wa", "tg", "r", "c"]);

export function sinEnlaces(texto: string): string {
  return texto
    .replace(/(?:https?:\/\/)?(?:www\.)?miarcana\.com((?:\/[\w\-#]*)*)/gi, (_, ruta: string) => {
      const partes = (ruta ?? "").split(/[/#]/).filter(Boolean);
      while (partes.length && ORIGENES.has(partes[0].toLowerCase())) partes.shift();
      const seccion = partes[0]?.toLowerCase();
      if (seccion === "grupo") return "nuestro grupo de Facebook «Carta Astral y Tarot en Español · Arcana»";
      const nombre = seccion ? SECCIONES[seccion] : undefined;
      return nombre ? `miarcana punto com (sección ${nombre})` : "miarcana punto com";
    })
    .replace(/(?:https?:\/\/)?t\.me\/(\w+)/gi, "Telegram (@$1)")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([.,;:!?)])/g, "$1");
}
