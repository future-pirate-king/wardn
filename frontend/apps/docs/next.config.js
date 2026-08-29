import { createMDX } from "fumadocs-mdx/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: ["127.0.0.1", "localhost", "0.0.0.0", "192.168.1.19"],
    async redirects() {
        return [
            {
                source: "/",
                destination: "/docs",
                permanent: true,
            },
        ];
    },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
