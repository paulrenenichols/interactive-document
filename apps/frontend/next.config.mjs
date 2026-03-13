/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Workaround: Next 15 type-check phase sometimes references .next/types/*.ts files
  // that are not yet written, causing ENOENT. Lint and types are still checked by Nx/ESLint.
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build; CI runs lint separately.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
