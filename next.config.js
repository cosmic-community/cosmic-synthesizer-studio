/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable modern features
  },
  images: {
    // Configure for Cosmic image optimization
    domains: ['cdn.cosmicjs.com', 'cosmic-s3.imgix.net'],
    formats: ['image/webp', 'image/avif'],
  },
  // Disable typed routes to prevent TypeScript routing errors
  typedRoutes: false,
  // Optimize bundle
  swcMinify: true,
  // Configure headers for audio content
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;