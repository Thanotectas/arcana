/** Normaliza lo que escribe la persona: solo cifras, sin espacios ni puntos. Devuelve null si no es un número válido. */
export function normalizarNumero(valor: string): string | null {
  const limpio = valor.replace(/[\s.:,\-_/]/g, "");
  return /^\d{1,8}$/.test(limpio) ? limpio : null;
}

/** Reduce un número a una sola cifra sumando sus dígitos (1234 → 10 → 1). */
export function reducir(numero: string): { pasos: number[]; raiz: number } {
  const pasos: number[] = [];
  let actual = numero.split("").reduce((s, d) => s + Number(d), 0);
  pasos.push(actual);
  while (actual > 9) {
    actual = String(actual).split("").reduce((s, d) => s + Number(d), 0);
    pasos.push(actual);
  }
  return { pasos, raiz: actual };
}
