import Link from "next/link";
export default function NoEncontrado() {
  return (
    <div className="py-20 text-center">
      <p className="font-display text-7xl text-oro-suave">404</p>
      <p className="mt-2 text-texto-suave">Esta página no está en las cartas.</p>
      <Link href="/" className="boton boton-secundario mt-6">Volver al inicio</Link>
    </div>
  );
}
