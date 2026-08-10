/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.IS_AGENT_BUILD === 'true' ? '.next-agent' : '.next',
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
