"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { COOKIE_IDIOMA, esIdioma } from "./idiomas";

export async function accionCambiarIdioma(formData: FormData) {
  const idioma = formData.get("idioma");
  if (!esIdioma(idioma)) return;
  const jar = await cookies();
  jar.set(COOKIE_IDIOMA, idioma, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
