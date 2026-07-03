"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/fade-in";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
      <FadeIn className="flex flex-col items-center text-center max-w-md">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-6">
          <AlertCircle className="h-8 w-8" strokeWidth={2} />
        </span>

        <h1 className="text-3xl font-extrabold text-foreground">حدث خطأ</h1>
        <p className="mt-3 text-muted-foreground">
          عذراً، حدث خطأ ما. يرجى محاولة مرة أخرى.
        </p>

        <div className="mt-8 flex gap-3">
          <Button onClick={reset}>محاولة مرة أخرى</Button>
          <Button asChild variant="outline">
            <Link href="/">العودة للرئيسية</Link>
          </Button>
        </div>
      </FadeIn>
    </div>
  );
}
