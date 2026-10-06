"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Avatar, Dropdown, Kbd, Label, SearchField, Tabs } from "@heroui/react";
import {
  Bell,
  BookOpen,
  BookOpenText,
  Calendar,
  ChevronDown,
  Home,
  LayoutDashboard,
  LogOut,
  Monitor,
  Moon,
  Sun,
  User,
  type LucideIcon,
} from "lucide-react";

/* LP top navigation, rebuilt against the "Learning Platform (Program
 * Catalogue View)" Figma frame (docs/CHA Platform_4.fig) via decode_fig.py —
 * this frame's chrome (logo, Explore Programs/My Program switcher,
 * notifications, search, theme toggle, profile card, and the full-width
 * global-nav row underneath) is identical across every learner-screen
 * variant decoded, so it's built once here per requirements §1's "Global nav
 * present on every learner screen." Two distinct rows, confirmed by their
 * Figma node positions: a slim content-switcher pair ("Explore Programs" /
 * "My Program") inside the canvas-colored header band, and a wider icon+label
 * nav row (My Dashboard / Catalogue / My Program / My Profile / Calendar)
 * just below it — previously only the switcher pair existed here, and the
 * icon nav row lived inline in CatalogClient instead of in shared chrome. */

const SWITCHER_TABS = [
  { id: "catalog", href: "/catalog", label: "Explore Programs" },
  { id: "program", href: "/courses", label: "My Program" },
];

const GLOBAL_NAV = [
  { label: "My Dashboard", icon: Home, href: `dashboard`, external: true },
  { label: "Catalogue", icon: BookOpen, href: "/catalog", external: false },
  { label: "My Program", icon: BookOpenText, href: "/courses", external: false },
  { label: "My Profile", icon: User, href: `profile`, external: true },
  { label: "Calendar", icon: Calendar, href: `dashboard`, external: true },
] as const;

const STUDENT_HUB_URL =
  process.env.NEXT_PUBLIC_STUDENT_HUB_URL ?? "http://localhost:3000";

type Theme = "light" | "dark" | "system";

type Props = {
  givenName: string;
  familyName: string;
  email: string;
  avatarUrl?: string;
};

export default function TopBar({ givenName, familyName, email, avatarUrl }: Props) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("light");

  function handleProfileMenuAction(key: React.Key) {
    switch (key) {
      case "hub":
        window.location.href = `${STUDENT_HUB_URL}/dashboard`;
        break;
      case "profile":
        window.location.href = `${STUDENT_HUB_URL}/profile`;
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

  // Learning mode (Sept 21 decision, Kris): once a learner is inside a unit
  // or one of its topics, the header band hides to give the canvas to the
  // content. The unit breadcrumb's Home button brings it back. Placed after
  // every hook so the theme effect above keeps running while hidden.
  if (/^\/programs\/[^/]+\/units\//.test(pathname)) return null;

  const fullName = [givenName, familyName].filter(Boolean).join(" ");
  const switcherSelected = pathname.startsWith("/courses") ? "program" : "catalog";

  return (
    <div className="flex shrink-0 flex-col bg-cha-canvas">
      {/* Header band: logo, content switcher, notifications, search, theme, profile */}
      <header className="flex h-[88px] items-stretch">
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

        <div className="flex min-w-0 flex-1 items-center gap-8 px-8">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4 self-stretch">
            <Tabs
              aria-label="Learning Platform sections"
              className="self-stretch"
              selectedKey={switcherSelected}
              variant="secondary"
            >
              <Tabs.ListContainer className="h-full">
                <Tabs.List aria-label="Learning Platform sections" className="h-full">
                  {SWITCHER_TABS.map((t) => (
                    <Tabs.Tab
                      key={t.id}
                      className="text-[15px]"
                      id={t.id}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches HeroUI's own documented Tabs.Tab + Next Link render-function pattern
                      render={(domProps: any) => <Link {...domProps} href={t.href} />}
                    >
                      {t.label}
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>

            <div className="flex min-w-0 items-center gap-4">
              <button
                className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cha-surface text-cha-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:bg-cha-surface-2"
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-[1.5px] border-cha-surface bg-red-500" />
              </button>

              <div className="h-8 w-px shrink-0 bg-cha-border" />

              <SearchField aria-label="Search" className="w-[260px] min-w-0 shrink" variant="secondary">
                <SearchField.Group className="rounded-full bg-cha-surface">
                  <SearchField.SearchIcon className="text-cha-faint" />
                  <SearchField.Input className="text-sm" placeholder="Search" />
                  <Kbd className="mr-3 shrink-0 rounded-md border border-cha-border bg-transparent px-1.5 py-0.5 text-[11px] font-semibold text-cha-faint">
                    <Kbd.Abbr keyValue="ctrl" />
                    <Kbd.Content>K</Kbd.Content>
                  </Kbd>
                </SearchField.Group>
              </SearchField>

              <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-cha-surface p-1 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <ThemeButton icon={Sun} on={theme === "light"} onClick={() => changeTheme("light")} label="Light" />
                <ThemeButton icon={Moon} on={theme === "dark"} onClick={() => changeTheme("dark")} label="Dark" />
                <ThemeButton icon={Monitor} on={theme === "system"} onClick={() => changeTheme("system")} label="System" />
              </div>
            </div>
          </div>

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
                  <Dropdown.Item id="hub" textValue="Student Hub">
                    <LayoutDashboard size={16} className="shrink-0 text-cha-muted" />
                    <Label>Student Hub</Label>
                  </Dropdown.Item>
                  <Dropdown.Item id="profile" textValue="My Profile">
                    <User size={16} className="shrink-0 text-cha-muted" />
                    <Label>My Profile</Label>
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

      <div className="h-px w-full bg-cha-border" />

      {/* Global nav row — My Dashboard / Catalogue / My Program / My Profile /
       * Calendar, present on every learner screen per requirements §1. */}
      <nav
        aria-label="Learning Platform"
        className="flex items-center gap-1 px-8 py-2.5"
      >
        {GLOBAL_NAV.map(({ label, icon: Icon, href, external }) => {
          const active = !external && pathname.startsWith(href);
          const className = `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            active
              ? "bg-cha-orange text-white"
              : "text-cha-ink hover:bg-cha-surface-2"
          }`;
          return external ? (
            <a key={label} href={`${STUDENT_HUB_URL}/${href}`} className={className}>
              <Icon size={16} />
              {label}
            </a>
          ) : (
            <Link key={label} href={href} className={className}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
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
