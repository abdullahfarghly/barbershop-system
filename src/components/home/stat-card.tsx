import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/shared/fade-in";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  delay?: number;
  accent?: "primary" | "success" | "destructive";
}

const accentText: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "text-primary",
  success: "text-success",
  destructive: "text-destructive",
};

const accentBg: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  delay = 0,
  accent = "primary",
}: StatCardProps) {
  return (
    <FadeIn delay={delay} className="h-full">
      <Card className="flex h-full flex-col items-center text-center">
        <div className="flex flex-col items-center gap-2 px-5 py-5">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              accentBg[accent]
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </span>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>

        <div className="w-full border-t border-dashed border-border" />

        <div className="flex items-baseline justify-center gap-1.5 px-5 py-5">
          <span className={cn("text-3xl font-extrabold", accentText[accent])}>
            {value}
          </span>
          {unit && (
            <span className="text-xs font-medium text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
      </Card>
    </FadeIn>
  );
}
