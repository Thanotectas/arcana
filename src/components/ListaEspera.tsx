"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import type { Idioma } from "@/lib/i18n/idiomas";
import type { Curso, TextosListaEspera } from "@/lib/lista-espera/textos";

/** Tarjeta para anotarse en la lista de espera de un curso (con sesión, el correo viene escrito). */
export function ListaEspera({ curso, idioma, origen, textos: t, correoInicial = "" }: { curso: Curso; idioma: Idioma; origen: string; textos: TextosListaEspera; correoInicial?: string }) {
  const [correo, setCorreo] = useState(correoInicial);
  const [estado, setEstado] = useState<"" | "enviando" | "listo" | "error">("");

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstado("enviando");
    const r = await fetch("/api/lista-espera", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ curso, correo, idioma, origen }) }).catch(() => null);
    setEstado(r?.ok ? "listo" : "error");
  };

  return (
    <section className="tarjeta border-violeta/40 p-6 text-center sm:p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-violeta-suave">{t.antetitulo}</p>
      <h2 className="font-display mt-1 text-2xl sm:text-3xl">{t.titulo}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-texto-suave">{t.texto}</p>
      {estado === "listo" ? (
        <p className="mt-4 font-medium text-oro-suave" role="status">{t.listo}</p>
      ) : (
        <form onSubmit={enviar} className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row">
          <input type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder={t.correo} aria-label={t.correo} className="campo flex-1" dir="ltr" />
          <button type="submit" disabled={estado === "enviando"} className="boton boton-primario inline-flex items-center justify-center gap-2">
            <Bell className="h-4 w-4" aria-hidden /> {t.boton}
          </button>
        </form>
      )}
      {estado === "error" && <p className="mt-2 text-sm text-red-300" role="alert">{t.error}</p>}
      <p className="mt-2 text-xs text-texto-suave">{t.nota}</p>
    </section>
  );
}
