import { Skeleton } from "@heroui/react";

export default function ProgramLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="h-[52px] border-b border-cha-border bg-cha-surface" />
      <div className="mx-auto w-full max-w-[1200px] px-8 pb-16 pt-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <Skeleton className="h-11 w-80 rounded-full" />
            <Skeleton className="mt-3 h-5 w-[480px] rounded-full" />
          </div>
          <Skeleton className="h-[84px] w-[360px] rounded-3xl" />
        </div>
        <Skeleton className="mt-8 h-[96px] w-full rounded-3xl" />
        <div className="mt-8 flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] w-full rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
