/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["recharts"],
    async rewrites() {
        return [
            {
                source: '/backend/:path*',
                destination: `${process.env.API_INTERNAL_URL || 'http://localhost:5001'}/:path*`,
            },
        ];
    },
};

export default nextConfig;
