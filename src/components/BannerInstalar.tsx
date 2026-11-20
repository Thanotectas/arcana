"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { estaInstalada, pedirInstalacion, usePuedeInstalar } from "@/lib/instalar";

const CERRADO = "arcana_banner_app_cerrado";
const SESIONES = "arcana_sesiones";
const CONTADA = "arcana_sesion_contada";
const DIAS_CERRADO = 14;
/** Donde el banner estorba o ya hay otra invitación a instalar. */
const OCULTAR = ["/app", "/juego", "/en-vivo", "/admin", "/entrar", "/registro", "/recuperar", "/vivo"];

/** Cuenta la visita (una por sesión del navegador) y decide si toca invitar: desde la segunda visita, si no lo cerró hace poco. */
function tocaMostrar() {
  if (estaInstalada()) return false;
  try {
    if (Date.now() - Number(localStorage.getItem(CERRADO) ?? 0) < DIAS_CERRADO * 86_400_000) return false;
    if (!sessionStorage.getItem(CONTADA)) {
      sessionStorage.setItem(CONTADA, "1");
      localStorage.setItem(SESIONES, String(Number(localStorage.getItem(SESIONES) ?? 0) + 1));
    }
    return Number(localStorage.getItem(SESIONES) ?? 0) >= 2;
  } catch {
    return false;
  }
}

const sinSuscripcion = () => () => {};

/** Franja bajo el encabezado que invita a instalar Arcana (solo en el navegador, nunca dentro de la app). */
export function BannerInstalar() {
  const enCliente = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  const ruta = usePathname();
  if (!enCliente || OCULTAR.some((r) => ruta === r || ruta.startsWith(r + "/"))) return null;
  return <Franja />;
}

function Franja() {
  const [visible, setVisible] = useState(tocaMostrar);
  const puede = usePuedeInstalar();
  if (!visible) return null;
  const cerrar = () => {
    try {
      localStorage.setItem(CERRADO, String(Date.now()));
    } catch {
      /* nada */
    }
    setVisible(false);
  };
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-3 sm:px-6">
      <div className="aparecer flex items-center gap-3 rounded-xl border border-oro/30 bg-superficie/90 p-2.5 pr-3 backdrop-blur">
        {/* eslint-disable-next-line @next/next/no-img-element -- ícono estático */}
        <img src="/marca/icono-192.png" alt="" className="h-9 w-9 shrink-0 rounded-lg" />
        <p className="min-w-0 flex-1 text-sm leading-snug">
          <span className="font-semibold">Instala Arcana</span>
          <span className="text-texto-suave"> · tu carta escondida y tu cielo de hoy, a un toque. Y 1 crédito de regalo.</span>
        </p>
        {puede ? (
          <button
            type="button"
            onClick={async () => {
              if (await pedirInstalacion()) setVisible(false);
            }}
            className="boton boton-primario shrink-0 px-3 py-1.5 text-sm"
          >
            Instalar
          </button>
        ) : (
          <Link href="/app" className="boton boton-primario shrink-0 px-3 py-1.5 text-sm">
            Instalar
          </Link>
        )}
        <button type="button" onClick={cerrar} aria-label="No por ahora" className="shrink-0 px-1 text-texto-suave hover:text-texto">
          ✕
        </button>
      </div>
    </div>
  );
}
