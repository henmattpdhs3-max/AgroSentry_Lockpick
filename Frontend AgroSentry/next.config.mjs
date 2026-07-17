/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Supabase storage bucket for diagnosis photos, filled in once provisioned
    ],
  },
};

export default nextConfig;
