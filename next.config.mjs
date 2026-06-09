/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // Only for Docker/self-hosted. Vercel uses default mode.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Update to specific CDN in production
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.maptiler.com https://*.openstreetmap.org https://basemaps.cartocdn.com",
              "worker-src blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
