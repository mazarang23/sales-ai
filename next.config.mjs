/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
    webpackBuildWorker: false,
  },

  // Limit Next.js build concurrency for Darakub's constrained environment
  cpus: 1,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;