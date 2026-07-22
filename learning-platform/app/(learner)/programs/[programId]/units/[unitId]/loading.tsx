import { Skeleton } from "@heroui/react";

/** Skeleton mirroring the unit view's rail / content / panel columns. */
export default function UnitLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="h-[52px] border-b border-cha-border bg-cha-surface" />
      <div className="flex flex-1 gap-4 px-4 pb-4 pt-4">
        <Skeleton className="w-[320px] shrink-0 rounded-2xl" />
        <Skeleton className="min-h-[520px] flex-1 rounded-2xl" />
        <Skeleton className="hidden w-[320px] shrink-0 rounded-2xl xl:block" />
      </div>
    </div>
  );
}
