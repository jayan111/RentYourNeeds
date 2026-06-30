/** @type {import('next').NextConfig} */

const backendOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || '';
  try { return new URL(raw); } catch { return null; }
})();

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/uploads/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/uploads/**' },
      ...(backendOrigin
        ? [{
            protocol: backendOrigin.protocol.replace(':', ''),
            hostname: backendOrigin.hostname,
            ...(backendOrigin.port ? { port: backendOrigin.port } : {}),
            pathname: '/uploads/**',
          }]
        : []),
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

module.exports = nextConfig;
