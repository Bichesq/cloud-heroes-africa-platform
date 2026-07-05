"use client";

import { Avatar } from "@heroui/react";
import { Globe, Cake, Clock, Phone, Lock, MapPin, Camera } from "lucide-react";
import { cardClass } from "./fields";
import type { ProfileData } from "../data/mock";

/** Right-rail live preview of how the profile reads to peers. */
export default function ProfilePreview({
  data,
  form,
}: {
  data: ProfileData;
  form: {
    firstName: string;
    lastName: string;
    country: string;
    birthDate: string;
    timezone: string;
    phone: string;
  };
}) {
  const fullName = `${form.firstName} ${form.lastName}`.trim();

  const rows = [
    { icon: Globe, label: "Country of Origin", value: form.country || "—" },
    { icon: Cake, label: "Date of Birth", value: form.birthDate || "MM / DD / YY" },
    { icon: Clock, label: "Timezone", value: form.timezone },
    { icon: Phone, label: "Phone Number", value: form.phone },
    { icon: Lock, label: "MFA Enabled", value: data.mfaEnabled ? "True" : "False" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-[26px] font-bold">Profile Preview</h2>

      <div className={`relative flex flex-col items-center px-6 py-7 text-center ${cardClass}`}>
        <button className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-[#e7f2fe] px-3 py-1.5 text-[11.5px] font-semibold text-cha-blue transition hover:bg-[#d8ebfd] dark:bg-cha-blue/15 dark:hover:bg-cha-blue/25">
          <Camera size={12} /> Change Photo
        </button>

        <div className="relative mt-5">
          <Avatar className="h-[118px] w-[118px] shrink-0">
            {data.avatarUrl && <Avatar.Image src={data.avatarUrl} alt={fullName} />}
            <Avatar.Fallback>
              {fullName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </Avatar.Fallback>
          </Avatar>
          <span className="absolute -right-3.5 -top-0.5 text-[26px] leading-none">🇨🇲</span>
        </div>

        <div className="mt-4 font-display text-[22px] font-extrabold">{fullName}</div>
        <div className="mt-1 text-[13px] text-cha-muted">{data.level}</div>
        <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-cha-faint">
          <MapPin size={13} /> {data.city}, {data.country}
        </div>

        <div className="my-6 h-px w-full bg-cha-separator" />

        <div className="flex w-full flex-col gap-[18px] text-left">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <Icon size={18} className="shrink-0 text-cha-muted" strokeWidth={1.7} />
              <span className="font-bold text-cha-ink">{label}:</span>
              <span className="text-cha-muted">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
