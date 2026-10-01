"use client";

import { useActionState } from "react";
import Link from "next/link";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { Turnstile } from "./Turnstile";
import type { EstadoAuth } from "@/lib/auth/acciones";
import { useT } from "@/lib/i18n/cliente";

type Accion = (prev: EstadoAuth, fd: FormData) => Promise<EstadoAuth>;

function useMensajes(estado: EstadoAuth) {
  const { t } = useT();
  const errores = t.auth.errores as Record<string, string>;
  return {
    t,
    error: estado.error ? (errores[estado.error] ?? estado.error) : undefined,
    mensaje: estado.mensaje ? (errores[estado.mensaje] ?? estado.mensaje) : undefined,
  };
}

export function FormularioEntrar({ accion, volver }: { accion: Accion; volver?: string }) {
  const [estado, enviar] = useActionState(accion, {});
  const { t, error } = useMensajes(estado);
  return (
    <form action={enviar} className="space-y-4">
      {error && <Aviso>{error}</Aviso>}
      <input type="hidden" name="volver" value={volver ?? "/inicio"} />
      <div>
        <label className="etiqueta" htmlFor="email">{t.auth.correo}</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="campo" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="password">{t.auth.contrasena}</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="campo" />
      </div>
      <Turnstile reinicio={estado} />
      <BotonEnviar className="boton boton-primario w-full" cargando={t.auth.entrando}>{t.comun.entrar}</BotonEnviar>
      <p className="text-center text-sm text-texto-suave">
        <Link href="/recuperar" className="hover:text-texto">{t.auth.olvidaste}</Link>
      </p>
    </form>
  );
}

export function FormularioRegistro({ accion }: { accion: Accion }) {
  const [estado, enviar] = useActionState(accion, {});
  const { t, error, mensaje } = useMensajes(estado);
  const [antes, resto] = t.auth.aceptoTerminos.split("{terminos}");
  const [medio, despues] = (resto ?? "").split("{privacidad}");
  return (
    <form action={enviar} className="space-y-4">
      {error && <Aviso>{error}</Aviso>}
      {mensaje && <Aviso tipo="exito">{mensaje}</Aviso>}
      <div>
        <label className="etiqueta" htmlFor="nombre">{t.auth.nombre}</label>
        <input id="nombre" name="nombre" autoComplete="given-name" required className="campo" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="email">{t.auth.correo}</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="campo" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="password">{t.auth.contrasenaNueva}</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="campo" />
      </div>
      <label className="flex items-start gap-2 text-sm text-texto-suave">
        <input type="checkbox" name="acepta" className="mt-1" required />
        <span>
          {antes}
          <Link href="/terminos" className="underline">{t.auth.terminos}</Link>
          {medio}
          <Link href="/privacidad" className="underline">{t.auth.privacidad}</Link>
          {despues}
        </span>
      </label>
      <Turnstile reinicio={estado} />
      <BotonEnviar className="boton boton-primario w-full" cargando={t.auth.creando}>{t.comun.crearCuenta}</BotonEnviar>
    </form>
  );
}

export function FormularioRecuperar({ accion }: { accion: Accion }) {
  const [estado, enviar] = useActionState(accion, {});
  const { t, error, mensaje } = useMensajes(estado);
  return (
    <form action={enviar} className="space-y-4">
      {error && <Aviso>{error}</Aviso>}
      {mensaje && <Aviso tipo="exito">{mensaje}</Aviso>}
      <div>
        <label className="etiqueta" htmlFor="email">{t.auth.correo}</label>
        <input id="email" name="email" type="email" required className="campo" />
      </div>
      <Turnstile reinicio={estado} />
      <BotonEnviar className="boton boton-primario w-full">{t.auth.enviarEnlace}</BotonEnviar>
    </form>
  );
}

export function FormularioPerfil({ accion, nombre, email }: { accion: Accion; nombre: string; email: string }) {
  const [estado, enviar] = useActionState(accion, {});
  const { t, error, mensaje } = useMensajes(estado);
  return (
    <form action={enviar} className="space-y-4">
      {error && <Aviso>{error}</Aviso>}
      {mensaje && <Aviso tipo="exito">{mensaje}</Aviso>}
      <div>
        <label className="etiqueta">{t.auth.correo}</label>
        <input value={email} disabled className="campo opacity-60" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="nombre">{t.auth.nombre}</label>
        <input id="nombre" name="nombre" defaultValue={nombre} required className="campo" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="password">{t.cuenta.nuevaContrasena}</label>
        <input id="password" name="password" type="password" autoComplete="new-password" className="campo" />
      </div>
      <BotonEnviar>{t.cuenta.guardar}</BotonEnviar>
    </form>
  );
}
