import type { Metadata } from "next";
import CalendarClient from "./components/CalendarClient";
import { mockCalendarPage } from "./data/mock";

export const metadata: Metadata = {
  title: "Calendar — Cloud Heroes Africa",
};

/**
 * Full calendar page (design: docs/Calendar View Light 2 with Popup.png).
 * Auth is enforced by the (student) layout; data is mocked for the POC.
 */
export default function CalendarPage() {
  return <CalendarClient data={mockCalendarPage} />;
}
