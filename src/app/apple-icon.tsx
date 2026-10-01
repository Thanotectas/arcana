import { ImageResponse } from "next/og";
import { simboloDataUri } from "@/lib/marca/simbolo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Ícono de iOS: el símbolo cuadrado a sangre (iOS redondea las esquinas). */
export default function IconoApple() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <img src={simboloDataUri("cuadrado")} width={180} height={180} alt="" />
      </div>
    ),
    size,
  );
}
