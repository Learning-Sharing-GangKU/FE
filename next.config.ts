import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    async rewrites() {
        if (process.env.NODE_ENV !== "production") {
            const BE_URL = process.env.NEXT_PUBLIC_BE_ORIGIN || "http://localhost:8080";
            return [{ source: "/api/:path*", destination: `${BE_URL}/api/:path*` }];
        }
        return [];
    },
};

export default nextConfig;
