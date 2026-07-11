import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (via pdfjs-dist) and mammoth use Node-specific/dynamic-require
  // patterns that webpack's bundler mishandles ("Object.defineProperty
  // called on non-object" at runtime) — load them via native `require`
  // instead of bundling them. @napi-rs/canvas ships a native .node binary
  // (used by pdfjs-dist to polyfill DOMMatrix/ImageData/Path2D in Node) that
  // webpack can't bundle either.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "mammoth", "@napi-rs/canvas"],
};

export default nextConfig;
