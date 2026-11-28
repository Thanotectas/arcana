/**
 * Un idioma principal por red: cada red aprende a quién mostrar la cuenta según quién reacciona, y mezclar idiomas
 * hace que un video en árabe le llegue a colombianos (nadie reacciona y el video muere). Por defecto Instagram va en
 * árabe (el público que llegó solo) y Facebook en español (México y Latinoamérica). YouTube y Telegram no se tocan.
 * REDES_IDIOMAS lo cambia sin tocar el código, p. ej. «instagram:ar,facebook:es» o «instagram:ar+es».
 */
type RedIdioma = "instagram" | "facebook";

function configuracion(): Record<RedIdioma, string[]> {
  const base: Record<RedIdioma, string[]> = { instagram: ["ar"], facebook: ["es"] };
  for (const parte of (process.env.REDES_IDIOMAS ?? "").split(",")) {
    const [red, idiomas] = parte.split(":").map((x) => x.trim());
    if ((red === "instagram" || red === "facebook") && idiomas) base[red] = idiomas.split("+").map((x) => x.trim());
  }
  return base;
}

/** ¿Esta red publica contenido en este idioma? */
export function publicaIdiomaEn(red: RedIdioma, idioma: string) {
  return configuracion()[red].includes(idioma);
}
