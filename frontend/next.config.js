/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow Leaflet and OpenStreetMap images
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.tile.openstreetmap.org' },
      { protocol: 'https', hostname: 'unpkg.com' },
    ],
  },
  // Rewrites for backend proxy (dev convenience)
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8000/api/v1/:path*',
      },
      {
        source: '/snapshots/:path*',
        destination: 'http://localhost:8000/snapshots/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
