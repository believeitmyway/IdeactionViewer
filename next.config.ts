import type { NextConfig } from "next";

// const isProd = process.env.NODE_ENV === 'production';

// TODO: Replace 'REPOSITORY_NAME' with the actual repository name if deploying to GitHub Pages under a subpath
// e.g., const repo = '/drive-md-viewer';
// If deploying to a custom domain or a User/Organization page (e.g., username.github.io), keep it empty string.
// const repo = '';

const nextConfig: NextConfig = {
  output: 'export',
  // basePath: isProd ? repo : '',
  // assetPrefix: isProd ? repo : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
