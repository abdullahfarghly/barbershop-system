import { create } from "zustand";
import { persist } from "zustand/middleware";

// Get credentials from environment variables (with fallback for testing)
const OWNER_EMAIL = process.env.NEXT_PUBLIC_OWNER_EMAIL || "admin@barbershop.com";
const OWNER_PASSWORD = process.env.NEXT_PUBLIC_OWNER_PASSWORD || "barber123";

interface AuthStore {
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Simple validation
        if (email === OWNER_EMAIL && password === OWNER_PASSWORD) {
          set({ isLoggedIn: true, isLoading: false });
          return true;
        } else {
          set({
            isLoading: false,
            error: "بيانات دخول غير صحيحة",
          });
          return false;
        }
      },

      logout: () => {
        set({
          isLoggedIn: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn }),
    }
  )
);
