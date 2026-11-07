import Link from "next/link";
import type { Metadata } from "next";
import { SIGNOS, imagenSigno } from "@/lib/zodiaco";
import { Migas, CtaLectura, Preguntas } from "@/components/seo/BloquesSeo";

export const metadata: Metadata = {
  title: "Reencarnación y vidas pasadas: qué dice tu Nodo Sur",
  description:
    "¿Quién fuiste en otra vida? La astrología kármica lo lee en el Nodo Sur de tu carta astral. Descubre qué significa tu Nodo Sur en cada signo, qué es el karma y cómo saber tus vidas pasadas.",
  alternates: { canonical: "/reencarnacion" },
};

/** Arquetipo de vida pasada del Nodo Sur en cada signo y lo que pide su Nodo Norte (el signo opuesto). */
const NODO_SUR: Record<string, { fuiste: string; trajiste: string; vienes: string }> = {
  aries: { fuiste: "Guerrera, pionera o líder que tuvo que valerse por sí misma.", trajiste: "Valentía, iniciativa y la costumbre de hacerlo todo sola.", vienes: "A aprender a compartir el camino: pareja, acuerdos y escuchar (Nodo Norte en Libra)." },
  tauro: { fuiste: "Campesina, artesana o guardiana de tierras y bienes.", trajiste: "Paciencia, sentido práctico y apego a lo seguro.", vienes: "A soltar, transformarte y confiar en lo que no se ve (Nodo Norte en Escorpio)." },
  geminis: { fuiste: "Mensajera, comerciante, escribana o estudiante eterna.", trajiste: "Curiosidad, palabra fácil y mente que nunca para.", vienes: "A buscar un sentido y una fe propia, más allá de los datos (Nodo Norte en Sagitario)." },
  cancer: { fuiste: "Madre, cuidadora o el sostén de una familia grande.", trajiste: "Ternura, intuición y la tendencia a vivir para los demás.", vienes: "A construir algo propio y ocupar tu lugar en el mundo (Nodo Norte en Capricornio)." },
  leo: { fuiste: "Reina, artista, actriz o alguien admirado por muchos.", trajiste: "Carisma, creatividad y necesidad de aplauso.", vienes: "A brillar con otros, en comunidad y por una causa (Nodo Norte en Acuario)." },
  virgo: { fuiste: "Sanadora, monja, herbolaria o servidora incansable.", trajiste: "Orden, habilidad con las manos y exigencia contigo misma.", vienes: "A confiar, soltar el control y abrirte a lo espiritual (Nodo Norte en Piscis)." },
  libra: { fuiste: "Diplomática, cortesana o la compañera inseparable de alguien.", trajiste: "Encanto, sentido de la justicia y miedo a estar sola.", vienes: "A atreverte a ir por lo tuyo, aunque no guste a todos (Nodo Norte en Aries)." },
  escorpio: { fuiste: "Hechicera, curandera, espía o guardiana de secretos.", trajiste: "Intensidad, intuición muy fina y memoria de crisis.", vienes: "A encontrar paz, estabilidad y placer en lo simple (Nodo Norte en Tauro)." },
  sagitario: { fuiste: "Viajera, sacerdotisa, maestra o filósofa errante.", trajiste: "Fe, amor por la libertad y verdades absolutas.", vienes: "A escuchar, aprender de lo cotidiano y comunicar con humildad (Nodo Norte en Géminis)." },
  capricornio: { fuiste: "Autoridad, gobernante, jefa de familia o de un oficio.", trajiste: "Disciplina, responsabilidad y dificultad para mostrar lo que sientes.", vienes: "A abrir el corazón y crear un hogar donde te cuiden (Nodo Norte en Cáncer)." },
  acuario: { fuiste: "Inventora, rebelde, astróloga o parte de una comunidad que soñaba con otro mundo.", trajiste: "Originalidad, ideales y cierta distancia con las emociones.", vienes: "A tomar el centro y expresar tu propio fuego (Nodo Norte en Leo)." },
  piscis: { fuiste: "Mística, monja, artista o alguien que vivió entre lo invisible.", trajiste: "Compasión enorme, sensibilidad y tendencia a evadirte.", vienes: "A aterrizar tus dones con orden y cuidar tu cuerpo (Nodo Norte en Virgo)." },
};

export default function PaginaReencarnacion() {
  return (
    <article className="mx-auto max-w-4xl space-y-10">
      <Migas items={[{ nombre: "Inicio", href: "/" }, { nombre: "Reencarnación y vidas pasadas", href: "/reencarnacion" }]} />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Astrología kármica</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Reencarnación y vidas pasadas</h1>
        <p className="mx-auto mt-3 max-w-2xl text-texto-suave">
          Muchas tradiciones creen que el alma vuelve una y otra vez para aprender. La astrología kármica lee esa historia en
          tu carta astral: el <strong>Nodo Sur</strong> guarda lo que ya viviste y el <strong>Nodo Norte</strong>, lo que
          vienes a aprender en esta vida.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Nodo Sur", "Lo que tu alma ya domina y repite sin darse cuenta: talentos, miedos y costumbres de otras vidas."],
          ["Nodo Norte", "El camino nuevo de esta vida: lo que cuesta al principio, pero te hace crecer."],
          ["Números kármicos", "En la numerología, las deudas 13, 14, 16 y 19 y los números que faltan en tu nombre muestran lo que vienes a saldar."],
        ].map(([t, d]) => (
          <div key={t} className="tarjeta p-5">
            <h2 className="font-display text-2xl text-oro-suave">{t}</h2>
            <p className="mt-2 text-sm">{d}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-display text-3xl">Tu Nodo Sur en cada signo</h2>
        <p className="mt-1 text-sm text-texto-suave">
          El Nodo Sur cambia de signo cada año y medio, más o menos. Para saber el tuyo necesitas tu fecha de nacimiento (con la
          hora y el lugar se ve también la casa, que dice en qué área de la vida).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {SIGNOS.map((s) => {
            const n = NODO_SUR[s.id];
            return (
              <div key={s.id} id={`nodo-sur-${s.id}`} className="tarjeta p-5">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- moneda estática */}
                  <img src={imagenSigno(s.id)} alt="" width={48} height={48} className="moneda-signo" />
                  <h3 className="font-display text-2xl">Nodo Sur en {s.nombre}</h3>
                </div>
                <p className="mt-3 text-sm"><strong className="text-oro-suave">Quién fuiste:</strong> {n.fuiste}</p>
                <p className="mt-1 text-sm"><strong className="text-oro-suave">Lo que trajiste:</strong> {n.trajiste}</p>
                <p className="mt-1 text-sm"><strong className="text-oro-suave">A qué vienes:</strong> {n.vienes}</p>
              </div>
            );
          })}
        </div>
      </section>

      <CtaLectura
        titulo="Recuerda tus vidas pasadas con Sibila"
        texto="Calculamos tu Nodo Sur, Saturno, Plutón y tus números kármicos, sacas tres cartas, y Sibila te cuenta quién fuiste, qué trajiste contigo y hacia dónde va tu alma."
        href="/vidas-pasadas"
        boton="Ver mis vidas pasadas"
      />

      <section className="tarjeta space-y-3 p-6">
        <h2 className="font-display text-2xl">Señales de que traes algo de otra vida</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Lugares, épocas o idiomas que te atraen sin explicación.</li>
          <li>Personas que sientes que ya conocías desde el primer momento.</li>
          <li>Miedos que no vienen de nada que hayas vivido (al agua, al fuego, a hablar en público).</li>
          <li>Talentos que nadie te enseñó.</li>
          <li>Sueños que se repiten con escenas que no son de tu vida.</li>
          <li>Situaciones que vuelven una y otra vez, con distintas personas.</li>
        </ul>
        <p className="text-sm text-texto-suave">
          ¿Un sueño así? <Link href="/suenos" className="text-oro-suave hover:text-texto">Sibila te lo interpreta</Link>.
        </p>
      </section>

      <Preguntas
        items={[
          { p: "¿Cómo saber quién fui en mi vida pasada?", r: "La astrología kármica lo lee en el Nodo Sur de tu carta astral: su signo describe el tipo de vida que tu alma ya conoce y su casa, el área donde lo vivió. Se complementa con Saturno, Plutón, la casa 12 y los números kármicos de tu nombre y tu fecha." },
          { p: "¿Qué es el karma?", r: "En las tradiciones orientales, el karma es la ley de causa y efecto que acompaña al alma de una vida a otra. No es un castigo: son aprendizajes pendientes que se repiten hasta que se comprenden." },
          { p: "¿Qué es el Nodo Sur en la carta astral?", r: "Es el punto opuesto al Nodo Norte de la Luna. Representa lo que ya traes aprendido, tu zona cómoda y los patrones que repites. El Nodo Norte, en el signo opuesto, es lo que vienes a desarrollar." },
          { p: "¿Qué son las deudas kármicas en numerología?", r: "Son los números 13, 14, 16 y 19 cuando aparecen en la suma de tu fecha de nacimiento o de tu nombre. Cada uno señala un aprendizaje por saldar: el 13 el esfuerzo, el 14 la libertad bien usada, el 16 el ego y el 19 la independencia." },
          { p: "¿La reencarnación es real?", r: "Es una creencia presente en el hinduismo, el budismo, el espiritismo y muchas tradiciones indígenas. Las lecturas de vidas pasadas son simbólicas y espirituales: sirven para entenderte y reflexionar sobre tu camino, no son un dato comprobable." },
        ]}
      />
    </article>
  );
}
