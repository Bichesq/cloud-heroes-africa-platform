"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard",     icon: "⊞" },
  { href: "/profile",   label: "My Profile",    icon: "◎" },
  { href: "/support",   label: "Help Desk",      icon: "?" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-gray-100 bg-white min-h-screen px-3 py-6 shrink-0">
      {/* Logo */}
      <div className="px-3 mb-8">
        <span className="font-semibold text-sm leading-tight">
          Cloud Heroes<br />
          <span className="text-blue-600">Africa</span>
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — account issue link */}
      <div className="border-t border-gray-100 pt-4 px-3">
        <Link
          href="/support#account"
          className="flex items-center gap-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span>🔑</span>
          Can&apos;t access my account?
        </Link>
      </div>
    </aside>
  );
}
