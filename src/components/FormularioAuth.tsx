"use client";

import { useActionState } from "react";
import Link from "next/link";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import type { EstadoAuth } from "@/lib/auth/acciones";

type Accion = (prev: EstadoAuth, fd: FormData) => Promise<EstadoAuth>;

export function FormularioEntrar({ accion, volver }: { accion: Accion; volver?: string }) {
  const [estado, enviar] = useActionState(accion, {});
  return (
    <form action={enviar} className="space-y-4">
      {estado.error && <Aviso>{estado.error}</Aviso>}
      <input type="hidden" name="volver" value={volver ?? "/inicio"} />
      <div>
        <label className="etiqueta" htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="campo" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="campo" />
      </div>
      <BotonEnviar className="boton boton-primario w-full" cargando="Entrando…">Entrar</BotonEnviar>
      <p className="text-center text-sm text-texto-suave">
        <Link href="/recuperar" className="hover:text-texto">¿Olvidaste tu contraseña?</Link>
      </p>
    </form>
  );
}

export function FormularioRegistro({ accion }: { accion: Accion }) {
  const [estado, enviar] = useActionState(accion, {});
  return (
    <form action={enviar} className="space-y-4">
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
      <div>
        <label className="etiqueta" htmlFor="nombre">Nombre</label>
        <input id="nombre" name="nombre" autoComplete="given-name" required className="campo" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="campo" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="password">Contraseña (mínimo 8 caracteres)</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="campo" />
      </div>
      <label className="flex items-start gap-2 text-sm text-texto-suave">
        <input type="checkbox" name="acepta" className="mt-1" required />
        <span>
          Acepto los <Link href="/terminos" className="underline">términos</Link> y la{" "}
          <Link href="/privacidad" className="underline">política de privacidad</Link>. Entiendo que las lecturas son
          de entretenimiento y reflexión.
        </span>
      </label>
      <BotonEnviar className="boton boton-primario w-full" cargando="Creando cuenta…">Crear cuenta</BotonEnviar>
    </form>
  );
}

export function FormularioRecuperar({ accion }: { accion: Accion }) {
  const [estado, enviar] = useActionState(accion, {});
  return (
    <form action={enviar} className="space-y-4">
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
      <div>
        <label className="etiqueta" htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" required className="campo" />
      </div>
      <BotonEnviar className="boton boton-primario w-full">Enviar enlace</BotonEnviar>
    </form>
  );
}

export function FormularioPerfil({ accion, nombre, email }: { accion: Accion; nombre: string; email: string }) {
  const [estado, enviar] = useActionState(accion, {});
  return (
    <form action={enviar} className="space-y-4">
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
      <div>
        <label className="etiqueta">Correo</label>
        <input value={email} disabled className="campo opacity-60" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="nombre">Nombre</label>
        <input id="nombre" name="nombre" defaultValue={nombre} required className="campo" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="password">Nueva contraseña (opcional)</label>
        <input id="password" name="password" type="password" autoComplete="new-password" className="campo" />
      </div>
      <BotonEnviar>Guardar cambios</BotonEnviar>
    </form>
  );
}
