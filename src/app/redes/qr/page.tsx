import type { Metadata } from "next";
import QRCode from "qrcode";
import { enlaceHub, refHubValido } from "@/lib/marca/redes";
import { sitio } from "@/lib/correo";
import { BotonImprimir } from "@/components/BotonImprimir";

export const metadata: Metadata = { title: "Tarjeta con QR del hub de redes", robots: { index: false, follow: false } };

const FRASES: Record<string, [string, string]> = {
  sigue: ["Sígueme en redes", "Tu carta del día gratis, rituales y lo que el cielo dice hoy."],
  carta: ["Tu carta del día, gratis", "Escanea y Sibila te lee la carta de hoy."],
  vivo: ["Sibila lee en vivo", "Escanea para ver dónde y cuándo es el próximo directo."],
};
const CANTIDADES = [1, 2, 4, 6];

/**
 * Tarjeta imprimible con el QR del hub (miarcana.com/redes?ref=…), para
 * volantes, el escenario del directo, tarjetas o el cierre de un video.
 * Solo en español: es una herramienta de la administración.
 */
export default async function PaginaQr({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const leer = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const ref = refHubValido(leer("ref"));
  const frase = FRASES[leer("frase")] ? leer("frase") : "sigue";
  const cantidad = CANTIDADES.includes(Number(leer("cantidad"))) ? Number(leer("cantidad")) : 4;
  const enlace = enlaceHub(ref, sitio());
  const svg = ref ? await QRCode.toString(enlace, { type: "svg", margin: 2, errorCorrectionLevel: "M", color: { dark: "#0b0716", light: "#f1d99a" } }) : "";
  const [titulo, detalle] = FRASES[frase];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <style>{`@media print { header, footer, canvas, .estrellas, .no-imprimir, [data-asistente] { display: none !important; } main { padding: 0 !important; } .hoja { gap: 8mm; } @page { size: letter; margin: 12mm; } }`}</style>
      <div className="no-imprimir">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Hub de redes</p>
        <h1 className="font-display text-4xl font-semibold">Tarjeta con QR</h1>
        <p className="mt-2 text-texto-suave">
          El QR lleva a <span className="text-oro-suave">miarcana.com/redes</span> con el código de origen, para saber desde dónde escanearon (se ve en /admin/hub). Sirve para volantes, el escenario del directo, tarjetas o la pantalla final de un video.
        </p>
      </div>
      <form className="no-imprimir tarjeta flex flex-wrap items-end gap-3 p-4" method="get">
        <label className="grid gap-1 text-sm font-semibold">
          Código de origen
          <input name="ref" defaultValue={ref} placeholder="volante" maxLength={40} required className="rounded-lg border border-borde bg-transparent px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Frase
          <select name="frase" defaultValue={frase} className="rounded-lg border border-borde bg-transparent px-3 py-2 font-normal">
            {Object.entries(FRASES).map(([k, [t]]) => (
              <option key={k} value={k} className="bg-noche">{t}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Por hoja
          <select name="cantidad" defaultValue={cantidad} className="rounded-lg border border-borde bg-transparent px-3 py-2 font-normal">
            {CANTIDADES.map((n) => (
              <option key={n} value={n} className="bg-noche">{n}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="boton boton-primario text-sm">Actualizar</button>
        {ref && <BotonImprimir />}
      </form>
      {!ref ? (
        <p className="no-imprimir text-sm text-texto-suave">Escribe el código de origen (minúsculas, números y guiones; por ejemplo <code>volante</code>, <code>video-qr</code> o <code>directo-pantalla</code>).</p>
      ) : (
        <div className="hoja grid gap-4 sm:grid-cols-2">
          {Array.from({ length: cantidad }, (_, i) => (
            <article key={i} className="grid justify-items-center gap-2 rounded-2xl border-2 border-[#d9b45a] bg-[#f1d99a] p-6 text-center text-[#0b0716]">
              <p className="font-display text-2xl font-semibold">Arcana</p>
              <h2 className="font-display text-xl font-semibold leading-tight">{titulo}</h2>
              <p className="text-sm text-[#3a2d4f]">{detalle}</p>
              <div className="w-44" dangerouslySetInnerHTML={{ __html: svg }} />
              <p className="font-semibold">miarcana.com/redes</p>
              <p className="text-xs text-[#3a2d4f]">Telegram · Canal de WhatsApp · Instagram · TikTok · YouTube · Facebook</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
