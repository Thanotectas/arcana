"use client";

import { Sparkles, Star, Sunrise, Moon, Hash, Hand, Hexagon, Flame, MoonStar, Coffee, Heart, HeartHandshake, Layers, Orbit, FlameKindling, Sparkle, Wind, BookOpen } from "lucide-react";
import type { IconoCatalogo as Clave } from "@/lib/catalogo";

const ICONOS = { tarot: Sparkles, astral: Star, hoy: Sunrise, horoscopo: Moon, luna: Orbit, numerologia: Hash, quiromancia: Hand, iching: Hexagon, chino: Flame, suenos: MoonStar, chocolate: Coffee, velas: FlameKindling, aura: Sparkle, tabaco: Wind, compatibilidad: Heart, sinastria: HeartHandshake, cruce: Layers, rituales: BookOpen } as const;

export function IconoCatalogo({ clave, className = "h-4 w-4" }: { clave: Clave; className?: string }) {
  const Icono = ICONOS[clave];
  return <Icono className={className} aria-hidden />;
}
