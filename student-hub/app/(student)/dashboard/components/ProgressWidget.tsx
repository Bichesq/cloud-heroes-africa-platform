import type { ProgressItem } from "../data/mock";

/**
 * "Your Progress" bars. Plain Tailwind track + gradient fill so the
 * brand orange (400→600) renders exactly; HeroUI ProgressBar would need
 * BEM overrides to recolor.
 */
export default function ProgressWidget({ items }: { items: ProgressItem[] }) {
  return (
    <div className="flex flex-col gap-[18px]">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold">{item.label}</span>
            <span className="text-[13px] font-bold text-cha-muted">
              {item.value}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-cha-surface-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF8D28] to-cha-orange transition-all"
              style={{ width: `${item.value}%` }}
              role="progressbar"
              aria-valuenow={item.value}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={item.label}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
