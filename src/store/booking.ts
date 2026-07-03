import { create } from "zustand";
import { supabase } from "@/lib/supabase";

// تعريف أنواع البيانات المتوافقة مع الباك اند واللوجيك الجديد
export interface Booking {
  id: string;
  name: string;
  phone: string;
  status: "waiting" | "in-progress" | "completed" | "cancelled";
  queuePosition: number;
  estimatedDuration: number;
  price: number;
  createdAt: string;
}

export interface ShopConfig {
  currentStatus: "open" | "closed" | "break";
  breakDurationMinutes: number;
  breakStartTime: string | null;
  shopOpenTime: string;
  shopCloseTime: string;
}

interface BookingStore {
  bookings: Booking[];
  config: ShopConfig;
  loading: boolean;
  
  // دوال جلب البيانات والمزامنة الحية
  fetchInitialData: () => Promise<void>;
  subscribeToRealtime: () => () => void;
  
  // دوال الحلاق والزبون السحابية
  addBooking: (name: string, phone: string, isWalkIn?: boolean) => Promise<string | null>;
  updateBookingStatus: (id: string, status: Booking["status"]) => Promise<void>;
  updateConfig: (newConfig: Partial<ShopConfig>) => Promise<void>;
  getCurrentQueue: () => Booking[];
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: [],
  config: {
    currentStatus: "open",
    breakDurationMinutes: 0,
    breakStartTime: null,
    shopOpenTime: "12:00",
    shopCloseTime: "23:00",
  },
  loading: true,

  // 1. جلب البيانات لأول مرة من السيرفر عند فتح التطبيق
  fetchInitialData: async () => {
    set({ loading: true });
    try {
      // جلب الحجوزات (النشطة والملغية لليوم) مرتبة بالأقدمية
      const { data: bookingsData, error: bError } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: true });

      // جلب إعدادات المحل
      const { data: configData, error: cError } = await supabase
        .from("shop_config")
        .select("*")
        .eq("id", 1)
        .single();

      if (!bError && bookingsData) {
        // تحويل أسماء الحقول من snake_case (قاعدة البيانات) إلى camelCase (الفرونت اند) للحفاظ على اللوجيك الأصلي
        const formattedBookings: Booking[] = bookingsData.map((b: any) => ({
          id: b.id,
          name: b.name,
          phone: b.phone,
          status: b.status,
          queuePosition: b.queue_position,
          estimatedDuration: b.estimated_duration,
          price: Number(b.price) || 0,
          createdAt: b.created_at,
        }));
        set({ bookings: formattedBookings });
      }

      if (!cError && configData) {
        set({
          config: {
            currentStatus: configData.current_status,
            breakDurationMinutes: configData.break_duration_minutes,
            breakStartTime: configData.break_start_time,
            shopOpenTime: configData.shop_open_time,
            shopCloseTime: configData.shop_close_time,
          },
        });
      }
    } catch (err) {
      console.error("Error fetching initial data from Supabase:", err);
    } finally {
      set({ loading: false });
    }
  },

  // 2. المزامنة السحابية اللحظية (الـ Realtime السحري)
  subscribeToRealtime: () => {
    // جلب البيانات أولاً لضمان المزامنة الصفرية
    get().fetchInitialData();

    // الاشتراك في جدول الحجوزات وجدول الإعدادات
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          get().fetchInitialData(); // إعادة الجلب التلقائي فور حدوث أي تعديل من أي جهاز
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shop_config" },
        () => {
          get().fetchInitialData();
        }
      )
      .subscribe();

    // دالة الإغلاق (Unsubscribe) عند الخروج من الصفحة لحماية الأداء
    return () => {
      supabase.removeChannel(channel);
    };
  },

  // 3. إضافة حجز جديد سحابياً (للزبون أو زبون الشارع Walk-in)
// تحديث دالة إضافة حجز جديد لتكون مرنة ومحمية من قيود الجداول
  addBooking: async (name, phone, isWalkIn = false) => {
    const currentQueue = get().getCurrentQueue();
    const nextPosition = currentQueue.length + 1;

    // 🎯 الحل الجذري: إرسال الحقول بأسماء الـ snake_case المطابقة تماماً لجدول الـ Database
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          name: String(name),
          phone: String(phone),
          status: "waiting",
          queue_position: Number(nextPosition),
          estimated_duration: 30,
          price: 0
        }
      ])
      .select()
      .single();

    if (error) {
      // لو فيه أي مشكلة، السيرفر هيطبعها كاملة هنا في الـ Console عشان نشوفها
      console.error("Supabase SQL Strict Error:", error.message, error.details, error.hint);
      throw error; // بنوقف التنفيذ فوراً لو فيه خطأ حقيقي عشان نصلحه
    }

    return phone; 
  },

  // 4. تحديث حالة الزبون في الطابور (دوال التحكم للحلاق لإنهاء/بدء/إلغاء الخدمة)
  updateBookingStatus: async (id, status) => {
    try {
      // تحديث الحالة والسعر (إذا اكتملت الخدمة نضع قيمة افتراضية للخزنة)
      const updateFields: any = { status };
      if (status === "completed") {
        updateFields.price = 100; // قيمة افتراضية موحدة للخزنة، يستطيع الحلاق رصدها بالكامل
      }

      const { error } = await supabase
        .from("bookings")
        .update(updateFields)
        .eq("id", id);

      if (error) throw error;

      // لوجيك إعادة ترتيب المواقع تلقائياً في الطابور بعد الخروج أو الإلغاء لضمان دقة الأرقام سحابياً
      if (status === "completed" || status === "cancelled") {
        const { data: remainingWaiting } = await supabase
          .from("bookings")
          .select("*")
          .eq("status", "waiting")
          .order("created_at", { ascending: true });

        if (remainingWaiting) {
          // تحديث مواقع المنتظرين المتبقين تصاعدياً
          for (let i = 0; i < remainingWaiting.length; i++) {
            await supabase
              .from("bookings")
              .update({ queue_position: i + 1 })
              .eq("id", remainingWaiting[i].id);
          }
        }
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
    }
  },

  // 5. تحديث إعدادات المحل، البريك، وساعات العمل المرنة للحلاق
  updateConfig: async (newConfig) => {
    try {
      // تحويل البيانات لـ snake_case المتوافق مع جدول Supabase
      const mappedConfig: any = {};
      if (newConfig.currentStatus) mappedConfig.current_status = newConfig.currentStatus;
      if (newConfig.breakDurationMinutes !== undefined) mappedConfig.break_duration_minutes = newConfig.breakDurationMinutes;
      if (newConfig.breakStartTime !== undefined) mappedConfig.break_start_time = newConfig.breakStartTime;
      if (newConfig.shopOpenTime) mappedConfig.shop_open_time = newConfig.shopOpenTime;
      if (newConfig.shopCloseTime) mappedConfig.shop_close_time = newConfig.shopCloseTime;

      const { error } = await supabase
        .from("shop_config")
        .update(mappedConfig)
        .eq("id", 1);

      if (error) throw error;
    } catch (err) {
      console.error("Error updating shop config:", err);
    }
  },

  // 6. الفلترة التلقائية للطابور النشط (في الانتظار أو جاري الخدمة) فقط للحفاظ على استقرار الواجهات
  getCurrentQueue: () => {
    return get().bookings.filter(
      (b) => b.status === "waiting" || b.status === "in-progress"
    );
  },
}));