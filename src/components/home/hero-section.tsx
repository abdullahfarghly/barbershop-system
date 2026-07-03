import Link from "next/link";
import { Scissors, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/fade-in";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-radial-glow">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-1/2 h-72 w-72 translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="container flex flex-col items-center px-6 py-16 text-center sm:py-24">
        <FadeIn>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            تجربة حلاقة فاخرة
          </span>
        </FadeIn>

        <FadeIn delay={0.1}>
          <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-gradient shadow-gold">
            <Scissors className="h-7 w-7 text-primary-foreground" strokeWidth={2} />
          </span>
        </FadeIn>

        <FadeIn delay={0.2}>
          <h1 className="text-3xl font-extrabold leading-tight text-foreground sm:text-5xl">
            دورك محجوز، وقتك محفوظ
          </h1>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            احجز موعدك في صالون البحراوي وتابع طابور الانتظار لحظة بلحظة، دون
            الحاجة للحضور المبكر أو الانتظار في المكان.
          </p>
        </FadeIn>

        <FadeIn delay={0.4} className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/booking">احجز الآن</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="#queue-status">تابع الطابور</Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
