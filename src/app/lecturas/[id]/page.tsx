import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLectura, requerirUsuario } from "@/lib/dal";
import { NOMBRES_LECTURA } from "@/lib/creditos";
import { LecturaEnVivo } from "@/components/LecturaEnVivo";
import { rotuloCarta } from "@/components/CartaVisual";
import { TiradaInteractiva, type CartaRevelada } from "@/components/TiradaInteractiva";
import { RuedaAstral } from "@/components/RuedaAstral";
import { TIRADAS, cartasDeTirada, type CartaTirada, type TipoTirada } from "@/lib/tarot/tiradas";
import { NOMBRES_CUERPO, type Cuerpo } from "@/lib/astro/efemerides";
import { NOMBRES_ASPECTO, SIMBOLOS_ASPECTO, type Aspecto } from "@/lib/astro/carta";
import type { Casas } from "@/lib/astro/casas";
import { signoPorId, signoPorLongitud, formatoGrado } from "@/lib/zodiaco";
import { SIGNIFICADO_NUMERO, type PerfilNumerologico } from "@/lib/numerologia";

export const metadata: Metadata = { title: "Lectura" };

export default async function PaginaLectura({ params }: { params: Promise<{ id: string }> }) {
  await requerirUsuario();
  const { id } = await params;
  const lectura = await getLectura(id);
  if (!lectura) notFound();

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{NOMBRES_LECTURA[lectura.tipo]}</p>
        <h1 className="font-display text-4xl font-semibold">{lectura.titulo}</h1>
        <p className="mt-1 text-sm text-texto-suave">{new Date(lectura.creado_en).toLocaleString("es-CO")}</p>
      </header>

      {lectura.tipo.startsWith("tarot") && <VistaTarot tipo={lectura.tipo as TipoTirada} resultado={lectura.resultado} nueva={lectura.estado !== "lista"} />}
      {lectura.tipo === "carta_astral" && <VistaCartaAstral resultado={lectura.resultado} entrada={lectura.entrada} />}
      {lectura.tipo === "numerologia" && <VistaNumerologia resultado={lectura.resultado as unknown as PerfilNumerologico} />}
      {lectura.tipo === "compatibilidad" && <VistaCompatibilidad resultado={lectura.resultado} />}

      <section className="tarjeta p-6 sm:p-8">
        <LecturaEnVivo id={lectura.id} estadoInicial={lectura.estado} textoInicial={lectura.interpretacion} />
      </section>

      <p className="text-xs text-texto-suave">
        Esta lectura es una herramienta de reflexión y entretenimiento. No sustituye asesoría profesional.
      </p>
      <div className="flex gap-3">
        <Link href="/lecturas" className="boton boton-secundario">Mis lecturas</Link>
        <Link href="/inicio" className="boton boton-fantasma">Inicio</Link>
      </div>
    </article>
  );
}

function VistaTarot({ tipo, resultado, nueva }: { tipo: TipoTirada; resultado: Record<string, unknown>; nueva: boolean }) {
  const tirada = TIRADAS[tipo];
  const cartas: CartaRevelada[] = cartasDeTirada((resultado.cartas as CartaTirada[]) ?? []).map((c) => {
    const pos = tirada.posiciones[c.posicion];
    return {
      nombre: c.carta.nombre,
      ...rotuloCarta(c.carta),
      invertida: c.invertida,
      posicion: pos?.nombre ?? "",
      posicionDescripcion: pos?.descripcion ?? "",
      palabras: c.invertida ? c.carta.palabrasClaveInvertida : c.carta.palabrasClave,
      significado: c.invertida ? c.carta.significadoInvertido : c.carta.significado,
      amor: c.carta.amor,
      trabajo: c.carta.trabajo,
    };
  });
  return <TiradaInteractiva cartas={cartas} ocultas={nueva} />;
}

interface ResultadoAstral {
  planetas: { cuerpo: Cuerpo; longitud: number; retrogrado: boolean; casa: number; signo: string }[];
  casas: Casas;
  aspectos: Aspecto[];
  elementos: Record<string, number>;
  modalidades: Record<string, number>;
}

function VistaCartaAstral({ resultado, entrada }: { resultado: Record<string, unknown>; entrada: Record<string, unknown> }) {
  const r = resultado as unknown as ResultadoAstral;
  const horaDesconocida = Boolean(entrada.horaDesconocida);
  const asc = signoPorLongitud(r.casas.ascendente);
  const mc = signoPorLongitud(r.casas.medioCielo);
  return (
    <section className="space-y-6">
      <div className="tarjeta p-4 sm:p-6">
        <RuedaAstral planetas={r.planetas} cuspides={r.casas.cuspides} ascendente={r.casas.ascendente} aspectos={r.aspectos} mostrarCasas={!horaDesconocida} />
        {!horaDesconocida && (
          <p className="mt-3 text-center text-sm text-texto-suave">
            Ascendente {asc.simbolo} {asc.nombre} {formatoGrado(r.casas.ascendente)} · Medio Cielo {mc.simbolo} {mc.nombre} {formatoGrado(r.casas.medioCielo)} · Casas {r.casas.sistema}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="tarjeta p-5">
          <h2 className="font-display mb-3 text-2xl">Posiciones</h2>
          <table className="w-full text-sm">
            <tbody>
              {r.planetas.map((p) => {
                const s = signoPorId(p.signo)!;
                return (
                  <tr key={p.cuerpo} className="border-t border-borde">
                    <td className="py-1.5">{NOMBRES_CUERPO[p.cuerpo]}</td>
                    <td className="py-1.5">{s.simbolo} {s.nombre} {formatoGrado(p.longitud)}{p.retrogrado && p.cuerpo !== "nodo_norte" ? " ℞" : ""}</td>
                    <td className="py-1.5 text-right text-texto-suave">{horaDesconocida ? "" : `casa ${p.casa}`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="tarjeta p-5">
          <h2 className="font-display mb-3 text-2xl">Aspectos</h2>
          <ul className="space-y-1 text-sm">
            {r.aspectos.slice(0, 14).map((a, i) => (
              <li key={i} className="flex justify-between border-t border-borde py-1.5">
                <span>{NOMBRES_CUERPO[a.a]} {SIMBOLOS_ASPECTO[a.tipo]} {NOMBRES_CUERPO[a.b]}</span>
                <span className="text-texto-suave">{NOMBRES_ASPECTO[a.tipo]} · {a.orbe}°</span>
              </li>
            ))}
          </ul>
          <h3 className="font-display mb-2 mt-5 text-xl">Elementos</h3>
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            {Object.entries(r.elementos).map(([k, v]) => (
              <div key={k} className="rounded-lg bg-superficie-2 p-2">
                <p className="text-lg font-semibold text-oro-suave">{v}</p>
                <p className="text-xs capitalize text-texto-suave">{k}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function VistaNumerologia({ resultado }: { resultado: PerfilNumerologico }) {
  const filas: [string, number][] = [
    ["Camino de vida", resultado.caminoDeVida],
    ["Expresión", resultado.expresion],
    ["Impulso del alma", resultado.almaOImpulso],
    ["Personalidad", resultado.personalidad],
    ["Cumpleaños", resultado.cumpleanos],
    ["Año personal", resultado.anioPersonal],
  ];
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {filas.map(([nombre, n]) => (
        <div key={nombre} className="tarjeta p-4 text-center">
          <p className="font-display text-5xl text-oro-suave">{n}</p>
          <p className="mt-1 text-sm font-medium">{nombre}</p>
          <p className="text-xs text-texto-suave">{SIGNIFICADO_NUMERO[n]?.titulo}</p>
        </div>
      ))}
    </section>
  );
}

function VistaCompatibilidad({ resultado }: { resultado: Record<string, unknown> }) {
  const a = signoPorId(String(resultado.signoA));
  const b = signoPorId(String(resultado.signoB));
  const puntaje = Number(resultado.puntaje);
  return (
    <section className="tarjeta flex flex-wrap items-center justify-center gap-8 p-6 text-center">
      <div>
        <p className="text-5xl">{a?.simbolo}</p>
        <p className="font-display text-xl">{a?.nombre}</p>
      </div>
      <div>
        <p className="font-display text-6xl text-oro-suave">{puntaje}%</p>
        <p className="text-xs uppercase tracking-widest text-texto-suave">afinidad</p>
      </div>
      <div>
        <p className="text-5xl">{b?.simbolo}</p>
        <p className="font-display text-xl">{b?.nombre}</p>
      </div>
    </section>
  );
}
