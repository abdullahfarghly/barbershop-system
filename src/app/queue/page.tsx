"use client";

import { useEffect, useState } from "react";
import { useBookingStore } from "@/store/booking";
import { Button } from "@/components/ui/button";
import { Scissors, Calendar, Users, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { QueueOverviewSection } from "@/components/home/queue-overview-section"; // أو اسم مكوّن عرض الطابور عندك

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const store = useBookingStore();

  // 🔌 تشغيل المزامنة السحابية اللحظية (Real-time) أول ما الموقع يفتح فوراً
  useEffect(() => {
    setIsMounted(true);
    
    // بدء الاتصال بالسيرفر والاشتراك في التحديثات اللحظية
    const unsubscribe = useBookingStore.getState().subscribeToRealtime();
    
    // قطع الاتصال عند مغادرة الموقع لحماية الأداء
    return () => unsubscribe();
  }, []);

  // حماية الصفحة من أخطاء الـ Hydration حتى يكتمل الاتصال بالمتصفح
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-gray-500">
        جاري الاتصال بسيرفر صالون البحراوي VIP...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 space-y-10" dir="rtl">
      {/* سيكشن الترحيب والهيدر الرئيسي */}
      <div className="max-w-2xl space-y-4 mt-8">
        <div className="inline-flex items-center gap-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full text-xs font-bold animate-pulse">
          <Scissors className="w-3.5 h-3.5" /> نظام الحجز والانتظار    
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          صالون البحراوي <span className="text-[#D4AF37]">VIP</span>
        </h1>
        <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          احجز دورك أونلاين وتابع مكانك في الطابور لحظة بلحظة من موبايلك دون الحاجة للانتظار الطويل داخل الصالون.
        </p>
      </div>

      {/* 📊 عرض حالة الطابور والعدادات الحية المتصلة بالـ Realtime */}
      <div className="w-full max-w-xl">
        <QueueOverviewSection />
      </div>

      {/* 🔘 أزرار التوجيه السريعة للزبون والأدمن */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center pb-12">
        <Button asChild size="lg" className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-black text-xs py-6 flex-1">
          <Link href="/booking">
            <Calendar className="w-4 h-4 ml-1.5" /> احجز دورك الآن
          </Link>
        </Button>
        
        <Button asChild size="lg" variant="outline" className="border-gray-800 hover:bg-gray-900 text-xs py-6 flex-1 text-gray-300">
          <Link href="/admin/dashboard">
            <ShieldAlert className="w-4 h-4 ml-1.5" /> لوحة الإدارة (للحلاق)
          </Link>
        </Button>
      </div>
    </div>
  );
}