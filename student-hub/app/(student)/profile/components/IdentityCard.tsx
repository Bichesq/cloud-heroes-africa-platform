"use client";

import { Avatar } from "@heroui/react";
import { countryFlag } from "@/lib/profile-options";
import { cardClass, Toggle } from "./fields";

export type ToggleKind = "photo" | "country";

/** Identity summary card with the two public-visibility toggles.
 * Toggles don't flip directly — they request a change, which the parent
 * confirms via modal before persisting. */
export default function IdentityCard({
  fullName,
  level,
  city,
  country,
  avatarUrl,
  photoPublic,
  countryPublic,
  onRequestToggle,
}: {
  fullName: string;
  level: string;
  city: string;
  country: string;
  avatarUrl?: string;
  photoPublic: boolean;
  countryPublic: boolean;
  onRequestToggle: (kind: ToggleKind, next: boolean) => void;
}) {
  return (
    <div className={`flex items-center justify-between gap-6 p-6 ${cardClass}`}>
      <div className="flex min-w-0 items-center gap-4">
        <Avatar className="h-[60px] w-[60px] shrink-0">
          {avatarUrl && <Avatar.Image src={avatarUrl} alt={fullName} />}
          <Avatar.Fallback>
            {fullName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </Avatar.Fallback>
        </Avatar>
        <div className="min-w-0">
          <div className="whitespace-nowrap font-display text-xl font-bold leading-tight">
            {fullName}
          </div>
          <div className="mt-0.5 text-[13.5px] text-cha-muted">{level}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[13.5px] text-cha-muted">
            {[city, country].filter(Boolean).join(", ")}{" "}
            <span className="text-[15px]">{countryFlag(country)}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3.5">
        <Toggle
          checked={photoPublic}
          onChange={(v) => onRequestToggle("photo", v)}
          label="Display Profile Photo to Public"
        />
        <Toggle
          checked={countryPublic}
          onChange={(v) => onRequestToggle("country", v)}
          label="Display Country of Origin"
        />
      </div>
    </div>
  );
}
