"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { COOKIE_IDIOMA, esIdioma } from "./idiomas";
import { createClient } from "../supabase/server";

export async function accionCambiarIdioma(formData: FormData) {
  const idioma = formData.get("idioma");
  if (!esIdioma(idioma)) return;
  const jar = await cookies();
  jar.set(COOKIE_IDIOMA, idioma, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  // Con sesión, el perfil recuerda el idioma (lo usa el aviso diario del cron).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await supabase.from("perfiles").update({ idioma }).eq("id", user.id);
  revalidatePath("/", "layout");
}
