import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,  // tells Next.js the frontend folder IS the root
  },
};

export default nextConfig;
