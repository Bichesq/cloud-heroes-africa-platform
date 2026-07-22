"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { Separator } from "@heroui/react";
import {
  BookOpenText,
  Compass,
  GraduationCap,
  Lightbulb,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import AppButton from "@/components/ui/AppButton";
import GoogleIcon from "./GoogleIcon";

const GOOGLE_BUTTON_CLASS =
  "mt-6 w-full justify-center gap-2 border-transparent bg-white text-cha-ink hover:bg-white/90";

const STUDENT_HUB_URL =
  process.env.NEXT_PUBLIC_STUDENT_HUB_URL ?? "http://localhost:3000";

type Tile = { icon: LucideIcon; tone: string; rotate: string; pos: string };

/* Mirrors the Student Hub sign-in collage but with learning-themed tiles —
   the LP is a separate surface, but signing in on either app signs the
   student into both (shared session cookie). */
const LEARNING_TILES: Tile[] = [
  { icon: BookOpenText, tone: "bg-cha-orange", rotate: "-rotate-6", pos: "left-0 top-6" },
  { icon: GraduationCap, tone: "bg-cha-ocean", rotate: "rotate-3", pos: "left-36 top-0" },
  { icon: Compass, tone: "bg-cha-blue", rotate: "-rotate-3", pos: "right-0 top-20" },
  { icon: Lightbulb, tone: "bg-cha-eclipse", rotate: "rotate-6", pos: "left-20 bottom-0" },
  { icon: Trophy, tone: "bg-cha-orange-strong", rotate: "rotate-2", pos: "right-16 bottom-8" },
];

function handleGoogleAuth() {
  signIn("google", { callbackUrl: "/courses" });
}

export default function SignInClient() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — auth panel */}
      <div className="relative isolate flex min-h-screen flex-col justify-between overflow-hidden bg-cha-eclipse px-8 py-10 sm:px-14 sm:py-12">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 15%, rgba(232,84,26,0.35), transparent 45%), radial-gradient(circle at 85% 80%, rgba(50,167,212,0.25), transparent 50%), linear-gradient(160deg, #241209 0%, #18181b 55%, #100c08 100%)",
          }}
        />

        {/* Brand */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo_cha.png"
            alt="Cloud Heroes Africa"
            width={44}
            height={44}
            className="rounded-xl"
          />
          <span className="font-display text-sm font-bold uppercase leading-tight tracking-wide text-white">
            Cloud Heroes
            <br />
            Africa
          </span>
        </div>

        {/* Auth card content */}
        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-display text-4xl font-extrabold text-white sm:text-5xl">
            Learning Platform
          </h1>

          <div className="mt-10">
            <h2 className="text-center font-display text-2xl font-bold text-white">
              Sign In
            </h2>
            <p className="mt-2 text-center text-sm text-white/70">
              Welcome back! Sign in to continue learning
            </p>
            <AppButton
              variant="outline"
              radius="pill"
              onPress={handleGoogleAuth}
              className={GOOGLE_BUTTON_CLASS}
            >
              <GoogleIcon className="size-[18px]" />
              Sign in with Google
            </AppButton>
          </div>

          <div className="my-8 flex items-center gap-3">
            <Separator variant="secondary" className="flex-1 bg-white/20" />
            <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Or
            </span>
            <Separator variant="secondary" className="flex-1 bg-white/20" />
          </div>

          <div>
            <p className="text-center text-sm text-white/70">
              If this is your first time,
            </p>
            <h2 className="mt-1 text-center font-display text-2xl font-bold text-white">
              Sign Up
            </h2>
            <AppButton
              variant="outline"
              radius="pill"
              onPress={handleGoogleAuth}
              className={GOOGLE_BUTTON_CLASS}
            >
              <GoogleIcon className="size-[18px]" />
              Sign up with Google
            </AppButton>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-center text-xs text-white/50">
            Not yet approved?{" "}
            <a
              href={process.env.NEXT_PUBLIC_REGISTRATION_FORM_URL ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white/80 underline-offset-2 hover:underline"
            >
              Apply to join
            </a>
          </p>
          <p className="text-center text-xs text-white/50">
            Trouble signing in?{" "}
            <a
              href={`${STUDENT_HUB_URL}/service-desk`}
              className="font-semibold text-white/80 underline-offset-2 hover:underline"
            >
              Get help
            </a>
          </p>
        </div>
      </div>

      {/* Right — learning panel */}
      <div className="relative hidden overflow-hidden bg-white lg:flex lg:flex-col lg:justify-center lg:px-16 lg:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-cha-ocean) 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />

        <h2 className="relative ml-auto max-w-md text-right font-display text-4xl font-extrabold uppercase leading-tight text-cha-orange sm:text-5xl">
          Learn today, lead tomorrow
        </h2>

        <div className="relative mx-auto mt-16 h-[420px] w-full max-w-lg">
          {LEARNING_TILES.map(({ icon: Icon, tone, rotate, pos }, i) => (
            <div
              key={i}
              className={`absolute grid size-28 place-items-center rounded-[28px] ${tone} ${rotate} ${pos} text-white shadow-lg`}
            >
              <Icon size={40} strokeWidth={1.75} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
