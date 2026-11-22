/**
 * Zodiaco sideral (astrología védica): ayanamsa de Lahiri, rashi lunar y nakshatra.
 *
 * Lahiri (Chitrapaksha) es la ayanamsa oficial de la India (Comité de Reforma del Calendario, 1956):
 * 23°15′00.658″ el 21 de marzo de 1956 a 0 h TT (JD 2435553.5). Ese valor incluía la nutación; la ayanamsa
 * media en esa fecha es 23.245524743° (el mismo dato de partida que usa Swiss Ephemeris). Desde ahí avanza con la
 * precesión general en longitud (IAU 1976, Lieske): p = 5029.0966″·T + 1.11113″·T² − 0.000006″·T³, con T en
 * siglos julianos desde J2000. Da 23.8571° en J2000 (23°51′26″) y unos 50.3″ por año.
 *
 * Las longitudes tropicales del motor (efemerides.ts) son aparentes (llevan la nutación), así que la longitud
 * sideral es: aparente − nutación en longitud − ayanamsa media = aparente − ayanamsa «verdadera».
 */
import { nutation } from "astronomia";
import { diasJulianos } from "@/lib/astro/efemerides";

const R2D = 180 / Math.PI;
const JD_1956 = 2435553.5;
const AYANAMSA_MEDIA_1956 = 23.245524743;

function norm360(g: number) {
  return ((g % 360) + 360) % 360;
}

/** Precesión general acumulada en longitud desde J2000 (segundos de arco). */
function precesionDesdeJ2000(jde: number) {
  const t = (jde - 2451545.0) / 36525;
  return 5029.0966 * t + 1.11113 * t * t - 0.000006 * t * t * t;
}

/** Ayanamsa media de Lahiri (grados) para un día juliano de efemérides (TT). */
export function ayanamsaLahiriMedia(jde: number) {
  return AYANAMSA_MEDIA_1956 + (precesionDesdeJ2000(jde) - precesionDesdeJ2000(JD_1956)) / 3600;
}

/** Ayanamsa de Lahiri «verdadera» (con nutación en longitud), la que se resta a una longitud aparente. */
export function ayanamsaLahiri(fechaUtc: Date) {
  const { jde } = diasJulianos(fechaUtc);
  const [dPsi] = nutation.nutation(jde);
  return ayanamsaLahiriMedia(jde) + dPsi * R2D;
}

/** Longitud sideral (Lahiri) a partir de una longitud tropical aparente. */
export function longitudSideral(longitudTropical: number, fechaUtc: Date) {
  return norm360(longitudTropical - ayanamsaLahiri(fechaUtc));
}

/** Nombres sánscritos de los 12 rashis, en el orden del zodiaco (Mesha = Aries). */
export const RASHIS = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];

/** Los 27 nakshatras (13°20′ cada uno desde 0° de Mesha sideral). */
export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

export const NAKSHATRAS_HI = [
  "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा",
  "मघा", "पूर्व फाल्गुनी", "उत्तर फाल्गुनी", "हस्त", "चित्रा", "स्वाति", "विशाखा", "अनुराधा", "ज्येष्ठा",
  "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्व भाद्रपद", "उत्तर भाद्रपद", "रेवती",
];

const ANCHO_NAKSHATRA = 360 / 27; // 13°20′

/** Nakshatra (índice 0-26) y pada (1-4) de una longitud sideral. */
export function nakshatraDeLongitud(longitudSid: number) {
  const l = norm360(longitudSid);
  const indice = Math.min(26, Math.floor(l / ANCHO_NAKSHATRA));
  const dentro = l - indice * ANCHO_NAKSHATRA;
  const pada = Math.min(4, Math.floor(dentro / (ANCHO_NAKSHATRA / 4)) + 1);
  return { indice, pada };
}
