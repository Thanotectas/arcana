/** Las siete llaves del camino: las que ya tiene brillan; las que faltan esperan en sombra. */
export function Llavero({ llaves, ganadas, compacto = false }: { llaves: { nombre: string; simbolo: string }[]; ganadas: boolean[]; compacto?: boolean }) {
  return (
    <ul className={`flex flex-wrap justify-center ${compacto ? "gap-2" : "gap-3 sm:gap-4"}`} aria-label={`${ganadas.filter(Boolean).length} de ${llaves.length} llaves`}>
      {llaves.map((l, i) => (
        <li key={l.nombre} className="flex flex-col items-center gap-1" title={l.nombre}>
          <span
            className={`flex items-center justify-center rounded-full border ${compacto ? "h-10 w-10 text-lg" : "h-14 w-14 text-2xl"} ${
              ganadas[i] ? "border-oro bg-oro/15 shadow-[0_0_22px_rgba(241,217,154,.45)]" : "border-borde bg-noche/60 opacity-35 grayscale"
            }`}
          >
            {l.simbolo}
          </span>
          {!compacto && <span className={`max-w-[5.5rem] text-center text-[11px] leading-tight ${ganadas[i] ? "text-oro-suave" : "text-texto-suave/60"}`}>{l.nombre.replace("Llave ", "")}</span>}
        </li>
      ))}
    </ul>
  );
}
