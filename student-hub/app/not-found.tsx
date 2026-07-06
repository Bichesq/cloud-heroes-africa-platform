import Link from "next/link";
import Image from "next/image";
import { Home, FolderOpen, MessageCircle, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 overflow-hidden bg-cha-surface text-cha-ink lg:grid-cols-[1.05fr_1fr]">
      {/* ============ LEFT — MESSAGE + ACTIONS ============ */}
      <div className="flex flex-col justify-center px-8 py-16 sm:px-14 lg:px-[clamp(56px,7vw,116px)]">
        {/* Brand */}
        <div className="mb-14 flex items-center gap-3.5">
          <Image
            src="/logo_cha.png"
            alt="Cloud Heroes Africa"
            width={52}
            height={52}
            className="h-13 w-13 rounded-xl"
          />
          <div className="font-display text-xl font-extrabold leading-[1.05] tracking-[0.02em]">
            CLOUD HEROES
            <br />
            AFRICA
          </div>
        </div>

        {/* Error badge */}
        <div className="mb-5 inline-flex items-center gap-2.5 self-start rounded-full bg-cha-orange-soft px-4 py-2 text-[13px] font-bold text-cha-orange">
          <span className="h-2 w-2 rounded-full bg-cha-orange" />
          Error 404 — Page Not Found
        </div>

        {/* Headline */}
        <h1 className="max-w-[520px] font-display text-4xl font-extrabold leading-[1.08] lg:text-[46px]">
          Looks like you&apos;ve wandered off the path.
        </h1>

        <p className="mb-9 mt-4.5 max-w-[460px] text-lg leading-relaxed text-cha-muted">
          The page you&apos;re looking for isn&apos;t here — but every hero takes
          a wrong turn now and then. Let&apos;s get you back on track and keep the
          momentum going.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3.5">
          <Link
            href="/dashboard"
            className="inline-flex h-13 items-center gap-2.5 rounded-xl bg-cha-orange px-6 text-sm font-semibold text-white transition-colors hover:bg-cha-orange-strong"
          >
            <Home size={18} />
            Back to Dashboard
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-13 items-center gap-2.5 rounded-xl border border-cha-border bg-cha-surface px-6 text-sm font-semibold text-cha-ink transition-colors hover:bg-cha-surface-2"
          >
            <FolderOpen size={18} />
            Browse Learning Paths
          </Link>
        </div>

        {/* Support */}
        <div className="mt-10 flex items-center gap-2.5 text-sm text-cha-faint">
          <MessageCircle size={17} className="text-cha-faint" />
          Still stuck?{" "}
          <Link
            href="/support"
            className="font-semibold text-cha-blue no-underline hover:underline"
          >
            Contact Support
          </Link>
        </div>
      </div>

      {/* ============ RIGHT — 404 VISUAL ============ */}
      <div
        className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-cha-canvas"
        style={{
          backgroundImage:
            "radial-gradient(var(--color-cha-border) 1.4px, transparent 1.4px)",
          backgroundSize: "26px 26px",
        }}
        aria-hidden="true"
      >
        {/* Dashed route wandering off */}
        <svg
          viewBox="0 0 620 620"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 opacity-50"
        >
          <path
            d="M40 540 C 180 470, 120 300, 300 300 S 480 150, 590 90"
            fill="none"
            stroke="var(--color-cha-ocean)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="2 14"
          />
        </svg>

        {/* Soft ocean glow */}
        <div
          className="absolute h-[520px] w-[520px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(50,167,212,0.16), transparent 66%)",
          }}
        />

        <div className="relative flex flex-col items-center text-center">
          <div
            className="font-display text-[120px] font-extrabold leading-[0.9] tracking-[-0.02em] text-cha-orange sm:text-[160px] lg:text-[230px]"
            style={{ textShadow: "0 30px 60px rgba(232,84,26,0.18)" }}
          >
            404
          </div>

          {/* Lost pin card */}
          <div
            className="-mt-6 flex items-center gap-3 rounded-full bg-cha-surface px-5 py-3 pl-4 shadow-[0_12px_34px_rgba(0,0,0,0.10)]"
            style={{ animation: "cha-float 4.5s ease-in-out infinite" }}
          >
            <span className="flex h-9.5 w-9.5 flex-none items-center justify-center rounded-full bg-cha-ocean text-white">
              <MapPin size={20} />
            </span>
            <div className="text-left leading-tight">
              <div className="font-display text-[15px] font-bold">
                You are here
              </div>
              <div className="text-[12.5px] text-cha-muted">
                …and it&apos;s a little off the map.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
