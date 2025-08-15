/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@open-swe/shared'],
  typescript: {
    // !! WARN !!
    // Temporarily allow production builds to complete even if
    // there are type errors.
    // This should be removed once all types are properly aligned
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  webpack: (config, { isServer }) => {
    // Add rule to handle TypeScript files from shared package
    config.module.rules.push({
      test: /\.tsx?$/,
      include: [
        /packages\/shared/,
      ],
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
