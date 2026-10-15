import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  async rewrites() {
    const upstream = (process.env.CALENDAR_UPSTREAM_URL || (process.env.NODE_ENV === "development" ? "http://127.0.0.1:3001" : "https://elcalendario.lovable.app")).replace(/\/$/, "");
    if (!upstream) return [];
    // Nitro publishes build assets at its root; the browser still sees /move.
    // Vite development already serves those files under /move.
    const assets = process.env.NODE_ENV === "development" ? [] : [
      { source: "/move/assets/:path*", destination: `${upstream}/assets/:path*` },
      { source: "/move/workbox-:file.js", destination: `${upstream}/workbox-:file.js` },
      ...["sw.js","manifest.webmanifest","firebase-messaging-sw.js","favicon.png","apple-touch-icon.png","app-icon.png","descobreix-logo.png","bright-retro.otf","occitania-flag.svg","aragon-council-flag.jpg","la-merce-2026.html","robots.txt"].map(file=>({source:`/move/${file}`,destination:`${upstream}/${file}`})),
    ];
    // The old public/move/index.html must not take precedence over the live calendar.
    return { beforeFiles: [
      ...assets,
      { source: "/move", destination: `${upstream}/move/` },
      { source: "/move/:path*", destination: `${upstream}/move/:path*` },
    ], afterFiles: [], fallback: [] };
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    // WebP avoids AVIF's slower first encoding while retaining responsive delivery.
    formats: ['image/webp'],
    qualities: [70, 75, 85],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tsnatwflznqhtpxfxlcd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);

