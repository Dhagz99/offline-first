import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    distDir: process.env.NEXT_DIST_DIR || ".next",

    allowedDevOrigins: [
        "192.168.1.251",
        "172.17.197.155",
    ],

    transpilePackages: [
        "@repo/shared",
    ],
};

export default nextConfig;