"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, LogIn } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/shared/fade-in";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading, error, login, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard");
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password) {
      setLocalError("الرجاء ملء جميع الحقول");
      return;
    }

    const success = await login(email, password);
    if (!success && error) {
      setLocalError(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
      <FadeIn className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold-gradient text-primary-foreground shadow-gold">
                <Lock className="h-6 w-6" strokeWidth={2} />
              </span>
            </div>
            <CardTitle className="text-2xl">لوحة التحكم</CardTitle>
            <CardDescription>تسجيل الدخول للمالك فقط</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {(localError || error) && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                  {localError || error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="admin@barbershop.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLocalError("");
                    }}
                    className="pr-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLocalError("");
                    }}
                    className="pr-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>جاري المحاولة...</>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 ml-2" />
                    دخول
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-3 rounded-lg bg-muted/30 p-4 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">📌 بيانات تجريبية:</p>
              <div>
                <p>📧 البريد: <span className="font-mono text-foreground">admin@barbershop.com</span></p>
                <p>🔑 كلمة المرور: <span className="font-mono text-foreground">barber123</span></p>
              </div>
              <p className="text-xs italic">غير كلمة المرور عند الإطلاق في الإنتاج</p>
            </div>

            <div className="mt-6 flex justify-center">
              <Button asChild variant="link">
                <Link href="/">العودة للرئيسية</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
