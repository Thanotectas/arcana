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
  // Las fuentes de las imágenes de vista previa se leen en tiempo de ejecución.
  outputFileTracingIncludes: { "/**": ["./src/app/fuentes/**"], "/api/lecturas/[id]/tarjeta": ["./public/cartas/rider/**", "./public/cartas/arcana/**", "./public/cartas/marsella/**", "./public/cartas/angeles/**", "./public/signos/**", "./public/animales/**"], "/api/redes/carta-dia": ["./public/cartas/rider/**", "./public/cartas/arcana/**", "./public/cartas/marsella/**", "./public/cartas/angeles/**"], "/api/cron/instagram": ["./public/cartas/rider/**", "./public/cartas/arcana/**", "./public/cartas/marsella/**", "./public/cartas/angeles/**", "./node_modules/@ffmpeg-installer/linux-x64/ffmpeg", "./node_modules/@ffmpeg-installer/linux-x64/package.json", "./node_modules/@ffmpeg-installer/ffmpeg/*.js*", "./node_modules/@ffmpeg-installer/ffmpeg/lib/**"], "/admin/redes": ["./public/cartas/rider/**", "./public/cartas/arcana/**", "./public/cartas/marsella/**", "./public/cartas/angeles/**", "./node_modules/@ffmpeg-installer/linux-x64/ffmpeg", "./node_modules/@ffmpeg-installer/linux-x64/package.json", "./node_modules/@ffmpeg-installer/ffmpeg/*.js*", "./node_modules/@ffmpeg-installer/ffmpeg/lib/**"], "/api/lecturas/[id]/pdf": ["./public/cartas/rider/**", "./public/cartas/arcana/**", "./public/cartas/marsella/**", "./public/cartas/angeles/**", "./public/signos/**", "./public/animales/**", "./public/marca/**"] },
  // El generador de PDF y ffmpeg (reel de la carta del día) traen sus propios binarios: mejor sin empaquetar.
  serverExternalPackages: ["@react-pdf/renderer", "@ffmpeg-installer/ffmpeg"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(), payment=(self \"https://checkout.bold.co\")" },
          // CSP acotada a lo que no puede romper el checkout de Bold ni Google: sin marcos ajenos, sin plugins, sin <base> externo.
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
