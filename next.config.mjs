/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/Novis",
  assetPrefix: "/Novis/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;