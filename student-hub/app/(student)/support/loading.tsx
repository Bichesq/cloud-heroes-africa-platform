import { Skeleton } from "@heroui/react";

/** Skeleton placeholders for the first navigation into /support, before
 * SupportView takes over with real data. */
export default function SupportLoading() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-10 w-64 rounded-full" />
      <Skeleton className="h-[220px] w-full rounded-[32px]" />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[132px] w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[320px] w-full rounded-3xl" />
      </div>
    </div>
  );
}
