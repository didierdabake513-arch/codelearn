/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow larger upload for course JSON files
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}
module.exports = nextConfig
