import type { Metadata } from "next";
export const metadata: Metadata = { title: "Política de privacidad" };

export default function Privacidad() {
  return (
    <article className="prosa mx-auto max-w-3xl">
      <h1 className="font-display text-4xl font-semibold text-oro-suave">Política de privacidad</h1>
      <p>Última actualización: {new Date().toLocaleDateString("es-CO")}. Tratamiento de datos conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013 (Colombia).</p>
      <h2>Datos que recogemos</h2>
      <ul>
        <li>Cuenta: nombre, correo y contraseña (cifrada).</li>
        <li>Lecturas: preguntas, nombres, fechas, horas y lugares de nacimiento que ingresas para generarlas.</li>
        <li>Pagos: referencia, monto y estado. Los datos de tarjeta los procesa Wompi; nunca llegan a nuestros servidores.</li>
      </ul>
      <h2>Para qué los usamos</h2>
      <p>Para prestar el servicio (calcular y redactar tus lecturas), gestionar tu saldo y comunicarnos contigo sobre tu cuenta. Los datos de las lecturas se envían a un proveedor de inteligencia artificial únicamente para generar la interpretación.</p>
      <h2>Tus derechos</h2>
      <p>Puedes conocer, actualizar, rectificar y suprimir tus datos, y revocar la autorización, escribiendo al correo de contacto. Puedes borrar cualquier lectura desde tu historial.</p>
      <h2>Conservación y seguridad</h2>
      <p>Conservamos tus datos mientras tu cuenta esté activa. Usamos cifrado en tránsito y controles de acceso por usuario en la base de datos.</p>
    </article>
  );
}
