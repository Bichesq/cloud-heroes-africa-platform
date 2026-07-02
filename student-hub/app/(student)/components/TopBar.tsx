"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Input } from "@heroui/react";
import {
  Bell,
  Search,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

const TABS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explore", label: "Explore Programs" },
];

type Theme = "light" | "dark" | "system";

type Props = {
  givenName: string;
  familyName: string;
  email: string;
};

export default function TopBar({ givenName, familyName, email }: Props) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("light");

  const fullName = [givenName, familyName].filter(Boolean).join(" ");

  return (
    <header className="flex h-[88px] shrink-0 items-center gap-6 bg-cha-canvas px-7">
      {/* Logo */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-[10px] bg-cha-blue text-[9px] font-extrabold leading-none text-white">
          CHA
        </div>
        <div className="font-display text-[15px] font-extrabold leading-[1.05] tracking-wide">
          CLOUD HEROES
          <br />
          AFRICA
        </div>
      </div>

      {/* Primary tabs */}
      <nav className="flex items-end gap-6 self-stretch pb-[30px]">
        {TABS.map((t) => {
          const active = pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`border-b-2 pb-2 text-[15px] transition-colors ${
                active
                  ? "border-cha-orange font-bold text-cha-ink"
                  : "border-transparent font-medium text-zinc-500 hover:text-cha-ink"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Notifications */}
      <button
        className="relative grid h-10 w-10 place-items-center rounded-full bg-white text-cha-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:bg-zinc-50"
        aria-label="Notifications"
      >
        <Bell size={18} />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-[1.5px] border-white bg-red-500" />
      </button>

      <div className="h-8 w-px bg-zinc-200" />

      {/* Search */}
      <div className="w-[300px] shrink-0">
        <Input
          type="search"
          placeholder="Search"
          aria-label="Search"
          className="rounded-full"
          startContent={<Search size={18} className="text-zinc-400" />}
          endContent={
            <span className="rounded-md border border-zinc-200 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-400">
              Ctrl K
            </span>
          }
        />
      </div>

      <div className="flex-1" />

      {/* Theme toggle */}
      <div className="flex items-center gap-0.5 rounded-full bg-white p-1 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <ThemeButton icon={Sun} on={theme === "light"} onClick={() => setTheme("light")} label="Light" />
        <ThemeButton icon={Moon} on={theme === "dark"} onClick={() => setTheme("dark")} label="Dark" />
        <ThemeButton icon={Monitor} on={theme === "system"} onClick={() => setTheme("system")} label="System" />
      </div>

      {/* Profile */}
      <div className="flex shrink-0 items-center gap-2.5">
        <div className="text-right">
          <div className="font-display text-[17px] font-extrabold leading-tight">
            Profile
          </div>
          <div className="text-sm font-semibold leading-tight text-cha-ink">
            {fullName || "Student"}
          </div>
          <div className="text-[11px] text-zinc-400">{email}</div>
        </div>
        <ChevronDown size={18} className="text-zinc-400" />
      </div>
    </header>
  );
}

function ThemeButton({
  icon: Icon,
  on,
  onClick,
  label,
}: {
  icon: LucideIcon;
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      className={`grid h-[34px] w-[34px] place-items-center rounded-full transition-colors ${
        on ? "bg-zinc-100 text-cha-ink" : "text-zinc-500 hover:text-cha-ink"
      }`}
    >
      <Icon size={16} />
    </button>
  );
}
