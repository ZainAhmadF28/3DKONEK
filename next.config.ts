/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

module.exports = nextConfig;
