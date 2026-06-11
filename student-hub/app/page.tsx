import Link from "next/link";

const FEATURES = [
  {
    icon: "☁️",
    title: "Cloud Skills Training",
    description:
      "Hands-on labs and structured learning paths across AWS, Azure, and Google Cloud.",
  },
  {
    icon: "🧑‍🏫",
    title: "Mentor-Led Programme",
    description:
      "Learn alongside experienced cloud professionals who guide you every step of the way.",
  },
  {
    icon: "🌍",
    title: "Built for Africa",
    description:
      "A community of cloud heroes across the continent, growing together.",
  },
  {
    icon: "🏆",
    title: "Recognised Certifications",
    description:
      "Work toward industry-recognised cloud certifications with structured support.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <span className="font-semibold text-sm">
          Cloud Heroes <span className="text-blue-600">Africa</span>
        </span>
        <Link
          href="/invite"
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          Sign in →
        </Link>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
          🚀 Now accepting Cohort 4 applications
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight max-w-2xl mb-4">
          Become a{" "}
          <span className="text-blue-600">Cloud Hero</span>{" "}
          in Africa
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mb-10 leading-relaxed">
          A structured, mentor-led cloud training programme for students and
          professionals across Africa. Learn. Build. Certify.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/invite"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium
                       px-8 py-3 rounded-lg text-sm transition-colors"
          >
            Get Started →
          </Link>
          <a
            href="#about"
            className="border border-gray-200 hover:border-gray-300 text-gray-600
                       font-medium px-8 py-3 rounded-lg text-sm transition-colors"
          >
            Learn more
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="about" className="bg-gray-50 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-2">
            Everything you need to grow
          </h2>
          <p className="text-center text-gray-400 text-sm mb-10">
            The Student Hub brings your entire learning journey into one place.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm"
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-blue-600 px-6 py-12 text-center">
        <h2 className="text-2xl font-semibold text-white mb-3">
          Ready to start your journey?
        </h2>
        <p className="text-blue-100 text-sm mb-6">
          You&apos;ll need an invite code from your programme coordinator to register.
        </p>
        <Link
          href="/invite"
          className="bg-white text-blue-600 hover:bg-blue-50 font-medium
                     px-8 py-3 rounded-lg text-sm transition-colors inline-block"
        >
          Enter your invite code →
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-gray-100 flex flex-col sm:flex-row
                         items-center justify-between gap-2">
        <span className="text-xs text-gray-400">
          © {new Date().getFullYear()} Cloud Heroes Africa
        </span>
        <div className="flex gap-4">
          <a href="/support" className="text-xs text-gray-400 hover:text-gray-600">
            Support
          </a>
          <a href="/invite" className="text-xs text-gray-400 hover:text-gray-600">
            Sign in
          </a>
        </div>
      </footer>

    </div>
  );
}