import type { CalendarEvent } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
}

export default function CalendarWidget({ events }: { events: CalendarEvent[] }) {
  return (
    <div className="card">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
        Upcoming events
      </p>
      {/* TODO: source from Learning Management calendar API */}
      <ul className="flex flex-col divide-y divide-gray-100">
        {events.map((event) => (
          <li key={event.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
            <div className="min-w-[72px] text-xs text-gray-400 pt-0.5">
              {formatDate(event.date)}
            </div>
            <div>
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-gray-400">{event.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}