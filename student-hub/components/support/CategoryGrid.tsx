"use client";

import type { HelpCategory } from "@/types";
import CategoryCard from "./CategoryCard";

export default function CategoryGrid({
  categories,
  selectedId,
  onSelect,
}: {
  categories: HelpCategory[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3" role="group" aria-label="Help topics">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          active={selectedId === category.id}
          onSelect={() => onSelect(category.id)}
        />
      ))}
    </div>
  );
}
