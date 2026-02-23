/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  turbopack: {
    resolveAlias: {
      tailwindcss: "./node_modules/tailwindcss",
    },
  },
};

export default nextConfig;
