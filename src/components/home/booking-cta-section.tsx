import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/fade-in";

export function BookingCtaSection() {
  return (
    <section className="container px-6 pb-16 sm:pb-24">
      <FadeIn className="mx-auto max-w-2xl">
        <div className="relative overflow-hidden rounded-2xl bg-gold-gradient p-8 text-center shadow-gold sm:p-12">
          <h2 className="text-2xl font-extrabold text-primary-foreground sm:text-3xl">
            جاهز لتحجز دورك؟
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-primary-foreground/85">
            احجز الآن وخذ مكانك في الطابور دون الحاجة للانتظار بالصالون.
          </p>

          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-6 w-full bg-background text-foreground shadow-soft hover:bg-background/90 sm:w-auto"
          >
            <Link href="/booking" className="flex items-center gap-2">
              احجز الآن
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </FadeIn>
    </section>
  );
}
