import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" aria-label="الصفحة الرئيسية">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            الرئيسية
          </Link>
          <Link
            href="/booking"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            الحجز
          </Link>
          <Link
            href="/queue"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            الطابور
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            لوحة التحكم
          </Link>
        </nav>

        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/booking">احجز الآن</Link>
        </Button>

        <Button asChild size="icon" variant="secondary" className="sm:hidden">
          <Link href="/booking" aria-label="احجز الآن">
            <span className="text-xs font-bold">حجز</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
