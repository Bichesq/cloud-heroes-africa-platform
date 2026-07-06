import { Skeleton } from "@heroui/react";

/** Skeleton placeholders while the profile page resolves the student record. */
export default function ProfileLoading() {
  return (
    <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-5">
          <div className="space-y-3">
            <Skeleton className="h-10 w-56 rounded-lg" />
            <Skeleton className="h-5 w-40 rounded-lg" />
          </div>
          <Skeleton className="h-[58px] w-64 rounded-2xl" />
        </div>

        {/* Student information header card */}
        <div className="flex items-center gap-4 rounded-3xl bg-cha-surface p-6 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
          <Skeleton className="h-[60px] w-[60px] shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-44 rounded-lg" />
            <Skeleton className="h-3 w-56 rounded-lg" />
            <Skeleton className="h-3 w-36 rounded-lg" />
          </div>
        </div>

        {/* Personal information card */}
        <div className="rounded-3xl bg-cha-surface p-7 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
          <Skeleton className="mb-6 h-6 w-52 rounded-lg" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        {/* MFA card */}
        <div className="rounded-3xl bg-cha-surface p-7 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
          <Skeleton className="mb-5 h-6 w-72 rounded-lg" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>

      {/* Preview rail */}
      <div className="flex flex-col gap-5">
        <Skeleton className="h-8 w-44 rounded-lg" />
        <div className="flex flex-col items-center rounded-3xl bg-cha-surface px-6 py-7 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
          <Skeleton className="mt-5 h-[118px] w-[118px] rounded-full" />
          <Skeleton className="mt-4 h-5 w-40 rounded-lg" />
          <Skeleton className="mt-2 h-3 w-32 rounded-lg" />
          <div className="mt-8 w-full space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
