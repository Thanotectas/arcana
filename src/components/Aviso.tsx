export function Aviso({ tipo = "error", children }: { tipo?: "error" | "exito" | "info"; children: React.ReactNode }) {
  const estilos = {
    error: "border-peligro/40 bg-peligro/10 text-peligro",
    exito: "border-exito/40 bg-exito/10 text-exito",
    info: "border-violeta/40 bg-violeta/10 text-violeta-suave",
  }[tipo];
  return (
    <div role={tipo === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${estilos}`}>
      {children}
    </div>
  );
}
