"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Markdown } from "./Markdown";
import { MARCA_ERROR } from "@/lib/lecturas/marcas";

type Fase = "conectando" | "escribiendo" | "lista" | "en_otra_pestana" | "error";

/**
 * Pide a /api/lecturas/[id]/generar la interpretación y la muestra a medida
 * que llega. Si la lectura ya estaba escrita, la muestra tal cual.
 */
export function LecturaEnVivo({
  id,
  estadoInicial,
  textoInicial,
}: {
  id: string;
  estadoInicial: "pendiente" | "generando" | "lista" | "error";
  textoInicial: string | null;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState(textoInicial ?? "");
  const [fase, setFase] = useState<Fase>(
    estadoInicial === "lista" ? "lista" : estadoInicial === "error" ? "error" : "conectando",
  );
  const iniciado = useRef(false);

  useEffect(() => {
    if (iniciado.current || estadoInicial === "lista" || estadoInicial === "error") return;
    iniciado.current = true;

    (async () => {
      try {
        const res = await fetch(`/api/lecturas/${id}/generar`, { method: "POST" });
        if (res.status === 409) {
          setFase("en_otra_pestana");
          return;
        }
        if (!res.ok || !res.body) {
          setFase("error");
          return;
        }
        setFase("escribiendo");
        const lector = res.body.getReader();
        const decodificador = new TextDecoder();
        let acumulado = "";
        for (;;) {
          const { done, value } = await lector.read();
          if (done) break;
          acumulado += decodificador.decode(value, { stream: true });
          setTexto(acumulado.replace(MARCA_ERROR, ""));
        }
        if (acumulado.includes(MARCA_ERROR.trim())) {
          setFase("error");
          return;
        }
        setFase("lista");
        router.refresh();
      } catch {
        setFase("error");
      }
    })();
  }, [id, estadoInicial, router]);

  // Si otra pestaña la está escribiendo, revisamos cada pocos segundos.
  const esperandoOtra = fase === "en_otra_pestana" && estadoInicial !== "lista" && estadoInicial !== "error";
  useEffect(() => {
    if (!esperandoOtra) return;
    const t = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(t);
  }, [esperandoOtra, router]);

  // Lo que diga el servidor tras un refresh manda sobre el estado local.
  if (fase === "en_otra_pestana" && estadoInicial === "lista" && textoInicial) {
    return <Markdown texto={textoInicial} />;
  }

  if (fase === "error" || (fase === "en_otra_pestana" && estadoInicial === "error")) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-peligro">No pudimos escribir esta lectura. Te devolvimos los créditos.</p>
        <Link href="/inicio" className="boton boton-secundario">Volver al inicio</Link>
      </div>
    );
  }

  if (!texto) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center" role="status">
        <div className="orbe-carga" aria-hidden />
        <p className="font-display text-xl text-oro-suave">
          {fase === "en_otra_pestana" ? "Tu lectura se está escribiendo en otra pestaña…" : "Arcana está leyendo tu consulta…"}
        </p>
        <p className="text-sm text-texto-suave">El texto aparecerá aquí mientras se escribe.</p>
      </div>
    );
  }

  return (
    <div aria-live="polite" aria-busy={fase === "escribiendo"}>
      <Markdown texto={texto} />
      {fase === "escribiendo" && <span className="cursor-escritura" aria-hidden />}
    </div>
  );
}
