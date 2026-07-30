export function ProductSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="aspect-square animate-pulse bg-well" />
          <div className="flex flex-col gap-2 p-4">
            <div className="h-2.5 w-2/5 animate-pulse rounded-md bg-mist" />
            <div className="h-3.5 w-[85%] animate-pulse rounded-md bg-mist" />
            <div className="h-3.5 w-3/5 animate-pulse rounded-md bg-mist" />
            <div className="mt-2 flex items-center justify-between">
              <div className="h-[18px] w-[70px] animate-pulse rounded-md bg-mist" />
              <div className="h-9 w-9 animate-pulse rounded-lg bg-mist" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
