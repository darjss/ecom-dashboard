/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    ppr: "incremental",
    dynamicIO: true,
    reactCompiler: true,
    useCache: true,
    cacheLife: {
      brandCategory: {
        stale: 60 * 60 * 24,
        revalidate: 60 * 60 * 24,
        expire: 60 * 60 * 24 * 30,
      },
      session: {
        stale: 1800,
        revalidate: 900,
        expire: 3600,
      },
      analytics:{
        stale: 60 * 60 * 12,
        revalidate: 60 * 60 * 12,
        expire: 60 * 60 * 24 ,
      }
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default config;
