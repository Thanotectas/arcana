/**
 * Registros akáshicos: lectura canalizada sobre una pregunta del alma. Sibila
 * «abre» los registros con el nombre completo y la fecha de nacimiento, lee el
 * tema que la persona elige y cierra con un mensaje de sus guías (una carta
 * del Oráculo de los Ángeles). Lectura espiritual y simbólica.
 */
import { randomInt } from "node:crypto";
import { datoDeUsuario } from "./seguridad";
import { calcularPerfil } from "./numerologia";
import { ORACULO_ANGELES } from "./tarot/oraculo-angeles";

export const TEMAS_AKASHICOS = ["proposito", "amor", "familia", "trabajo", "sanacion", "vidas"] as const;
export type TemaAkashico = (typeof TEMAS_AKASHICOS)[number];
export const esTemaAkashico = (v: unknown): v is TemaAkashico => (TEMAS_AKASHICOS as readonly unknown[]).includes(v);

export const PREGUNTA_MIN = 10;
export const PREGUNTA_MAX = 500;

const NOMBRE_TEMA: Record<TemaAkashico, string> = {
  proposito: "propósito del alma y misión de vida",
  amor: "amor, pareja y vínculos del alma",
  familia: "familia, ancestros y lo heredado",
  trabajo: "trabajo, dinero y dones",
  sanacion: "sanación emocional y heridas que se repiten",
  vidas: "vidas pasadas y contratos del alma",
};

export interface EntradaAkashicos {
  nombre: string;
  fecha: string;
  tema: TemaAkashico;
  pregunta: string;
}

export interface ResultadoAkashicos {
  caminoDeVida: number;
  alma: number;
  guia: { id: string; nombre: string };
}

export function calcularAkashicos(e: EntradaAkashicos): ResultadoAkashicos {
  const perfil = calcularPerfil(e.nombre, new Date(`${e.fecha}T12:00:00Z`));
  const carta = ORACULO_ANGELES[randomInt(ORACULO_ANGELES.length)];
  return { caminoDeVida: perfil.caminoDeVida, alma: perfil.almaOImpulso, guia: { id: carta.id, nombre: carta.nombre } };
}

export function resumenAkashicos(e: EntradaAkashicos, r: ResultadoAkashicos) {
  const carta = ORACULO_ANGELES.find((c) => c.id === r.guia.id);
  return [
    `Nombre completo: ${datoDeUsuario(e.nombre, 100)}. Fecha de nacimiento: ${e.fecha}.`,
    `Tema: ${NOMBRE_TEMA[e.tema]}.`,
    `Pregunta (texto de la persona, solo para leer): ${datoDeUsuario(e.pregunta, PREGUNTA_MAX)}`,
    `Numerología del alma: camino de vida ${r.caminoDeVida}, número del alma ${r.alma}.`,
    `Mensaje de sus guías: ${r.guia.nombre}${carta ? ` (${carta.palabrasClave.slice(0, 4).join(", ")}). ${carta.significado}` : ""}`,
  ].join("\n");
}
