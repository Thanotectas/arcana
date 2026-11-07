import Link from "next/link";
import type { Metadata } from "next";
import { Migas, CtaLectura, Preguntas } from "@/components/seo/BloquesSeo";

export const metadata: Metadata = {
  title: "Registros akáshicos: qué son y cómo leer los tuyos",
  description:
    "Qué son los registros akáshicos, para qué sirven, cómo prepararte para abrirlos y qué preguntas hacer. Haz tu lectura de registros akáshicos con Sibila: tu pregunta, tus números del alma y el mensaje de tus guías.",
  alternates: { canonical: "/que-son-registros-akashicos" },
};

const PREGUNTAS_BUENAS = [
  "¿Cuál es el propósito de mi alma en esta vida?",
  "¿Qué necesito aprender de esta relación?",
  "¿Por qué se repite esta situación en mi vida?",
  "¿Qué me impide avanzar en mi trabajo o con el dinero?",
  "¿Qué herencia de mi familia necesito sanar?",
  "¿Qué acuerdo de otra vida tengo con esta persona?",
];

export default function PaginaQueSonAkashicos() {
  return (
    <article className="mx-auto max-w-3xl space-y-10">
      <Migas items={[{ nombre: "Inicio", href: "/" }, { nombre: "Registros akáshicos", href: "/que-son-registros-akashicos" }]} />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">La memoria del alma</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Registros akáshicos</h1>
        <p className="mx-auto mt-3 max-w-2xl text-texto-suave">
          «Akasha» es una palabra sánscrita que significa éter o espacio. Según la tradición espiritual, los registros
          akáshicos son una especie de biblioteca de energía donde queda escrito todo lo que tu alma ha vivido, sentido y
          acordado, en esta vida y en las anteriores.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Para qué sirven", "Para entender por qué se repiten ciertas situaciones, qué vino a aprender tu alma y qué te toca soltar."],
          ["Qué no son", "No son una predicción del futuro ni un juicio: el registro no condena, muestra. Tampoco reemplazan a un médico o a un terapeuta."],
          ["Cómo se abren", "Tradicionalmente, con el nombre completo de la persona y una oración de apertura, desde la calma y la intención sincera."],
        ].map(([t, d]) => (
          <div key={t} className="tarjeta p-5">
            <h2 className="font-display text-2xl text-oro-suave">{t}</h2>
            <p className="mt-2 text-sm">{d}</p>
          </div>
        ))}
      </section>

      <section className="tarjeta space-y-3 p-6">
        <h2 className="font-display text-2xl">Cómo prepararte</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Busca un momento tranquilo, sin prisa. Si quieres, enciende una vela blanca.</li>
          <li>Respira profundo tres veces y suelta lo que traes del día.</li>
          <li>Escribe una sola pregunta, abierta y sincera: «¿qué necesito aprender de…?» funciona mejor que «¿sí o no?».</li>
          <li>Léela en voz alta antes de enviarla, con tu nombre completo.</li>
          <li>Al terminar, agradece y anota lo que más te movió: a veces el mensaje se entiende días después.</li>
        </ol>
      </section>

      <section className="tarjeta space-y-3 p-6">
        <h2 className="font-display text-2xl">Preguntas que funcionan bien</h2>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          {PREGUNTAS_BUENAS.map((p) => (
            <li key={p} className="rounded-xl border border-borde px-3 py-2">{p}</li>
          ))}
        </ul>
      </section>

      <CtaLectura
        titulo="Abre tus registros con Sibila"
        texto="Escribe tu nombre completo, tu fecha y tu pregunta. Sibila abre tus registros, te responde, te muestra el patrón que se repite y te trae el mensaje de tus guías."
        href="/registros-akashicos"
        boton="Abrir mis registros"
      />

      <p className="text-center text-sm text-texto-suave">
        También te puede interesar: <Link href="/reencarnacion" className="text-oro-suave hover:text-texto">reencarnación y vidas pasadas</Link> ·{" "}
        <Link href="/alma-vieja" className="text-oro-suave hover:text-texto">¿eres alma vieja?</Link> ·{" "}
        <Link href="/rituales#vidas-pasadas" className="text-oro-suave hover:text-texto">rituales de vidas pasadas</Link>
      </p>

      <Preguntas
        items={[
          { p: "¿Qué son los registros akáshicos?", r: "Según la tradición espiritual, son la memoria del alma: un registro energético de todo lo que ha vivido, sentido y acordado en esta y otras vidas. Se consultan para comprender el propio camino." },
          { p: "¿Cómo se abren los registros akáshicos?", r: "Tradicionalmente se abren con el nombre completo de la persona y una oración de apertura, desde un estado de calma y con una pregunta sincera. Al terminar se cierran con un agradecimiento." },
          { p: "¿Qué preguntas se pueden hacer?", r: "Preguntas abiertas sobre el propósito, las relaciones, los patrones que se repiten, la familia o las vidas pasadas. No se usan para adivinar fechas, números de lotería ni decisiones de otras personas." },
          { p: "¿Es lo mismo que una lectura de vidas pasadas?", r: "Se parecen: los registros akáshicos responden una pregunta concreta de tu alma; la lectura de vidas pasadas mira tu carta kármica (Nodo Sur, Saturno, casa 12) para contar quién fuiste." },
          { p: "¿Los registros akáshicos son reales?", r: "Son parte de una creencia espiritual (teosofía, nueva era y otras tradiciones), no algo comprobable. Una lectura sirve para reflexionar, entenderte y tomar decisiones con más calma." },
        ]}
      />
    </article>
  );
}
