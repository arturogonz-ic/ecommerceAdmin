import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/ecommerceAdmin",
  images: { unoptimized: true },
};

export default nextConfig;
