import { Skeleton } from "@heroui/react";

export default function CatalogLoading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-8 pb-16 pt-8">
      <Skeleton className="h-12 w-96 rounded-full" />
      <Skeleton className="mt-3 h-6 w-[420px] rounded-full" />
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[360px] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
