import { Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/shared/fade-in";
import { cn } from "@/lib/utils";

interface ShopStatusCardProps {
  isOpen: boolean;
  queueCount: number;
  estimatedWait: number;
}

export function ShopStatusCard({ isOpen, queueCount, estimatedWait }: ShopStatusCardProps) {
  return (
    <FadeIn>
      <Card className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Store className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">حالة الصالون</p>
              <p className="text-xs text-muted-foreground">
                {isOpen
                  ? `${queueCount} زبائن في الطابور`
                  : "الصالون مغلق الآن"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant={isOpen ? "success" : "destructive"}>
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  isOpen ? "bg-success animate-pulse-soft" : "bg-destructive"
                )}
              />
              {isOpen ? "مفتوح الآن" : "مغلق"}
            </Badge>
            {isOpen && (
              <span className="text-xs font-semibold text-primary">
                انتظار: {estimatedWait} دقيقة
              </span>
            )}
          </div>
        </div>
      </Card>
    </FadeIn>
  );
}
