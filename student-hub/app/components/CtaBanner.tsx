import AppButtonLink from "@/components/ui/AppButtonLink";

const REGISTRATION_URL = process.env.NEXT_PUBLIC_REGISTRATION_FORM_URL ?? "#";

export default function CtaBanner() {
  return (
    <section id="signin" className="mx-auto max-w-[1200px] px-5 pb-16 sm:px-8 sm:pb-20">
      <div className="rounded-[32px] bg-cha-orange px-6 py-12 text-center text-white sm:px-12 sm:py-16">
        <h2 className="mb-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Ready to Start Your Journey?
        </h2>
        <p className="mx-auto mb-8 max-w-[460px] text-base leading-relaxed text-white/90 sm:text-lg">
          Already been accepted? Sign in with the Google account you registered
          with.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <AppButtonLink href="/SignIn" variant="outline" radius="pill" size="lg">
            Sign In with Google
          </AppButtonLink>
          <AppButtonLink
            href={REGISTRATION_URL}
            external
            variant="dark"
            radius="pill"
            size="lg"
          >
            Apply to Join
          </AppButtonLink>
        </div>
      </div>
    </section>
  );
}
