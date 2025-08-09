/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tse3.mm.bing.net',
        port: '',
        pathname: '/**',
      },
      // Anda bisa menambahkan domain lain di sini jika perlu
    ],
  },
  experimental: {
    // Pre-bundle packages to speed up cold-start in dev
    optimizePackageImports: ['react', 'react-dom', 'three', 'react-icons'],
  },
  eslint: {
    // Skip ESLint during production builds to speed them up
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optionally skip type-checking during builds for speed
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
