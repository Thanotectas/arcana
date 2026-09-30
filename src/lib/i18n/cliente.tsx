"use client";

import { createContext, useContext } from "react";
import type { Idioma } from "./idiomas";
import type { Diccionario } from "./diccionarios";

interface ContextoIdioma {
  idioma: Idioma;
  t: Diccionario;
}

const Contexto = createContext<ContextoIdioma | null>(null);

export function ProveedorIdioma({ idioma, t, children }: ContextoIdioma & { children: React.ReactNode }) {
  return <Contexto.Provider value={{ idioma, t }}>{children}</Contexto.Provider>;
}

/** Textos de la interfaz en componentes de cliente. */
export function useT() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useT debe usarse dentro de ProveedorIdioma");
  return ctx;
}
