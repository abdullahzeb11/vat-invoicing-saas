import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-3xl space-y-6">
      <Skeleton className="h-8 w-40" />
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
