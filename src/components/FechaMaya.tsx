"use client";

import { useMemo, useState } from "react";
import { calcularMaya } from "@/lib/oraculos/maya";
import { useT } from "@/lib/i18n/cliente";
import { CruzOraculo, EncabezadoKin } from "./GraficosMaya";

/** Campo de la fecha del calendario maya: al escribirla aparecen el kin y su oráculo. */
export function FechaMaya({ fechaInicial }: { fechaInicial: string }) {
  const { t, idioma } = useT();
  const [fecha, setFecha] = useState(fechaInicial);
  const valida = /^\d{4}-\d{2}-\d{2}$/.test(fecha) && Number(fecha.slice(0, 4)) >= 1900;
  const r = useMemo(() => (valida ? calcularMaya(fecha) : null), [fecha, valida]);
  return (
    <>
      <div>
        <label className="etiqueta" htmlFor="fecha">{t.maya.fecha}</label>
        <input id="fecha" name="fecha" type="date" className="campo" min="1900-01-01" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>
      {r ? (
        <div key={r.kin} className="space-y-6 rounded-2xl border border-borde bg-white/[0.02] p-4 sm:p-5">
          <EncabezadoKin r={r} t={t.maya} idioma={idioma} />
          <CruzOraculo r={r} t={t.maya} idioma={idioma} />
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-borde p-6 text-center text-sm text-texto-suave">{t.maya.escribeFecha}</p>
      )}
    </>
  );
}
