"use client";

import { useEffect, useRef } from "react";

export interface DatosCheckoutBold {
  scriptUrl: string;
  apiKey: string;
  orderId: string;
  montoPesos: number;
  moneda: string;
  firma: string;
  descripcion: string;
  redirectUrl: string;
  email?: string;
  nombre?: string;
}

/**
 * Inserta el botón de pagos de Bold. La librería de Bold se ejecuta sobre su
 * propia etiqueta <script data-bold-button> y dibuja el botón en su lugar.
 */
export function CheckoutBold(d: DatosCheckoutBold) {
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const div = contenedor.current;
    if (!div) return;
    div.innerHTML = "";

    const s = document.createElement("script");
    s.src = d.scriptUrl;
    s.async = true;
    s.setAttribute("data-bold-button", "dark-L");
    s.setAttribute("data-api-key", d.apiKey);
    s.setAttribute("data-order-id", d.orderId);
    s.setAttribute("data-amount", String(d.montoPesos));
    s.setAttribute("data-currency", d.moneda);
    s.setAttribute("data-integrity-signature", d.firma);
    s.setAttribute("data-description", d.descripcion);
    s.setAttribute("data-redirection-url", d.redirectUrl);
    if (d.email || d.nombre) {
      s.setAttribute(
        "data-customer-data",
        JSON.stringify({ ...(d.email ? { email: d.email } : {}), ...(d.nombre ? { fullName: d.nombre } : {}) }),
      );
    }
    div.appendChild(s);

    return () => {
      div.innerHTML = "";
    };
  }, [d.scriptUrl, d.apiKey, d.orderId, d.montoPesos, d.moneda, d.firma, d.descripcion, d.redirectUrl, d.email, d.nombre]);

  return <div ref={contenedor} className="flex min-h-14 justify-center" />;
}
