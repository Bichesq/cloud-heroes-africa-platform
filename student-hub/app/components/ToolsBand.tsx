const TOOLS = ["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins", "Red Hat"];

export default function ToolsBand() {
  return (
    <section
      id="tracks"
      className="mx-auto max-w-[1200px] px-5 py-14 text-center sm:px-8 sm:py-16"
    >
      <p className="mb-6 text-xs font-semibold uppercase tracking-wide text-cha-faint">
        Train on the tools that power real cloud careers
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {TOOLS.map((tool) => (
          <span
            key={tool}
            className="rounded-full border border-cha-border px-5 py-2.5 text-sm font-semibold text-cha-ink/80"
          >
            {tool}
          </span>
        ))}
      </div>
    </section>
  );
}
