"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Avatar, Dropdown, Label } from "@heroui/react";
import {
  Bell,
  Search,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";

/** Every student page's own label — matches the sidebar's nav so the two
 * stay in sync. The first top-bar tab mirrors whichever of these the
 * student is currently on, instead of always saying "Dashboard". */
const PAGE_TITLES = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/my-program", label: "My Program" },
  { href: "/calendar", label: "Calendar" },
  { href: "/analytics", label: "Analytics" },
  { href: "/notes", label: "Notes" },
  { href: "/support", label: "Helpdesk" },
  { href: "/service-desk", label: "Service Desk" },
  { href: "/profile", label: "My Profile" },
  { href: "/settings", label: "Settings" },
];

const EXPLORE_TAB = { href: "/explore", label: "Explore Programs" };

type Theme = "light" | "dark" | "system";

type Props = {
  givenName: string;
  familyName: string;
  email: string;
  avatarUrl?: string;
};

export default function TopBar({ givenName, familyName, email, avatarUrl }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("light");

  function handleProfileMenuAction(key: React.Key) {
    switch (key) {
      case "dashboard":
        router.push("/dashboard");
        break;
      case "profile":
        router.push("/profile");
        break;
      case "settings":
        router.push("/settings");
        break;
      case "logout":
        signOut({ callbackUrl: "/SignIn" });
        break;
    }
  }

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme) || "light";
    setTheme(savedTheme);
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    const applyTheme = (t: Theme) => {
      let actualTheme = t;
      if (t === "system") {
        const supportDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        actualTheme = supportDark ? "dark" : "light";
      }

      if (actualTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
      }
    };

    applyTheme(newTheme);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        const supportDark = mediaQuery.matches;
        if (supportDark) {
          document.documentElement.classList.add("dark");
          document.documentElement.setAttribute("data-theme", "dark");
        } else {
          document.documentElement.classList.remove("dark");
          document.documentElement.setAttribute("data-theme", "light");
        }
      }
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const fullName = [givenName, familyName].filter(Boolean).join(" ");

  const currentPage =
    PAGE_TITLES.find((p) => pathname.startsWith(p.href)) ?? PAGE_TITLES[0];
  const tabs = [currentPage, EXPLORE_TAB];

  return (
    <header className="flex h-[88px] shrink-0 items-stretch bg-cha-canvas">
      {/* Col 1 — logo + company name, aligns with the 300px sidebar */}
      <div className="flex w-[300px] shrink-0 items-center gap-3 px-5">
        <img
          src="/logo_cha.png"
          alt="Cloud Heroes Africa"
          className="h-11 w-11 shrink-0 rounded-[10px] object-contain"
        />
        <div className="font-display text-[15px] font-extrabold leading-[1.05] tracking-wide">
          CLOUD HEROES
          <br />
          AFRICA
        </div>
      </div>

      {/* Cols 2 & 3 — align with the main content area (flex-1, px-8, gap-8) */}
      <div className="flex min-w-0 flex-1 items-center gap-8 px-8">
        {/* Col 2 — tabs (left) through the theme toggle (right); aligns with
            the 1fr content column so the Dashboard tab lines up with the
            welcome message and the toggle ends where the middle grid ends. */}
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4 self-stretch">
          {/* Primary tabs */}
          <nav className="flex items-end gap-6 self-stretch pb-[30px]">
            {tabs.map((t) => {
              const active = pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`border-b-2 pb-2 text-[15px] transition-colors ${
                    active
                      ? "border-cha-orange font-bold text-cha-ink"
                      : "border-transparent font-medium text-cha-muted hover:text-cha-ink"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>

          {/* Notifications + search + theme toggle */}
          <div className="flex min-w-0 items-center gap-4">
            {/* Notifications */}
            <button
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cha-surface text-cha-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:bg-cha-surface-2"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-[1.5px] border-cha-surface bg-red-500" />
            </button>

            <div className="h-8 w-px shrink-0 bg-cha-border" />

            {/* Search */}
            <div className="w-[260px] min-w-0 shrink">
              <div className="flex items-center gap-2 rounded-full border border-cha-border bg-cha-surface px-3 py-1.5">
                <Search size={18} className="shrink-0 text-cha-faint" />
                <input
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-cha-faint"
                />
                <span className="shrink-0 rounded-md border border-cha-border px-1.5 py-0.5 text-[11px] font-semibold text-cha-faint">
                  Ctrl K
                </span>
              </div>
            </div>

            {/* Theme toggle */}
            <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-cha-surface p-1 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <ThemeButton icon={Sun} on={theme === "light"} onClick={() => changeTheme("light")} label="Light" />
              <ThemeButton icon={Moon} on={theme === "dark"} onClick={() => changeTheme("dark")} label="Dark" />
              <ThemeButton icon={Monitor} on={theme === "system"} onClick={() => changeTheme("system")} label="System" />
            </div>
          </div>
        </div>

        {/* Col 3 — profile, aligns with the 340px rail */}
        <div className="flex w-[340px] shrink-0 items-center justify-between gap-2.5">
          <div className="min-w-0">
            <div className="font-display text-[17px] font-extrabold leading-tight">
              Profile
            </div>
            <div className="truncate text-sm font-semibold leading-tight text-cha-ink">
              {fullName || "Student"}
            </div>
            <div className="truncate text-[11px] text-cha-faint">{email}</div>
          </div>
          <Dropdown>
            <Dropdown.Trigger className="flex shrink-0 items-center gap-1.5 rounded-full outline-none">
              <Avatar.Root className="h-10 w-10 shrink-0 rounded-full ring-2 ring-cha-orange ring-offset-2">
                <Avatar.Image src={avatarUrl} />
                <Avatar.Fallback>
                  {(fullName || "S")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </Avatar.Fallback>
              </Avatar.Root>
              <ChevronDown size={18} className="shrink-0 text-cha-faint" />
            </Dropdown.Trigger>
            <Dropdown.Popover className="min-w-[200px]">
              <Dropdown.Menu onAction={handleProfileMenuAction}>
                <Dropdown.Item id="dashboard" textValue="Dashboard">
                  <LayoutDashboard size={16} className="shrink-0 text-cha-muted" />
                  <Label>Dashboard</Label>
                </Dropdown.Item>
                <Dropdown.Item id="profile" textValue="Profile">
                  <User size={16} className="shrink-0 text-cha-muted" />
                  <Label>Profile</Label>
                </Dropdown.Item>
                <Dropdown.Item id="settings" textValue="Settings">
                  <Settings size={16} className="shrink-0 text-cha-muted" />
                  <Label>Settings</Label>
                </Dropdown.Item>
                <Dropdown.Item id="logout" textValue="Log out" variant="danger">
                  <LogOut size={16} className="shrink-0 text-danger" />
                  <Label>Log out</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
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
        on ? "bg-cha-surface-2 text-cha-ink" : "text-cha-muted hover:text-cha-ink"
      }`}
    >
      <Icon size={16} />
    </button>
  );
}
