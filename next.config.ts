import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Legacy images uploaded before the Cloudflare R2 migration.
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Default R2 public bucket URL. If you connect a custom domain instead, add its
        // exact hostname here too (or replace this entry).
        protocol: "https",
        hostname: "*.r2.dev",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
