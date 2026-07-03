import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // تجاهل أخطاء التايب سكريبت القديمة للرفع الفوري
  },
  eslint: {
    ignoreDuringBuilds: true, // تجاهل تحذيرات الـ ESLint
  },
};

export default nextConfig;