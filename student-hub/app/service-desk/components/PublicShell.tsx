import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Minimal, unauthenticated shell for /service-desk — no Sidebar/TopBar
 * (there's no session to drive them), just enough chrome to orient a
 * visitor who isn't signed in: brand mark and a way back to Sign In.
 */
export default function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cha-canvas text-cha-ink">
      <header className="flex items-center justify-between px-6 py-6 sm:px-12">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo_cha.png"
            alt="Cloud Heroes Africa"
            width={40}
            height={40}
            className="rounded-xl"
          />
          <span className="font-display text-[13px] font-extrabold uppercase leading-tight tracking-wide">
            Cloud Heroes
            <br />
            Africa
          </span>
        </Link>
        <Link
          href="/SignIn"
          className="text-sm font-semibold text-cha-blue underline-offset-2 hover:underline"
        >
          Back to sign in
        </Link>
      </header>
      <main className="mx-auto max-w-4xl px-6 pb-20 sm:px-12">{children}</main>
    </div>
  );
}
