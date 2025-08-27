import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static optimization
  output: 'standalone',
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Enable compression
  compress: true,
  
  // Environment variables configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Images configuration
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  
  // Experimental features
  experimental: {
    // Remove turbopack for production builds
    // turbopack: false,
  },
  
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    
    return config;
  },
};

export default nextConfig;
