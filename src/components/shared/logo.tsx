import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showName?: boolean;
}

export function Logo({ className, showName = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-gradient text-primary-foreground shadow-gold">
        <Scissors className="h-[18px] w-[18px]" strokeWidth={2.25} />
      </span>
      {showName && (
        <span className="text-base font-extrabold tracking-tight text-foreground">
          صالون البحراوي
        </span>
      )}
    </div>
  );
}
