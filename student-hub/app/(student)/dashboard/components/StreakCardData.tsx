import { getCompletions } from "@/lib/curriculum";
import StreakWidget from "./StreakWidget";

export default async function StreakCardData({
  studentId,
  offsetHours,
  now,
}: {
  studentId: string | undefined;
  offsetHours: number;
  now: string;
}) {
  const completions = studentId ? await getCompletions(studentId) : [];
  return <StreakWidget completions={completions} offsetHours={offsetHours} now={now} />;
}
