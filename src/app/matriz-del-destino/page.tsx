import type { Metadata } from "next";
import { MatrizDestino } from "@/components/seo/MatrizDestino";
import { CtaLectura, Migas, Preguntas } from "@/components/seo/BloquesSeo";
import { calcularMatriz } from "@/lib/seo/matriz";

export const metadata: Metadata = {
  title: "Matriz del Destino gratis: calcula la tuya con tu fecha de nacimiento",
  description: "Pon tu fecha de nacimiento y mira tu Matriz del Destino dibujada: tu esencia, tu don, tu gran lección y tus tres propósitos con los 22 arcanos del tarot. Gratis.",
  alternates: { canonical: "/matriz-del-destino" },
};

const PREGUNTAS = [
  {
    p: "¿Qué es la Matriz del Destino?",
    r: "Es un mapa que se dibuja con tu fecha de nacimiento: un octograma con números del 1 al 22, cada uno ligado a un arcano mayor del tarot. El centro habla de tu esencia y los demás puntos de tu don, de cómo te ven, de tu camino material y de tu gran lección.",
  },
  {
    p: "¿Cómo se calcula?",
    r: "El día, el mes y la suma de las cifras del año se reducen a un número del 1 al 22. Con ellos se calculan los demás puntos sumando y reduciendo de nuevo. Aquí lo hace la calculadora por ti.",
  },
  {
    p: "¿Por qué el 22 es El Loco?",
    r: "En la Matriz los arcanos van del 1 al 22, y El Loco, que en el tarot lleva el 0, ocupa el 22. Se usa el orden de Marsella: el 8 es la Justicia y el 11 la Fuerza.",
  },
  {
    p: "¿Es lo mismo que la numerología?",
    r: "Se parecen porque ambas parten de tu fecha, pero la numerología pitagórica reduce a números del 1 al 9 (y los maestros 11, 22 y 33), mientras que la Matriz trabaja con los 22 arcanos del tarot.",
  },
];

export default async function PaginaMatriz({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const valor = (await searchParams).fecha;
  const fecha = typeof valor === "string" && calcularMatriz(valor) ? valor : "";
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Migas items={[{ nombre: "Inicio", href: "/" }, { nombre: "Matriz del Destino", href: "/matriz-del-destino" }]} />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Gratis · con tu fecha de nacimiento</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Tu Matriz del Destino</h1>
        <p className="mx-auto mt-3 max-w-xl text-texto-suave">
          Pon tu fecha de nacimiento y mira cómo se dibuja tu matriz: tu esencia, tu don, tu gran lección y tus tres propósitos, cada uno con su arcano del tarot.
        </p>
      </header>
      <MatrizDestino fechaInicial={fecha} />
      <CtaLectura
        titulo="¿Quieres que Sibila te la lea completa?"
        texto="Tu numerología con Sibila une tus números con tu nombre y tu fecha, y te dice lo que se anuncia este año. La primera lectura es gratis."
        href="/numerologia"
        boton="Hacer mi numerología"
      />
      <Preguntas items={PREGUNTAS} />
    </div>
  );
}
