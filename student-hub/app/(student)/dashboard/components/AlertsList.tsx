import type { Alert } from "@/types";

const styles: Record<Alert["type"], { bg: string; text: string; icon: string }> = {
  info:    { bg: "bg-blue-50",   text: "text-blue-700",  icon: "ℹ" },
  warning: { bg: "bg-amber-50",  text: "text-amber-700", icon: "⚠" },
  success: { bg: "bg-green-50",  text: "text-green-700", icon: "✓" },
  danger:  { bg: "bg-red-50",    text: "text-red-700",   icon: "!" },
};

export default function AlertsList({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) return null;

  return (
    <div className="card">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Updates</p>
      <ul className="flex flex-col gap-2">
        {alerts.map((alert) => {
          const s = styles[alert.type];
          return (
            <li
              key={alert.id}
              className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${s.bg} ${s.text}`}
            >
              <span className="font-semibold mt-0.5 text-xs">{s.icon}</span>
              <span>{alert.message}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}