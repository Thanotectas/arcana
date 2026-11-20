"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { EllipsisVertical, Share, SquarePlus, Compass, MoreHorizontal } from "lucide-react";
import { dispositivo, estaInstalada, iphoneSinSafari, navegadorDeRed, pedirInstalacion, usePuedeInstalar } from "@/lib/instalar";

const sinSuscripcion = () => () => {};

/** Botón o pasos para instalar Arcana, según el celular y el navegador de la persona. */
export function GuiaInstalar({ qr }: { qr: string }) {
  const enCliente = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  if (!enCliente) return <div className="tarjeta h-64 animate-pulse" />;
  return <Guia qr={qr} />;
}

function Paso({ n, icono, children }: { n: number; icono: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 rounded-xl bg-superficie-2 p-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violeta text-sm font-semibold text-white">{n}</span>
      <span className="flex-1 text-sm">{children}</span>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-borde text-oro">{icono}</span>
    </li>
  );
}

function Guia({ qr }: { qr: string }) {
  const [instalada] = useState(estaInstalada);
  const [equipo] = useState(dispositivo);
  const [red] = useState(navegadorDeRed);
  const [sinSafari] = useState(iphoneSinSafari);
  const puede = usePuedeInstalar();
  const [lista, setLista] = useState(false);

  if (instalada || lista) {
    return (
      <div className="tarjeta space-y-3 p-6 text-center">
        <p className="text-4xl">🎉</p>
        <p className="font-display text-2xl">{instalada ? "Ya tienes Arcana instalada" : "¡Listo! Arcana quedó en tu pantalla de inicio"}</p>
        <p className="text-sm text-texto-suave">Ábrela desde su ícono y entra con tu cuenta: te espera 1 crédito de regalo.</p>
        <Link href="/juego" className="boton boton-primario inline-flex">
          Jugar la carta escondida
        </Link>
      </div>
    );
  }

  if (red) {
    return (
      <div className="tarjeta space-y-3 p-6">
        <p className="font-semibold">Estás viendo esto dentro de {red}</p>
        <p className="text-sm text-texto-suave">Desde aquí no se puede instalar. Ábrelo en tu navegador y sigue los pasos:</p>
        <ol className="space-y-2">
          <Paso n={1} icono={<MoreHorizontal size={20} />}>
            Toca los <strong>tres puntos</strong> {equipo === "iphone" ? "(abajo o arriba a la derecha)" : "(arriba a la derecha)"}.
          </Paso>
          <Paso n={2} icono={<Compass size={20} />}>
            Elige <strong>«Abrir en el navegador»</strong>{equipo === "iphone" ? " o «Abrir en Safari»" : ""}.
          </Paso>
        </ol>
        <p className="text-xs text-texto-suave">O copia y pega en tu navegador: miarcana.com/app</p>
      </div>
    );
  }

  if (equipo === "iphone") {
    return (
      <div className="tarjeta space-y-3 p-6">
        <p className="text-center font-semibold">En iPhone son 3 toques</p>
        {sinSafari && <p className="rounded-lg border border-oro/40 p-3 text-sm">En iPhone se instala desde <strong>Safari</strong>. Abre miarcana.com/app en Safari y sigue estos pasos.</p>}
        <ol className="space-y-2">
          <Paso n={1} icono={<Share size={20} />}>
            Toca <strong>Compartir</strong>, el cuadrado con la flecha hacia arriba, en la barra de Safari.
          </Paso>
          <Paso n={2} icono={<SquarePlus size={20} />}>
            Baja y toca <strong>«Agregar a inicio»</strong>.
          </Paso>
          <Paso n={3} icono={<span className="text-xs font-semibold">Agregar</span>}>
            Toca <strong>«Agregar»</strong>, arriba a la derecha. ¡Listo! Arcana aparece en tu pantalla.
          </Paso>
        </ol>
      </div>
    );
  }

  return (
    <div className="tarjeta space-y-4 p-6">
      {puede ? (
        <button type="button" onClick={async () => setLista(await pedirInstalacion())} className="boton boton-primario flex w-full justify-center py-3 text-lg">
          Instalar Arcana
        </button>
      ) : (
        <>
          <p className="text-center font-semibold">{equipo === "android" ? "En Android son 2 toques" : "Instálala en tu computador"}</p>
          <ol className="space-y-2">
            <Paso n={1} icono={<EllipsisVertical size={20} />}>
              {equipo === "android" ? (
                <>
                  En Chrome, toca los <strong>tres puntos</strong> de arriba a la derecha.
                </>
              ) : (
                <>
                  En Chrome o Edge, busca el ícono de <strong>instalar</strong> en la barra de direcciones, o abre el menú (⋮).
                </>
              )}
            </Paso>
            <Paso n={2} icono={<SquarePlus size={20} />}>
              Toca <strong>«Instalar app»</strong> o <strong>«Agregar a la pantalla principal»</strong>.
            </Paso>
          </ol>
        </>
      )}
      {equipo === "computador" && (
        <div className="flex items-center gap-4 border-t border-borde pt-4">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl" dangerouslySetInnerHTML={{ __html: qr }} />
          <p className="text-sm text-texto-suave">¿La quieres en el celular? Escanea este código con la cámara y sigue los pasos.</p>
        </div>
      )}
    </div>
  );
}
