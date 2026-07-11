import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (via pdfjs-dist) and mammoth use Node-specific/dynamic-require
  // patterns that webpack's bundler mishandles ("Object.defineProperty
  // called on non-object" at runtime) — load them via native `require`
  // instead of bundling them. @napi-rs/canvas ships a native .node binary
  // (used by pdfjs-dist to polyfill DOMMatrix/ImageData/Path2D in Node) that
  // webpack can't bundle either.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "mammoth", "@napi-rs/canvas"],

  // pdfjs-dist loads @napi-rs/canvas via a dynamic `require()` inside a
  // try/catch (to gracefully degrade if it's absent), which Vercel's build
  // trace can't follow statically — so its platform-specific native binary
  // never makes it into the deployed function, and the DOMMatrix/ImageData/
  // Path2D polyfills silently fail at runtime. Force-include it explicitly.
  // The actual .node binary lives in a separate per-platform optional
  // dependency package (@napi-rs/canvas-<platform>), not inside
  // @napi-rs/canvas itself — Vercel's Node.js functions run on
  // linux-x64-gnu, so that's the one that must be included.
  outputFileTracingIncludes: {
    "/api/upload/**": [
      "./node_modules/@napi-rs/canvas/**",
      "./node_modules/@napi-rs/canvas-linux-x64-gnu/**",
    ],
  },
};

export default nextConfig;
