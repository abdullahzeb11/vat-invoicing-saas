import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-2 pt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 pt-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/2 mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
