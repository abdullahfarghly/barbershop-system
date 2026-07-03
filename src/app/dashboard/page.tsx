"use client";
import { useEffect, useState } from "react";
import { useBookingStore } from "@/store/booking";
import { supabase } from "@/lib/supabase";
import { 
  CheckCircle, XCircle, Clock, LayoutDashboard, Power, 
  Phone, UserPlus, Coffee, Calendar, Lock, LogIn 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  // --- 1. نظام تسجيل الدخول والـ Session الممتد على موبايل الحلاق ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // مواصفات زبون الشارع (Walk-in)
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");

  // إعدادات وقت البريك وساعات العمل المرنة
  const [shopOpenTime, setShopOpenTime] = useState("12:00");
  const [shopCloseTime, setShopCloseTime] = useState("23:00");

  const store = useBookingStore();
  const config = store.config;
  const bookings = store.bookings;
  const queue = store.getCurrentQueue();

  useEffect(() => {
    setIsMounted(true);
    // التحقق الفوري لو الحلاق مسجل دخول قبل كدة ومحفوظ في المتصفح لفتح الداشبورد فوراً
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
      } else {
        // فحص احتياطي عبر البيئة المحيطة لتسهيل التجربة لو مسجل في الـ env
        const savedAuth = localStorage.getItem("barber_logged_in");
        if (savedAuth === "true") setIsAuthenticated(true);
      }
      setAuthLoading(false);
    };
    checkUser();

    // تشغيل المزامنة الحية على الصفحة فوراً
    const unsubscribe = store.subscribeToRealtime();
    return () => unsubscribe();
  }, []);

  // دالة تسجيل الدخول لأول مرة
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const adminEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL || "admin@barbershop.com";
    const adminPass = process.env.NEXT_PUBLIC_OWNER_PASSWORD || "barber123";

    if (email === adminEmail && password === adminPass) {
      localStorage.setItem("barber_logged_in", "true");
      setIsAuthenticated(true);
    } else {
      alert("بيانات الدخول غير صحيحة يا معلّم!");
    }
  };

  // الخروج من الحساب
  const handleLogout = () => {
    localStorage.removeItem("barber_logged_in");
    setIsAuthenticated(false);
  };

  if (!isMounted || authLoading) {
    return <div className="text-center p-20 text-gray-400 text-xs">جاري تهيئة لوحة التحكم السحابية...</div>;
  }

  // شاشة تسجيل الدخول (تظهر مرة واحدة فقط على الموبايل)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
        <Card className="w-full max-w-md bg-gray-900/40 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-black text-[#D4AF37] flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" /> تسجيل دخول الحلاق VIP
            </CardTitle>
            <CardDescription className="text-xs">سجل دخول مرة واحدة لتتحكم في الطابور من موبايلك يومياً</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">البريد الإلكتروني</label>
                <Input 
                  type="email" 
                  placeholder="admin@barbershop.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/50 border-gray-850 text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">كلمة المرور</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/50 border-gray-850 text-sm"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs py-5">
                <LogIn className="w-4 h-4 ml-1" /> دخول سريع وتذكر جهازي
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- 2. لوجيك معالجة الحجوزات والتحكم السحابي ---
  const waitingList = queue.filter((b) => b.status === "waiting");
  const inProgressList = queue.filter((b) => b.status === "in-progress");

  // إضافة زبون من الشارع (Walk-in) في آخر الدور تلقائياً
  const handleAddWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName) return;
    const phoneNum = walkInPhone || "حضور مباشر بالشعر";
    await store.addBooking(walkInName, phoneNum, true);
    setWalkInName("");
    setWalkInPhone("");
  };

  // تفعيل / إلغاء وضع الاستراحة (البريك)
  const handleToggleBreak = async () => {
    const isCurrentlyBreak = config.currentStatus === "break";
    await store.updateConfig({
      currentStatus: isCurrentlyBreak ? "open" : "break",
      breakDurationMinutes: isCurrentlyBreak ? 0 : 30,
      breakStartTime: isCurrentlyBreak ? null : new Date().toISOString()
    });
  };

  // غلق / فتح المحل كلياً حسب ظروف الحلاق المرنة
  const handleToggleShopStatus = async () => {
    const isOpen = config.currentStatus === "open";
    await store.updateConfig({
      currentStatus: isOpen ? "closed" : "open"
    });
  };

  // حفظ ساعات العمل المتغيرة اليومية
  const handleSaveWorkingHours = async () => {
    await store.updateConfig({
      shopOpenTime,
      shopCloseTime
    });
    alert("تم تحديث ساعات العمل المرنة على السيرفر بنجاح!");
  };

  // حساب أرباح الخزنة الفورية سحابياً
  const totalEarnings = bookings
    .filter((b) => b.status === "completed")
    .reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl" dir="rtl">
      {/* الهيدر العلوي */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-800 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#D4AF37] flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" /> لوحة الإدارة VIP • صالون البحراوي
          </h1>
          <p className="text-xs text-gray-400 mt-1">البيانات متصلة  بالكامل وتتحدث فورياً على جميع الأجهزة</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleToggleBreak} 
            variant={config.currentStatus === "break" ? "default" : "outline"}
            className="text-xs font-bold border-amber-600/50 text-amber-400"
          >
            <Coffee className="w-4 h-4 ml-1" />
            {config.currentStatus === "break" ? "إنهاء البريك والعودة" : "أخذ بريك (30 دقيقة)"}
          </Button>
          <Button 
            onClick={handleToggleShopStatus} 
            variant={config.currentStatus === "open" ? "destructive" : "default"}
            className="text-xs font-bold"
          >
            <Power className="w-4 h-4 ml-1" />
            {config.currentStatus === "open" ? "إغلاق المحل كلياً" : "فتح المحل للحجز"}
          </Button>
          <Button onClick={handleLogout} variant="ghost" className="text-xs text-gray-500 hover:text-white">
            خروج
          </Button>
        </div>
      </div>

      {/* لوحة إعدادات الحلاق المرنة وساعات العمل وزبون الشارع */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* كارت إضافة زبون الشارع في آخر الطابور */}
        <Card className="bg-gray-900/40 border-gray-800 md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-gray-200">
              <UserPlus className="w-4 h-4 text-[#D4AF37]" /> زبون من الشارع (Walk-in)
            </CardTitle>
            <CardDescription className="text-[11px]">احجز لزبون حضر للمحل مباشرة ليأخذ آخر الدور</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddWalkIn} className="space-y-3">
              <Input 
                type="text" 
                placeholder="اسم الزبون المباشر" 
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                className="bg-black/40 border-gray-800 text-xs"
                required
              />
              <Input 
                type="text" 
                placeholder="رقم الهاتف (اختياري)" 
                value={walkInPhone}
                onChange={(e) => setWalkInPhone(e.target.value)}
                className="bg-black/40 border-gray-800 text-xs"
              />
              <Button type="submit" className="w-full text-xs bg-gray-800 text-white hover:bg-gray-700 font-bold">
                إدراج في آخر الطابور
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* كارت التحكم في ساعات العمل المرنة */}
        <Card className="bg-gray-900/40 border-gray-800 md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-gray-200">
              <Calendar className="w-4 h-4 text-[#D4AF37]" /> ساعات عمل اليوم المرنة
            </CardTitle>
            <CardDescription className="text-[11px]">حدد وقت الفتح والغلق حسب ظروفك اليومية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">من الساعة</label>
                <Input type="time" value={shopOpenTime} onChange={(e) => setShopOpenTime(e.target.value)} className="bg-black/40 border-gray-800 text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">إلى الساعة</label>
                <Input type="time" value={shopCloseTime} onChange={(e) => setShopCloseTime(e.target.value)} className="bg-black/40 border-gray-800 text-xs" />
              </div>
            </div>
            <Button onClick={handleSaveWorkingHours} className="w-full text-xs bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/20 font-bold">
              تثبيت المواعيد الجديدة
            </Button>
          </CardContent>
        </Card>

        {/* كارت الخزنة الفورية السحابية */}
        <Card className="bg-gray-900/40 border-gray-800 md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-gray-400">إحصائيات فوريـــة</CardTitle>
          </CardHeader> 
          <CardContent className="space-y-4">
            <div>
              <p className="text-[11px] text-gray-500">أرباح الخزنة المسجلة اليوم</p>
              <p className="text-2xl font-black text-emerald-400">{totalEarnings} ج.م</p>
            </div>
            <div className="flex gap-4 border-t border-gray-850 pt-2 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">منتظر دور</span>
                <span className="font-bold text-[#D4AF37]">{waitingList.length} زبائن</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">حالة الصالون</span>
                <span className="font-bold text-white">
                  {config.currentStatus === "open" ? "🔓 مفتوح" : config.currentStatus === "break" ? "☕ في بريك" : "🔒 مغلق"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* طابور الحضور الحي وإدارة العمليات الفورية */}
      <div className="bg-gray-900/20 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-black text-gray-200 mb-4 flex items-center gap-1.5">
          <span>📋</span> الطابور الحي المباشر حالياً ({queue.length} زبون)
        </h3>

        {queue.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-8">لا توجد حجوزات نشطة في الطابور حالياً.</p>
        ) : (
          <div className="space-y-3">
            {queue.map((booking, index) => (
              <div 
                key={booking.id} 
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  booking.status === 'in-progress' 
                    ? 'bg-emerald-950/30 border-emerald-500/40' 
                    : 'bg-gray-950/80 border-gray-800'
                }`}
              >
                {/* بيانات العميل ومكالمة الهاتف المباشرة المطلوبة ببساطة ووضوح */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[11px] font-black text-[#D4AF37]">
                      #{index + 1}
                    </div>
                    <span className="text-sm font-black text-white">{booking.name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      booking.status === 'in-progress' ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-amber-500/20 text-amber-500'
                    }`}>
                      {booking.status === 'in-progress' ? 'جاري الحلاقة الآن' : 'في الانتظار'}
                    </span>
                  </div>
                  
                  {/* قسم بيانات الهاتف والاتصال السريع المطلوب بضغطة زر */}
                  <div className="mt-2 flex items-center gap-3">
                    <p className="text-xs text-gray-400 font-mono flex items-center gap-1">
                      📱 رقم الهاتف: <span className="text-gray-200">{booking.phone}</span>
                    </p>
                    {booking.phone !== "حضور مباشر بالشعر" && (
                      <a 
                        href={`tel:${booking.phone}`} 
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded hover:bg-emerald-500/20 transition-all"
                      >
                        <Phone className="w-3 h-3" /> اتصل بالزبون فوراً
                      </a>
                    )}
                  </div>
                </div>

                {/* أزرار التحكم في الحالات والمنبه اللحظي للزبون التالي */}
                <div className="flex gap-1.5 shrink-0">
                  {booking.status === 'waiting' && (
                    <Button 
                      onClick={() => store.updateBookingStatus(booking.id, "in-progress")} 
                      size="sm" className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black text-xs font-black px-3"
                    >
                      <Clock className="w-3.5 h-3.5 ml-1" /> إدخال للحلاقة (نبه التالي)
                    </Button>
                  )}
                  {booking.status === 'in-progress' && (
                    <Button 
                      onClick={() => store.updateBookingStatus(booking.id, "completed")} 
                      size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3"
                    >
                      <CheckCircle className="w-3.5 h-3.5 ml-1" /> إنهـاء الحلاقـة 
                    </Button>
                  )}
                  <Button 
                    onClick={() => store.updateBookingStatus(booking.id, "cancelled")} 
                    size="sm" variant="destructive" className="text-xs px-2"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}