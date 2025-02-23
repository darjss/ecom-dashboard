/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

/** @type {import("next").NextConfig} */
const config = {
  // serverExternalPackages: ["bun:sqlite"],
  experimental: {
    ppr: "incremental",
    dynamicIO: true,
    // reactCompiler: true,b
    useCache: true,
    cacheLife: {
       brandCategory: {
         stale: 60 * 60 * 24,
         revalidate: 60 * 60 * 24,
         expire: 60 * 60 * 24 * 30,
       },
       session: {
        stale: 900, // 15 minutes
        revalidate: 60, // 1 minute
        expire: 1800, // 30 minutes
      },
    },
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default config;
