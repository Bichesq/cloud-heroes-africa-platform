import { getEvents } from "@/lib/events";
import CalendarWidget from "./CalendarWidget";

export default async function CalendarCardData({
  offsetHours,
  now,
}: {
  offsetHours: number;
  now: string;
}) {
  const events = await getEvents();
  return <CalendarWidget events={events} offsetHours={offsetHours} now={now} />;
}
