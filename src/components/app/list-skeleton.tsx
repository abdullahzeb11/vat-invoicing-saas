import { Skeleton } from "@/components/ui/skeleton";

/**
 * Full-page list skeleton including the page-header bar. Use in route loading.tsx.
 */
export function ListSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <ListBodySkeleton rows={rows} columns={columns} />
    </div>
  );
}

/**
 * Table-only skeleton (no page-header bar). Use as a Suspense fallback inside a
 * page that already renders its real header above the Suspense boundary.
 */
export function ListBodySkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b p-3">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 p-3">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
