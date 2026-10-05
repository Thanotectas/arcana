"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Markdown } from "./Markdown";
import { extraerError, limpiarMarcas, type CodigoErrorLectura } from "@/lib/lecturas/marcas";
import { accionReintentarLectura } from "@/lib/lecturas/acciones";
import { BotonEnviar } from "./BotonEnviar";
import { useT } from "@/lib/i18n/cliente";

// "reconectando": se cortó la conexión pero el servidor sigue escribiendo y
// guarda al terminar; se consulta hasta que la lectura quede lista o falle.
type Fase = "conectando" | "escribiendo" | "lista" | "en_otra_pestana" | "reconectando" | "error";

/**
 * Pide a /api/lecturas/[id]/generar la interpretación y la muestra a medida
 * que llega. Si la lectura ya estaba escrita, la muestra tal cual.
 * `transformar` permite recortar anexos (por ejemplo, el JSON de trazos de la
 * palma) antes de mostrar el texto; `alTexto` recibe el texto crudo completo.
 */
export function LecturaEnVivo({
  id,
  estadoInicial,
  textoInicial,
  transformar,
  alTexto,
}: {
  id: string;
  estadoInicial: "pendiente" | "generando" | "lista" | "error";
  textoInicial: string | null;
  transformar?: (texto: string) => string;
  alTexto?: (texto: string, terminado: boolean) => void;
}) {
  const { t } = useT();
  const router = useRouter();
  const [texto, setTexto] = useState(textoInicial ?? "");
  const [fase, setFase] = useState<Fase>(
    estadoInicial === "lista" ? "lista" : estadoInicial === "error" ? "error" : "conectando",
  );
  const [codigoError, setCodigoError] = useState<CodigoErrorLectura | null>(null);
  const iniciado = useRef(false);
  const notificar = useRef(alTexto);
  notificar.current = alTexto;

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
        if (res.status === 410) {
          setFase("error");
          return;
        }
        if (!res.ok || !res.body) {
          setFase("reconectando");
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
          const limpio = limpiarMarcas(acumulado);
          setTexto(limpio);
          notificar.current?.(limpio, false);
        }
        const codigo = extraerError(acumulado);
        if (codigo) {
          setCodigoError(codigo);
          setFase("error");
          return;
        }
        notificar.current?.(acumulado, true);
        setFase("lista");
        router.refresh();
      } catch {
        // Corte de red (pantalla bloqueada, cambio de wifi a datos…): el
        // servidor no reembolsa por esto, así que no se anuncia un fallo.
        setFase("reconectando");
      }
    })();
  }, [id, estadoInicial, router]);

  const enEspera = fase === "en_otra_pestana" || fase === "reconectando";
  const esperandoOtra = enEspera && estadoInicial !== "lista" && estadoInicial !== "error";
  useEffect(() => {
    if (!esperandoOtra) return;
    const tm = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(tm);
  }, [esperandoOtra, router]);

  const mostrar = (s: string) => (transformar ? transformar(s) : s);

  if (enEspera && estadoInicial === "lista" && textoInicial) {
    return <Markdown texto={mostrar(textoInicial)} />;
  }

  if (fase === "error" || (enEspera && estadoInicial === "error")) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-peligro">{t.lecturas.detalle.fallo}</p>
        {codigoError && <p className="text-sm text-texto-suave">{t.lecturas.detalle.causas[codigoError]}</p>}
        <div className="flex flex-wrap justify-center gap-3">
          <form action={accionReintentarLectura}>
            <input type="hidden" name="id" value={id} />
            <BotonEnviar cargando={t.lecturas.detalle.reintentando}>{t.lecturas.detalle.reintentar}</BotonEnviar>
          </form>
          <Link href="/inicio" className="boton boton-secundario">{t.comun.volverInicio}</Link>
        </div>
      </div>
    );
  }

  if (!texto || fase === "reconectando") {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center" role="status">
        <div className="orbe-carga" aria-hidden />
        <p className="font-display text-xl text-oro-suave">
          {fase === "en_otra_pestana"
            ? t.lecturas.detalle.otraPestana
            : fase === "reconectando"
              ? t.lecturas.detalle.reconectando
              : t.lecturas.detalle.escribiendo}
        </p>
        <p className="text-sm text-texto-suave">{t.lecturas.detalle.aparecera}</p>
      </div>
    );
  }

  return (
    <div aria-live="polite" aria-busy={fase === "escribiendo"}>
      <Markdown texto={mostrar(texto)} />
      {fase === "escribiendo" && <span className="cursor-escritura" aria-hidden />}
    </div>
  );
}
