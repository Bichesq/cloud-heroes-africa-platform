"use client";

import { Avatar } from "@heroui/react";
import { cardClass, Toggle } from "./fields";
import type { ProfileData } from "../data/mock";

/** Identity summary card with the two public-visibility toggles. */
export default function IdentityCard({
  data,
  fullName,
  photoPublic,
  countryPublic,
  onPhotoPublic,
  onCountryPublic,
}: {
  data: ProfileData;
  fullName: string;
  photoPublic: boolean;
  countryPublic: boolean;
  onPhotoPublic: (v: boolean) => void;
  onCountryPublic: (v: boolean) => void;
}) {
  return (
    <div className={`flex items-center justify-between gap-6 p-6 ${cardClass}`}>
      <div className="flex min-w-0 items-center gap-4">
        <Avatar className="h-[60px] w-[60px] shrink-0">
          {data.avatarUrl && <Avatar.Image src={data.avatarUrl} alt={fullName} />}
          <Avatar.Fallback>
            {fullName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </Avatar.Fallback>
        </Avatar>
        <div className="min-w-0">
          <div className="whitespace-nowrap font-display text-xl font-bold leading-tight">
            {fullName}
          </div>
          <div className="mt-0.5 text-[13.5px] text-cha-muted">{data.level}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[13.5px] text-cha-muted">
            {data.city}, {data.country} <span className="text-[15px]">🇨🇲</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3.5">
        <Toggle checked={photoPublic} onChange={onPhotoPublic} label="Display Profile Photo to Public" />
        <Toggle checked={countryPublic} onChange={onCountryPublic} label="Display Country of Origin" />
      </div>
    </div>
  );
}
