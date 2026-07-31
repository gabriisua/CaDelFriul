import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/api/**',
      },
    ],
  },
  reactCompiler: true,
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
