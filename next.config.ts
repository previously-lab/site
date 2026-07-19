import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Home directory has a pnpm-lock.yaml that Turbopack picks up as the
  // workspace root, causing module resolution to fail. Pin it here.
  turbopack: {
    root: process.cwd(),
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
