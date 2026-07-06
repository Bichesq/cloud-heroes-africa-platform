"use client";

import { useRef, useState } from "react";
import { Avatar } from "@heroui/react";
import { Globe, Cake, Clock, Phone, Lock, MapPin, Camera, EyeOff } from "lucide-react";
import { countryFlag } from "@/lib/profile-options";
import { cardClass } from "./fields";
import type { PersonalForm } from "./PersonalInfo";

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Right-rail live preview. This is a self-view: it always shows the full
 * data, but marks fields that are hidden from public surfaces. "Change
 * Photo" uploads a new avatar (JPG/PNG ≤ 2 MB) and updates instantly.
 */
export default function ProfilePreview({
  form,
  city,
  level,
  avatarUrl,
  mfaEnabled,
  photoPublic,
  countryPublic,
  onAvatarChange,
  onUploadError,
}: {
  form: PersonalForm;
  city: string;
  level: string;
  avatarUrl?: string;
  mfaEnabled: boolean;
  photoPublic: boolean;
  countryPublic: boolean;
  onAvatarChange: (url: string) => void;
  onUploadError: (message: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const fullName = `${form.firstName} ${form.lastName}`.trim();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      onUploadError("Only JPG or PNG images are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      onUploadError("Image must be 2 MB or smaller.");
      return;
    }

    const body = new FormData();
    body.append("file", file);
    setUploading(true);
    try {
      const res = await fetch("/api/profile/avatar", { method: "POST", body });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.avatarUrl) {
        onUploadError(json?.error ?? "Couldn't upload the photo. Please try again.");
        return;
      }
      onAvatarChange(json.avatarUrl);
    } catch {
      onUploadError("Couldn't upload the photo. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const rows: { icon: typeof Globe; label: string; value: string; hidden?: boolean }[] = [
    {
      icon: Globe,
      label: "Country of Origin",
      value: form.country || "—",
      hidden: !countryPublic,
    },
    { icon: Cake, label: "Date of Birth", value: form.birthDate || "MM / DD / YY" },
    { icon: Clock, label: "Timezone", value: form.timezone },
    { icon: Phone, label: "Phone Number", value: form.phone || "—" },
    { icon: Lock, label: "MFA Enabled", value: mfaEnabled ? "True" : "False" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-[26px] font-bold">Profile Preview</h2>

      <div className={`relative flex flex-col items-center px-6 py-7 text-center ${cardClass}`}>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-[#e7f2fe] px-3 py-1.5 text-[11.5px] font-semibold text-cha-blue transition hover:bg-[#d8ebfd] disabled:opacity-60 dark:bg-cha-blue/15 dark:hover:bg-cha-blue/25"
        >
          <Camera size={12} /> {uploading ? "Uploading…" : "Change Photo"}
        </button>

        <div className="relative mt-5">
          <Avatar className="h-[118px] w-[118px] shrink-0">
            {avatarUrl && <Avatar.Image src={avatarUrl} alt={fullName} />}
            <Avatar.Fallback>
              {fullName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </Avatar.Fallback>
          </Avatar>
          <span className="absolute -right-3.5 -top-0.5 text-[26px] leading-none">
            {countryFlag(form.country)}
          </span>
        </div>

        {!photoPublic && (
          <span className="mt-3 flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <EyeOff size={11} /> Photo hidden from public
          </span>
        )}

        <div className="mt-4 font-display text-[22px] font-extrabold">{fullName}</div>
        <div className="mt-1 text-[13px] text-cha-muted">{level}</div>
        <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-cha-faint">
          <MapPin size={13} /> {[city, form.country].filter(Boolean).join(", ")}
        </div>

        <div className="my-6 h-px w-full bg-cha-separator" />

        <div className="flex w-full flex-col gap-[18px] text-left">
          {rows.map(({ icon: Icon, label, value, hidden }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <Icon size={18} className="shrink-0 text-cha-muted" strokeWidth={1.7} />
              <span className="font-bold text-cha-ink">{label}:</span>
              <span className="text-cha-muted">{value}</span>
              {hidden && (
                <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-amber-600 dark:text-amber-400">
                  <EyeOff size={10} /> Hidden
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
