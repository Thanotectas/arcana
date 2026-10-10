"use client";

import { useActionState } from "react";
import { Users, BadgeCheck, Coins, Wallet, Sparkles, Send } from "lucide-react";
import { useT } from "@/lib/i18n/cliente";
import { fechaLarga, plantilla } from "@/lib/i18n/formato";
import { formatoCOP } from "@/lib/creditos";
import { accionCanjearCreditos, accionDatosPago, accionSolicitarRetiro, accionUnirmeEmbajadores, type EstadoEmbajador } from "@/lib/embajadores-acciones";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";

export interface DatosPanelEmbajador {
  resumen: {
    esEmbajador: boolean;
    desde: string | null;
    invitados: number;
    invitadosPagaron: number;
    ganadoTotal: number;
    pendiente: number;
    disponible: number;
  };
  comisiones: { fecha: string; nombre: string; comision_cop: number; estado: "anulada" | "en_espera" | "disponible" }[];
  retiros: { id: number; tipo: "creditos" | "dinero"; monto_cop: number; creditos: number | null; estado: "solicitado" | "pagado" | "rechazado"; creado_en: string }[];
  datosPago: { metodo_pago: string | null; datos_pago: string | null; titular: string | null } | null;
  reglas: { comisionPct: number; diasEspera: number; pesosPorCredito: number; retiroMinimo: number };
}

/** Avisos de éxito o error de una acción, traducidos. */
function Resultado({ estado }: { estado: EstadoEmbajador }) {
  const { t } = useT();
  const e = t.embajadores;
  if (estado.error) return <Aviso>{e.errores[estado.error]}</Aviso>;
  if (estado.mensaje) return <Aviso tipo="exito">{plantilla(e.mensajes[estado.mensaje], { creditos: estado.creditos ?? 0 })}</Aviso>;
  return null;
}

/** Invitación a unirse al programa (para quien aún no es Embajador). */
function Unirse({ reglas }: { reglas: DatosPanelEmbajador["reglas"] }) {
  const { t } = useT();
  const e = t.embajadores;
  const [estado, unirse] = useActionState<EstadoEmbajador, FormData>(accionUnirmeEmbajadores, {});
  const valores = { pct: reglas.comisionPct, dias: reglas.diasEspera, pesos: formatoCOP(reglas.pesosPorCredito), minimo: formatoCOP(reglas.retiroMinimo) };
  return (
    <form action={unirse} className="space-y-4">
      <ul className="space-y-2 text-sm">
        {e.puntos.map((p) => (
          <li key={p} className="flex gap-2"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-oro" aria-hidden />{plantilla(p, valores)}</li>
        ))}
      </ul>
      <details className="rounded-xl border border-borde p-4 text-sm text-texto-suave">
        <summary className="cursor-pointer text-texto">{e.condicionesTitulo}</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">{e.condiciones.map((c) => <li key={c}>{c}</li>)}</ul>
      </details>
      <Resultado estado={estado} />
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="acepto" required className="mt-0.5 h-4 w-4 accent-[var(--oro)]" />
        <span>{e.acepto}</span>
      </label>
      <BotonEnviar>{e.unirme}</BotonEnviar>
    </form>
  );
}

function Cifra({ icono: Icono, valor, etiqueta, destacada }: { icono: typeof Users; valor: string; etiqueta: string; destacada?: boolean }) {
  return (
    <div className={`tarjeta flex items-center gap-3 p-4 ${destacada ? "border-oro/50" : ""}`}>
      <Icono className="h-7 w-7 shrink-0 text-oro" aria-hidden />
      <div className="min-w-0">
        <p className={`font-display text-3xl ${destacada ? "text-oro-suave" : "text-texto"}`}>{valor}</p>
        <p className="text-xs text-texto-suave">{etiqueta}</p>
      </div>
    </div>
  );
}

/** Panel propio del Embajador: cifras, comisiones, canje por créditos y retiro en dinero. */
export function PanelEmbajador({ datos }: { datos: DatosPanelEmbajador }) {
  const { t, idioma } = useT();
  const e = t.embajadores;
  const { resumen: r, reglas } = datos;
  const [canje, canjear] = useActionState<EstadoEmbajador, FormData>(accionCanjearCreditos, {});
  const [retiro, retirar] = useActionState<EstadoEmbajador, FormData>(accionSolicitarRetiro, {});
  const [pago, guardarPago] = useActionState<EstadoEmbajador, FormData>(accionDatosPago, {});

  if (!r.esEmbajador) return <Unirse reglas={reglas} />;

  const valores = { pesos: formatoCOP(reglas.pesosPorCredito), minimo: formatoCOP(reglas.retiroMinimo) };
  return (
    <div className="space-y-6">
      {r.desde && <p className="text-sm text-texto-suave">{plantilla(e.desde, { fecha: fechaLarga(r.desde, idioma) })}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Cifra icono={Users} valor={String(r.invitados)} etiqueta={e.invitados} />
        <Cifra icono={BadgeCheck} valor={String(r.invitadosPagaron)} etiqueta={e.pagaron} />
        <Cifra icono={Coins} valor={formatoCOP(r.ganadoTotal)} etiqueta={e.ganado} />
        <Cifra icono={Wallet} valor={formatoCOP(r.disponible)} etiqueta={e.disponible} destacada />
      </div>
      {r.pendiente > 0 && <p className="text-sm text-texto-suave">{plantilla(e.enEspera, { monto: formatoCOP(r.pendiente), dias: reglas.diasEspera })}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <form action={canjear} className="tarjeta space-y-3 p-5">
          <h3 className="font-display text-xl font-semibold">{e.canjeTitulo}</h3>
          <p className="text-sm text-texto-suave">{plantilla(e.canjeTexto, valores)}</p>
          <Resultado estado={canje} />
          <input type="hidden" name="disponible" value={r.disponible} />
          <label className="block text-sm">
            <span className="text-texto-suave">{e.monto}</span>
            <input name="monto" inputMode="numeric" placeholder={String(reglas.pesosPorCredito)} className="campo mt-1 w-full" />
          </label>
          <div className="flex flex-wrap gap-2">
            <BotonEnviar className="boton boton-primario">{e.canjear}</BotonEnviar>
            <button type="submit" name="todo" value="1" className="boton boton-secundario" disabled={r.disponible < reglas.pesosPorCredito}>{e.todo}</button>
          </div>
        </form>

        <form action={retirar} className="tarjeta space-y-3 p-5">
          <h3 className="font-display text-xl font-semibold">{e.retiroTitulo}</h3>
          <p className="text-sm text-texto-suave">{plantilla(e.retiroTexto, valores)}</p>
          <Resultado estado={retiro} />
          <input type="hidden" name="disponible" value={r.disponible} />
          <label className="block text-sm">
            <span className="text-texto-suave">{e.monto}</span>
            <input name="monto" inputMode="numeric" placeholder={String(reglas.retiroMinimo)} className="campo mt-1 w-full" />
          </label>
          <div className="flex flex-wrap gap-2">
            <BotonEnviar className="boton boton-primario"><Send className="h-4 w-4" aria-hidden /> {e.retirar}</BotonEnviar>
            <button type="submit" name="todo" value="1" className="boton boton-secundario" disabled={r.disponible < reglas.retiroMinimo}>{e.todo}</button>
          </div>
        </form>
      </div>

      <form action={guardarPago} className="tarjeta space-y-3 p-5">
        <h3 className="font-display text-xl font-semibold">{e.pagoTitulo}</h3>
        <Resultado estado={pago} />
        <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
          <label className="block text-sm">
            <span className="text-texto-suave">{e.metodo}</span>
            <select name="metodo" defaultValue={datos.datosPago?.metodo_pago ?? "nequi"} className="campo mt-1 w-full">
              {(Object.keys(e.metodos) as (keyof typeof e.metodos)[]).map((m) => <option key={m} value={m}>{e.metodos[m]}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-texto-suave">{e.datos}</span>
            <input name="datos" defaultValue={datos.datosPago?.datos_pago ?? ""} maxLength={160} className="campo mt-1 w-full" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-texto-suave">{e.titular}</span>
          <input name="titular" defaultValue={datos.datosPago?.titular ?? ""} maxLength={120} className="campo mt-1 w-full" />
        </label>
        <BotonEnviar className="boton boton-secundario">{e.guardar}</BotonEnviar>
      </form>

      <section className="space-y-2">
        <h3 className="font-display text-xl font-semibold">{e.historial}</h3>
        {datos.comisiones.length ? (
          <ul className="divide-y divide-white/10 text-sm">
            {datos.comisiones.map((c, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2">
                <span>{c.nombre} <span className="text-xs text-texto-suave">· {fechaLarga(c.fecha, idioma)}</span></span>
                <span className="text-right">
                  <span className={c.estado === "anulada" ? "text-texto-suave line-through" : "font-semibold text-oro-suave"}>{formatoCOP(c.comision_cop)}</span>
                  <span className="ml-2 text-xs text-texto-suave">{e.estados[c.estado]}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-texto-suave">{e.sinComisiones}</p>
        )}
      </section>

      {datos.retiros.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-display text-xl font-semibold">{e.retirosTitulo}</h3>
          <ul className="divide-y divide-white/10 text-sm">
            {datos.retiros.map((x) => (
              <li key={x.id} className="flex items-center justify-between gap-3 py-2">
                <span>{e.tipos[x.tipo]} <span className="text-xs text-texto-suave">· {fechaLarga(x.creado_en, idioma)}</span></span>
                <span className="text-right">
                  <span className="font-semibold">{x.tipo === "creditos" ? `${x.creditos ?? 0} cr. · ${formatoCOP(x.monto_cop)}` : formatoCOP(x.monto_cop)}</span>
                  <span className="ml-2 text-xs text-texto-suave">{e.retiroEstados[x.estado]}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
