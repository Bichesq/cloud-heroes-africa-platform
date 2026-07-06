import Image from "next/image";
import { Link } from "@heroui/react";
import AppButtonLink from "@/components/ui/AppButtonLink";

const NAV_LINKS = [
  { href: "#programme", label: "Programme" },
  { href: "#tracks", label: "Tracks" },
  { href: "#community", label: "Community" },
  { href: "#support", label: "Support" },
];

const REGISTRATION_URL = process.env.NEXT_PUBLIC_REGISTRATION_FORM_URL ?? "#";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-cha-border bg-cha-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-[74px] max-w-[1200px] items-center gap-7 px-5 sm:px-8">
        <a href="#top" className="flex flex-none items-center gap-3">
          <Image
            src="/logo_cha.png"
            alt="Cloud Heroes Africa"
            width={44}
            height={44}
            className="rounded-xl"
          />
          <span className="font-display text-sm font-extrabold uppercase leading-[1.05] tracking-wide">
            Cloud Heroes
            <br />
            Africa
          </span>
        </a>

        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-cha-ink/70 hover:text-cha-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-none items-center gap-2.5">
          <a
            href={REGISTRATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm font-semibold text-cha-ink/70 hover:text-cha-ink sm:inline"
          >
            Apply to Join
          </a>
          <AppButtonLink href="/SignIn" variant="primary" radius="pill" size="md">
            Sign In
          </AppButtonLink>
        </div>
      </div>
    </header>
  );
}
