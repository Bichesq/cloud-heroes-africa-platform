import { getProgram, getCompletions } from "@/lib/curriculum";
import { moduleStats, progressWidgetModules } from "@/lib/curriculum-utils";
import ProgressWidget from "./ProgressWidget";

export default async function ProgressCardData({
  studentId,
  activeProgramId,
}: {
  studentId: string | undefined;
  activeProgramId: string;
}) {
  const program = await getProgram(activeProgramId);
  const completions = studentId ? await getCompletions(studentId) : [];
  const stats = program ? moduleStats(program, completions) : [];
  const { visible, hasMore } = progressWidgetModules(stats, 4);

  return (
    <div className="cha-card flex flex-col gap-4 p-5">
      <h2 className="font-display text-lg font-bold">Your Progress</h2>
      <ProgressWidget modules={visible} hasMore={hasMore} />
    </div>
  );
}
