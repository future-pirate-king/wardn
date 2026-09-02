import { createMDX } from "fumadocs-mdx/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: ["127.0.0.1", "localhost", "0.0.0.0", "192.168.1.19", "192.168.1.9"],
};

const withMDX = createMDX();

export default withMDX(nextConfig);
