import { getProgram, getCompletions } from "@/lib/curriculum";
import { programStats } from "@/lib/curriculum-utils";
import RecentProgramCard from "./RecentProgramCard";

export default async function RecentProgramCardData({
  studentId,
  activeProgramId,
}: {
  studentId: string | undefined;
  activeProgramId: string;
}) {
  const program = await getProgram(activeProgramId);
  const completions = studentId ? await getCompletions(studentId) : [];
  const overall = program ? programStats(program, completions) : null;
  return <RecentProgramCard overall={overall} />;
}
