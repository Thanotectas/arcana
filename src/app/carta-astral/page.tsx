import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { requerirUsuario, getPerfil, lugarDePerfil, horaDePerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { accionCartaAstral, accionVistaPreviaAstral } from "@/lib/lecturas/acciones";
import { FormularioLectura } from "@/components/FormularioLectura";
import { CampoLugar } from "@/components/CampoLugar";
import { CampoHora } from "@/components/CampoHoraDesconocida";
import { VistaCartaAstral } from "@/components/VistaCartaAstral";
import { calcularCarta, type DatosNacimiento } from "@/lib/astro/carta";
import { zonaHorariaValida } from "@/lib/seguridad";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.cartaAstral };
}

type Params = { vista?: string; nombre?: string; fecha?: string; hora?: string; lugar?: string; lat?: string; lon?: string; zona?: string };

/** Datos de nacimiento válidos desde la URL de la vista previa, o null. */
function datosDesdeParams(q: Params): DatosNacimiento | null {
  if (q.vista !== "1") return null;
  const d: DatosNacimiento = {
    nombre: (q.nombre ?? "").trim().slice(0, 80),
    fecha: q.fecha ?? "",
    hora: q.hora || "12:00",
    horaDesconocida: !q.hora,
    lugar: (q.lugar ?? "").trim().slice(0, 120),
    latitud: Number(q.lat),
    longitud: Number(q.lon),
    zonaHoraria: q.zona ?? "",
  };
  if (!d.nombre || !/^\d{4}-\d{2}-\d{2}$/.test(d.fecha) || !/^\d{2}:\d{2}$/.test(d.hora)) return null;
  if (!d.lugar || Number.isNaN(d.latitud) || Number.isNaN(d.longitud) || Math.abs(d.latitud) > 90 || Math.abs(d.longitud) > 180) return null;
  if (!zonaHorariaValida(d.zonaHoraria)) return null;
  const anio = Number(d.fecha.slice(0, 4));
  if (anio < 1900 || anio > new Date().getFullYear()) return null;
  return d;
}

const lista = (r: string[]) => r.slice(0, 3).join(", ");

export default async function PaginaCartaAstral({ searchParams }: { searchParams: Promise<Params> }) {
  await requerirUsuario();
  const [perfil, t, q] = await Promise.all([getPerfil(), getT(), searchParams]);
  const datos = datosDesdeParams(q);

  // ----- Vista previa gratuita: la carta calculada y la lectura bloqueada -----
  if (datos) {
    const carta = calcularCarta(datos);
    const resultado = {
      planetas: carta.planetas.map((p) => ({ cuerpo: p.cuerpo, longitud: p.longitud, retrogrado: p.retrogrado, casa: p.casa, signo: p.signo.id })),
      casas: carta.casas,
      aspectos: carta.aspectos,
      elementos: carta.elementos,
      modalidades: carta.modalidades,
    };
    const sol = carta.planetas.find((p) => p.cuerpo === "sol")!.signo;
    const luna = carta.planetas.find((p) => p.cuerpo === "luna")!.signo;
    const resumen =
      plantilla(t.astral.vista.resumen, { sol: sol.nombre, rasgosSol: lista(sol.rasgos), luna: luna.nombre, rasgosLuna: lista(luna.rasgos) }) +
      (datos.horaDesconocida ? "" : plantilla(t.astral.vista.resumenAsc, { asc: carta.ascendente.signo.nombre, rasgosAsc: lista(carta.ascendente.signo.rasgos) }));
    // Texto difuminado detrás del candado: solo decoración, sin sentido legible.
    const relleno = [sol, luna, carta.ascendente.signo].flatMap((s) => s.rasgos).concat(carta.planetas.map((p) => p.signo.nombre));
    const borroso = Array.from({ length: 9 }, (_, i) => relleno.slice(i % 4, (i % 4) + 9).join(" · ")).join(". ");

    return (
      <div className="mx-auto max-w-4xl space-y-6" id="vista">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.astral.seccion}</p>
          <h1 className="font-display text-4xl font-semibold">{plantilla(t.astral.vista.titulo, { nombre: datos.nombre })}</h1>
          <p className="mt-2 text-texto-suave">{resumen}</p>
        </div>

        <VistaCartaAstral resultado={resultado} entrada={{ horaDesconocida: datos.horaDesconocida }} t={t} />

        <section className="tarjeta relative overflow-hidden border-oro/50 p-6 sm:p-8">
          <p className="relative select-none text-texto-suave blur-sm" aria-hidden>
            {borroso}
          </p>
          <div className="absolute inset-0 bg-gradient-to-b from-superficie/30 via-superficie/90 to-superficie" />
          <div className="relative mx-auto -mt-16 max-w-xl text-center">
            <Lock className="mx-auto h-8 w-8 text-oro" aria-hidden />
            <h2 className="font-display mt-2 text-3xl">{t.astral.vista.bloqueadaTitulo}</h2>
            <p className="mt-2 text-texto-suave">{t.astral.vista.bloqueadaTexto}</p>
            <div className="mt-5">
              <FormularioLectura accion={accionCartaAstral} textoBoton={plantilla(t.astral.vista.desbloquear, { n: COSTOS.carta_astral })} textoCargando={t.astral.calculando}>
                <input type="hidden" name="nombre" value={datos.nombre} />
                <input type="hidden" name="fecha" value={datos.fecha} />
                <input type="hidden" name="hora" value={datos.hora} />
                {datos.horaDesconocida && <input type="hidden" name="hora_desconocida" value="on" />}
                <input type="hidden" name="lugar" value={datos.lugar} />
                <input type="hidden" name="latitud" value={String(datos.latitud)} />
                <input type="hidden" name="longitud" value={String(datos.longitud)} />
                <input type="hidden" name="zona_horaria" value={datos.zonaHoraria} />
              </FormularioLectura>
            </div>
            <p className="mt-3 text-sm text-texto-suave">
              {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}{" "}
              <Link href="/carta-astral" className="underline">{t.astral.vista.editar}</Link>
            </p>
          </div>
        </section>
      </div>
    );
  }

  // ----- Formulario: calcular es gratis -----
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.astral.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.astral.titulo}</h1>
        <p className="mt-2 text-texto-suave">{t.astral.intro}</p>
        <p className="mt-2 flex items-start gap-2 text-sm text-oro-suave"><Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{plantilla(t.astral.vista.nota, { n: COSTOS.carta_astral })}</p>
      </div>

      <div className="tarjeta p-6">
        <FormularioLectura accion={accionVistaPreviaAstral} textoBoton={t.astral.vista.calcularGratis} textoCargando={t.astral.calculando}>
          <div>
            <label className="etiqueta" htmlFor="nombre">{t.astral.nombre}</label>
            <input id="nombre" name="nombre" className="campo" defaultValue={perfil?.nombre ?? ""} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="etiqueta" htmlFor="fecha">{t.astral.fecha}</label>
              <input id="fecha" name="fecha" type="date" className="campo" min="1900-01-01" required defaultValue={perfil?.fecha_nacimiento ?? ""} />
            </div>
            <CampoHora valorInicial={horaDePerfil(perfil)} />
          </div>
          <CampoLugar valorInicial={lugarDePerfil(perfil)} />
        </FormularioLectura>
      </div>
    </div>
  );
}
