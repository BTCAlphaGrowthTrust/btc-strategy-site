import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/buy-program", destination: "/gaia", permanent: true },
      { source: "/buy-program/:path*", destination: "/gaia/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
