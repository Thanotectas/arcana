import { getPerfil, circuloActivo } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { ASISTENTE, NOMBRE_ASISTENTE } from "@/lib/asistente";
import { CHAT_VISITAS } from "@/lib/chat-visitas";
import { Asistente } from "./Asistente";
import { ChatVisitante } from "./ChatVisitante";

/** Monta el chat de Sibila: el de la cuenta con sesión, y el de visitantes (gratis, con tope diario) sin ella. */
export async function AsistenteFlotante() {
  const perfil = await getPerfil();
  if (!perfil) return <ChatVisitante nombre={NOMBRE_ASISTENTE} tope={CHAT_VISITAS.porPersonaDia} />;
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
