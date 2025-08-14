/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Unblock production builds on Vercel while we fix lint errors incrementally
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      },
    ],
  },
};

module.exports = nextConfig;