import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["y-monaco", "lib0"],
  outputFileTracingRoot: path.join(__dirname),
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "monaco-editor/esm/vs/editor/editor.api.js": path.resolve(
        __dirname,
        "node_modules/monaco-editor/esm/vs/editor/editor.api.js"
      ),
    };
    return config;
  },
};

export default nextConfig;
