import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (via pdfjs-dist) and mammoth use Node-specific/dynamic-require
  // patterns that webpack's bundler mishandles ("Object.defineProperty
  // called on non-object" at runtime) — load them via native `require`
  // instead of bundling them.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "mammoth"],
};

export default nextConfig;
