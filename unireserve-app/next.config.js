/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '16mb' },
  },
};

module.exports = nextConfig;
