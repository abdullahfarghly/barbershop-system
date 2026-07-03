import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container px-6 py-10 sm:py-16">
      <div className="space-y-8">
        <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />

        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="h-8 w-24 bg-muted rounded animate-pulse mb-3" />
              <div className="h-6 w-16 bg-muted rounded animate-pulse" />
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <div className="h-6 w-40 bg-muted rounded animate-pulse mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
