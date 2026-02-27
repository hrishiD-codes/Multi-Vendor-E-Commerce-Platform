/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  output: "standalone",
  turbopack: {
    resolveAlias: {
      tailwindcss: "./node_modules/tailwindcss",
    },
  },
};

export default nextConfig;
