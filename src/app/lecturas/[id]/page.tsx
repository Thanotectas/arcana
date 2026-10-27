import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLectura, requerirUsuario, getPreguntas, getPerfil, circuloActivo } from "@/lib/dal";
import { comprasVisibles } from "@/lib/plataforma";
import { ConversacionLectura } from "@/components/ConversacionLectura";
import { COSTO_PREGUNTA, PREGUNTAS_GRATIS_POR_LECTURA } from "@/lib/creditos";
import { LecturaEnVivo } from "@/components/LecturaEnVivo";
import { LecturaTaza } from "@/components/LecturaTaza";
import { LecturaHuevo } from "@/components/LecturaHuevo";
import { LecturaTabaco } from "@/components/LecturaTabaco";
import { LecturaVelas } from "@/components/LecturaVelas";
import { LecturaQuiromancia } from "@/components/LecturaQuiromancia";
import { rotuloCarta, imagenCarta } from "@/components/CartaVisual";
import { TiradaInteractiva, type CartaRevelada } from "@/components/TiradaInteractiva";
import { VistaCartaAstral } from "@/components/VistaCartaAstral";
import { RetornoSolar } from "@/components/RetornoSolar";
import { VistaSinastria } from "@/components/VistaSinastria";
import { CompartirLectura } from "@/components/CompartirLectura";
import { TIRADAS, POSICIONES_I18N, cartasDeTirada, type CartaTirada, type TipoTirada } from "@/lib/tarot/tiradas";
import { MAZOS, esMazo, type IdMazo } from "@/lib/tarot/mazos";
import { signoPorId, imagenSigno } from "@/lib/zodiaco";
import type { PerfilNumerologico } from "@/lib/numerologia";
import { cuadricula, deudasKarmicas, edad, etapas, hoyColombia, mesYDia, planoNombre } from "@/lib/numerologia-avanzada";
import { CLAVES_NUMEROLOGIA, CicloNumerologia, CuadriculaPitagoras, EtapasVida, FichaNumero, MandalaNumerologia, MesDiaPersonal, NombreNumeros } from "@/components/GraficosNumerologia";
import { VistaIChing } from "@/components/VistaIChing";
import type { ResultadoIChing } from "@/lib/iching";
import { SiguientePaso } from "@/components/SiguientePaso";
import type { ResultadoChino } from "@/lib/chino";
import { VistaChino } from "@/components/VistaChino";
import type { EntradaSueno, ResultadoSueno } from "@/lib/suenos";
import type { EntradaVelas } from "@/lib/velas";
import type { ResultadoAura } from "@/lib/aura";
import { VistaAura } from "@/components/VistaAura";
import type { ResultadoSinastria } from "@/lib/astro/sinastria";
import type { DatosNacimiento } from "@/lib/astro/carta";
import type { FuenteCruce } from "@/lib/cruce";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { fechaHora, plantilla } from "@/lib/i18n/formato";
import type { Diccionario } from "@/lib/i18n/diccionarios";
import type { Idioma } from "@/lib/i18n/idiomas";
import { VistaOraculo } from "@/components/VistaOraculo";
import { Pendulo } from "@/components/Pendulo";
import type { ResultadoOraculo } from "@/lib/oraculos/comun";
import type { ResultadoPendulo } from "@/lib/oraculos/pendulo";
import type { ResultadoMaya } from "@/lib/oraculos/maya";
import { VistaMaya } from "@/components/VistaMaya";
import type { ResultadoRevolucion } from "@/lib/astro/revolucion";

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
  const esTaza = lectura.tipo === "chocolate" || lectura.tipo === "cafe";
  const esVelas = lectura.tipo === "velas";
  const esTabaco = lectura.tipo === "tabaco";
  const esHuevo = lectura.tipo === "huevo";
  const urlFoto = esQuiromancia || esTaza || esVelas || esTabaco || esHuevo ? await urlFirmadaPalma(String(lectura.entrada.foto ?? "")) : null;

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
      {lectura.tipo === "numerologia" && <VistaNumerologia resultado={lectura.resultado as unknown as PerfilNumerologico} entrada={lectura.entrada} t={t} />}
      {lectura.tipo === "compatibilidad" && <VistaCompatibilidad resultado={lectura.resultado} t={t} />}
      {lectura.tipo === "iching" && <VistaIChing resultado={lectura.resultado as unknown as ResultadoIChing} t={t} />}
      {lectura.tipo === "chino" && <VistaChino resultado={lectura.resultado as unknown as ResultadoChino} t={t} />}
      {lectura.tipo === "cruce" && <VistaCruce entrada={lectura.entrada} resultado={lectura.resultado} t={t} />}
      {(lectura.tipo === "baraja_espanola" || lectura.tipo === "lenormand" || lectura.tipo === "runas") && (
        <VistaOraculo tipo={lectura.tipo} resultado={lectura.resultado as unknown as ResultadoOraculo} idioma={idioma} titulo={lectura.tipo === "runas" ? t.runas.tusCartas : t.baraja.tusCartas} invertida={t.oraculo.invertida} />
      )}
      {lectura.tipo === "pendulo" && <VistaPendulo resultado={lectura.resultado as unknown as ResultadoPendulo} t={t} />}
      {lectura.tipo === "maya" && <VistaMaya resultado={lectura.resultado as unknown as ResultadoMaya} t={t} idioma={idioma} />}
      {lectura.tipo === "revolucion_solar" && (
        <>
          <RetornoSolar r={lectura.resultado as unknown as ResultadoRevolucion} horaDesconocida={Boolean(lectura.entrada.horaDesconocida)} t={t} idioma={idioma} />
          <VistaCartaAstral resultado={lectura.resultado} entrada={lectura.entrada} t={t} />
        </>
      )}
      {lectura.tipo === "aura" && <VistaAura resultado={lectura.resultado as unknown as ResultadoAura} t={t} />}
      {lectura.tipo === "sinastria" && <VistaSinastria resultado={lectura.resultado as unknown as ResultadoSinastria} entrada={lectura.entrada as { a?: DatosNacimiento; b?: DatosNacimiento }} t={t} />}
      {lectura.tipo === "suenos" && <VistaSueno entrada={lectura.entrada as unknown as EntradaSueno} resultado={lectura.resultado as unknown as ResultadoSueno} t={t} />}

      {esQuiromancia ? (
        <LecturaQuiromancia
          id={lectura.id}
          estadoInicial={lectura.estado}
          textoInicial={lectura.interpretacion}
          urlFoto={urlFoto}
          mano={lectura.entrada.mano === "izquierda" ? "izquierda" : "derecha"}
          dominante={lectura.entrada.dominante === "izquierda" ? "izquierda" : "derecha"}
        />
      ) : esVelas ? (
        <LecturaVelas id={lectura.id} estadoInicial={lectura.estado} textoInicial={lectura.interpretacion} urlFoto={urlFoto} entrada={lectura.entrada as unknown as EntradaVelas} />
      ) : esTabaco ? (
        <LecturaTabaco id={lectura.id} estadoInicial={lectura.estado} textoInicial={lectura.interpretacion} urlFoto={urlFoto} />
      ) : esHuevo ? (
        <LecturaHuevo id={lectura.id} estadoInicial={lectura.estado} textoInicial={lectura.interpretacion} urlFoto={urlFoto} />
      ) : esTaza ? (
        <LecturaTaza id={lectura.id} tipo={lectura.tipo === "cafe" ? "cafe" : "chocolate"} estadoInicial={lectura.estado} textoInicial={lectura.interpretacion} urlFoto={urlFoto} />
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
  const nuevas: Record<string, string> = {
    revolucion_solar: "/revolucion-solar",
    baraja_espanola: "/baraja-espanola",
    lenormand: "/lenormand",
    runas: "/runas",
    pendulo: "/pendulo",
    cafe: "/cafe",
    huevo: "/huevo",
    maya: "/calendario-maya",
  };
  if (nuevas[tipo]) return nuevas[tipo];
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
      elemento: c.carta.elemento,
      arcano: c.carta.arcano,
      numero: c.carta.numero,
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

function VistaNumerologia({ resultado, entrada, t }: { resultado: PerfilNumerologico; entrada: Record<string, unknown>; t: Diccionario }) {
  const nombre = String(entrada.nombre ?? "");
  const fecha = String(entrada.fecha ?? "");
  const hoy = hoyColombia();
  const vida = etapas(fecha);
  const { mes, dia } = mesYDia(resultado.anioPersonal, hoy);
  return (
    <section className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="tarjeta p-5">
          <h2 className="font-display mb-1 text-2xl">{t.numerologia.constelacion}</h2>
          <p className="mb-2 text-xs text-texto-suave">{t.numerologia.constelacionNota}</p>
          <MandalaNumerologia perfil={resultado} t={t} />
        </div>
        <div className="tarjeta flex flex-col justify-center p-5">
          <h2 className="font-display mb-3 text-2xl">{t.numerologia.cicloTitulo}</h2>
          <CicloNumerologia anio={resultado.anioPersonal} t={t} />
          <p className="mt-4 text-center text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.numerologia.mesTitulo}</p>
          <MesDiaPersonal mes={mes} dia={dia} t={t} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CLAVES_NUMEROLOGIA.map((k, i) => (
          <FichaNumero key={k} clave={k} valor={resultado[k]} t={t} retraso={i * 90} />
        ))}
      </div>
      {vida && (
        <div className="tarjeta space-y-4 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-2xl">{t.numerologia.etapasTitulo}</h2>
            <p className="text-xs text-texto-suave">{t.numerologia.etapasNota}</p>
          </div>
          <EtapasVida etapas={vida} edad={edad(fecha, hoy)} t={t} />
        </div>
      )}
      {/^\d{4}-\d{2}-\d{2}$/.test(fecha) && (
        <div className="tarjeta space-y-4 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-2xl">{t.numerologia.cuadriculaTitulo}</h2>
            <p className="text-xs text-texto-suave">{t.numerologia.cuadriculaNota}</p>
          </div>
          <CuadriculaPitagoras cuadro={cuadricula(fecha)} t={t} />
        </div>
      )}
      {nombre && (
        <div className="tarjeta space-y-4 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-2xl">{t.numerologia.nombreTitulo}</h2>
            <p className="text-xs text-texto-suave">{t.numerologia.nombreNota}</p>
          </div>
          <NombreNumeros plano={planoNombre(nombre)} deudas={deudasKarmicas(nombre, fecha)} t={t} />
        </div>
      )}
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

function VistaPendulo({ resultado, t }: { resultado: ResultadoPendulo; t: Diccionario }) {
  const movimientos = t.pendulo.movimientos as Record<string, string>;
  return (
    <section className="tarjeta flex flex-col items-center gap-2 p-6 text-center">
      <Pendulo movimiento={resultado.movimiento} className="h-56 w-48" />
      <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.pendulo.respondio}</p>
      <p className="font-display text-4xl text-oro">{movimientos[resultado.movimiento] ?? resultado.movimiento}</p>
    </section>
  );
}

