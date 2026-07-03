import type { Booking, QueueItem } from "@/types";

/**
 * دالة مساعدة داخلية لتحويل ومقارنة التواريخ بشكل آمن تماماً
 * تضمن عدم حدوث خطأ toDateString is not a function عند استرجاع البيانات كنصوص من الـ localStorage
 */
const safeDateMatch = (dateTarget: any, dateCompare: Date): boolean => {
  if (!dateTarget) return false;
  try {
    const target = new Date(dateTarget);
    // التأكد من أن التحويل أنتج تاريخاً صالحاً وليس Invalid Date
    if (isNaN(target.getTime())) return false;
    return target.toDateString() === dateCompare.toDateString();
  } catch (e) {
    return false;
  }
};

/**
 * Core queue calculation logic
 * Single source of truth for all queue-related calculations
 */
export const QueueService = {
  /**
   * Calculate estimated wait time for a customer at a given position
   * Takes into account:
   * - Current service progress
   * - Remaining services before them
   * - Average service duration
   */
  calculateWaitTime(
    position: number,
    currentBooking: Booking | null,
    allBookingsInQueue: Booking[],
    averageServiceDuration: number
  ): number {
    if (position <= 1) return 0;

    let totalWaitTime = 0;

    // If someone is being served, add remaining time from their service
    if (currentBooking && currentBooking.status === "in-progress") {
      const startTime = currentBooking.actualStartTime
        ? new Date(currentBooking.actualStartTime).getTime()
        : Date.now();
      const elapsedMinutes = Math.floor(
        (Date.now() - startTime) / (1000 * 60)
      );
      const remainingTime = Math.max(
        0,
        currentBooking.estimatedDuration - elapsedMinutes
      );
      totalWaitTime += remainingTime;
    }

    // Add time for customers before this one in queue
    const customersBeforeThisOne = position - 1;
    const remainingBookingsCount = customersBeforeThisOne - (currentBooking ? 1 : 0);
    totalWaitTime += remainingBookingsCount * averageServiceDuration;

    return Math.ceil(totalWaitTime);
  },

  /**
   * Calculate estimated arrival time (ETA) for a customer
   */
  calculateETA(waitTime: number): string {
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + waitTime * 60000);
    return arrivalTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  /**
   * Find the next available time slot for a booking request
   * If requested time is not available, find the nearest available slot
   */
  findAvailableSlot(
    requestedTime: string,
    date: Date,
    allBookings: Booking[],
    numberOfChairs: number,
    averageServiceDuration: number,
    shopOpenTime: string,
    shopCloseTime: string
  ): string {
    // Parse times
    const [reqHour, reqMin] = requestedTime.split(":").map(Number);
    const [openHour, openMin] = shopOpenTime.split(":").map(Number);
    const [closeHour, closeMin] = shopCloseTime.split(":").map(Number);

    const openTimeMinutes = openHour * 60 + openMin;
    const closeTimeMinutes = closeHour * 60 + closeMin;
    let currentTimeMinutes = reqHour * 60 + reqMin;

    // Start checking from requested time
    while (currentTimeMinutes + averageServiceDuration <= closeTimeMinutes) {
      const timeString = `${String(Math.floor(currentTimeMinutes / 60)).padStart(2, "0")}:${String(
        currentTimeMinutes % 60
      ).padStart(2, "0")}`;

      // Count how many bookings overlap with this time slot
      const overlappingBookings = allBookings.filter((booking) => {
        // تعديل أمني: استخدام دالة التحقق الآمن من التاريخ بدلاً من السطر القديم المسبب للخطأ
        if (!safeDateMatch(booking.date, date)) return false;
        if (booking.status === "cancelled") return false;

        const [bHour, bMin] = booking.requestedTime.split(":").map(Number);
        const bookingStartMinutes = bHour * 60 + bMin;
        const bookingEndMinutes = bookingStartMinutes + booking.estimatedDuration;

        return (
          currentTimeMinutes < bookingEndMinutes &&
          currentTimeMinutes + averageServiceDuration > bookingStartMinutes
        );
      });

      // If we have available chairs, this slot is good
      if (overlappingBookings.length < numberOfChairs) {
        return timeString;
      }

      // Try next time slot (30-minute intervals)
      currentTimeMinutes += 30;
    }

    // If no slot found today, return last possible slot
    const lastSlotMinutes = closeTimeMinutes - averageServiceDuration;
    return `${String(Math.floor(lastSlotMinutes / 60)).padStart(2, "0")}:${String(
      lastSlotMinutes % 60
    ).padStart(2, "0")}`;
  },

  /**
   * Recalculate entire queue after a change
   * Called when customer is added, removed, or service is finished
   */
  recalculateQueue(
    bookings: Booking[],
    currentDate: Date,
    numberOfChairs: number,
    averageServiceDuration: number
  ): Booking[] {
    // Filter bookings for today
    const todayBookings = bookings.filter(
      (b) =>
        // تعديل أمني: استخدام دالة التحقق الآمن من التاريخ
        safeDateMatch(b.date, currentDate) && b.status !== "cancelled"
    );

    // Sort by requested time, then by creation time
    const sorted = todayBookings.sort((a, b) => {
      const aTime = a.requestedTime;
      const bTime = b.requestedTime;
      if (aTime !== bTime) return aTime.localeCompare(bTime);
      
      // تأمين مقارنة تاريخ الإنشاء createdAt أيضاً في حال تم حفظه كـ string
      const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aCreated - bCreated;
    });

    // Reassign positions and recalculate wait times
    const currentlyServing = sorted.find((b) => b.status === "in-progress");

    let position = 1;
    return sorted.map((booking) => {
      if (booking.status === "in-progress") {
        // Don't count in-progress as part of queue
        return booking;
      }

      const newWaitTime = this.calculateWaitTime(
        position,
        currentlyServing || null,
        sorted,
        averageServiceDuration
      );

      const updatedBooking = {
        ...booking,
        queuePosition: position,
        estimatedWaitTime: newWaitTime,
        estimatedArrivalTime: this.calculateETA(newWaitTime),
      };

      position++;
      return updatedBooking;
    });
  },

  /**
   * Get queue for display on home page and queue tracking
   */
  getPublicQueue(
    bookings: Booking[],
    currentDate: Date
  ): QueueItem[] {
    return bookings
      .filter(
        (b) =>
          // تعديل أمني: استخدام دالة التحقق الآمن من التاريخ لمنع توقف شاشة الطابور والصفحة الرئيسية
          safeDateMatch(b.date, currentDate) &&
          b.status !== "cancelled" &&
          b.status !== "completed"
      )
      .map((b) => ({
        id: b.id,
        name: b.name,
        phone: b.phone,
        position: b.queuePosition,
        status: b.status,
        estimatedWaitTime: b.estimatedWaitTime,
        estimatedArrivalTime: b.estimatedArrivalTime,
        type: b.type,
      }));
  },

  /**
   * Get next customer to serve
   */
  getNextCustomer(bookings: Booking[], currentDate: Date): Booking | null {
    return (
      bookings.find(
        (b) =>
          // تعديل أمني: استخدام دالة التحقق الآمن من التاريخ
          safeDateMatch(b.date, currentDate) && b.status === "waiting"
      ) || null
    );
  },

  /**
   * Check if shop is currently open
   */
  isShopOpen(
    shopStatus: string,
    openTime: string,
    closeTime: string
  ): boolean {
    if (shopStatus !== "open") return false;

    const now = new Date();
    const [currentHour, currentMinute] = [now.getHours(), now.getMinutes()];
    const [openHour, openMin] = openTime.split(":").map(Number);
    const [closeHour, closeMin] = closeTime.split(":").map(Number);

    const currentTimeMinutes = currentHour * 60 + currentMinute;
    const openTimeMinutes = openHour * 60 + openMin;
    const closeTimeMinutes = closeHour * 60 + closeMin;

    return (
      currentTimeMinutes >= openTimeMinutes &&
      currentTimeMinutes <= closeTimeMinutes
    );
  },

  /**
   * Calculate impact of break on queue
   */
  getWaitTimeAdjustmentForBreak(breakMinutes: number): number {
    return breakMinutes; // Simple: add break duration to all wait times
  },
};