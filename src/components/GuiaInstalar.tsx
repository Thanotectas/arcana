"use client";

import { Fragment, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { EllipsisVertical, Share, SquarePlus, Compass, MoreHorizontal } from "lucide-react";
import { dispositivo, estaInstalada, iphoneSinSafari, navegadorDeRed, pedirInstalacion, usePuedeInstalar } from "@/lib/instalar";
import { useT } from "@/lib/i18n/cliente";
import { TEXTOS_INSTALAR, type Trozos } from "@/lib/instalar-textos";

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

/** Pinta los trozos de un texto con los impares en negrita. */
function Negritas({ trozos }: { trozos: Trozos }) {
  return trozos.map((s, i) => <Fragment key={i}>{i % 2 ? <strong>{s}</strong> : s}</Fragment>);
}

function Guia({ qr }: { qr: string }) {
  const tx = TEXTOS_INSTALAR[useT().idioma];
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
        <p className="font-display text-2xl">{instalada ? tx.yaInstalada : tx.listo}</p>
        <p className="text-sm text-texto-suave">{tx.abrela}</p>
        <Link href="/juego" className="boton boton-primario inline-flex">
          {tx.jugar}
        </Link>
      </div>
    );
  }

  if (red) {
    return (
      <div className="tarjeta space-y-3 p-6">
        <p className="font-semibold">{tx.dentroDe(red)}</p>
        <p className="text-sm text-texto-suave">{tx.noSePuede}</p>
        <ol className="space-y-2">
          <Paso n={1} icono={<MoreHorizontal size={20} />}>
            <Negritas trozos={tx.redPaso1(equipo === "iphone")} />
          </Paso>
          <Paso n={2} icono={<Compass size={20} />}>
            <Negritas trozos={tx.redPaso2(equipo === "iphone")} />
          </Paso>
        </ol>
        <p className="text-xs text-texto-suave">{tx.copia}</p>
      </div>
    );
  }

  if (equipo === "iphone") {
    return (
      <div className="tarjeta space-y-3 p-6">
        <p className="text-center font-semibold">{tx.iphoneTitulo}</p>
        {sinSafari && <p className="rounded-lg border border-oro/40 p-3 text-sm"><Negritas trozos={tx.sinSafari} /></p>}
        <ol className="space-y-2">
          <Paso n={1} icono={<Share size={20} />}>
            <Negritas trozos={tx.iphonePaso1} />
          </Paso>
          <Paso n={2} icono={<SquarePlus size={20} />}>
            <Negritas trozos={tx.iphonePaso2} />
          </Paso>
          <Paso n={3} icono={<span className="text-xs font-semibold">{tx.iphoneBoton}</span>}>
            <Negritas trozos={tx.iphonePaso3} />
          </Paso>
        </ol>
      </div>
    );
  }

  return (
    <div className="tarjeta space-y-4 p-6">
      {puede ? (
        <button type="button" onClick={async () => setLista(await pedirInstalacion())} className="boton boton-primario flex w-full justify-center py-3 text-lg">
          {tx.instalar}
        </button>
      ) : (
        <>
          <p className="text-center font-semibold">{equipo === "android" ? tx.androidTitulo : tx.computadorTitulo}</p>
          <ol className="space-y-2">
            <Paso n={1} icono={<EllipsisVertical size={20} />}>
              <Negritas trozos={equipo === "android" ? tx.androidPaso1 : tx.computadorPaso1} />
            </Paso>
            <Paso n={2} icono={<SquarePlus size={20} />}>
              <Negritas trozos={tx.paso2} />
            </Paso>
          </ol>
        </>
      )}
      {equipo === "computador" && (
        <div className="flex items-center gap-4 border-t border-borde pt-4">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl" dangerouslySetInnerHTML={{ __html: qr }} />
          <p className="text-sm text-texto-suave">{tx.qr}</p>
        </div>
      )}
    </div>
  );
}
