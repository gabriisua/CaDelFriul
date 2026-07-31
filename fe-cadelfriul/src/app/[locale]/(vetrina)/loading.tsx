import { Skeleton } from "@/components/ui/skeleton";

export default function VetrinaLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <Skeleton className="mb-4 h-10 w-64" />
      <Skeleton className="mb-10 h-5 w-96" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-lg border p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
