import type { Metadata } from "next";
export const metadata: Metadata = { title: "Términos y condiciones" };

export default function Terminos() {
  return (
    <article className="prosa mx-auto max-w-3xl">
      <h1 className="font-display text-4xl font-semibold text-oro-suave">Términos y condiciones</h1>
      <p>Última actualización: {new Date().toLocaleDateString("es-CO")}. Este documento es una base; revísalo con un abogado antes de operar comercialmente.</p>
      <h2>1. Naturaleza del servicio</h2>
      <p>Arcana ofrece contenidos de tarot, astrología y numerología con fines de entretenimiento, reflexión personal y crecimiento. Las lecturas no constituyen asesoría médica, psicológica, legal, financiera ni de ningún otro tipo profesional, y no deben usarse para tomar decisiones que requieran esa asesoría.</p>
      <h2>2. Cuenta</h2>
      <p>Debes ser mayor de 18 años. Eres responsable de la confidencialidad de tu contraseña y de la actividad en tu cuenta.</p>
      <h2>3. Créditos y pagos</h2>
      <p>Las lecturas se pagan con créditos prepagados. Los créditos no tienen vencimiento, no son transferibles ni canjeables por dinero. Los pagos se procesan a través de Bold; Arcana no almacena datos de tarjetas. Una vez generada una lectura, el crédito consumido no es reembolsable, salvo fallo técnico atribuible a Arcana, en cuyo caso se reintegra automáticamente.</p>
      <h2>4. Derecho de retracto</h2>
      <p>Conforme a la Ley 1480 de 2011 (Estatuto del Consumidor, Colombia), puedes ejercer el derecho de retracto sobre créditos no utilizados dentro de los cinco días hábiles siguientes a la compra, escribiendo al correo de contacto.</p>
      <h2>5. Contenido generado</h2>
      <p>Las interpretaciones se generan con ayuda de inteligencia artificial a partir de la tradición esotérica clásica y de los datos que ingresas. Pueden contener imprecisiones. Las lecturas son para tu uso personal.</p>
      <h2>6. Limitación de responsabilidad</h2>
      <p>Arcana no se hace responsable por decisiones tomadas con base en el contenido del servicio.</p>
      <h2>7. Cambios</h2>
      <p>Podemos actualizar estos términos. Los cambios rigen desde su publicación.</p>
    </article>
  );
}
