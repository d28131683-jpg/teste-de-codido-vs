export default {
  reactStrictMode: true,
  basePath: '/teste-de-codido-vs',
  assetPrefix: '/teste-de-codido-vs/',
  output: 'export',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
};
