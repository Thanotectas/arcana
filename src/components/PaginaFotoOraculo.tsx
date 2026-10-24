import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { FormularioFotoOraculo } from "./FormularioFotoOraculo";

/** Página de la lectura del café o de la limpia con huevo. */
export async function PaginaFotoOraculo({ tipo }: { tipo: "cafe" | "huevo" }) {
  await requerirUsuario();
  const [perfil, t] = await Promise.all([getPerfil(), getT()]);
  const textos = t[tipo];
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{textos.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{textos.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {textos.intro} {plantilla(t.comun.cuesta, { n: COSTOS[tipo], unidad: t.comun.creditos })}{" "}
          {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>

      <details className="tarjeta p-5">
        <summary className="cursor-pointer font-display text-xl">{textos.queSeLee}</summary>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {(textos.senales as readonly { nombre: string; texto: string }[]).map((s) => (
            <div key={s.nombre} className="rounded-xl border border-borde p-3 text-sm">
              <dt className="font-semibold text-oro-suave">{s.nombre}</dt>
              <dd className="mt-1 text-texto-suave">{s.texto}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-texto-suave">{textos.consejo}</p>
      </details>

      <div className="tarjeta p-6">
        <FormularioFotoOraculo tipo={tipo} />
      </div>
    </div>
  );
}
