/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // next.config.ts nao e suportado no Next.js 14 - usar .mjs
}

export default nextConfig
