import { Avatar, Button } from "@heroui/react";
import { LogOut } from "lucide-react";
import AuthoringSidebar from "@/components/AuthoringSidebar";
import { signOut } from "@/lib/auth";
import { requireAuthor } from "@/lib/session";

/* Authoring shell — Figma "Create Course View (For Admins)" → Programs frame:
 * a 128px canvas-coloured header band (logo left; profile right), a 1px
 * separator, then the 284px AUTHORING sidebar beside the content area.
 *
 * Sub-step 1 builds the parts that have something behind them: logo,
 * the signed-in author (initials Avatar — the frame's photo is a mock
 * person), and Sign out. The frame's Helpdesk / Support Tickets tabs,
 * notifications, search and theme toggle come with later sub-steps. */

async function doSignOut() {
  "use server";
  await signOut({ redirectTo: "/signin" });
}

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export default async function AuthoringLayout({ children }: { children: React.ReactNode }) {
  const author = await requireAuthor();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-32 shrink-0 items-center justify-between border-b border-cha-border bg-cha-canvas px-11">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-cha-wordmark.png"
          alt="Cloud Heroes Africa"
          width={182}
          height={47}
          className="h-auto w-[182px]"
        />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar color="accent" variant="soft">
              <Avatar.Fallback>{initials(author.name, author.email)}</Avatar.Fallback>
            </Avatar>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-cha-ink">{author.name || author.email}</p>
              <p className="text-[11px] text-cha-muted">{author.email}</p>
            </div>
          </div>
          <form action={doSignOut}>
            <Button type="submit" size="sm" variant="ghost">
              <LogOut size={15} />
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <div className="flex flex-1">
        <AuthoringSidebar />
        <main className="min-w-0 flex-1 bg-cha-surface px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
