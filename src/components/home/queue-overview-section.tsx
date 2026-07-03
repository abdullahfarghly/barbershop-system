"use client";

import { useEffect, useState } from "react"; // استيراد الـ Hooks لمنع الـ Hydration Error
import { Clock, Users } from "lucide-react";
import { ShopStatusCard } from "@/components/home/shop-status-card";
import { StatCard } from "@/components/home/stat-card";
import { useBookingStore } from "@/store/booking";

export function QueueOverviewSection() {
  // 🛡️ فحص حالة الـ Mount لمنع تضارب الأرقام بين السيرفر والـ localStorage
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const config = useBookingStore((state) => state.config);
  const getCurrentQueue = useBookingStore((state) => state.getCurrentQueue);
  
  const useStoreState = useBookingStore.getState() as any;

  // جلب الطابور الحالي
  const queue = getCurrentQueue ? getCurrentQueue() : [];
  
  // التحقق من حالة فتح المحل
  const isOpen = config?.currentStatus === "open";

  // حساب وقت الانتظار المتوقع بناءً على اللوجيك الأصلي
  let estimatedWait = 0;
  if (queue.length > 0) {
    if (useStoreState.getEstimatedWaitTime) {
      estimatedWait = useStoreState.getEstimatedWaitTime(1);
    } else {
      estimatedWait = queue.length * 20; // حساب تقريبي احتياطي لحماية الـ Build
    }
  }

  // 🔓 إذا لم تكتمل عملية الـ Mount على المتصفح، نعيد هيكل فارغ متناسق لمنع الـ Hydration Error تماماً دون تغيير اللوجيك
  if (!isMounted) {
    return (
      <section id="queue-status" className="container px-6 py-10 sm:py-14">
        <div className="mx-auto flex max-w-2xl flex-col gap-5 text-center text-xs text-gray-500">
          جاري تحميل حالة الطابور الفورية...
        </div>
      </section>
    );
  }

  return (
    <section id="queue-status" className="container px-6 py-10 sm:py-14">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <ShopStatusCard 
          isOpen={isOpen} 
          queueCount={queue.length} 
          estimatedWait={estimatedWait}
        />

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Clock}
            label="الانتظار المتوقع"
            value={String(estimatedWait)}
            unit="دقيقة"
            accent="primary"
            delay={0.1}
          />
          <StatCard
            icon={Users}
            label="الزبائن في الطابور"
            value={String(queue.length)}
            unit="زبون"
            accent="primary"
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
}