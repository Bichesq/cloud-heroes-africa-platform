import { Skeleton } from "@heroui/react";

/** Skeleton placeholders for the very first navigation into /dashboard,
 * before the page's own per-widget Suspense boundaries take over. */
export default function DashboardLoading() {
  return (
    <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-8">
        <div className="space-y-3">
          <Skeleton className="h-10 w-72 rounded-lg" />
          <Skeleton className="h-5 w-40 rounded-lg" />
        </div>

        <Skeleton className="h-[196px] w-full rounded-3xl" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-[104px] w-full rounded-3xl" />
            <Skeleton className="h-[220px] w-full rounded-3xl" />
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="h-[180px] w-full rounded-3xl" />
            <Skeleton className="h-[140px] w-full rounded-3xl" />
          </div>
        </div>
      </div>

      <Skeleton className="h-[520px] w-full rounded-3xl" />
    </div>
  );
}
