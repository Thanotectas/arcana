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

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      perfiles: {
        Row: PerfilRow;
        Insert: Insertable<PerfilRow, "nombre" | "fecha_nacimiento" | "hora_nacimiento" | "lugar_nacimiento" | "latitud" | "longitud" | "zona_horaria" | "creditos" | "ilimitado" | "idioma" | "codigo_invitacion" | "invitado_por" | "invitacion_premiada" | "circulo_hasta" | "creado_en" | "actualizado_en">;
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
      mensajes_diarios: {
        Row: MensajeDiarioRow;
        Insert: Insertable<MensajeDiarioRow, "id" | "idioma" | "creado_en">;
        Update: Partial<MensajeDiarioRow>;
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
