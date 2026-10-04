/* eslint-disable jsx-a11y/alt-text -- Image es el primitivo de react-pdf, no un <img> HTML */
import "server-only";
import path from "path";
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

/**
 * PDF de una lectura: hoja A4 color marfil, títulos en Cormorant, cuerpo en
 * Inter, con el bloque visual de la lectura (cartas, monedas, foto, aura…),
 * la interpretación de Sibila y las preguntas posteriores.
 */
const FUENTES = path.join(process.cwd(), "src/app/fuentes");
let registradas = false;
function registrarFuentes() {
  if (registradas) return;
  Font.register({
    family: "Cormorant",
    fonts: [
      { src: path.join(FUENTES, "CormorantGaramond-Regular.ttf") },
      { src: path.join(FUENTES, "CormorantGaramond-SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(FUENTES, "CormorantGaramond-Italic.ttf"), fontStyle: "italic" },
    ],
  });
  Font.register({
    family: "Inter",
    fonts: [
      { src: path.join(FUENTES, "Inter-Regular.ttf") },
      { src: path.join(FUENTES, "Inter-SemiBold.ttf"), fontWeight: 600 },
    ],
  });
  Font.register({ family: "Simbolos", src: path.join(FUENTES, "NotoSansSymbols2.ttf") });
  // Sin guiones automáticos: cortan mal las palabras en español.
  Font.registerHyphenationCallback((palabra) => [palabra]);
  registradas = true;
}

const PAPEL = "#fbf7ee";
const TINTA = "#2a2140";
const TINTA_SUAVE = "#6b6283";
const VIOLETA = "#4b3a86";
const ORO = "#b8923d";
const LINEA = "#e3d8bf";

// Ojo: un lineHeight en el estilo de la página hace desaparecer el pie fijo (position absolute);
// por eso la altura de línea va en cada bloque de texto.
const s = StyleSheet.create({
  pagina: { backgroundColor: PAPEL, paddingTop: 44, paddingBottom: 54, paddingHorizontal: 48, fontFamily: "Inter", fontSize: 10.5, color: TINTA },
  cabecera: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  marca: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 30, height: 30, borderRadius: 8 },
  marcaNombre: { fontFamily: "Cormorant", fontSize: 19, fontWeight: 600, color: VIOLETA, letterSpacing: 1 },
  etiqueta: { fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", color: ORO, fontWeight: 600 },
  titulo: { fontFamily: "Cormorant", fontSize: 27, fontWeight: 600, color: VIOLETA, lineHeight: 1.15 },
  meta: { fontSize: 9, color: TINTA_SUAVE, marginTop: 4 },
  filete: { borderBottomWidth: 1, borderBottomColor: ORO, marginTop: 12, marginBottom: 14 },
  adorno: { fontFamily: "Simbolos", color: ORO, fontSize: 9, textAlign: "center", marginVertical: 10, letterSpacing: 6 },
  visual: { marginBottom: 14, padding: 12, borderWidth: 1, borderColor: LINEA, borderRadius: 10, backgroundColor: "#f6f0e2" },
  fila: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 12 },
  carta: { alignItems: "center", width: 96 },
  cartaImagen: { width: 84, height: 126, borderRadius: 6, borderWidth: 1, borderColor: ORO, objectFit: "cover" },
  cartaNombre: { fontFamily: "Cormorant", fontSize: 12, fontWeight: 600, color: VIOLETA, marginTop: 5, textAlign: "center", lineHeight: 1.2 },
  cartaPosicion: { fontSize: 7.5, color: TINTA_SUAVE, textAlign: "center", marginTop: 1, lineHeight: 1.3 },
  moneda: { alignItems: "center", width: 110 },
  monedaImagen: { width: 70, height: 70 },
  monedaValor: { fontFamily: "Cormorant", fontSize: 14, fontWeight: 600, color: VIOLETA, marginTop: 4, textAlign: "center" },
  monedaEtiqueta: { fontSize: 7.5, color: TINTA_SUAVE, textAlign: "center", letterSpacing: 1.5, textTransform: "uppercase" },
  fichas: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  ficha: { borderWidth: 1, borderColor: LINEA, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9, fontSize: 8.5, color: TINTA_SUAVE },
  fichaValor: { color: TINTA, fontWeight: 600 },
  foto: { maxHeight: 250, borderRadius: 8, objectFit: "contain", alignSelf: "center" },
  citaCaja: { borderLeftWidth: 2, borderLeftColor: ORO, paddingLeft: 10, marginBottom: 12 },
  cita: { fontFamily: "Cormorant", fontStyle: "italic", fontSize: 12.5, color: TINTA, lineHeight: 1.45 },
  citaEtiqueta: { fontSize: 7.5, letterSpacing: 2, textTransform: "uppercase", color: ORO, marginBottom: 3 },
  h2: { fontFamily: "Cormorant", fontSize: 17.5, fontWeight: 600, color: VIOLETA, marginTop: 12, marginBottom: 4 },
  h3: { fontFamily: "Cormorant", fontSize: 14, fontWeight: 600, color: VIOLETA, marginTop: 8, marginBottom: 2 },
  parrafo: { marginBottom: 7, textAlign: "justify", lineHeight: 1.55 },
  negrita: { fontWeight: 600 },
  cursiva: { fontFamily: "Cormorant", fontStyle: "italic", fontSize: 12 },
  vineta: { flexDirection: "row", marginBottom: 3, paddingLeft: 6 },
  vinetaMarca: { width: 12, color: ORO },
  vinetaTexto: { flex: 1, lineHeight: 1.55 },
  seccionPreguntas: { marginTop: 10 },
  pregunta: { fontFamily: "Cormorant", fontStyle: "italic", fontSize: 13, color: VIOLETA, marginTop: 8, marginBottom: 2 },
  aviso: { marginTop: 16, fontSize: 8, lineHeight: 1.4, color: TINTA_SUAVE, borderTopWidth: 1, borderTopColor: LINEA, paddingTop: 8 },
  pie: { position: "absolute", left: 48, right: 48, bottom: 24, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: TINTA_SUAVE },
  hexagrama: { alignItems: "center", gap: 4 },
  lineaYang: { width: 90, height: 7, backgroundColor: VIOLETA, borderRadius: 2 },
  lineaYin: { width: 90, height: 7, flexDirection: "row", justifyContent: "space-between" },
  lineaYinMitad: { width: 38, height: 7, backgroundColor: VIOLETA, borderRadius: 2 },
  mutante: { backgroundColor: ORO },
});

export type VisualPdf =
  | { tipo: "cartas"; items: { imagen: string | null; nombre: string; posicion: string }[] }
  | { tipo: "monedas"; items: { imagen: string | null; etiqueta: string; valor: string }[] }
  | { tipo: "numeros"; items: { etiqueta: string; valor: string }[] }
  | { tipo: "foto"; imagen: string }
  | { tipo: "hexagrama"; lineas: (0 | 1)[]; mutantes: number[]; titulo: string; futuro?: string }
  | { tipo: "aura"; imagen: string; items: { etiqueta: string; valor: string }[] };

export interface DatosPdf {
  idioma: string;
  etiqueta: string;
  titulo: string;
  meta: string;
  logo: string;
  visual?: VisualPdf;
  fichas?: { etiqueta: string; valor: string }[];
  cita?: { etiqueta: string; texto: string };
  interpretacion: string;
  preguntas: { pregunta: string; respuesta: string }[];
  textos: { preguntas: string; pagina: string; pie: string; aviso: string };
}

// ---------------------------------------------------------------------------
// Markdown mínimo → bloques
// ---------------------------------------------------------------------------
type Bloque = { tipo: "h2" | "h3" | "p" | "li"; texto: string; numero?: number };

function bloquesDe(md: string): Bloque[] {
  const bloques: Bloque[] = [];
  let parrafo: string[] = [];
  const cerrar = () => {
    if (parrafo.length) bloques.push({ tipo: "p", texto: parrafo.join(" ") });
    parrafo = [];
  };
  for (const cruda of md.replace(/\r/g, "").split("\n")) {
    const linea = cruda.trim();
    if (!linea) {
      cerrar();
      continue;
    }
    const h = linea.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      cerrar();
      bloques.push({ tipo: h[1].length <= 2 ? "h2" : "h3", texto: h[2].replace(/[*_]/g, "") });
      continue;
    }
    const li = linea.match(/^(?:[-*•]|(\d+)[.)])\s+(.*)$/);
    if (li) {
      cerrar();
      bloques.push({ tipo: "li", texto: li[2], numero: li[1] ? Number(li[1]) : undefined });
      continue;
    }
    if (/^(---|\*\*\*|___)$/.test(linea)) {
      cerrar();
      continue;
    }
    parrafo.push(linea.replace(/^>\s?/, ""));
  }
  cerrar();
  return bloques;
}

/** Texto con **negritas** y *cursivas* como fragmentos. */
function Inline({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g).filter(Boolean);
  return (
    <Text>
      {partes.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) return <Text key={i} style={s.negrita}>{p.slice(2, -2)}</Text>;
        if ((p.startsWith("*") && p.endsWith("*")) || (p.startsWith("_") && p.endsWith("_"))) return <Text key={i} style={s.cursiva}>{p.slice(1, -1)}</Text>;
        return <Text key={i}>{p.replace(/`/g, "")}</Text>;
      })}
    </Text>
  );
}

function Interpretacion({ md }: { md: string }) {
  const bloques = bloquesDe(md);
  return (
    <View>
      {bloques.map((b, i) => {
        if (b.tipo === "h2") return <Text key={i} style={s.h2}>{b.texto}</Text>;
        if (b.tipo === "h3") return <Text key={i} style={s.h3}>{b.texto}</Text>;
        if (b.tipo === "li") {
          return (
            <View key={i} style={s.vineta}>
              <Text style={s.vinetaMarca}>{b.numero ? `${b.numero}.` : "•"}</Text>
              <View style={s.vinetaTexto}><Inline texto={b.texto} /></View>
            </View>
          );
        }
        return (
          <View key={i} style={s.parrafo}><Inline texto={b.texto} /></View>
        );
      })}
    </View>
  );
}

function Visual({ v }: { v: VisualPdf }) {
  if (v.tipo === "cartas") {
    return (
      <View style={s.visual}>
        <View style={s.fila}>
          {v.items.map((c, i) => (
            <View key={i} style={s.carta}>
              {c.imagen ? <Image src={c.imagen} style={s.cartaImagen} /> : <View style={[s.cartaImagen, { backgroundColor: "#ece3cf" }]} />}
              <Text style={s.cartaNombre}>{c.nombre}</Text>
              <Text style={s.cartaPosicion}>{c.posicion}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }
  if (v.tipo === "monedas") {
    return (
      <View style={s.visual}>
        <View style={s.fila}>
          {v.items.map((m, i) => (
            <View key={i} style={s.moneda}>
              {m.imagen ? <Image src={m.imagen} style={s.monedaImagen} /> : null}
              <Text style={s.monedaValor}>{m.valor}</Text>
              <Text style={s.monedaEtiqueta}>{m.etiqueta}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }
  if (v.tipo === "numeros") {
    return (
      <View style={s.visual}>
        <View style={s.fila}>
          {v.items.map((m, i) => (
            <View key={i} style={[s.moneda, { width: 80 }]}>
              <Text style={[s.monedaValor, { fontSize: 26 }]}>{m.valor}</Text>
              <Text style={s.monedaEtiqueta}>{m.etiqueta}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }
  if (v.tipo === "foto") {
    return (
      <View style={s.visual}>
        <Image src={v.imagen} style={s.foto} />
      </View>
    );
  }
  if (v.tipo === "aura") {
    return (
      <View style={[s.visual, { flexDirection: "row", alignItems: "center", gap: 16 }]}>
        <Image src={v.imagen} style={{ width: 120, height: 120 }} />
        <View style={{ flex: 1, gap: 3 }}>
          {v.items.map((m, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ width: 54, fontSize: 8.5, color: TINTA_SUAVE }}>{m.etiqueta}</Text>
              <View style={{ flex: 1, height: 5, backgroundColor: "#e9e0cb", borderRadius: 3 }}>
                <View style={{ width: `${Math.max(2, Number(m.valor))}%`, height: 5, backgroundColor: i < 2 ? VIOLETA : ORO, borderRadius: 3 }} />
              </View>
              <Text style={{ width: 20, fontSize: 8, color: TINTA_SUAVE, textAlign: "right" }}>{m.valor}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }
  // Hexagrama (de abajo hacia arriba: dibujamos invertido)
  return (
    <View style={[s.visual, { alignItems: "center" }]}>
      <View style={s.hexagrama}>
        {[...v.lineas].reverse().map((l, idx) => {
          const i = v.lineas.length - 1 - idx;
          const mut = v.mutantes.includes(i);
          return l === 1 ? (
            <View key={i} style={[s.lineaYang, mut ? s.mutante : {}]} />
          ) : (
            <View key={i} style={s.lineaYin}>
              <View style={[s.lineaYinMitad, mut ? s.mutante : {}]} />
              <View style={[s.lineaYinMitad, mut ? s.mutante : {}]} />
            </View>
          );
        })}
      </View>
      <Text style={[s.monedaValor, { marginTop: 8 }]}>{v.titulo}</Text>
      {v.futuro ? <Text style={s.monedaEtiqueta}>{v.futuro}</Text> : null}
    </View>
  );
}

function DocumentoLectura({ d }: { d: DatosPdf }) {
  return (
    <Document title={d.titulo} author="Arcana · miarcana.com" subject={d.etiqueta} language={d.idioma}>
      <Page size="A4" style={s.pagina}>
        <View style={s.cabecera} fixed>
          <View style={s.marca}>
            <Image src={d.logo} style={s.logo} />
            <Text style={s.marcaNombre}>Arcana</Text>
          </View>
          <Text style={s.etiqueta}>{d.etiqueta}</Text>
        </View>

        <Text style={s.titulo}>{d.titulo}</Text>
        <Text style={s.meta}>{d.meta}</Text>
        <View style={s.filete} />

        {d.visual ? <Visual v={d.visual} /> : null}
        {d.fichas?.length ? (
          <View style={s.fichas}>
            {d.fichas.map((f, i) => (
              <Text key={i} style={s.ficha}>
                {f.etiqueta}: <Text style={s.fichaValor}>{f.valor}</Text>
              </Text>
            ))}
          </View>
        ) : null}
        {d.cita ? (
          <View style={s.citaCaja}>
            <Text style={s.citaEtiqueta}>{d.cita.etiqueta}</Text>
            <Text style={s.cita}>{d.cita.texto}</Text>
          </View>
        ) : null}

        <Interpretacion md={d.interpretacion} />

        {d.preguntas.length ? (
          <View style={s.seccionPreguntas}>
            <Text style={s.adorno}>✦ ✦ ✦</Text>
            <Text style={s.h2}>{d.textos.preguntas}</Text>
            {d.preguntas.map((p, i) => (
              <View key={i}>
                <Text style={s.pregunta}>{p.pregunta}</Text>
                <Interpretacion md={p.respuesta} />
              </View>
            ))}
          </View>
        ) : null}

        <Text style={s.aviso}>{d.textos.aviso}</Text>

        <View style={s.pie} fixed>
          <Text>{d.textos.pie}</Text>
          <Text render={({ pageNumber, totalPages }) => d.textos.pagina.replace("{n}", String(pageNumber)).replace("{total}", String(totalPages))} />
        </View>
      </Page>
    </Document>
  );
}

export async function pdfDeLectura(d: DatosPdf): Promise<Buffer> {
  registrarFuentes();
  return renderToBuffer(<DocumentoLectura d={d} />);
}
