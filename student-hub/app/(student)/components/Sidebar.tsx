"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Avatar, Button } from "@heroui/react";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  CalendarDays,
  PieChart,
  StickyNote,
  LifeBuoy,
  User,
  Settings,
  LogOut,
  Headphones,
  X,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  chevron?: boolean;
};

const MAIN: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/assessments", label: "Assessments", icon: ClipboardCheck },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: PieChart },
];

const ACCOUNT: NavLink[] = [
  { href: "/notes", label: "Notes", icon: StickyNote, chevron: true },
  { href: "/support", label: "Helpdesk", icon: LifeBuoy },
  { href: "/profile", label: "My Profile", icon: User },
];

type Props = {
  name?: string;
  level?: string;
  track?: string;
  avatarUrl?: string;
};

export default function Sidebar({
  name = "Chem Patrick",
  level = "Student | Intermediate",
  track = "DevOps Engineer Track",
  avatarUrl,
}: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[300px] shrink-0 flex-col gap-4 overflow-y-auto rounded-tr-[28px] bg-white px-5 pb-5 pt-7 md:flex">
      {/* Profile */}
      <div className="flex items-center gap-3.5">
        <Avatar
          src={avatarUrl}
          alt={name}
          className="h-14 w-14 shrink-0"
        >
          {name
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")}
        </Avatar>
        <div>
          <div className="font-display text-xl font-bold leading-tight">
            {name}
          </div>
          <div className="mt-0.5 text-xs leading-snug text-zinc-500">
            {level}
            <br />
            {track}
          </div>
        </div>
      </div>

      <NavGroup label="Main menu" items={MAIN} pathname={pathname} />
      <NavGroup label="Account Management" items={ACCOUNT} pathname={pathname} />

      {/* Support card */}
      <div className="cha-card-outline relative mt-1 p-[18px]">
        <button
          className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-50"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
        <div className="flex items-center gap-2 text-sm font-bold">
          <Headphones size={18} /> Need support?
        </div>
        <p className="my-2.5 text-[12.5px] leading-snug text-zinc-500">
          Contact one of our team members to get the help you need.
        </p>
        <Button
          variant="primary"
          className="w-full rounded-full bg-cha-orange font-semibold text-white hover:bg-cha-orange-strong"
        >
          Contact Support
        </Button>
      </div>

      {/* Bottom */}
      <div className="mt-auto flex flex-col gap-1 border-t border-zinc-100 pt-3">
        <NavRow href="/settings" label="Settings" icon={Settings} pathname={pathname} />
        <button
          onClick={() => signOut({ callbackUrl: "/invite" })}
          className="flex h-12 items-center gap-3 rounded-full px-4 text-left text-sm font-semibold text-cha-ink transition-colors hover:bg-zinc-50"
        >
          <LogOut size={20} />
          <span className="flex-1">Log out</span>
        </button>
      </div>
    </aside>
  );
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavLink[];
  pathname: string;
}) {
  return (
    <div>
      <div className="px-2 pb-1.5 text-xs font-semibold text-zinc-400">
        {label}
      </div>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavRow key={item.href} {...item} pathname={pathname} />
        ))}
      </div>
    </div>
  );
}

function NavRow({
  href,
  label,
  icon: Icon,
  chevron,
  pathname,
}: NavLink & { pathname: string }) {
  const active = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex h-12 items-center gap-3 rounded-full px-4 text-sm font-semibold transition-colors ${
        active
          ? "bg-cha-orange text-white"
          : "text-cha-ink hover:bg-zinc-50"
      }`}
    >
      <Icon size={20} className="shrink-0" />
      <span className="flex-1">{label}</span>
      {chevron && <ChevronRight size={16} className="opacity-60" />}
    </Link>
  );
}
