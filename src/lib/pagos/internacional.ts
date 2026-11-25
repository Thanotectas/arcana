import "server-only";
import { paypalConfigurado } from "./paypal";
import { pagosInternacionalesConfigurados as lemonConfigurado } from "./lemon";

/** Proveedor del pago en dólares: PayPal si tiene claves; Lemon solo si se reactiva (LEMON_ACTIVO=1). */
export function proveedorInternacional(): "paypal" | "lemon" | null {
  if (paypalConfigurado()) return "paypal";
  if (lemonConfigurado()) return "lemon";
  return null;
}

export function pagoInternacionalDisponible() {
  return proveedorInternacional() !== null;
}
