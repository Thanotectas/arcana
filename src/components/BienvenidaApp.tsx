"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CLAVE = "arcana_app_bienvenida";

/**
 * Solo en Arcana instalada: la primera vez que la cuenta la abre, pide el crédito de bienvenida y lo celebra.
 * Sin sesión no hace nada (lo intenta de nuevo cuando la persona entre).
 */
export function BienvenidaApp() {
  const [mostrar, setMostrar] = useState(false);
  const [premio, setPremio] = useState<{ creditos: number; probador: boolean }>({ creditos: 1, probador: false });
  useEffect(() => {
    try {
      if (localStorage.getItem(CLAVE) === "listo") return;
    } catch {
      /* sin almacenamiento: se intenta igual */
    }
    let vivo = true;
    fetch("/api/app/bienvenida", { method: "POST" })
      .then(async (r) => {
        if (!r.ok) return;
        const d = (await r.json()) as { premio?: boolean; creditos?: number; probador?: boolean };
        try {
          localStorage.setItem(CLAVE, "listo");
        } catch {
          /* nada */
        }
        if (vivo && d.premio) {
          setPremio({ creditos: d.creditos ?? 1, probador: Boolean(d.probador) });
          setMostrar(true);
        }
      })
      .catch(() => null);
    return () => {
      vivo = false;
    };
  }, []);
  if (!mostrar) return null;
  return (
    <div className="fixed inset-x-4 top-20 z-50 mx-auto max-w-md" role="status">
      <div className="tarjeta aparecer flex items-start gap-3 border border-oro/50 p-4 shadow-2xl">
        <span className="text-3xl">🎁</span>
        <div className="flex-1 text-sm">
          <p className="font-semibold">{premio.probador ? "¡Gracias por probar Arcana!" : "¡Gracias por instalar Arcana!"}</p>
          <p className="text-texto-suave">
            Te regalamos {premio.creditos} {premio.creditos === 1 ? "crédito" : "créditos"} para tus lecturas. Ya {premio.creditos === 1 ? "está" : "están"} en tu cuenta.
            {premio.probador && " Ábrela un par de veces por semana y cuéntanos qué te parece."}
          </p>
          <Link href="/juego" onClick={() => setMostrar(false)} className="mt-2 inline-block text-oro-suave underline">
            Juega la carta escondida de hoy
          </Link>
        </div>
        <button type="button" onClick={() => setMostrar(false)} aria-label="Cerrar" className="text-texto-suave hover:text-texto">
          ✕
        </button>
      </div>
    </div>
  );
}
