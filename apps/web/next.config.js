/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["recharts"],
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
            { protocol: 'http', hostname: 'localhost' },
        ],
    },
};

export default nextConfig;
