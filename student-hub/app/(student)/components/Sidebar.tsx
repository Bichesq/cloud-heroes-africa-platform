"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Avatar, Button } from "@heroui/react";
import {
  LayoutDashboard,
  GraduationCap,
  CalendarDays,
  PieChart,
  StickyNote,
  LifeBuoy,
  ShieldAlert,
  User,
  Settings,
  LogOut,
  Headphones,
  X,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
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
  { href: "/my-program", label: "My Program", icon: GraduationCap },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: PieChart },
];

const ACCOUNT: NavLink[] = [
  { href: "/notes", label: "Notes", icon: StickyNote, chevron: true },
  { href: "/support", label: "Helpdesk", icon: LifeBuoy },
  { href: "/service-desk", label: "Service Desk", icon: ShieldAlert },
  { href: "/profile", label: "My Profile", icon: User },
];

const COLLAPSE_KEY = "cha_sidebar_collapsed";

type Props = {
  name?: string;
  track?: string;
  avatarUrl?: string;
};

export default function Sidebar({
  name = "Chem Patrick",
  track = "CHA Student",
  avatarUrl,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "true");
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  }

  return (
    <aside
      className={`hidden shrink-0 flex-col gap-4 overflow-y-auto overflow-x-hidden rounded-tr-[28px] bg-cha-surface pb-5 pt-7 transition-[width] duration-200 md:flex ${
        collapsed ? "w-[88px] px-3" : "w-[300px] px-5"
      }`}
    >
      {/* Collapse toggle — moved here from the page headers so it always
          controls this sidebar, regardless of which page is active. */}
      <button
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-cha-muted transition-colors hover:bg-cha-surface-2 hover:text-cha-ink ${
          collapsed ? "mx-auto" : "self-end"
        }`}
      >
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>

      {/* Profile */}
      <div
        className={`flex items-center gap-3.5 ${
          collapsed ? "flex-col gap-2" : ""
        }`}
      >
        <Avatar.Root className="h-14 w-14 shrink-0 rounded-full ring-2 ring-cha-orange ring-offset-2">
          <Avatar.Image src={avatarUrl} />
          <Avatar.Fallback>
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </Avatar.Fallback>
        </Avatar.Root>
        {!collapsed && (
          <div>
            <div className="font-display text-xl font-bold leading-tight">
              {name}
            </div>
            <div className="mt-0.5 text-xs leading-snug text-cha-muted">
              {track}
            </div>
          </div>
        )}
      </div>

      <NavGroup
        label="Main menu"
        items={MAIN}
        pathname={pathname}
        collapsed={collapsed}
      />
      <NavGroup
        label="Account Management"
        items={ACCOUNT}
        pathname={pathname}
        collapsed={collapsed}
      />

      {/* Support card */}
      {!collapsed && (
        <div className="cha-card-outline relative mt-1 p-[18px]">
          <button
            className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full text-cha-faint transition-colors hover:bg-cha-surface-2"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2 text-sm font-bold">
            <Headphones size={18} /> Need support?
          </div>
          <p className="my-2.5 text-[12.5px] leading-snug text-cha-muted">
            Contact one of our team members to get the help you need.
          </p>
          <Button
            variant="primary"
            onPress={() => router.push("/support")}
            className="w-full rounded-full bg-cha-orange font-semibold text-white hover:bg-cha-orange-strong"
          >
            Contact Support
          </Button>
        </div>
      )}

      {/* Bottom */}
      <div
        className={`mt-auto flex flex-col gap-1 border-t border-cha-border pt-3 ${
          collapsed ? "items-center" : ""
        }`}
      >
        <NavRow
          href="/settings"
          label="Settings"
          icon={Settings}
          pathname={pathname}
          collapsed={collapsed}
        />
        <button
          onClick={() => signOut({ callbackUrl: "/SignIn" })}
          aria-label="Log out"
          title={collapsed ? "Log out" : undefined}
          className={`flex h-12 items-center gap-3 rounded-full text-left text-sm font-semibold text-cha-ink transition-colors hover:bg-cha-surface-2 ${
            collapsed ? "w-12 justify-center px-0" : "px-4"
          }`}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span className="flex-1">Log out</span>}
        </button>
      </div>
    </aside>
  );
}

function NavGroup({
  label,
  items,
  pathname,
  collapsed,
}: {
  label: string;
  items: NavLink[];
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <div>
      {!collapsed && (
        <div className="px-2 pb-1.5 text-xs font-semibold text-cha-faint">
          {label}
        </div>
      )}
      <div className={`flex flex-col gap-0.5 ${collapsed ? "items-center" : ""}`}>
        {items.map((item) => (
          <NavRow key={item.href} {...item} pathname={pathname} collapsed={collapsed} />
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
  collapsed,
}: NavLink & { pathname: string; collapsed?: boolean }) {
  const active = pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-label={label}
      title={collapsed ? label : undefined}
      className={`flex h-12 items-center gap-3 rounded-full text-sm font-semibold transition-colors ${
        collapsed ? "w-12 justify-center px-0" : "px-4"
      } ${active ? "bg-cha-orange text-white" : "text-cha-ink hover:bg-cha-surface-2"}`}
    >
      <Icon size={20} className="shrink-0" />
      {!collapsed && <span className="flex-1">{label}</span>}
      {!collapsed && chevron && <ChevronRight size={16} className="opacity-60" />}
    </Link>
  );
}
