import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Library lives in ./src — consumed by templates via transpilePackages on the invite host.
  transpilePackages: [],
};

export default nextConfig;
