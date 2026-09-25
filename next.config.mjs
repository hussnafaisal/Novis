import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,

  basePath: "/Novis",
  assetPrefix: "/Novis/",

  images: {
    unoptimized: true,
  },
};

export default nextConfig;