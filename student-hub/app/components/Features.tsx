import { MapPin, PieChart, Star, Users, type LucideIcon } from "lucide-react";
import AppCard from "@/components/ui/AppCard";

type Feature = {
  icon: LucideIcon;
  tone: string;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: PieChart,
    tone: "bg-cha-orange",
    title: "Cloud Skills Training",
    description:
      "Hands-on labs and structured paths across AWS, Docker, Kubernetes and Terraform.",
  },
  {
    icon: Users,
    tone: "bg-cha-ocean",
    title: "Mentor-Led Programme",
    description:
      "Learn alongside experienced cloud professionals who guide you every step of the way.",
  },
  {
    icon: MapPin,
    tone: "bg-cha-blue",
    title: "Built for Africa",
    description:
      "A continent-wide community of cloud heroes, learning and growing together.",
  },
  {
    icon: Star,
    tone: "bg-cha-eclipse",
    title: "Recognised Certifications",
    description:
      "Work toward industry-recognised cloud certifications with structured support.",
  },
];

export default function Features() {
  return (
    <section id="programme" className="bg-cha-canvas py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="mx-auto mb-12 max-w-[620px] text-center">
          <h2 className="mb-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Everything You Need to Grow
          </h2>
          <p className="text-base leading-relaxed text-cha-muted sm:text-lg">
            The Student Portal brings your entire learning journey — labs,
            mentors, schedule and certifications — into one place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, tone, title, description }) => (
            <AppCard key={title} padding="lg">
              <div
                className={`mb-4 grid size-[52px] place-items-center rounded-[15px] ${tone} text-white`}
              >
                <Icon size={26} strokeWidth={1.75} />
              </div>
              <h3 className="mb-2 font-display text-lg font-bold leading-snug">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-cha-muted">
                {description}
              </p>
            </AppCard>
          ))}
        </div>
      </div>
    </section>
  );
}
