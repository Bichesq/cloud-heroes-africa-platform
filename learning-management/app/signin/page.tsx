import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Alert, Button } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import { auth, signIn } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in — Cloud Heroes Africa Learning Management",
};

/* Staff sign-in. No Learning Management sign-in frame exists in the Figma, so
 * this follows the design system's Login screen (ui_kits/platform/
 * LoginScreen.jsx): brand + headline + actions on the left, the community
 * illustration on a canvas panel on the right. Microsoft SSO is the only
 * method (2026-06-08 decision) — no email/password field, no Google.
 * Errors are deliberately generic (SECURITY.md §4). */

async function signInWithMicrosoft() {
  "use server";
  await signIn("microsoft-entra-id", { redirectTo: "/" });
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [session, { error }] = await Promise.all([auth(), searchParams]);
  if (session?.user?.authorId) redirect("/");

  return (
    <main className="grid min-h-screen bg-cha-surface lg:grid-cols-2">
      <section className="flex flex-col justify-center px-8 py-16 sm:px-16 xl:px-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-cha-wordmark.png"
          alt="Cloud Heroes Africa"
          width={182}
          height={47}
          className="mb-12 h-auto w-[182px]"
        />

        <p className="font-display text-sm font-bold uppercase tracking-wide text-cha-orange">
          Learning Management
        </p>
        <h1 className="mt-2 max-w-[460px] font-display text-4xl font-extrabold leading-tight">
          Author the programs heroes learn from.
        </h1>
        <p className="mt-4 max-w-[420px] text-lg leading-relaxed text-cha-muted">
          Sign in with your Cloud Heroes Africa Microsoft account to create and manage programs.
        </p>

        {error && (
          <Alert status="danger" className="mt-8 max-w-[400px]">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>We couldn&apos;t sign you in</Alert.Title>
              <Alert.Description>
                Use your Cloud Heroes Africa Microsoft account. If this keeps happening, contact a
                Program Owner.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}

        <form action={signInWithMicrosoft} className="mt-8 max-w-[400px]">
          <Button type="submit" size="lg" fullWidth>
            Sign in with Microsoft
            <ArrowRight size={18} />
          </Button>
        </form>

        <p className="mt-6 max-w-[400px] text-[13px] text-cha-muted">
          For Cloud Heroes Africa staff. Learners sign in on the Learning Platform instead.
        </p>
      </section>

      <section className="relative hidden items-center justify-center overflow-hidden bg-cha-canvas lg:flex">
        <p className="absolute inset-x-14 top-14 font-display text-3xl font-extrabold leading-snug">
          Empowering Africans to build world-class cloud careers.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img-community.png"
          alt="Learners across Africa"
          className="w-[78%] object-contain"
        />
      </section>
    </main>
  );
}
