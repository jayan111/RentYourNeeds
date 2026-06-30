/** @type {import('next').NextConfig} */

// Derive the backend hostname from NEXT_PUBLIC_API_URL for image domains
const backendOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || '';
  try { return new URL(raw); } catch { return null; }
})();

const nextConfig = {
  images: {
    remotePatterns: [
      // Local development
      { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/uploads/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/uploads/**' },
      // Production backend (derived from NEXT_PUBLIC_API_URL at build time)
      ...(backendOrigin
        ? [{
            protocol: backendOrigin.protocol.replace(':', ''),
            hostname: backendOrigin.hostname,
            ...(backendOrigin.port ? { port: backendOrigin.port } : {}),
            pathname: '/uploads/**',
          }]
        : []),
      // Unsplash (used for placeholder product images)
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

module.exports = nextConfig;
