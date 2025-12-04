import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    async rewrites() {
        if (process.env.NODE_ENV !== "production") {
            const BE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
            return [{ source: "/api/:path*", destination: `${BE_URL}/api/:path*` }];
        }
        return [];
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        // ✅ TS 타입 에러가 있어도 빌드 실패로 안 봄
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
