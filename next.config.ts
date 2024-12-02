/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "your-domain.vercel.app"],
  },
};

module.exports = nextConfig;
