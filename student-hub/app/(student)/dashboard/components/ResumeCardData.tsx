import { getProgram, getCompletions } from "@/lib/curriculum";
import { resumeState } from "@/lib/curriculum-utils";
import ResumeCard from "./ResumeCard";

export default async function ResumeCardData({
  studentId,
  activeProgramId,
}: {
  studentId: string | undefined;
  activeProgramId: string;
}) {
  const program = await getProgram(activeProgramId);
  const completions = studentId ? await getCompletions(studentId) : [];
  return <ResumeCard state={resumeState(program, completions)} />;
}
