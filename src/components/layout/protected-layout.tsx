"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">جاري إعادة التوجيه...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div>
      <div className="sticky top-16 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="container flex items-center justify-between h-14">
          <p className="text-sm font-semibold text-muted-foreground">
            ✅ مسجل دخول كمالك
          </p>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}
