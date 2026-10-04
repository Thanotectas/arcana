import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLectura, requerirUsuario, getPreguntas, getPerfil, circuloActivo } from "@/lib/dal";
import { comprasVisibles } from "@/lib/plataforma";
import { ConversacionLectura } from "@/components/ConversacionLectura";
import { COSTO_PREGUNTA, PREGUNTAS_GRATIS_POR_LECTURA } from "@/lib/creditos";
import { LecturaEnVivo } from "@/components/LecturaEnVivo";
import { LecturaQuiromancia } from "@/components/LecturaQuiromancia";
import { rotuloCarta, imagenCarta } from "@/components/CartaVisual";
import { TiradaInteractiva, type CartaRevelada } from "@/components/TiradaInteractiva";
import { RuedaAstral } from "@/components/RuedaAstral";
import { CompartirLectura } from "@/components/CompartirLectura";
import { TIRADAS, POSICIONES_I18N, cartasDeTirada, type CartaTirada, type TipoTirada } from "@/lib/tarot/tiradas";
import { MAZOS, esMazo, type IdMazo } from "@/lib/tarot/mazos";
import { NOMBRES_CUERPO, type Cuerpo } from "@/lib/astro/efemerides";
import { NOMBRES_ASPECTO, SIMBOLOS_ASPECTO, type Aspecto } from "@/lib/astro/carta";
import type { Casas } from "@/lib/astro/casas";
import { signoPorId, signoPorLongitud, formatoGrado, imagenSigno } from "@/lib/zodiaco";
import { SIGNIFICADO_NUMERO, type PerfilNumerologico } from "@/lib/numerologia";
import { HexagramaVisual } from "@/components/HexagramaVisual";
import { hexagramaPorNumero, esYang, SIMBOLO_TRIGRAMA, type ResultadoIChing } from "@/lib/iching";
import { SiguientePaso } from "@/components/SiguientePaso";
import { FICHA, COLOR_ELEMENTO, CARACTER_ELEMENTO, type ResultadoChino, type Animal, type ElementoChino, type PilarAnio } from "@/lib/chino";
import type { EntradaSueno, ResultadoSueno } from "@/lib/suenos";
import { TONO_COLOR, type EntradaVelas } from "@/lib/velas";
import { COLORES_AURA, type ResultadoAura } from "@/lib/aura";
import { Aura } from "@/components/Aura";
import type { ResultadoSinastria, Dimension } from "@/lib/astro/sinastria";
import type { FuenteCruce } from "@/lib/cruce";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { fechaHora, plantilla } from "@/lib/i18n/formato";
import type { Diccionario } from "@/lib/i18n/diccionarios";
import type { Idioma } from "@/lib/i18n/idiomas";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.lecturas.lista.titulo };
}

export default async function PaginaLectura({ params }: { params: Promise<{ id: string }> }) {
  await requerirUsuario();
  const { id } = await params;
  const [lectura, t, idioma, perfil, compras] = await Promise.all([getLectura(id), getT(), getIdioma(), getPerfil(), comprasVisibles()]);
  if (!lectura) notFound();
  const preguntas = lectura.estado === "lista" ? await getPreguntas(lectura.id) : [];

  const esQuiromancia = lectura.tipo === "quiromancia";
  const esChocolate = lectura.tipo === "chocolate";
  const esVelas = lectura.tipo === "velas";
  const esTabaco = lectura.tipo === "tabaco";
  const urlFoto = esQuiromancia || esChocolate || esVelas || esTabaco ? await urlFirmadaPalma(String(lectura.entrada.foto ?? "")) : null;

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.lecturas.nombres[lectura.tipo]}</p>
          <h1 className="font-display text-4xl font-semibold">{lectura.titulo}</h1>
          <p className="mt-1 text-sm text-texto-suave">{fechaHora(lectura.creado_en, idioma)}</p>
        </div>
        <CompartirLectura titulo={lectura.titulo} id={lectura.id} lista={lectura.estado === "lista"} />
      </header>

      {lectura.tipo.startsWith("tarot") && (
        <VistaTarot tipo={lectura.tipo as TipoTirada} entrada={lectura.entrada} resultado={lectura.resultado} nueva={lectura.estado !== "lista"} idioma={idioma} />
      )}
      {lectura.tipo === "carta_astral" && <VistaCartaAstral resultado={lectura.resultado} entrada={lectura.entrada} t={t} />}
      {lectura.tipo === "numerologia" && <VistaNumerologia resultado={lectura.resultado as unknown as PerfilNumerologico} t={t} />}
      {lectura.tipo === "compatibilidad" && <VistaCompatibilidad resultado={lectura.resultado} t={t} />}
      {lectura.tipo === "iching" && <VistaIChing resultado={lectura.resultado as unknown as ResultadoIChing} t={t} />}
      {lectura.tipo === "chino" && <VistaChino resultado={lectura.resultado as unknown as ResultadoChino} t={t} />}
      {lectura.tipo === "cruce" && <VistaCruce entrada={lectura.entrada} resultado={lectura.resultado} t={t} />}
      {esChocolate && urlFoto && (
        <section className="tarjeta p-4">
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.chocolate.tuTaza}</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- foto privada firmada */}
          <img src={urlFoto} alt={t.chocolate.tuTaza} className="mx-auto max-h-96 rounded-xl" />
        </section>
      )}
      {esTabaco && urlFoto && (
        <section className="tarjeta p-4">
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.tabaco.tuTabaco}</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- foto privada firmada */}
          <img src={urlFoto} alt={t.tabaco.tuTabaco} className="mx-auto max-h-96 rounded-xl" />
        </section>
      )}
      {lectura.tipo === "aura" && <VistaAura resultado={lectura.resultado as unknown as ResultadoAura} t={t} />}
      {esVelas && <VistaVelas entrada={lectura.entrada as unknown as EntradaVelas} urlFoto={urlFoto} t={t} />}
      {lectura.tipo === "sinastria" && <VistaSinastria resultado={lectura.resultado as unknown as ResultadoSinastria} t={t} />}
      {lectura.tipo === "suenos" && <VistaSueno entrada={lectura.entrada as unknown as EntradaSueno} resultado={lectura.resultado as unknown as ResultadoSueno} t={t} />}

      {esQuiromancia ? (
        <LecturaQuiromancia id={lectura.id} estadoInicial={lectura.estado} textoInicial={lectura.interpretacion} urlFoto={urlFoto} />
      ) : (
        <section className="tarjeta p-6 sm:p-8">
          <LecturaEnVivo id={lectura.id} estadoInicial={lectura.estado} textoInicial={lectura.interpretacion} />
        </section>
      )}

      {lectura.estado === "lista" && (
        <ConversacionLectura
          lecturaId={lectura.id}
          iniciales={preguntas}
          costo={COSTO_PREGUNTA}
          gratisRestantes={PREGUNTAS_GRATIS_POR_LECTURA}
          ilimitado={Boolean(perfil?.ilimitado)}
          enCirculo={circuloActivo(perfil)}
          compras={compras}
        />
      )}
      {lectura.estado === "lista" && <SiguientePaso tipo={lectura.tipo} />}
      {lectura.estado === "lista" && perfil && !perfil.ilimitado && (
        <p className="flex flex-wrap items-center gap-2 text-sm text-texto-suave">
          {plantilla(t.crecimiento.saldoLectura, { n: perfil.creditos })}
          {compras && perfil.creditos <= 1 && (
            <Link href="/creditos" className="text-oro-suave underline">{t.persuasion.recargar}</Link>
          )}
        </p>
      )}

      <p className="text-xs text-texto-suave">{t.comun.aviso}</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/lecturas" className="boton boton-secundario">{t.comun.misLecturas}</Link>
        <Link href={rutaNueva(lectura.tipo)} className="boton boton-fantasma">{t.lecturas.detalle.nuevaLectura}</Link>
      </div>
    </article>
  );
}

function rutaNueva(tipo: string) {
  if (tipo.startsWith("tarot")) return "/tarot";
  if (tipo === "carta_astral") return "/carta-astral";
  if (tipo === "numerologia") return "/numerologia";
  if (tipo === "quiromancia") return "/quiromancia";
  if (tipo === "iching") return "/iching";
  if (tipo === "chino") return "/calendario-chino";
  if (tipo === "cruce") return "/cruce";
  if (tipo === "suenos") return "/suenos";
  if (tipo === "sinastria") return "/sinastria";
  if (tipo === "chocolate") return "/chocolate";
  if (tipo === "velas") return "/velas";
  if (tipo === "aura") return "/aura";
  if (tipo === "tabaco") return "/tabaco";
  return "/compatibilidad";
}

async function urlFirmadaPalma(ruta: string) {
  if (!ruta) return null;
  const { data } = await getSupabaseAdmin().storage.from("palmas").createSignedUrl(ruta, 60 * 60);
  return data?.signedUrl ?? null;
}

function VistaTarot({
  tipo,
  entrada,
  resultado,
  nueva,
  idioma,
}: {
  tipo: TipoTirada;
  entrada: Record<string, unknown>;
  resultado: Record<string, unknown>;
  nueva: boolean;
  idioma: Idioma;
}) {
  const mazo: IdMazo = esMazo(entrada.mazo) ? entrada.mazo : "rider";
  const posiciones = POSICIONES_I18N[idioma][tipo] ?? TIRADAS[tipo].posiciones;
  const cartas: CartaRevelada[] = cartasDeTirada((resultado.cartas as CartaTirada[]) ?? [], mazo).map((c) => {
    const pos = posiciones[c.posicion];
    return {
      nombre: c.carta.nombre,
      ...rotuloCarta(c.carta, mazo),
      imagen: imagenCarta(c.carta, mazo),
      repeticiones: c.carta.arcano === "menor" ? c.carta.numero : 1,
      invertida: c.invertida,
      posicion: pos?.nombre ?? "",
      posicionDescripcion: pos?.descripcion ?? "",
      palabras: c.invertida ? c.carta.palabrasClaveInvertida : c.carta.palabrasClave,
      significado: c.invertida ? c.carta.significadoInvertido : c.carta.significado,
      sombra: c.carta.significadoInvertido,
      amor: c.carta.amor,
      trabajo: c.carta.trabajo,
    };
  });
  return <TiradaInteractiva cartas={cartas} ocultas={nueva} estilo={MAZOS[mazo].estilo} />;
}

interface ResultadoAstral {
  planetas: { cuerpo: Cuerpo; longitud: number; retrogrado: boolean; casa: number; signo: string }[];
  casas: Casas;
  aspectos: Aspecto[];
  elementos: Record<string, number>;
  modalidades: Record<string, number>;
}

function VistaCartaAstral({ resultado, entrada, t }: { resultado: Record<string, unknown>; entrada: Record<string, unknown>; t: Diccionario }) {
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
            {t.astral.ascendente} {asc.simbolo} {asc.nombre} {formatoGrado(r.casas.ascendente)} · {t.astral.medioCielo} {mc.simbolo} {mc.nombre} {formatoGrado(r.casas.medioCielo)} · {t.astral.casas} {r.casas.sistema}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="tarjeta p-5">
          <h2 className="font-display mb-3 text-2xl">{t.astral.posiciones}</h2>
          <table className="w-full text-sm">
            <tbody>
              {r.planetas.map((p) => {
                const s = signoPorId(p.signo)!;
                return (
                  <tr key={p.cuerpo} className="border-t border-borde">
                    <td className="py-1.5">{NOMBRES_CUERPO[p.cuerpo]}</td>
                    <td className="py-1.5">{s.simbolo} {s.nombre} {formatoGrado(p.longitud)}{p.retrogrado && p.cuerpo !== "nodo_norte" ? " ℞" : ""}</td>
                    <td className="py-1.5 text-right text-texto-suave">{horaDesconocida ? "" : plantilla(t.astral.casaN, { n: p.casa })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="tarjeta p-5">
          <h2 className="font-display mb-3 text-2xl">{t.astral.aspectos}</h2>
          <ul className="space-y-1 text-sm">
            {r.aspectos.slice(0, 14).map((a, i) => (
              <li key={i} className="flex justify-between border-t border-borde py-1.5">
                <span>{NOMBRES_CUERPO[a.a]} {SIMBOLOS_ASPECTO[a.tipo]} {NOMBRES_CUERPO[a.b]}</span>
                <span className="text-texto-suave">{NOMBRES_ASPECTO[a.tipo]} · {a.orbe}°</span>
              </li>
            ))}
          </ul>
          <h3 className="font-display mb-2 mt-5 text-xl">{t.astral.elementos}</h3>
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            {Object.entries(r.elementos).map(([k, v]) => (
              <div key={k} className="rounded-lg bg-superficie-2 p-2">
                <p className="text-lg font-semibold text-oro-suave">{v}</p>
                <p className="text-xs capitalize text-texto-suave">{t.horoscopo.elementos[k as keyof typeof t.horoscopo.elementos] ?? k}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function VistaNumerologia({ resultado, t }: { resultado: PerfilNumerologico; t: Diccionario }) {
  const claves = ["caminoDeVida", "expresion", "almaOImpulso", "personalidad", "cumpleanos", "anioPersonal"] as const;
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {claves.map((k, i) => (
        <div key={k} className="tarjeta aparecer p-4 text-center" style={{ animationDelay: `${i * 90}ms` }}>
          <p className="font-display text-5xl text-oro-suave">{resultado[k]}</p>
          <p className="mt-1 text-sm font-medium">{t.numerologia.numeros[k]}</p>
          <p className="text-xs text-texto-suave">{SIGNIFICADO_NUMERO[resultado[k]]?.titulo}</p>
        </div>
      ))}
    </section>
  );
}

function VistaCompatibilidad({ resultado, t }: { resultado: Record<string, unknown>; t: Diccionario }) {
  const a = signoPorId(String(resultado.signoA));
  const b = signoPorId(String(resultado.signoB));
  const puntaje = Number(resultado.puntaje);
  return (
    <section className="tarjeta flex flex-wrap items-center justify-center gap-8 p-6 text-center">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element -- moneda estática pequeña */}
        {a && <img src={imagenSigno(a.id)} alt="" width={96} height={96} className="moneda-signo mx-auto" />}
        <p className="font-display text-xl">{a?.nombre}</p>
      </div>
      <div>
        <p className="font-display text-6xl text-oro-suave">{puntaje}%</p>
        <p className="text-xs uppercase tracking-widest text-texto-suave">{t.compatibilidad.afinidad}</p>
      </div>
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element -- moneda estática pequeña */}
        {b && <img src={imagenSigno(b.id)} alt="" width={96} height={96} className="moneda-signo mx-auto" />}
        <p className="font-display text-xl">{b?.nombre}</p>
      </div>
    </section>
  );
}

function VistaIChing({ resultado, t }: { resultado: ResultadoIChing; t: Diccionario }) {
  const presente = hexagramaPorNumero(resultado.presente);
  const futuro = resultado.futuro ? hexagramaPorNumero(resultado.futuro) : null;
  if (!presente) return null;
  const lineas = resultado.valores.map((v) => (esYang(v) ? 1 : 0)) as (0 | 1)[];
  return (
    <section className={`grid gap-4 ${futuro ? "md:grid-cols-2" : ""}`}>
      <BloqueHexagrama h={presente} titulo={t.iching.presente} lineasH={lineas} mutantes={resultado.mutantes} t={t} />
      {futuro && <BloqueHexagrama h={futuro} titulo={t.iching.futuro} lineasH={futuro.lineas} mutantes={[]} t={t} />}
    </section>
  );
}

function BloqueHexagrama({
  h,
  titulo,
  lineasH,
  mutantes,
  t,
}: {
  h: NonNullable<ReturnType<typeof hexagramaPorNumero>>;
  titulo: string;
  lineasH: (0 | 1)[];
  mutantes: number[];
  t: Diccionario;
}) {
  return (
    <div className="tarjeta flex flex-col items-center gap-3 p-5 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{titulo}</p>
      <HexagramaVisual lineas={lineasH} mutantes={mutantes} tamano={110} animado />
      <p className="font-display text-2xl text-oro-suave">
        {h.numero}. {h.nombre} <span className="text-base text-texto-suave">{h.chino} · {h.pinyin}</span>
      </p>
      <p className="text-xs text-texto-suave">
        {SIMBOLO_TRIGRAMA[h.trigramaSuperior]} {t.iching.trigramas[h.trigramaSuperior]} / {SIMBOLO_TRIGRAMA[h.trigramaInferior]} {t.iching.trigramas[h.trigramaInferior]}
      </p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {h.palabrasClave.map((p) => (
          <span key={p} className="rounded-full border border-oro/30 px-2.5 py-0.5 text-xs text-oro-suave">{p}</span>
        ))}
      </div>
    </div>
  );
}

function VistaChino({ resultado, t }: { resultado: ResultadoChino; t: Diccionario }) {
  const nombres = t.chino.animales as Record<Animal, string>;
  const elementos = t.chino.elementos as Record<ElementoChino, string>;
  const pilar = (p: PilarAnio) => plantilla(t.chino.pilar, { animal: nombres[p.animal], elemento: elementos[p.elemento] });
  const color = COLOR_ELEMENTO[resultado.pilar.elemento];
  return (
    <section className="grid gap-4 sm:grid-cols-[auto_1fr]">
      <div className="tarjeta flex flex-col items-center justify-center p-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático pequeño, sin optimización necesaria */}
        <img src={`/animales/${resultado.pilar.animal}.webp`} alt="" width={128} height={128} className="animal-oro-vivo" />
        <p className="mt-1 text-2xl" style={{ color }}>{FICHA[resultado.pilar.animal].caracter}</p>
        <p className="font-display mt-2 text-2xl text-oro-suave">{pilar(resultado.pilar)}</p>
        <p className="text-xs text-texto-suave">{CARACTER_ELEMENTO[resultado.pilar.elemento]} {elementos[resultado.pilar.elemento]} · {resultado.pilar.polaridad} · {resultado.pilar.anio}</p>
      </div>
      <div className="tarjeta grid gap-2 p-5 text-sm sm:grid-cols-2">
        <p><span className="text-texto-suave">{t.chino.trino}:</span> {resultado.companeros.map((a) => nombres[a]).join(" · ")}</p>
        <p><span className="text-texto-suave">{t.chino.amigo}:</span> {nombres[resultado.amigo]}</p>
        <p><span className="text-texto-suave">{t.chino.choque}:</span> {nombres[resultado.choque]}</p>
        {resultado.animalHora && <p><span className="text-texto-suave">{t.chino.animalSecreto}:</span> {nombres[resultado.animalHora]}</p>}
        <p className="sm:col-span-2"><span className="text-texto-suave">{t.chino.anioActual}:</span> {resultado.anioActual.anio}, {pilar(resultado.anioActual)} · {(t.chino.relaciones as Record<string, string>)[resultado.relacionAnioActual]}</p>
      </div>
    </section>
  );
}

function VistaCruce({ entrada, resultado, t }: { entrada: Record<string, unknown>; resultado: Record<string, unknown>; t: Diccionario }) {
  const fuentes = ((resultado.fuentes as FuenteCruce[] | undefined) ?? []).slice(0, 2);
  const nombres = t.cruce.sistemas as Record<string, string>;
  const pregunta = typeof entrada.pregunta === "string" && entrada.pregunta ? entrada.pregunta : null;
  return (
    <section className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        {fuentes.map((f, i) => (
          <div key={f.sistema} className="contents">
            {i === 1 && <p className="text-center font-display text-4xl text-oro">×</p>}
            <div className="tarjeta p-4">
              <p className="text-xs uppercase tracking-widest text-violeta-suave">{nombres[f.sistema] ?? f.sistema}</p>
              {f.lecturaId ? (
                <Link href={`/lecturas/${f.lecturaId}`} className="mt-1 block text-sm text-oro-suave underline">{f.titulo ?? t.cruce.lecturaPrevia}</Link>
              ) : (
                <p className="mt-1 text-sm text-texto-suave">{t.cruce.desdeDatos}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {pregunta && <p className="text-sm text-texto-suave">{t.cruce.pregunta}: <span className="text-texto">{pregunta}</span></p>}
    </section>
  );
}

function VistaSueno({ entrada, resultado, t }: { entrada: EntradaSueno; resultado: ResultadoSueno; t: Diccionario }) {
  const emociones = t.suenos.emociones as Record<string, string>;
  return (
    <section className="tarjeta space-y-3 p-6">
      <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.suenos.tuSueno}</p>
      <p className="whitespace-pre-line text-texto-suave">{entrada.texto}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        {entrada.emocion && <span className="rounded-full bg-violeta/20 px-3 py-1 text-violeta-suave">{emociones[entrada.emocion] ?? entrada.emocion}</span>}
        {entrada.recurrente && <span className="rounded-full bg-oro/15 px-3 py-1 text-oro-suave">{t.suenos.recurrente}</span>}
        {entrada.fecha && <span className="rounded-full bg-white/5 px-3 py-1 text-texto-suave">{entrada.fecha}</span>}
        {resultado.previos?.length > 0 && <span className="rounded-full bg-white/5 px-3 py-1 text-texto-suave">{plantilla(t.suenos.conDiario, { n: resultado.previos.length })}</span>}
      </div>
    </section>
  );
}

function VistaSinastria({ resultado, t }: { resultado: ResultadoSinastria; t: Diccionario }) {
  const r = resultado;
  const solA = signoPorId(r.a.sol);
  const solB = signoPorId(r.b.sol);
  const dims: Dimension[] = ["emocional", "pasion", "comunicacion", "estabilidad"];
  const nombres = t.sinastria.dimensiones as Record<Dimension, string>;
  const punto = (p: string) => (p === "ascendente" ? t.astral.ascendente : NOMBRES_CUERPO[p as keyof typeof NOMBRES_CUERPO]);
  return (
    <section className="space-y-6">
      <div className="tarjeta flex flex-wrap items-center justify-center gap-8 p-6 text-center">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- moneda estática pequeña */}
          {solA && <img src={imagenSigno(solA.id)} alt="" width={96} height={96} className="moneda-signo mx-auto" />}
          <p className="font-display mt-2 text-xl">{r.a.nombre}</p>
          <p className="text-xs text-texto-suave">☉ {solA?.nombre} · ☽ {signoPorId(r.a.luna)?.nombre}{r.a.ascendente ? ` · ↑ ${signoPorId(r.a.ascendente)?.nombre}` : ""}</p>
        </div>
        <div>
          <p className="font-display text-6xl text-oro-suave">{r.puntaje}%</p>
          <p className="text-xs uppercase tracking-widest text-texto-suave">{t.compatibilidad.afinidad}</p>
        </div>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- moneda estática pequeña */}
          {solB && <img src={imagenSigno(solB.id)} alt="" width={96} height={96} className="moneda-signo mx-auto" />}
          <p className="font-display mt-2 text-xl">{r.b.nombre}</p>
          <p className="text-xs text-texto-suave">☉ {solB?.nombre} · ☽ {signoPorId(r.b.luna)?.nombre}{r.b.ascendente ? ` · ↑ ${signoPorId(r.b.ascendente)?.nombre}` : ""}</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="tarjeta p-5">
          <h2 className="font-display mb-3 text-2xl">{t.sinastria.dimensionesTitulo}</h2>
          <ul className="space-y-3">
            {dims.map((d) => (
              <li key={d}>
                <div className="flex justify-between text-sm"><span>{nombres[d]}</span><span className="text-oro-suave">{r.dimensiones[d]}</span></div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violeta to-oro" style={{ width: `${r.dimensiones[d]}%` }} /></div>
              </li>
            ))}
          </ul>
        </div>
        <div className="tarjeta p-5">
          <h2 className="font-display mb-3 text-2xl">{t.sinastria.aspectosTitulo}</h2>
          {r.aspectos.length ? (
            <ul className="space-y-1.5 text-sm">
              {r.aspectos.slice(0, 8).map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-3 border-t border-borde pt-1.5 first:border-0">
                  <span>{punto(a.a)} <span className="text-texto-suave">{SIMBOLOS_ASPECTO[a.tipo]} {NOMBRES_ASPECTO[a.tipo].toLowerCase()}</span> {punto(a.b)}</span>
                  <span className={a.aporte >= 0 ? "text-exito" : "text-oro"}>{a.aporte >= 0 ? t.sinastria.armonico : t.sinastria.tenso} · {a.orbe}°</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-texto-suave">{t.sinastria.sinAspectos}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function VistaVelas({ entrada, urlFoto, t }: { entrada: EntradaVelas; urlFoto: string | null; t: Diccionario }) {
  const intenciones = t.velas.intenciones as Record<string, { nombre: string }>;
  const colores = t.velas.colores as Record<string, { nombre: string }>;
  const senales = t.velas.senales as Record<string, string>;
  return (
    <section className="tarjeta grid gap-4 p-4 sm:grid-cols-[minmax(0,320px)_1fr] sm:p-6">
      {urlFoto && (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- foto privada firmada */}
          <img src={urlFoto} alt={t.velas.tuVela} className="w-full rounded-xl" />
        </div>
      )}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.velas.tuVela}</p>
        <p className="flex items-center gap-2 text-sm">
          <span className="inline-block h-4 w-4 rounded-full border border-white/20" style={{ background: TONO_COLOR[entrada.color] }} aria-hidden />
          {colores[entrada.color]?.nombre} · {intenciones[entrada.intencion]?.nombre}
        </p>
        {entrada.senales?.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {entrada.senales.map((s) => (
              <span key={s} className="rounded-full bg-oro/15 px-3 py-1 text-oro-suave">{senales[s] ?? s}</span>
            ))}
          </div>
        )}
        {entrada.pregunta && <p className="text-sm text-texto-suave">«{entrada.pregunta}»</p>}
      </div>
    </section>
  );
}

function VistaAura({ resultado, t }: { resultado: ResultadoAura; t: Diccionario }) {
  const nombres = t.aura.colores as Record<string, { nombre: string; rasgos: string }>;
  const orden = [...COLORES_AURA].sort((a, b) => resultado.puntajes[b] - resultado.puntajes[a]);
  return (
    <section className="tarjeta grid gap-6 p-6 md:grid-cols-[260px_1fr]">
      <Aura principal={resultado.principal} secundario={resultado.secundario} />
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.aura.tuAura}</p>
          <p className="font-display text-3xl text-oro-suave">{nombres[resultado.principal]?.nombre} <span className="text-texto-suave">+</span> {nombres[resultado.secundario]?.nombre}</p>
          <p className="text-sm text-texto-suave">{nombres[resultado.principal]?.rasgos}</p>
        </div>
        <ul className="space-y-1.5">
          {orden.map((c) => (
            <li key={c} className="flex items-center gap-3 text-sm">
              <span className="w-20 shrink-0 text-texto-suave">{nombres[c]?.nombre}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full" style={{ width: `${resultado.puntajes[c]}%`, background: `var(--aura-${c})` }} /></span>
              <span className="w-8 text-right text-xs text-texto-suave">{resultado.puntajes[c]}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
