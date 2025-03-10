import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProductSkeleton = () => (
  <Card className="overflow-hidden">
    <CardContent className="bg-bg p-4">
      <div className="flex flex-row">
        {/* Image skeleton */}
        <Skeleton className="h-24 w-24 shrink-0" />

        {/* Content skeleton */}
        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-7 w-20" />
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ProductSkeleton;
