/**
 * Tipos de la base de datos (espejo de supabase/migrations/).
 * Cuando el esquema crezca, regenerar con:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type PerfilRow = {
  id: string;
  nombre: string | null;
  fecha_nacimiento: string | null;
  hora_nacimiento: string | null;
  lugar_nacimiento: string | null;
  latitud: number | null;
  longitud: number | null;
  zona_horaria: string | null;
  creditos: number;
  ilimitado: boolean;
  idioma: string;
  codigo_invitacion: string | null;
  invitado_por: string | null;
  invitacion_premiada: boolean;
  circulo_hasta: string | null;
  bienvenida_dada: boolean;
  recibe_correos: boolean;
  /** Red por la que llegó al registrarse (youtube, instagram, tiktok, …); null si no se supo. */
  origen: string | null;
  origen_detalle: string | null;
  creado_en: string;
  actualizado_en: string;
};

type CorreoRow = {
  id: number;
  usuario_id: string;
  tipo: string;
  asunto: string;
  estado: string;
  id_proveedor: string | null;
  detalle: string | null;
  creado_en: string;
};

type MovimientoRow = {
  id: number;
  usuario_id: string;
  cantidad: number;
  motivo: string;
  referencia: string | null;
  creado_en: string;
};

type LecturaRow = {
  id: string;
  usuario_id: string;
  tipo: string;
  titulo: string;
  entrada: Json;
  resultado: Json;
  interpretacion: string | null;
  creditos_usados: number;
  estado: "pendiente" | "generando" | "lista" | "error";
  generando_desde: string | null;
  creado_en: string;
};

type OrdenRow = {
  id: string;
  usuario_id: string;
  paquete: string;
  creditos: number;
  monto_centavos: number;
  moneda: string;
  referencia: string;
  estado: string;
  transaccion_id: string | null;
  metodo_pago: string | null;
  /** Pago real hecho para probar el flujo; fuera de las métricas de ventas. */
  es_prueba: boolean;
  /** Código de oferta aplicado (créditos extra ya sumados en `creditos`). */
  codigo: string | null;
  /** Red de la cookie de origen al comprar; null si no la había. */
  origen: string | null;
  creado_en: string;
  actualizado_en: string;
};

type CodigoOfertaRow = {
  codigo: string;
  creditos_extra: number;
  paquetes: string[] | null;
  cupo: number | null;
  vence_en: string | null;
  activo: boolean;
  nota: string | null;
  creado_en: string;
};

type PreguntaRow = {
  id: string;
  lectura_id: string;
  usuario_id: string;
  pregunta: string;
  respuesta: string | null;
  estado: string;
  creditos_usados: number;
  creado_en: string;
};

type MensajeAsistenteRow = {
  id: string;
  usuario_id: string;
  rol: "persona" | "asistente";
  contenido: string;
  estado: "pendiente" | "lista" | "error";
  creditos_usados: number;
  creado_en: string;
};

type MensajeDiarioRow = {
  id: number;
  usuario_id: string;
  fecha: string;
  idioma: string;
  contenido: string;
  creado_en: string;
};

type HoroscopoRow = {
  id: number;
  signo: string;
  fecha: string;
  idioma: string;
  contenido: string;
  creado_en: string;
};

type Insertable<T, Opcionales extends keyof T> = Omit<T, Opcionales> & Partial<Pick<T, Opcionales>>;

type SuscripcionPushRow = {
  id: number;
  usuario_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  idioma: string;
  agente: string | null;
  creado_en: string;
};

type PublicacionProgramadaRow = {
  id: string;
  semana: string;
  fecha: string;
  tipo: "guia" | "pregunta" | "producto" | "oferta" | "luna" | "signo" | "reflexion";
  redes: string[];
  etiqueta: string;
  titulo: string;
  extracto: string;
  texto: string;
  simbolos: string[];
  carta: string | null;
  enlace: string;
  pie: string;
  estado: "borrador" | "aprobada" | "publicando" | "publicada" | "descartada" | "error";
  resultados: Record<string, { id?: string; error?: string; formato?: "reel" | "imagen" }>;
  detalle: string | null;
  creado_en: string;
  actualizado_en: string;
  publicado_en: string | null;
};

type TiktokCuentaRow = {
  id: number;
  open_id: string;
  nombre: string | null;
  usuario: string | null;
  avatar: string | null;
  access_token: string;
  refresh_token: string;
  expira_en: string;
  refresh_expira_en: string | null;
  scopes: string | null;
  conectada_en: string;
  actualizado_en: string;
};

type PublicacionTiktokRow = {
  id: number;
  publish_id: string | null;
  modo: "borrador" | "directo";
  titulo: string | null;
  video: string;
  privacidad: string | null;
  estado: "enviando" | "procesando" | "en_borradores" | "publicada" | "error";
  post_id: string | null;
  detalle: string | null;
  creado_en: string;
  actualizado_en: string;
};

type YoutubeCuentaRow = {
  id: number;
  canal_id: string;
  nombre: string | null;
  usuario: string | null;
  avatar: string | null;
  refresh_token: string;
  access_token: string | null;
  expira_en: string | null;
  conectada_en: string;
  actualizado_en: string;
};

type PublicacionYoutubeRow = {
  id: number;
  video_id: string | null;
  titulo: string;
  video: string;
  privacidad: "public" | "unlisted" | "private";
  estado: "subiendo" | "subido" | "error";
  detalle: string | null;
  creado_en: string;
};

type EnVivoPreguntaRow = {
  id: number;
  mensaje_id: string | null;
  origen: "chat" | "manual" | "pagina";
  tipo: "tarot" | "aura" | "numerologia" | "horoscopo" | "chocolate" | "mano";
  imagen: string | null;
  huella: string | null;
  autor: string;
  texto: string;
  signo: string | null;
  estado: "pendiente" | "leyendo" | "leida" | "omitida";
  lectura: string | null;
  cartas: unknown;
  detalle: string | null;
  creado_en: string;
  leida_en: string | null;
};

type EnVivoEstadoRow = {
  id: number;
  live_chat_id: string | null;
  page_token: string | null;
  proxima_consulta: string | null;
  buscado_en: string | null;
  latido_en: string | null;
  actualizado_en: string;
};

type ChatVisitaRow = {
  id: number;
  huella: string;
  idioma: string;
  pregunta: string;
  respuesta: string | null;
  estado: "escribiendo" | "lista" | "error";
  creado_en: string;
};

type MetricaRedesRow = {
  id: number;
  red: "instagram" | "facebook";
  media_id: string;
  origen: "carta_dia" | "programada" | "carrusel";
  referencia: string;
  fecha: string;
  tipo: string;
  formato: string | null;
  vistas: number | null;
  alcance: number | null;
  me_gusta: number | null;
  comentarios: number | null;
  guardados: number | null;
  compartidos: number | null;
  detalle: string | null;
  actualizado_en: string;
};

type InteraccionRedesRow = {
  id: number;
  red: "instagram" | "facebook";
  tipo: "comentario" | "mensaje";
  id_meta: string;
  remitente_id: string;
  remitente: string | null;
  objeto_id: string | null;
  texto: string;
  respuesta: string | null;
  estado: "pendiente" | "respondida" | "omitida" | "error";
  humano: boolean;
  detalle: string | null;
  creado_en: string;
};

type MensajeTelegramRow = {
  id: number;
  chat_id: number;
  nombre: string | null;
  usuario: string | null;
  rol: "persona" | "asistente";
  contenido: string;
  update_id: number | null;
  tipo: string;
  humano: boolean;
  creado_en: string;
};

type SuscriptorTelegramRow = {
  chat_id: number;
  nombre: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
};

type MensajeWhatsappRow = {
  id: number;
  telefono: string;
  nombre: string | null;
  rol: "persona" | "asistente";
  contenido: string;
  id_meta: string | null;
  tipo: string;
  humano: boolean;
  creado_en: string;
};

type EmbajadorRow = {
  usuario_id: string;
  desde: string;
  estado: "activo" | "suspendido";
  metodo_pago: "nequi" | "daviplata" | "banco" | "paypal" | null;
  datos_pago: string | null;
  titular: string | null;
  actualizado_en: string;
};

type ComisionRow = {
  id: number;
  embajador_id: string;
  invitado_id: string;
  orden_id: string;
  monto_orden_centavos: number;
  moneda: string;
  comision_cop: number;
  estado: "vigente" | "anulada";
  libera_en: string;
  creado_en: string;
};

type RetiroEmbajadorRow = {
  id: number;
  embajador_id: string;
  tipo: "creditos" | "dinero";
  monto_cop: number;
  creditos: number | null;
  estado: "solicitado" | "pagado" | "rechazado";
  metodo_pago: string | null;
  datos_pago: string | null;
  titular: string | null;
  nota: string | null;
  creado_en: string;
  resuelto_en: string | null;
};

type PublicacionRedRow = {
  id: number;
  red: string;
  tipo: string;
  fecha: string;
  estado: "pendiente" | "publicada" | "error";
  referencia: string | null;
  detalle: string | null;
  /** Datos de la publicación (p. ej. los textos del carrusel semanal). */
  contenido: unknown;
  creado_en: string;
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      perfiles: {
        Row: PerfilRow;
        Insert: Insertable<PerfilRow, "nombre" | "fecha_nacimiento" | "hora_nacimiento" | "lugar_nacimiento" | "latitud" | "longitud" | "zona_horaria" | "creditos" | "ilimitado" | "idioma" | "codigo_invitacion" | "invitado_por" | "invitacion_premiada" | "circulo_hasta" | "bienvenida_dada" | "recibe_correos" | "origen" | "origen_detalle" | "creado_en" | "actualizado_en">;
        Update: Partial<PerfilRow>;
        Relationships: [];
      };
      movimientos_creditos: {
        Row: MovimientoRow;
        Insert: Insertable<MovimientoRow, "id" | "referencia" | "creado_en">;
        Update: Partial<MovimientoRow>;
        Relationships: [];
      };
      lecturas: {
        Row: LecturaRow;
        Insert: Insertable<LecturaRow, "id" | "entrada" | "resultado" | "interpretacion" | "creditos_usados" | "estado" | "generando_desde" | "creado_en">;
        Update: Partial<LecturaRow>;
        Relationships: [];
      };
      ordenes: {
        Row: OrdenRow;
        Insert: Insertable<OrdenRow, "id" | "moneda" | "estado" | "transaccion_id" | "metodo_pago" | "es_prueba" | "codigo" | "origen" | "creado_en" | "actualizado_en">;
        Update: Partial<OrdenRow>;
        Relationships: [];
      };
      preguntas_lectura: {
        Row: PreguntaRow;
        Insert: Insertable<PreguntaRow, "id" | "respuesta" | "estado" | "creditos_usados" | "creado_en">;
        Update: Partial<PreguntaRow>;
        Relationships: [];
      };
      correos: {
        Row: CorreoRow;
        Insert: Insertable<CorreoRow, "id" | "estado" | "id_proveedor" | "detalle" | "creado_en">;
        Update: Partial<CorreoRow>;
        Relationships: [];
      };
      suscripciones_push: {
        Row: SuscripcionPushRow;
        Insert: Insertable<SuscripcionPushRow, "id" | "idioma" | "agente" | "creado_en">;
        Update: Partial<SuscripcionPushRow>;
        Relationships: [];
      };
      cartas_dia: {
        Row: { usuario_id: string; fecha: string };
        Insert: { usuario_id: string; fecha: string };
        Update: Partial<{ usuario_id: string; fecha: string }>;
        Relationships: [];
      };
      mensajes_asistente: {
        Row: MensajeAsistenteRow;
        Insert: Insertable<MensajeAsistenteRow, "id" | "estado" | "creditos_usados" | "creado_en">;
        Update: Partial<MensajeAsistenteRow>;
        Relationships: [];
      };
      mensajes_diarios: {
        Row: MensajeDiarioRow;
        Insert: Insertable<MensajeDiarioRow, "id" | "idioma" | "creado_en">;
        Update: Partial<MensajeDiarioRow>;
        Relationships: [];
      };
      publicaciones_redes: {
        Row: PublicacionRedRow;
        Insert: Insertable<PublicacionRedRow, "id" | "estado" | "referencia" | "detalle" | "contenido" | "creado_en">;
        Update: Partial<PublicacionRedRow>;
        Relationships: [];
      };
      embajadores: {
        Row: EmbajadorRow;
        Insert: Insertable<EmbajadorRow, "desde" | "estado" | "metodo_pago" | "datos_pago" | "titular" | "actualizado_en">;
        Update: Partial<EmbajadorRow>;
        Relationships: [];
      };
      comisiones: {
        Row: ComisionRow;
        Insert: Insertable<ComisionRow, "id" | "estado" | "creado_en">;
        Update: Partial<ComisionRow>;
        Relationships: [];
      };
      retiros_embajador: {
        Row: RetiroEmbajadorRow;
        Insert: Insertable<RetiroEmbajadorRow, "id" | "creditos" | "estado" | "metodo_pago" | "datos_pago" | "titular" | "nota" | "creado_en" | "resuelto_en">;
        Update: Partial<RetiroEmbajadorRow>;
        Relationships: [];
      };
      en_vivo_preguntas: {
        Row: EnVivoPreguntaRow;
        Insert: Insertable<EnVivoPreguntaRow, "id" | "mensaje_id" | "tipo" | "imagen" | "huella" | "signo" | "estado" | "lectura" | "cartas" | "detalle" | "creado_en" | "leida_en">;
        Update: Partial<EnVivoPreguntaRow>;
        Relationships: [];
      };
      en_vivo_estado: {
        Row: EnVivoEstadoRow;
        Insert: Insertable<EnVivoEstadoRow, "id" | "live_chat_id" | "page_token" | "proxima_consulta" | "buscado_en" | "latido_en" | "actualizado_en">;
        Update: Partial<EnVivoEstadoRow>;
        Relationships: [];
      };
      codigos_oferta: {
        Row: CodigoOfertaRow;
        Insert: Insertable<CodigoOfertaRow, "paquetes" | "cupo" | "vence_en" | "activo" | "nota" | "creado_en">;
        Update: Partial<CodigoOfertaRow>;
        Relationships: [];
      };
      youtube_cuenta: {
        Row: YoutubeCuentaRow;
        Insert: Insertable<YoutubeCuentaRow, "id" | "nombre" | "usuario" | "avatar" | "access_token" | "expira_en" | "conectada_en" | "actualizado_en">;
        Update: Partial<YoutubeCuentaRow>;
        Relationships: [];
      };
      publicaciones_youtube: {
        Row: PublicacionYoutubeRow;
        Insert: Insertable<PublicacionYoutubeRow, "id" | "video_id" | "estado" | "detalle" | "creado_en">;
        Update: Partial<PublicacionYoutubeRow>;
        Relationships: [];
      };
      tiktok_cuenta: {
        Row: TiktokCuentaRow;
        Insert: Insertable<TiktokCuentaRow, "id" | "nombre" | "usuario" | "avatar" | "refresh_expira_en" | "scopes" | "conectada_en" | "actualizado_en">;
        Update: Partial<TiktokCuentaRow>;
        Relationships: [];
      };
      publicaciones_tiktok: {
        Row: PublicacionTiktokRow;
        Insert: Insertable<PublicacionTiktokRow, "id" | "publish_id" | "titulo" | "privacidad" | "estado" | "post_id" | "detalle" | "creado_en" | "actualizado_en">;
        Update: Partial<PublicacionTiktokRow>;
        Relationships: [];
      };
      chat_visitas: {
        Row: ChatVisitaRow;
        Insert: Insertable<ChatVisitaRow, "id" | "idioma" | "respuesta" | "estado" | "creado_en">;
        Update: Partial<ChatVisitaRow>;
        Relationships: [];
      };
      metricas_redes: {
        Row: MetricaRedesRow;
        Insert: Insertable<MetricaRedesRow, "id" | "formato" | "vistas" | "alcance" | "me_gusta" | "comentarios" | "guardados" | "compartidos" | "detalle" | "actualizado_en">;
        Update: Partial<MetricaRedesRow>;
        Relationships: [];
      };
      interacciones_redes: {
        Row: InteraccionRedesRow;
        Insert: Insertable<InteraccionRedesRow, "id" | "remitente" | "objeto_id" | "respuesta" | "estado" | "humano" | "detalle" | "creado_en">;
        Update: Partial<InteraccionRedesRow>;
        Relationships: [];
      };
      mensajes_telegram: {
        Row: MensajeTelegramRow;
        Insert: Insertable<MensajeTelegramRow, "id" | "nombre" | "usuario" | "update_id" | "tipo" | "humano" | "creado_en">;
        Update: Partial<MensajeTelegramRow>;
        Relationships: [];
      };
      suscriptores_telegram: {
        Row: SuscriptorTelegramRow;
        Insert: Insertable<SuscriptorTelegramRow, "nombre" | "activo" | "creado_en" | "actualizado_en">;
        Update: Partial<SuscriptorTelegramRow>;
        Relationships: [];
      };
      mensajes_whatsapp: {
        Row: MensajeWhatsappRow;
        Insert: Insertable<MensajeWhatsappRow, "id" | "nombre" | "id_meta" | "tipo" | "humano" | "creado_en">;
        Update: Partial<MensajeWhatsappRow>;
        Relationships: [];
      };
      publicaciones_programadas: {
        Row: PublicacionProgramadaRow;
        Insert: Insertable<PublicacionProgramadaRow, "id" | "redes" | "simbolos" | "carta" | "enlace" | "pie" | "estado" | "resultados" | "detalle" | "creado_en" | "actualizado_en" | "publicado_en">;
        Update: Partial<PublicacionProgramadaRow>;
        Relationships: [];
      };
      horoscopos: {
        Row: HoroscopoRow;
        Insert: Insertable<HoroscopoRow, "id" | "idioma" | "creado_en">;
        Update: Partial<HoroscopoRow>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      consumir_creditos: {
        Args: { p_cantidad: number; p_motivo: string; p_referencia?: string | null };
        Returns: boolean;
      };
      reclamar_generacion: {
        Args: { p_lectura: string };
        Returns: boolean;
      };
      reembolsar_lectura: {
        Args: { p_lectura: string };
        Returns: boolean;
      };
      aplicar_invitacion: {
        Args: { p_codigo: string };
        Returns: boolean;
      };
      unirme_embajadores: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      guardar_pago_embajador: {
        Args: { p_metodo: string; p_datos: string; p_titular: string };
        Returns: boolean;
      };
      resumen_embajador: {
        Args: Record<string, never>;
        Returns: {
          es_embajador: boolean;
          desde: string | null;
          invitados: number;
          invitados_pagaron: number;
          ganado_total: number;
          pendiente: number;
          disponible: number;
          canjeado: number;
          retirado: number;
          en_proceso: number;
        }[];
      };
      comisiones_recientes: {
        Args: Record<string, never>;
        Returns: { fecha: string; nombre: string; comision_cop: number; estado: "anulada" | "en_espera" | "disponible" }[];
      };
      canjear_saldo_creditos: {
        Args: { p_monto_cop: number };
        Returns: number;
      };
      solicitar_retiro_embajador: {
        Args: { p_monto_cop: number };
        Returns: number | null;
      };
      resumen_invitaciones: {
        Args: Record<string, never>;
        Returns: { invitados: number; premiadas: number; creditos_ganados: number }[];
      };
      nombre_invitador: {
        Args: { p_codigo: string };
        Returns: string | null;
      };
      contador_lecturas: {
        Args: Record<string, never>;
        Returns: number;
      };
      finalizar_generacion: {
        Args: { p_lectura: string; p_texto: string };
        Returns: boolean;
      };
      finalizar_pregunta: {
        Args: { p_pregunta: string; p_texto: string };
        Returns: boolean;
      };
      reintentar_lectura: {
        Args: { p_lectura: string; p_costo: number };
        Returns: boolean;
      };
      devolver_creditos: {
        Args: { p_usuario: string; p_cantidad: number; p_motivo: string; p_referencia?: string | null };
        Returns: undefined;
      };
      carta_dia_disponible: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      reservar_carta_dia: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      crear_pregunta: {
        Args: { p_lectura: string; p_pregunta: string };
        Returns: { id: string; costo: number }[];
      };
      crear_mensaje_asistente: {
        Args: { p_texto: string };
        Returns: { id: string; costo: number }[];
      };
      finalizar_mensaje_asistente: {
        Args: { p_mensaje: string; p_texto: string };
        Returns: boolean;
      };
      reembolsar_mensaje_asistente: {
        Args: { p_mensaje: string };
        Returns: boolean;
      };
      mensajes_asistente_hoy: {
        Args: Record<string, never>;
        Returns: number;
      };
      registrar_push: {
        Args: { p_endpoint: string; p_p256dh: string; p_auth: string; p_idioma: string; p_agente?: string | null };
        Returns: undefined;
      };
      ha_comprado: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      reembolsar_pregunta: {
        Args: { p_pregunta: string };
        Returns: boolean;
      };
      acreditar_orden: {
        Args: { p_referencia: string; p_transaccion_id: string; p_metodo_pago?: string | null };
        Returns: boolean;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
