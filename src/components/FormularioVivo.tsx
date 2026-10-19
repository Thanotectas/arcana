"use client";

import { useActionState, useState } from "react";
import { Camera } from "lucide-react";
import { accionFotoEnVivo, type EstadoEnVivo } from "@/lib/en-vivo-acciones";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Aviso } from "@/components/Aviso";

/** Achica la foto en el teléfono (máximo 1.280 px, JPEG) para que suba rápido. */
async function achicar(archivo: File): Promise<Blob> {
  const imagen = await createImageBitmap(archivo);
  const escala = Math.min(1, 1280 / Math.max(imagen.width, imagen.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);
  lienzo.getContext("2d")?.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  return new Promise((listo, falla) => lienzo.toBlob((b) => (b ? listo(b) : falla(new Error("foto"))), "image/jpeg", 0.85));
}

/** Formulario de /vivo: la foto de la taza o de la mano para que Sibila la lea en el directo. */
export function FormularioVivo() {
  const [tipo, setTipo] = useState<"chocolate" | "mano">("chocolate");
  const [estado, enviar] = useActionState<EstadoEnVivo, FormData>(async (prev, fd) => {
    const foto = fd.get("foto");
    if (foto instanceof File && foto.size) {
      try {
        fd.set("foto", new File([await achicar(foto)], "foto.jpg", { type: "image/jpeg" }));
      } catch {
        return { error: "No pudimos abrir esa foto. Prueba con otra." };
      }
    }
    return accionFotoEnVivo(prev, fd);
  }, {});

  if (estado.mensaje) return <Aviso tipo="exito">{estado.mensaje}</Aviso>;

  return (
    <form action={enviar} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {(["chocolate", "mano"] as const).map((t) => (
          <label key={t} className={`cursor-pointer rounded-2xl border p-4 text-center transition ${tipo === t ? "border-oro bg-oro/10 text-oro-suave" : "border-borde text-texto-suave"}`}>
            <input type="radio" name="tipo" value={t} checked={tipo === t} onChange={() => setTipo(t)} className="sr-only" />
            <span className="block text-3xl">{t === "chocolate" ? "☕" : "✋"}</span>
            <span className="mt-1 block font-semibold">{t === "chocolate" ? "Mi taza de chocolate" : "Mi mano"}</span>
          </label>
        ))}
      </div>
      <p className="text-sm text-texto-suave">
        {tipo === "chocolate" ? "Tómate el chocolate, inclina la taza y toma la foto desde arriba, con buena luz, mostrando el fondo con los restos." : "Abre la palma de tu mano dominante, con buena luz, y toma la foto de frente. Solo la mano."}
      </p>
      <label className="block space-y-1 text-sm">
        <span className="text-texto-suave">Foto</span>
        <input type="file" name="foto" accept="image/*" capture="environment" required className="block w-full text-sm" />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-texto-suave">Tu nombre (como quieres que Sibila te llame)</span>
        <input name="nombre" maxLength={40} required className="campo w-full" />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-texto-suave">Tu pregunta (opcional) y tu signo</span>
        <input name="pregunta" maxLength={200} placeholder="Ej: Soy Leo, ¿qué viene en el amor?" className="campo w-full" />
      </label>
      <label className="flex items-start gap-2 text-sm text-texto-suave">
        <input type="checkbox" name="acepto" className="mt-1" required />
        Acepto que mi foto y mi nombre se muestren en el directo de Arcana. La foto se borra después de la lectura.
      </label>
      {estado.error && <Aviso>{estado.error}</Aviso>}
      <BotonEnviar className="boton boton-primario w-full" cargando="Enviando…">
        <Camera className="h-4 w-4" aria-hidden /> Enviar a Sibila
      </BotonEnviar>
    </form>
  );
}
