// ==================== ENUMS & TYPES ====================

export type ShopStatus = "open" | "closed" | "busy" | "break";
export type BookingType = "online" | "walk-in";
export type BookingStatus = "waiting" | "in-progress" | "completed" | "no-show" | "cancelled";
export type NotificationType = "confirmation" | "reminder" | "queue-moved" | "queue-delayed" | "cancelled" | "ready";

// ==================== BOOKING ====================

export interface Booking {
  id: string;
  name: string;
  phone: string;
  type: BookingType; // online or walk-in
  date: Date;
  requestedTime: string; // customer's preferred time
  actualStartTime?: string; // when service actually started
  actualEndTime?: string; // when service actually ended
  queuePosition: number;
  status: BookingStatus;
  estimatedDuration: number; // set by barber
  estimatedWaitTime: number; // calculated
  estimatedArrivalTime: string; // calculated
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  barberId?: string; // which barber serves this customer
}

export interface BookingRequest {
  name: string;
  phone: string;
  date: Date;
  requestedTime: string;
  type: BookingType;
}

// ==================== QUEUE ====================

export interface QueueItem {
  id: string;
  name: string;
  phone: string;
  position: number;
  status: BookingStatus;
  estimatedWaitTime: number;
  estimatedArrivalTime: string;
  type: BookingType;
}

// ==================== SHOP CONFIGURATION ====================

export interface ShopConfig {
  id: string;
  name: string;
  
  // Operations
  openTime: string; // HH:MM format
  closeTime: string; // HH:MM format
  workingDays: number[]; // 0-6, 0=Sunday
  averageServiceDuration: number; // minutes (barber decides actual)
  
  // Resources
  numberOfChairs: number;
  numberOfBarbers: number;
  maxQueueSize: number;
  
  // Status & Breaks
  currentStatus: ShopStatus;
  breakUntil?: Date; // if status is "break"
  breakDuration?: number; // minutes
  
  // Configuration
  notificationEnabled: boolean;
  allowWalkIn: boolean;
  autoConfirmBooking: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ==================== NOTIFICATIONS ====================

export interface Notification {
  id: string;
  bookingId: string;
  customerPhone: string;
  type: NotificationType;
  message: string;
  sent: boolean;
  sentAt?: Date;
  method: "sms" | "whatsapp" | "in-app"; // in-app for now
  createdAt: Date;
}

// ==================== BARBER ====================

export interface Barber {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // hashed in production
  status: "active" | "inactive" | "on-break";
  currentCustomerId?: string;
  createdAt: Date;
}

// ==================== STATISTICS ====================

export interface DailyStats {
  date: Date;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  averageWaitTime: number;
  averageServiceTime: number;
  busyHours: string[]; // times when queue was full
}

// ==================== SETTINGS ====================

export interface NotificationSettings {
  confirmationEnabled: boolean;
  reminderEnabled: boolean;
  reminderMinutesBefore: number; // 10, 30, 60
  delayNotificationEnabled: boolean;
  earlyNotificationEnabled: boolean;
  provider: "twilio" | "whatsapp" | "mock"; // mock for now
}

// ==================== UI HELPERS ====================

export interface BookingFormData {
  name: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}

export interface WalkInCustomerData {
  name: string;
  phone?: string;
}
