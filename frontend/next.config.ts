import type { NextConfig } from "next";
import { Script } from "vm";


const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  distDir: "./api/public",
  // ... any other things you'd like to add 
}
export default nextConfig;
// package.json

//... your other scripts
module.exports = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}
