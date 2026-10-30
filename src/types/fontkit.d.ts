/* Tipos mínimos para la parte de `fontkit` que usa Arcana (glifos como trazos SVG). */
declare module "fontkit" {
  export interface Path {
    toSVG(): string;
  }
  export interface Glyph {
    path: Path;
    advanceWidth: number;
  }
  export interface GlyphPosition {
    xAdvance: number;
    xOffset: number;
    yOffset: number;
  }
  export interface GlyphRun {
    glyphs: Glyph[];
    positions: GlyphPosition[];
  }
  export interface Font {
    unitsPerEm: number;
    layout(texto: string): GlyphRun;
    hasGlyphForCodePoint(codigo: number): boolean;
  }
  export function create(datos: Buffer): Font;
}
