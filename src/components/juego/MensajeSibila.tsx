"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SIGNOS } from "@/lib/zodiaco";
import { contarEvento } from "@/lib/juego/eventos";

const CLAVE_SIGNO = "arcana-juego-signo";

function signoGuardado() {
  try {
    return localStorage.getItem(CLAVE_SIGNO);
  } catch {
    return null;
  }
}

/**
 * Del juego a la lectura: con la carta ya descubierta, Sibila le da a la persona un mensaje corto para su signo
 * y la invita a preguntarle algo concreto en una tirada (con el código CAMINO, 1 crédito extra al comprar).
 */
export function MensajeSibila({ carta }: { carta: string }) {
  const [signo, setSigno] = useState<string | null>(signoGuardado);
  const [eligiendo, setEligiendo] = useState(false);
  const [texto, setTexto] = useState<string | null>(null);
  const [estado, setEstado] = useState<"cargando" | "elegir" | "listo" | "error">("cargando");

  useEffect(() => {
    let vivo = true;
    fetch(signo ? `/api/juego/mensaje?signo=${signo}` : "/api/juego/mensaje")
      .then(async (r) => {
        if (!vivo) return;
        if (r.status === 400) return setEstado("elegir");
        if (!r.ok) return setEstado("error");
        const d = (await r.json()) as { signo: string; texto: string };
        if (!vivo) return;
        setTexto(d.texto);
        setEstado("listo");
        if (!signo) setSigno(d.signo);
        contarEvento("mensaje");
      })
      .catch(() => vivo && setEstado("error"));
    return () => {
      vivo = false;
    };
  }, [signo]);

  function elegir(id: string) {
    try {
      localStorage.setItem(CLAVE_SIGNO, id);
    } catch {
      /* nada */
    }
    setEligiendo(false);
    setTexto(null);
    setEstado("cargando");
    setSigno(id);
  }

  const actual = SIGNOS.find((s) => s.id === signo);
  const mostrarSignos = estado === "elegir" || eligiendo;

  return (
    <div className="space-y-3 rounded-2xl border border-oro/40 bg-gradient-to-br from-violeta/25 via-noche to-noche p-4 text-left">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- retrato estático */}
        <img src="/juego/sibila-gana.webp" alt="" className="h-12 w-12 shrink-0 rounded-full border-2 border-oro/70" />
        <div className="min-w-0">
          <p className="font-display text-xl leading-tight">Lo que {carta} te dice hoy</p>
          <p className="text-xs text-texto-suave">{actual ? `Para ${actual.nombre} ${actual.simbolo}` : "Un mensaje de Sibila para tu signo"}</p>
        </div>
      </div>

      {mostrarSignos ? (
        <div className="space-y-2">
          <p className="text-sm">¿Cuál es tu signo?</p>
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
            {SIGNOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => elegir(s.id)}
                className={`flex flex-col items-center rounded-lg border px-1 py-1.5 text-[11px] transition active:scale-95 ${s.id === signo ? "border-oro bg-oro/15" : "border-borde bg-superficie-2 hover:border-violeta-suave"}`}
              >
                <span className="text-lg leading-none text-oro-suave">{s.simbolo}</span>
                <span className="mt-0.5">{s.nombre}</span>
              </button>
            ))}
          </div>
        </div>
      ) : estado === "cargando" ? (
        <p className="animate-pulse text-sm text-texto-suave">Sibila está mirando tu signo…</p>
      ) : estado === "error" ? (
        <p className="text-sm text-texto-suave">Sibila no pudo escribirte ahora. Inténtalo en un momento.</p>
      ) : (
        <>
          <p className="aparecer text-[15px] leading-relaxed">{texto}</p>
          <button type="button" onClick={() => setEligiendo(true)} className="text-xs text-texto-suave underline">
            No es mi signo
          </button>
        </>
      )}

      <div className="space-y-2 border-t border-borde pt-3">
        <Link href="/tarot?tirada=tarot_tres" onClick={() => contarEvento("oferta")} className="boton boton-primario flex w-full justify-center text-center">
          Pregúntale a Sibila en una tirada de 3 cartas
        </Link>
        <p className="text-center text-xs text-texto-suave">
          Cuesta 1 crédito. ¿No tienes? Con el código{" "}
          <Link href="/creditos?codigo=CAMINO" onClick={() => contarEvento("oferta")} className="font-semibold text-oro-suave underline">
            CAMINO
          </Link>{" "}
          te regalamos 1 crédito extra en tu compra.
        </p>
      </div>
    </div>
  );
}
