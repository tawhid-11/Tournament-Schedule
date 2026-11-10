/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack: (config) => {
    config.externals.push({
      "@resvg/resvg-js": "commonjs @resvg/resvg-js",
    });
    return config;
  },
};

export default nextConfig;
