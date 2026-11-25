import "server-only";
import { paypalConfigurado } from "./paypal";
import { pagosInternacionalesConfigurados as lemonConfigurado } from "./lemon";
import { esAdmin } from "../admin";

/**
 * Proveedor del pago en dólares para esta persona: PayPal si tiene claves;
 * Lemon solo si se reactiva (LEMON_ACTIVO=1).
 *
 * Mientras PAYPAL_PUBLICO no sea "1", PayPal solo lo ven y usan las cuentas
 * administradoras (ADMIN_CORREOS): así se prueba en producción con una compra
 * real sin que los clientes lo vean. Los demás siguen pagando en pesos con Bold.
 */
export function proveedorInternacional(correo: string | null | undefined): "paypal" | "lemon" | null {
  if (paypalConfigurado() && (process.env.PAYPAL_PUBLICO === "1" || esAdmin(correo))) return "paypal";
  if (lemonConfigurado()) return "lemon";
  return null;
}

export function pagoInternacionalDisponible(correo: string | null | undefined) {
  return proveedorInternacional(correo) !== null;
}
