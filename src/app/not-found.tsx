import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/fade-in";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
      <FadeIn className="flex flex-col items-center text-center max-w-md">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
          <AlertCircle className="h-8 w-8" strokeWidth={2} />
        </span>

        <h1 className="text-3xl font-extrabold text-foreground">الصفحة غير موجودة</h1>
        <p className="mt-3 text-muted-foreground">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم حذفها.
        </p>

        <div className="mt-8 flex gap-3">
          <Button asChild>
            <Link href="/">العودة للرئيسية</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/booking">الحجز</Link>
          </Button>
        </div>
      </FadeIn>
    </div>
  );
}
