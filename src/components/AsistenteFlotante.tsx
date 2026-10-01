import { getPerfil, circuloActivo } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { ASISTENTE, NOMBRE_ASISTENTE } from "@/lib/asistente";
import { Asistente } from "./Asistente";

/** Monta el chat de Sibila solo para personas con sesión. */
export async function AsistenteFlotante() {
  const perfil = await getPerfil();
  if (!perfil) return null;
  const supabase = await createClient();
  const { data: hoy } = await supabase.rpc("mensajes_asistente_hoy");
  return (
    <Asistente
      nombre={NOMBRE_ASISTENTE}
      gratisPorDia={ASISTENTE.gratisPorDia}
      circuloPorDia={ASISTENTE.circuloPorDia}
      costo={ASISTENTE.costo}
      enCirculo={circuloActivo(perfil)}
      ilimitado={perfil.ilimitado}
      usadosHoy={typeof hoy === "number" ? hoy : 0}
    />
  );
}
