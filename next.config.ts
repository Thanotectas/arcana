import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // La foto de la palma (reducida a 1280 px en el navegador) viaja en una
      // Server Action; el límite por defecto es 1 MB.
      bodySizeLimit: "5mb",
    },
  },
  // El proyecto vive (por ahora) dentro de otro repositorio; fijamos la raíz
  // para que Turbopack no busque node_modules en directorios superiores.
  turbopack: { root: __dirname },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
