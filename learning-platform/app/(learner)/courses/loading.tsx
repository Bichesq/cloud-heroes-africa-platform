import { Skeleton } from "@heroui/react";

export default function CoursesLoading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-8 pb-16 pt-8">
      <Skeleton className="h-12 w-72 rounded-full" />
      <Skeleton className="mt-3 h-6 w-96 rounded-full" />
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-[240px] w-full rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
