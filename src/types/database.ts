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
  creado_en: string;
  actualizado_en: string;
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
  creado_en: string;
  actualizado_en: string;
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

type PublicacionRedRow = {
  id: number;
  red: string;
  tipo: string;
  fecha: string;
  estado: "pendiente" | "publicada" | "error";
  referencia: string | null;
  detalle: string | null;
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
        Insert: Insertable<PerfilRow, "nombre" | "fecha_nacimiento" | "hora_nacimiento" | "lugar_nacimiento" | "latitud" | "longitud" | "zona_horaria" | "creditos" | "ilimitado" | "idioma" | "codigo_invitacion" | "invitado_por" | "invitacion_premiada" | "circulo_hasta" | "bienvenida_dada" | "creado_en" | "actualizado_en">;
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
        Insert: Insertable<OrdenRow, "id" | "moneda" | "estado" | "transaccion_id" | "metodo_pago" | "es_prueba" | "creado_en" | "actualizado_en">;
        Update: Partial<OrdenRow>;
        Relationships: [];
      };
      preguntas_lectura: {
        Row: PreguntaRow;
        Insert: Insertable<PreguntaRow, "id" | "respuesta" | "estado" | "creditos_usados" | "creado_en">;
        Update: Partial<PreguntaRow>;
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
        Insert: Insertable<PublicacionRedRow, "id" | "estado" | "referencia" | "detalle" | "creado_en">;
        Update: Partial<PublicacionRedRow>;
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
