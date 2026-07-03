"use client";
import { useEffect, useState } from "react";
import { useBookingStore } from "@/store/booking";
import { Calendar, Users, Clock, AlertTriangle, CheckCircle, Phone, User, ArrowRight, BellRing } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function BookingPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [myActivePhone, setMyActivePhone] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const store = useBookingStore();
  const config = store.config;
  const queue = store.getCurrentQueue();

  useEffect(() => {
    setIsMounted(true);
    // تذكر رقم الزبون لو حجز قبل كدة علشان يتابع دوره تلقائياً لو قفل الفون وفتح تاني
    const savedPhone = localStorage.getItem("my_active_booking_phone");
    if (savedPhone) {
      setMyActivePhone(savedPhone);
    }
    // تشغيل المزامنة اللحظية
    const unsubscribe = store.subscribeToRealtime();
    return () => unsubscribe();
  }, []);

  // دالة إرسال الحجز للسيرفر
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    // فحص رقم الهاتف لمنع تكرار الحجز للزبون نفسه في نفس الطابور
    const alreadyBooked = queue.some(b => b.phone === phone && b.status === "waiting");
    if (alreadyBooked) {
      alert("رقم الهاتف هذا محجوز به بالفعل في الطابور الحالي يا غالي!");
      setMyActivePhone(phone);
      localStorage.setItem("my_active_booking_phone", phone);
      return;
    }

    setIsSubmitting(true);
    const resultPhone = await store.addBooking(name, phone);
    setIsSubmitting(false);

    if (resultPhone) {
      setMyActivePhone(resultPhone);
      localStorage.setItem("my_active_booking_phone", resultPhone);
    } else {
      alert("حدث خطأ أثناء الحجز، حاول مرة أخرى.");
    }
  };

  // دالة إلغاء الحجز من طرف الزبون
  const handleCancelMyBooking = async (bookingId: string) => {
    if (confirm("هل أنت متأكد من إلغاء دورك في الطابور؟")) {
      await store.updateBookingStatus(bookingId, "cancelled");
      localStorage.removeItem("my_active_booking_phone");
      setMyActivePhone(null);
    }
  };

  if (!isMounted) {
    return <div className="text-center p-20 text-xs text-gray-500">جاري تحميل شاشة الحجز السحابية...</div>;
  }

  // البحث عن حجز الزبون الحالي في الطابور الحي
  const myCurrentBooking = queue.find((b) => b.phone === myActivePhone);
  
  // حساب عدد الأشخاص المنتظرين أمام هذا الزبون بالظبط
  let peopleAhead = 0;
  if (myCurrentBooking && myCurrentBooking.status === "waiting") {
    const myIndex = queue.findIndex(b => b.id === myCurrentBooking.id);
    // الأشخاص الذين في الانتظار وقبل هذا الزبون في المصفوفة المرتبة زمنيًا
    peopleAhead = queue.slice(0, myIndex).filter(b => b.status === "waiting").length;
  }

  // اللوجيك الذكي لحساب الرينج التقريبي للوقت (متوسط 20 لـ 30 دقيقة لكل زبون أمامك)
  const minWaitTime = peopleAhead * 30;
  const maxWaitTime = peopleAhead * 45;

  // فحص حالة المحل (مفتوح، بريك، مغلق) لتقديم حماية لو نسي الحلاق تفعيلها
  const isShopOpen = config.currentStatus === "open";
  const isShopBreak = config.currentStatus === "break";
  const isShopClosed = config.currentStatus === "closed";

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl" dir="rtl">
      {/* زر العودة للرئيسية */}
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white mb-6 transition-all">
        <ArrowRight className="w-3.5 h-3.5" /> العودة للرئيسية
      </Link>

      {/* 🛡️ أولاً: لو الزبون عنده حجز نشط حالياً، يتابع شاشة التتبع الفوري */}
      {myCurrentBooking ? (
        <div className="space-y-6">
          {/* 🚨 نظام التنبيه الذكي الـ 10 دقائق المطلوبة (لامع ووامض) */}
          {myCurrentBooking.status === "waiting" && peopleAhead <= 1 && (
            <div className="bg-rose-500/10 border-2 border-rose-500 text-rose-400 p-4 rounded-xl text-center font-bold text-xs animate-pulse flex items-center justify-center gap-2">
              <BellRing className="w-5 h-5 text-rose-500 animate-bounce" />
              <span>🚨 انزل فوراً للصالون! متبقي {peopleAhead === 0 ? "دورك الآن" : "زبون واحد فقط أمامك"} (حوالي 10 دقائق)</span>
            </div>
          )}

          <Card className="bg-gray-900/40 border-[#D4AF37]/30 shadow-lg shadow-[#D4AF37]/5">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <CardTitle className="text-lg font-black text-white">تم تأكيد حجزك بنجاح</CardTitle>
              <CardDescription className="text-xs">يا   <span className="text-[#D4AF37] font-bold">{myCurrentBooking.name}</span>، دورك محفوظ  </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-center">
              
              {/* حالة الدور الحالية */}
              <div className="bg-black/40 p-4 rounded-xl border border-gray-850">
                <span className="text-xs text-gray-400 block mb-1">حالتك في الطابور الآن</span>
                <span className={`text-sm font-black px-3 py-1 rounded-full ${
                  myCurrentBooking.status === "in-progress" 
                    ? "bg-emerald-500/20 text-emerald-400 animate-pulse" 
                    : "bg-amber-500/20 text-amber-400"
                }`}>
                  {myCurrentBooking.status === "in-progress" ? "🎬 تفضل ع الكرسي.. جاري حلاقتك الآن!" : "⏳ منتظر دورك"}
                </span>
              </div>

              {/* تفاصيل الانتظار الذكية المبنية على الرينج المرن الموصى به */}
              {myCurrentBooking.status === "waiting" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/30 p-3 rounded-lg border border-gray-850">
                    <Users className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                    <span className="text-[10px] text-gray-400 block">زبائن أمامك</span>
                    <span className="text-base font-black text-white">{peopleAhead} زبائن</span>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg border border-gray-850">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                    <span className="text-[10px] text-gray-400 block">الوقت التقريبي</span>
                    <span className="text-xs font-black text-[#D4AF37] block mt-0.5">
                      {peopleAhead === 0 ? "أقل من 5 دقائق" : `${minWaitTime} - ${maxWaitTime} دقيقة`}
                    </span>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-gray-500 leading-relaxed pt-2">
                * يرجى إبقاء هذه الصفحة مفتوحة لمتابعة الطابور سحابياً. سيتغير الترتيب تلقائياً فور إنهاء الحلاق للزبون الحالي.
              </p>

              <Button 
                onClick={() => handleCancelMyBooking(myCurrentBooking.id)} 
                variant="destructive" 
                className="w-full text-xs font-bold py-5 mt-2"
              >
                إلغاء حجز الدور الحالي
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* 📋 ثانياً: لو الزبون معندوش حجز، تظهر شاشة استمارة الحجز */
        <Card className="bg-gray-900/40 border-gray-800">
          <CardHeader className="text-center">
            <div className="mx-auto h-10 w-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-1">
              <Calendar className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <CardTitle className="text-xl font-black text-[#D4AF37]">احجز دورك في الطابور</CardTitle>
            <CardDescription className="text-xs">سجل بياناتك لتدخل طابور الحضور الحي فوراً</CardDescription>
          </CardHeader>
          <CardContent>
            
            {/* عرض لو الحلاق في فترة بريك أو المحل مغلق مرناً */}
            {isShopClosed && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs font-bold text-center mb-4">
                🔒 الحلاق يعتذر عن استقبال حجوزات جديدة حالياً (المحل مغلق).
              </div>
            )}
            {isShopBreak && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-lg text-xs font-bold text-center mb-4">
                ☕ الحلاق في استراحة قصيرة حالياً (البريك ينتهي قريباً ويمكنك الحجز لضمان مكانك).
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> اسمك الكريم
                </label>
                <Input 
                  type="text" 
                  placeholder="اكتب اسمك الثلاثي" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/50 border-gray-850 text-sm py-5"
                  disabled={isShopClosed}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> رقم موبايلك (للتواصل والتتبع)
                </label>
                <Input 
                  type="tel" 
                  placeholder="01xxxxxxxxx" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-black/50 border-gray-850 text-sm py-5 text-right font-mono"
                  disabled={isShopClosed}
                  required
                />
              </div>

              <div className="bg-black/20 p-3 rounded-lg border border-gray-850 flex items-center gap-2 text-gray-400 text-[11px]">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>ساعات العمل المحددة لليوم: من <b>{config.shopOpenTime}</b> إلى <b>{config.shopCloseTime}</b></span>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-black text-xs py-6"
                disabled={isShopClosed || isSubmitting}
              >
                {isSubmitting ? "جاري حجز دورك سحابياً..." : "تأكيد الحجز الفوري"}
              </Button>
            </form>

            {/* زر الطوارئ: لو الزبون قفل الصفحة وعايز يسترجع حجزه برقم الفون */}
            <div className="border-t border-gray-850 mt-5 pt-4 text-center">
              <p className="text-[10px] text-gray-500 mb-2">هل حجزت بالفعل وتبحث عن دورك؟</p>
              <button 
                onClick={() => {
                  const p = prompt("أدخل رقم الهاتف الذي حجزت به:");
                  if (p) {
                    setMyActivePhone(p);
                    localStorage.setItem("my_active_booking_phone", p);
                  }
                }}
                className="text-xs text-[#D4AF37] font-bold hover:underline"
              >
                🔍 استرجاع ومتابعة حجز قديم
              </button>
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  );
}