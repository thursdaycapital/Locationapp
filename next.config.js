/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 允许访问摄像头和定位
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=*, geolocation=*',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

