/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // This starter does not ship a standalone ESLint toolchain. Keep builds
  // deterministic; linting can be enabled later by adding eslint explicitly.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
