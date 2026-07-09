import { Construction } from "lucide-react";

/** Lightweight placeholder for nav destinations not yet built, so no
 * sidebar/top-bar link ever 404s. */
export default function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-3xl bg-cha-surface p-10 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cha-orange/10 text-cha-orange">
        <Construction size={24} />
      </div>
      <h1 className="font-display text-[26px] font-extrabold">{title}</h1>
      <p className="max-w-md text-sm font-medium text-cha-muted">{description}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-cha-faint">
        Coming soon
      </p>
    </div>
  );
}
