/**
 * Geocodificación de lugares con la API pública de Open-Meteo (sin clave).
 * Devuelve coordenadas y zona horaria IANA, necesarias para la carta.
 */
export interface Lugar {
  nombre: string;
  region?: string;
  pais?: string;
  latitud: number;
  longitud: number;
  zonaHoraria: string;
}

interface RespuestaOpenMeteo {
  results?: {
    name: string;
    admin1?: string;
    country?: string;
    latitude: number;
    longitude: number;
    timezone: string;
  }[];
}

export async function buscarLugares(texto: string, limite = 6): Promise<Lugar[]> {
  const q = texto.trim();
  if (q.length < 2) return [];
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", q);
  url.searchParams.set("count", String(limite));
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const json = (await res.json()) as RespuestaOpenMeteo;
  return (json.results ?? []).map((r) => ({
    nombre: r.name,
    region: r.admin1,
    pais: r.country,
    latitud: r.latitude,
    longitud: r.longitude,
    zonaHoraria: r.timezone,
  }));
}

export function etiquetaLugar(l: Lugar) {
  return [l.nombre, l.region, l.pais].filter(Boolean).join(", ");
}
