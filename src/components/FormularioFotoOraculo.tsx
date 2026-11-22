"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { accionCafe, accionHuevo, type EstadoAccion } from "@/lib/lecturas/acciones";
import { CapturaPalma, reducirImagen } from "./CapturaPalma";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { BotonVoz } from "./BotonVoz";
import { useT } from "@/lib/i18n/cliente";
import { textoErrorLectura } from "@/lib/i18n/errores";
import type { Idioma } from "@/lib/i18n/idiomas";

/** Café: fotos opcionales de los lados y del plato (así se lee el kahve falı en Turquía). */
const FOTOS_EXTRA: Record<Idioma, { titulo: string; lados: string; plato: string }> = {
  es: { titulo: "Opcional: más fotos para una lectura más completa", lados: "Los lados de la taza", plato: "El plato (si volteaste la taza sobre él)" },
  en: { titulo: "Optional: more photos for a fuller reading", lados: "The sides of the cup", plato: "The saucer (if you turned the cup over onto it)" },
  pt: { titulo: "Opcional: mais fotos para uma leitura mais completa", lados: "As laterais da xícara", plato: "O pires (se você virou a xícara sobre ele)" },
  fr: { titulo: "Facultatif : plus de photos pour une lecture plus complète", lados: "Les parois de la tasse", plato: "La soucoupe (si tu as retourné la tasse dessus)" },
  tr: { titulo: "İsteğe bağlı: daha dolu bir fal için fazladan fotoğraf", lados: "Fincanın yanları", plato: "Fincan tabağı (fincanı üzerine kapattıysan)" },
  ar: { titulo: "اختياري: صور إضافية لقراءة أوفى", lados: "جوانب الفنجان", plato: "الصحن (إن قُلب الفنجان عليه)" },
  id: { titulo: "Opsional: foto tambahan untuk bacaan yang lebih lengkap", lados: "Sisi-sisi cangkir", plato: "Tatakan (jika cangkir kamu telungkupkan di atasnya)" },
  hi: { titulo: "वैकल्पिक: पूरी रीडिंग के लिए और तस्वीरें", lados: "कप के किनारे", plato: "तश्तरी (अगर आपने कप उस पर उलटा रखा था)" },
};

/** Lectura del café o limpia con huevo: pasos, foto y pregunta opcional. */
export function FormularioFotoOraculo({ tipo }: { tipo: "cafe" | "huevo" }) {
  const { t, idioma } = useT();
  const extra = FOTOS_EXTRA[idioma] ?? FOTOS_EXTRA.es;
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(tipo === "cafe" ? accionCafe : accionHuevo, {});
  const [pregunta, setPregunta] = useState("");
  const textos = t[tipo];

  const mensajeError = (() => {
    switch (estado.error) {
      case "FOTO_FORMATO": return t.quiromancia.errores.formato;
      case "FOTO_TAMANO": return t.quiromancia.errores.tamano;
      case "FOTO_SUBIR": return t.quiromancia.errores.subir;
      default: return textoErrorLectura(estado.error, t);
    }
  })();

  return (
    <form action={enviar} className="space-y-6">
      {mensajeError && (
        <Aviso>
          {mensajeError} {estado.error === "SIN_CREDITOS" && <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>}
        </Aviso>
      )}

      <ol className="grid gap-3 text-sm text-texto-suave sm:grid-cols-3">
        {(textos.pasos as readonly string[]).map((p, i) => (
          <li key={i} className="rounded-xl border border-borde bg-white/[0.02] p-3">
            <span className="font-display text-lg text-oro">{i + 1}</span>
            <p className="mt-1">{p}</p>
          </li>
        ))}
      </ol>

      <CapturaPalma variante={tipo} />

      {tipo === "cafe" && (
        <details className="rounded-xl border border-borde p-4 text-sm">
          <summary className="cursor-pointer text-texto-suave">{extra.titulo}</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="etiqueta">{extra.lados}</span>
              <CampoFotoExtra nombre="foto2" />
            </label>
            <label className="block">
              <span className="etiqueta">{extra.plato}</span>
              <CampoFotoExtra nombre="foto3" />
            </label>
          </div>
        </details>
      )}

      <div>
        <label className="etiqueta" htmlFor="pregunta">{textos.pregunta}</label>
        <textarea id="pregunta" name="pregunta" rows={2} maxLength={300} className="campo" value={pregunta} onChange={(e) => setPregunta(e.target.value)} />
        <div className="mt-2"><BotonVoz valor={pregunta} onChange={(v) => setPregunta(v.slice(0, 300))} /></div>
      </div>

      <BotonEnviar cargando={textos.subiendo}>{textos.leer}</BotonEnviar>
    </form>
  );
}

/** Foto extra del café: se reduce en el teléfono (como la principal) para no pasar el límite de subida. */
function CampoFotoExtra({ nombre }: { nombre: string }) {
  return (
    <input
      type="file"
      name={nombre}
      accept="image/jpeg,image/png,image/webp"
      className="campo mt-1 w-full"
      onChange={async (e) => {
        const entrada = e.currentTarget;
        const archivo = entrada.files?.[0];
        if (!archivo) return;
        try {
          const { archivo: reducido } = await reducirImagen(archivo);
          const dt = new DataTransfer();
          dt.items.add(reducido);
          entrada.files = dt.files;
        } catch {
          entrada.value = "";
        }
      }}
    />
  );
}
