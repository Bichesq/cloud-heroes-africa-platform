"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/profile",   label: "My Profile", icon: "◎" },
  { href: "/support",   label: "Help Desk",  icon: "?" },
];

type Props = {
  givenName: string;
  familyName: string;
  email: string;
};

export default function TopBar({ givenName, familyName, email }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const initials = `${givenName?.[0] ?? ""}${familyName?.[0] ?? ""}`.toUpperCase();

  return (
    <>
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">

        {/* Mobile: logo + hamburger */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-gray-500 hover:text-gray-700 p-1"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? "✕" : "☰"}
          </button>
          <span className="md:hidden font-semibold text-sm">
            Cloud Heroes <span className="text-blue-600">Africa</span>
          </span>
        </div>

        {/* Desktop: page title (derived from path) */}
        <div className="hidden md:block">
          <span className="text-sm font-medium text-gray-700">
            {NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.label ?? ""}
          </span>
        </div>

        {/* Right — avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
              {initials}
            </div>
            <span className="hidden md:block text-sm text-gray-600">
              {givenName}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-20">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium">{givenName} {familyName}</p>
                <p className="text-xs text-gray-400 truncate">{email}</p>
              </div>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Edit profile
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/invite" })}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <nav className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{icon}</span>
                {label}
              </Link>
            );
          })}
          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              onClick={() => signOut({ callbackUrl: "/invite" })}
              className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"
            >
              Sign out
            </button>
          </div>
        </nav>
      )}
    </>
  );
}
