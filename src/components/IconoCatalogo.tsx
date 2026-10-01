"use client";

import { Sparkles, Star, Sunrise, Moon, Hash, Hand, Hexagon, Flame, MoonStar, Coffee, Heart, HeartHandshake, Layers } from "lucide-react";
import type { IconoCatalogo as Clave } from "@/lib/catalogo";

const ICONOS = { tarot: Sparkles, astral: Star, hoy: Sunrise, horoscopo: Moon, numerologia: Hash, quiromancia: Hand, iching: Hexagon, chino: Flame, suenos: MoonStar, chocolate: Coffee, compatibilidad: Heart, sinastria: HeartHandshake, cruce: Layers } as const;

export function IconoCatalogo({ clave, className = "h-4 w-4" }: { clave: Clave; className?: string }) {
  const Icono = ICONOS[clave];
  return <Icono className={className} aria-hidden />;
}
