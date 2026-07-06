import Image from "next/image";
import AppButtonLink from "@/components/ui/AppButtonLink";

export default function Hero() {
  return (
    <section
      id="top"
      className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24"
    >
      <div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-cha-orange-soft px-3.5 py-1.5 text-xs font-semibold text-cha-orange">
          <span className="size-1.5 rounded-full bg-cha-orange" />
          Now Accepting Cohort 4 Applications
        </div>

        <h1 className="mb-5 font-display text-4xl font-extrabold leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl">
          Train in the <span className="text-cha-orange">Cloud, </span>
          Rise as <span className="text-cha-orange">Africa’s </span>
          Next <span className="text-cha-orange"> Tech Leader</span>
        </h1>

        <p className="mb-8 max-w-[480px] text-lg leading-relaxed text-cha-muted">
          A structured, mentor-led cloud training programme for students across
          the continent. Learn real tools, build real projects, and certify —{" "}
          <strong className="font-semibold text-cha-orange">for free.</strong>
        </p>

        <div className="flex flex-wrap gap-3">
          <AppButtonLink href="/SignIn" variant="primary" radius="pill" size="lg">
            Get Started with Google
          </AppButtonLink>
          <AppButtonLink href="#tracks" variant="outline" radius="pill" size="lg">
            Explore Tracks
          </AppButtonLink>
        </div>
      </div>

      <div className="relative">
        <div className="relative aspect-[4/4.4] w-full overflow-hidden rounded-[28px] shadow-xl">
          <Image
            src="/img-community.png"
            alt="Cloud Heroes Africa learner"
            fill
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="object-cover object-top"
            priority
          />
        </div>

        <div className="absolute right-[-14px] top-5 rounded-full bg-cha-eclipse px-4 py-2.5 text-xs font-semibold text-white shadow-md">
          100% Free · Mentor-Led
        </div>
      </div>
    </section>
  );
}
