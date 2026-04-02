import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.strava.com",
      },
      {
        protocol: "https",
        hostname: "dgalywyr863hv.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
