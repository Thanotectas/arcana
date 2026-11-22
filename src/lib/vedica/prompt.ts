import type { Prompt } from "@/lib/lecturas/prompts";
import type { Idioma } from "@/lib/i18n/idiomas";
import { datoDeUsuario } from "@/lib/seguridad";
import { ANIOS_DASHA, NAKSHATRAS, NOMBRE_GRAHA, RASHIS, RASHIS_OCCIDENTAL, SENOR_RASHI, formatoGradoVedico, type IdGraha, type ManglikPersona, type ResultadoKundli } from "./calculo";
import type { IdKoota, PersonaMilan, ResultadoMilan } from "./milan";

/*
 * Prompts de la astrología védica. Las instrucciones van en español (como el
 * resto de productos); Sibila responde en el idioma de la persona.
 */

const rashi = (i: number) => `${RASHIS[i]} (${RASHIS_OCCIDENTAL[i]})`;
const graha = (id: IdGraha) => NOMBRE_GRAHA[id];

/** Reglas de contenido comunes a los dos productos. */
const REGLAS_JYOTISH =
  "Reglas firmes: nada de miedo ni fatalismo. Explica el Manglik dosha y cualquier dosha o puntaje bajo con calma, como tendencias que se trabajan con conciencia, y da consejos prácticos (conversación, paciencia, hábitos, decisiones compartidas). " +
  "Nunca recomiendes remedios pagados, gemas ni piedras, pujas, rituales, mantras por encargo, ayunos, donaciones a templos ni «matrimonios simbólicos» (kumbh vivah); si el tema sale, di con suavidad que no hace falta comprar nada y que lo que más ayuda es lo práctico. " +
  "Nunca digas que una unión está «condenada», «prohibida» o «destinada al fracaso», ni anuncies muertes, enfermedades graves, divorcios o desgracias. No digas que la persona necesita consultar a un pandit.";

const TRADICION_KUNDLI =
  "Lees como una jyotishi cálida y clara de la tradición védica (Jyotish, escuela de Parashara): zodíaco sideral con ayanamsa Lahiri, casas de signo entero contadas desde el Lagna, nakshatras y Vimshottari dasha. " +
  "Usa los términos sánscritos estándar (Lagna, rashi, bhava, graha, nakshatra, pada, mahadasha, antardasha, dosha) y explícalos con palabras de todos los días la primera vez. " +
  "Bases: el Lagna da el cuerpo y el temperamento; la Luna (rashi y nakshatra) la mente y las emociones, central en Jyotish; los regentes de casa y las dignidades (exaltado, debilitado, signo propio) matizan cada graha; Rahu y Ketu muestran deseo y desapego; el mahadasha marca qué graha gobierna cada etapa y el antardasha el tono de los meses. " +
  "No mezcles astrología occidental tropical. " +
  REGLAS_JYOTISH;

const TRADICION_MILAN =
  "Lees como una jyotishi cálida y clara de la tradición védica: Ashtakoot Guna Milan (Varna 1, Vashya 2, Tara 3, Yoni 4, Graha Maitri 5, Gana 6, Bhakoot 7, Nadi 8; total 36) calculado desde el nakshatra y el rashi de la Luna de cada persona, con zodíaco sideral Lahiri. " +
  "La tradición considera aceptable más de 18 gunas, bueno desde 25 y excelente desde 33, pero el puntaje es un mapa de afinidades, no un veredicto: explícalo, no lo uses como sentencia. " +
  "Los términos sánscritos se dicen y se explican con palabras sencillas. " +
  REGLAS_JYOTISH;

function describirManglik(m: ManglikPersona) {
  const desde = [
    m.casaDesdeLagna !== null ? `Mangal en la casa ${m.casaDesdeLagna} desde el Lagna${m.desdeLagna ? " (casa Manglik)" : ""}` : "Lagna desconocido",
    `casa ${m.casaDesdeLuna} desde la Luna${m.desdeLuna ? " (casa Manglik)" : ""}`,
  ].join(", ");
  const estado = m.estado === "si" ? "Manglik" : m.estado === "parcial" ? "Manglik parcial (solo desde una referencia)" : "no Manglik";
  return `${estado}: ${desde}${m.atenuado ? "; Mangal en signo propio o exaltado, lo que la tradición considera atenuante" : ""}`;
}

/** Resumen en texto plano del kundli para el modelo. */
export function resumenKundli(r: ResultadoKundli, nombre: string, entrada: Record<string, unknown>) {
  const l: string[] = [];
  l.push(`Nombre: ${datoDeUsuario(nombre, 80)}`);
  l.push(`Nacimiento: ${String(entrada.fecha ?? "")} ${r.horaDesconocida ? "(hora desconocida: se usó el mediodía)" : String(entrada.hora ?? "")} en ${datoDeUsuario(entrada.lugar, 120)}`);
  l.push(`Ayanamsa Lahiri: ${formatoGradoVedico(r.ayanamsa)}`);
  if (r.lagna) {
    l.push(`Lagna: ${rashi(r.lagna.rashi)} ${formatoGradoVedico(r.lagna.grado)}, nakshatra ${NAKSHATRAS[r.lagna.nakshatra]} pada ${r.lagna.pada}`);
  } else {
    l.push(`Lagna desconocido: las casas se cuentan desde la Luna (Chandra Lagna en ${rashi(r.rashiCasa1)}).`);
  }
  l.push(`Rashi lunar: ${rashi(r.luna.rashi)}; nakshatra lunar: ${NAKSHATRAS[r.luna.nakshatra]} pada ${r.luna.pada} (regente ${graha(r.luna.senorNakshatra)})`);
  l.push(`Grahas (casas de signo entero desde ${r.lagna ? "el Lagna" : "la Luna"}):`);
  for (const g of r.grahas) {
    const notas = [g.retrogrado && g.id !== "rahu" && g.id !== "ketu" ? "retrógrado" : "", g.dignidad ?? ""].filter(Boolean).join(", ");
    l.push(`- ${graha(g.id)}: ${rashi(g.rashi)} ${formatoGradoVedico(g.grado)}, casa ${g.casa}, nakshatra ${NAKSHATRAS[g.nakshatra]} pada ${g.pada}${notas ? ` (${notas})` : ""}`);
  }
  // Regentes de las casas clave, para que la lectura sea concreta.
  const regente = (casa: number) => {
    const s = (r.rashiCasa1 + casa - 1) % 12;
    const senor = SENOR_RASHI[s];
    const donde = r.grahas.find((g) => g.id === senor);
    return `casa ${casa} (${RASHIS[s]}) regida por ${graha(senor)}${donde ? `, que está en la casa ${donde.casa}` : ""}`;
  };
  l.push(`Regentes clave: ${[1, 2, 4, 5, 7, 9, 10, 11].map(regente).join("; ")}`);
  const b = r.dasha.balance;
  l.push(`Vimshottari dasha: al nacer quedaban ${b.anios} años, ${b.meses} meses y ${b.dias} días del mahadasha de ${graha(b.senor)}.`);
  l.push(`Mahadashas: ${r.dasha.mahadashas.map((m) => `${graha(m.senor)} ${m.inicio.slice(0, 4)}–${m.fin.slice(0, 4)} (${ANIOS_DASHA[m.senor]} años)`).join("; ")}`);
  l.push(`Fecha de la lectura: ${r.fechaCalculo.slice(0, 10)}.`);
  if (r.dasha.actual) {
    const a = r.dasha.actual;
    l.push(`Mahadasha actual: ${graha(a.maha.senor)} (${a.maha.inicio} a ${a.maha.fin}); antardasha actual: ${graha(a.antar.senor)} (${a.antar.inicio} a ${a.antar.fin}).`);
    if (r.dasha.proximos.length) l.push(`Próximos antardashas: ${r.dasha.proximos.map((p) => `${graha(p.maha)}/${graha(p.senor)} desde ${p.inicio}`).join("; ")}`);
  }
  l.push(`Manglik: ${describirManglik(r.manglik)}`);
  return l.join("\n");
}

export function promptKundli(entrada: Record<string, unknown>, resultado: Record<string, unknown>, idioma: Idioma): Prompt {
  const r = resultado as unknown as ResultadoKundli;
  const nombre = String(entrada.nombre ?? r.nombre ?? "");
  return {
    usuario:
      `Interpreta este kundli védico (carta natal sideral).\n\n${resumenKundli(r, nombre, entrada)}\n\n` +
      `Estructura: ## Tu Lagna y tu naturaleza (el signo ascendente, su regente y dónde está, y cómo se nota en el día a día${r.lagna ? "" : "; aclara en una frase que sin hora de nacimiento se lee desde la Luna"}), ` +
      `## Tu Luna: rashi y nakshatra (la mente y las emociones; la deidad, el símbolo y las cualidades del nakshatra y de su pada), ` +
      `## Los grahas en tus bhavas (los 4 o 5 grahas más significativos por casa, dignidad o conjunción, con ejemplos concretos; no los listes todos), ` +
      `## Rahu y Ketu: tu eje de crecimiento, ` +
      `## La etapa que vives (${r.dasha.actual ? "el mahadasha y el antardasha actuales con sus fechas, y qué temas activan según la casa y el signo de esos grahas" : "el dasha según las fechas"}), ` +
      `## Lo que viene (los próximos antardashas y, si cae en los próximos años, el cambio de mahadasha; con fechas y en qué áreas), ` +
      `## Amor y matrimonio (casa 7, su regente y Shukra; el estado Manglik explicado con calma, como tendencia y con un consejo práctico), ` +
      `## Trabajo, dinero y propósito (casas 10, 2, 11 y 9 con sus regentes), ` +
      `## Lo que tu kundli anuncia (de 3 a 5 predicciones concretas, cada una en un párrafo corto que empieza con el área en negrita —**Amor**, **Dinero y trabajo**, **Familia**, **Tu energía**, **Cambios y viajes**—; usa solo las áreas que la carta sostenga, átalas a los dashas y dales plazos amplios), ` +
      `## Síntesis y un consejo práctico. ` +
      `Usa el nombre de la persona y las fechas de los dashas tal como vienen. Extensión: 1100 a 1400 palabras.`,
    sistemaExtra: TRADICION_KUNDLI,
    opciones: { idioma, effort: "medium", maxTokens: 4500, nivel: "premium" },
  };
}

function resumenPersona(p: PersonaMilan, rol: string) {
  return (
    `${rol}: ${datoDeUsuario(p.nombre, 80)}${p.horaDesconocida ? " (hora de nacimiento desconocida, se usó el mediodía)" : ""}\n` +
    `- Luna en ${rashi(p.rashi)} ${formatoGradoVedico(p.gradoLuna)}, nakshatra ${NAKSHATRAS[p.nakshatra]} pada ${p.pada}; regente del rashi: ${graha(p.senorRashi)}\n` +
    `- Varna ${p.varna}, Vashya ${p.vashya}, Yoni ${p.yoni}, Gana ${p.gana}, Nadi ${p.nadi}\n` +
    `- ${describirManglik(p.manglik)}`
  );
}

const NOMBRE_KOOTA: Record<IdKoota, string> = {
  varna: "Varna (trabajo y visión, máx. 1)",
  vashya: "Vashya (atracción e influencia mutua, máx. 2)",
  tara: "Tara (fortuna y bienestar, máx. 3)",
  yoni: "Yoni (armonía física e instintiva, máx. 4)",
  graha_maitri: "Graha Maitri (amistad de las mentes, máx. 5)",
  gana: "Gana (temperamento, máx. 6)",
  bhakoot: "Bhakoot (vínculo emocional, familia y prosperidad, máx. 7)",
  nadi: "Nadi (salud y constitución, máx. 8)",
};

const EXCEPCION: Record<ResultadoMilan["excepciones"][number], string> = {
  nadi_misma_rashi: "mismo rashi lunar con distinto nakshatra (anula el Nadi dosha según los textos)",
  nadi_mismo_nakshatra_otro_pada: "mismo nakshatra con distinto pada (anula el Nadi dosha según los textos)",
  bhakoot_mismo_senor: "los dos rashis lunares tienen el mismo regente (suaviza el Bhakoot dosha)",
  bhakoot_senores_amigos: "los regentes de los dos rashis lunares son amigos (suaviza el Bhakoot dosha)",
};

/** Resumen en texto plano del milan para el modelo. */
export function resumenMilan(r: ResultadoMilan) {
  const l: string[] = [];
  l.push(resumenPersona(r.a, "Persona A (lado del novio en las tablas clásicas)"));
  l.push(resumenPersona(r.b, "Persona B (lado de la novia en las tablas clásicas)"));
  l.push("Ashtakoot:");
  for (const k of r.kootas) l.push(`- ${NOMBRE_KOOTA[k.id]}: ${k.puntos} de ${k.maximo}`);
  l.push(`Total: ${r.total} de 36 gunas (nivel: ${r.nivel}).`);
  l.push(`Doshas tradicionales presentes: ${r.doshas.length ? r.doshas.map((d) => `${d} dosha`).join(", ") : "ninguno"}.`);
  if (r.excepciones.length) l.push(`Excepciones clásicas que aplican: ${r.excepciones.map((e) => EXCEPCION[e]).join("; ")}.`);
  const manglik = { ninguno: "ninguno es Manglik", ambos: "los dos son Manglik (la tradición lo considera equilibrado)", solo_a: "solo la persona A es Manglik", solo_b: "solo la persona B es Manglik" }[r.manglik];
  l.push(`Manglik en la pareja: ${manglik}.`);
  return l.join("\n");
}

export function promptKundliMilan(entrada: Record<string, unknown>, resultado: Record<string, unknown>, idioma: Idioma): Prompt {
  void entrada;
  const r = resultado as unknown as ResultadoMilan;
  const a = datoDeUsuario(r.a?.nombre, 80) || "A";
  const b = datoDeUsuario(r.b?.nombre, 80) || "B";
  return {
    usuario:
      `Interpreta este kundli milan (Ashtakoot Guna Milan) entre dos personas.\n\n${resumenMilan(r)}\n\n` +
      `Estructura: ## Sus Lunas (quién es cada uno por su rashi y nakshatra lunar, tres o cuatro líneas cada uno), ` +
      `## Sus ${r.total} gunas (qué significa este total, con calma: un mapa de afinidades, no una sentencia), ` +
      `## Koota por koota (los ocho, un párrafo corto cada uno con su puntaje: qué mide y cómo se siente en la vida real; en los kootas bajos, una sugerencia práctica concreta), ` +
      `## Manglik (el estado de cada uno, explicado sin miedo, como intensidad y empuje que se canalizan; si ambos lo son, que la tradición lo ve equilibrado), ` +
      `## Lo que se anuncia para esta relación (de 3 a 4 predicciones concretas sobre la convivencia, la familia y las etapas que vienen, con plazos amplios y apoyadas en los kootas), ` +
      `## Un consejo para ${a}, otro para ${b} y una síntesis cálida. ` +
      `Usa los nombres de las dos personas. Si hay doshas, menciona las excepciones clásicas que aplican y trátalos como áreas de atención, nunca como impedimento. Extensión: 800 a 1000 palabras.`,
    sistemaExtra: TRADICION_MILAN,
    opciones: { idioma, effort: "medium", maxTokens: 3500, nivel: "premium" },
  };
}
