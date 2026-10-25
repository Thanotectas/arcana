import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { accionBaraja, accionLenormand, accionRunas } from "@/lib/lecturas/acciones";
import { TIRADAS_BARAJA, BARAJA } from "@/lib/oraculos/baraja";
import { TIRADAS_LENORMAND, LENORMAND } from "@/lib/oraculos/lenormand";
import { TIRADAS_RUNAS, RUNAS } from "@/lib/oraculos/runas";
import { RitualOraculo } from "./RitualOraculo";
import { GlifoRuna } from "./VistaOraculo";

const DATOS = {
  baraja_espanola: { clave: "baraja", accion: accionBaraja, tiradas: TIRADAS_BARAJA, total: BARAJA.length, estilo: "carta" },
  lenormand: { clave: "lenormand", accion: accionLenormand, tiradas: TIRADAS_LENORMAND, total: LENORMAND.length, estilo: "carta" },
  runas: { clave: "runas", accion: accionRunas, tiradas: TIRADAS_RUNAS, total: RUNAS.length, estilo: "runa" },
} as const;

/** Página de la baraja española, el Lenormand o las runas: explicación y ritual. */
export async function PaginaOraculo({ tipo }: { tipo: keyof typeof DATOS }) {
  await requerirUsuario();
  const [perfil, t, idioma] = await Promise.all([getPerfil(), getT(), getIdioma()]);
  const d = DATOS[tipo];
  const textos = t[d.clave];
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{textos.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{textos.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {textos.intro} {plantilla(t.comun.cuesta, { n: COSTOS[tipo], unidad: t.comun.creditos })}{" "}
          {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>

      <details className="tarjeta p-5">
        <summary className="cursor-pointer font-display text-xl">{textos.comoSeLee}</summary>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {(textos.claves as readonly { nombre: string; texto: string }[]).map((c) => (
            <div key={c.nombre} className="rounded-xl border border-borde p-3 text-sm">
              <dt className="font-semibold text-oro-suave">{c.nombre}</dt>
              <dd className="mt-1 text-texto-suave">{c.texto}</dd>
            </div>
          ))}
        </dl>
        {tipo === "runas" && (
          <ul className="mt-4 grid grid-cols-4 gap-3 text-center text-xs sm:grid-cols-6">
            {RUNAS.map((r) => (
              <li key={r.id} className="flex flex-col items-center gap-1 rounded-lg border border-borde p-2">
                <GlifoRuna runa={r} className="h-8 w-6 text-oro-suave" />
                <span className="font-semibold">{r.nombre}</span>
                <span className="text-texto-suave">{r.significado[idioma]}</span>
              </li>
            ))}
          </ul>
        )}
      </details>

      <div className="tarjeta p-6">
        <RitualOraculo
          accion={d.accion}
          total={d.total}
          estilo={d.estilo}
          tiradas={d.tiradas.map((x) => ({ id: x.id, nombre: x.nombre[idioma], descripcion: x.descripcion[idioma], n: x.posiciones.length }))}
          textos={{ elige: textos.elige, leer: textos.leer }}
          dorso={tipo === "baraja_espanola" ? "/cartas/espanola/dorso.webp" : undefined}
        />
      </div>
    </div>
  );
}
